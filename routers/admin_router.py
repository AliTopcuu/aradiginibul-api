from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/admin", tags=["Admin Paneli"])

# --- ŞEMALAR ---
class DashboardStats(BaseModel):
    total_users: int
    total_orders: int
    total_products: int
    total_revenue: float
    recent_orders: list
    recent_users: list

class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    sku: Optional[str] = None
    image_url: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str

# --- 1. DASHBOARD İSTATİSTİKLERİ ---
@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    total_users = db.query(func.count(models.User.id)).scalar()
    total_orders = db.query(func.count(models.Order.id)).scalar()
    total_products = db.query(func.count(models.Product.id)).scalar()
    total_revenue = db.query(func.coalesce(func.sum(models.Order.total_price), 0)).scalar()

    # Son 5 sipariş
    recent_orders = db.query(models.Order).order_by(models.Order.created_at.desc()).limit(5).all()
    recent_orders_data = [{
        "id": o.id,
        "user_id": o.user_id,
        "user_email": o.owner.email if o.owner else "Bilinmiyor",
        "total_price": o.total_price,
        "status": o.current_status,
        "created_at": str(o.created_at)
    } for o in recent_orders]

    # Son 5 kullanıcı
    recent_users = db.query(models.User).order_by(models.User.created_at.desc()).limit(5).all()
    recent_users_data = [{
        "id": u.id,
        "email": u.email,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "role": u.role,
        "created_at": str(u.created_at)
    } for u in recent_users]

    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_products": total_products,
        "total_revenue": float(total_revenue),
        "recent_orders": recent_orders_data,
        "recent_users": recent_users_data
    }

# --- 2. KULLANICI YÖNETİMİ ---
@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    return [{
        "id": u.id,
        "email": u.email,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "phone": u.phone,
        "role": u.role,
        "is_active": u.is_active,
        "created_at": str(u.created_at)
    } for u in users]

@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, role_data: UserRoleUpdate, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Kendi rolünüzü değiştiremezsiniz.")
    user.role = role_data.role
    db.commit()
    return {"mesaj": f"Kullanıcı rolü '{role_data.role}' olarak güncellendi."}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Kendinizi silemezsiniz!")
    db.delete(user)
    db.commit()
    return {"mesaj": "Kullanıcı silindi."}

# --- 3. SİPARİŞ YÖNETİMİ ---
@router.get("/orders")
def get_all_orders(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    return [{
        "id": o.id,
        "user_id": o.user_id,
        "user_email": o.owner.email if o.owner else "Bilinmiyor",
        "user_name": f"{o.owner.first_name or ''} {o.owner.last_name or ''}".strip() if o.owner else "Bilinmiyor",
        "total_price": o.total_price,
        "status": o.current_status,
        "created_at": str(o.created_at),
        "items": [{
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else "Silinmiş Ürün",
            "quantity": item.quantity,
            "unit_price": item.unit_price
        } for item in o.items]
    } for o in orders]

@router.put("/orders/{order_id}/status")
def update_order_status(order_id: int, status_data: OrderStatusUpdate, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    order.current_status = status_data.status
    # Tarihçeye kayıt ekle
    history = models.OrderHistory(
        order_id=order.id,
        status=status_data.status,
        notes=status_data.notes or f"Durum '{status_data.status}' olarak güncellendi."
    )
    db.add(history)
    db.commit()
    return {"mesaj": f"Sipariş #{order_id} durumu '{status_data.status}' olarak güncellendi."}

# --- 4. ÜRÜN YÖNETİMİ ---
@router.put("/products/{product_id}")
def update_product(product_id: int, product_data: ProductUpdate, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    if product_data.name is not None:
        product.name = product_data.name
    if product_data.description is not None:
        product.description = product_data.description
    if product_data.price is not None:
        product.price = product_data.price
    if product_data.stock_quantity is not None:
        product.stock_quantity = product_data.stock_quantity
    if product_data.sku is not None:
        product.sku = product_data.sku
    if product_data.image_url is not None:
        product.image_url = product_data.image_url
    db.commit()
    db.refresh(product)
    return {"mesaj": "Ürün güncellendi.", "urun": {"id": product.id, "name": product.name, "price": product.price, "stock_quantity": product.stock_quantity}}

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    db.delete(product)
    db.commit()
    return {"mesaj": "Ürün silindi."}
