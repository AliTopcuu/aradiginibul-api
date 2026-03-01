from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/orders", tags=["Sipariş & İşlem Motoru"])

# Müşterinin kendi siparişlerini görüntülemesi
@router.get("/")
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.created_at.desc()).all()
    return [{
        "id": o.id,
        "total_price": o.total_price,
        "status": o.current_status,
        "created_at": str(o.created_at),
        "items": [{
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else "Silinmiş Ürün",
            "quantity": item.quantity,
            "unit_price": item.unit_price
        } for item in o.items],
        "history": [{
            "status": h.status,
            "created_at": str(h.created_at),
            "notes": h.notes
        } for h in sorted(o.history, key=lambda x: x.created_at)]
    } for o in orders]

@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_req: schemas.OrderCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Sipariş Başlığını Oluştur
    new_order = models.Order(user_id=current_user.id, total_price=0.0, current_status="Hazırlanıyor")
    db.add(new_order)
    db.flush() # DİKKAT: flush(), veritabanına geçici yazar (ID almak için). Henüz commit etmedik!

    total_amount = 0.0

    # 2. Kalemleri Tek Tek Dön ve Stok/İskonto Kontrolü Yap
    for item in order_req.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        
        if not product:
            db.rollback() # Hata varsa tüm işlemi iptal et ve stoğu geri ver!
            raise HTTPException(status_code=404, detail=f"Ürün ID {item.product_id} bulunamadı.")
        
        if product.stock_quantity < item.quantity:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Stok yetersiz: {product.name}. Mevcut stok: {product.stock_quantity}")
        
        # --- B2B HACİMSEL İSKONTO ALGORİTMASI ---
        unit_price = product.price
        applied_discount = 0.0
        
        # Ürünün indirim kurallarını kontrol et (Miktara göre uygulanabilir kuralları bul)
        applicable_rules = [rule for rule in product.discount_rules if item.quantity >= rule.min_quantity]
        if applicable_rules:
            # En yüksek indirim yüzdesini veren kuralı seç
            best_rule = max(applicable_rules, key=lambda r: r.discount_percentage)
            applied_discount = (unit_price * best_rule.discount_percentage) / 100
            unit_price -= applied_discount
        
        # 3. Stoğu Düş ve Sipariş Kalemini Yarat
        product.stock_quantity -= item.quantity
        
        order_item = models.OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=unit_price # İndirimli fiyatı faturaya yazıyoruz
        )
        db.add(order_item)
        
        total_amount += (unit_price * item.quantity)
    
    # 4. Toplam Tutarı Güncelle ve Tarihçeye (Timeline) İlk Durumu Ekle
    new_order.total_price = total_amount
    
    history_entry = models.OrderHistory(
        order_id=new_order.id,
        status="Hazırlanıyor",
        notes="Sipariş başarıyla alındı ve stoklar rezerve edildi."
    )
    db.add(history_entry)
    
    # 5. HER ŞEY KUSURSUZSA VERİTABANINA KALICI OLARAK YAZ (TRANSACTION COMMIT)
    db.commit()
    db.refresh(new_order)
    
    return new_order