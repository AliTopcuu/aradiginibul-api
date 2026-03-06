from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models, schemas, auth
from database import get_db
from datetime import datetime

router = APIRouter(prefix="/favorites", tags=["Favoriler & Fiyat Takibi"])

# --- 1. FAVORİLERE ÜRÜN EKLEME / ÇIKARMA ---
@router.post("/{product_id}")
def toggle_favorite(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    
    if product in current_user.favorites:
        current_user.favorites.remove(product)
        # Fiyat takibini de sil
        db.query(models.PriceTracking).filter(
            models.PriceTracking.user_id == current_user.id,
            models.PriceTracking.product_id == product_id
        ).delete()
        mesaj = "Ürün favorilerden çıkarıldı."
    else:
        current_user.favorites.append(product)
        # Fiyat takibine ekle
        price_track = models.PriceTracking(
            user_id=current_user.id,
            product_id=product_id,
            initial_price=product.price,
            current_price=product.price,
            discount_percentage=0.0
        )
        db.add(price_track)
        mesaj = "Ürün favorilerinize eklendi."
    
    db.commit()
    return {"mesaj": mesaj}

# --- 2. KULLANICI FAVORİLERİNİ LİSTELEME ---
@router.get("/", response_model=List[schemas.ProductResponse])
def get_favorites(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return current_user.favorites

# --- 3. KULLANICI FAVORİLERİNİN FİYAT İZLEME BİLGİLERİ ---
@router.get("/tracking/list", response_model=List[schemas.PriceTrackingResponse])
def get_price_tracking(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    tracking_list = db.query(models.PriceTracking).filter(
        models.PriceTracking.user_id == current_user.id,
        models.PriceTracking.is_active == True
    ).all()
    
    # Ürün bilgilerini ekle
    result = []
    for track in tracking_list:
        product = db.query(models.Product).filter(models.Product.id == track.product_id).first()
        result.append({
            "id": track.id,
            "user_id": track.user_id,
            "product_id": track.product_id,
            "product": product,
            "initial_price": track.initial_price,
            "current_price": track.current_price,
            "discount_percentage": track.discount_percentage,
            "price_drop": track.initial_price - track.current_price,
            "created_at": track.created_at
        })
    return result

# --- 4. KULLANICI BİLDİRİMLERİNİ LİSTELEME ---
@router.get("/notifications/list", response_model=List[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()
    return notifications

# --- 5. BİLDİRİM OKU OLARAK İŞARETLE ---
@router.put("/notifications/{notification_id}/read")
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı.")
    
    notification.is_read = True
    db.commit()
    return {"mesaj": "Bildirim okundu olarak işaretlendi."}

# --- 6. TÜMEL BİLDİRİMLERİ OKU OLARAK İŞARETLE ---
@router.put("/notifications/read-all")
def mark_all_notifications_as_read(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"mesaj": "Tüm bildirimler okundu olarak işaretlendi."}

# --- 7. OKUNMAMIŞ BİLDİRİM SAYISI ---
@router.get("/notifications/count/unread")
def get_unread_notification_count(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    count = db.query(func.count(models.Notification.id)).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).scalar()
    return {"unread_count": count}
