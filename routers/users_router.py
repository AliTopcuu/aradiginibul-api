from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/users", tags=["Kullanıcı & İstek Listesi"])

# 1. FAVORİLERE ÜRÜN EKLEME / ÇIKARMA (Sadece giriş yapmış müşteriler)
@router.post("/favorites/{product_id}")
def toggle_favorite(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    
    # Ürün zaten favorilerdeyse çıkar, değilse ekle (Toggle Mantığı)
    if product in current_user.favorites:
        current_user.favorites.remove(product)
        mesaj = "Ürün istek listenizden çıkarıldı."
    else:
        current_user.favorites.append(product)
        mesaj = "Ürün istek listenize eklendi."
        
    db.commit()
    return {"mesaj": mesaj}

# 2. KENDİ PROFİLİNİ VE FAVORİLERİNİ GÖRME
@router.get("/me", response_model=schemas.UserResponse)
def get_my_profile(current_user: models.User = Depends(auth.get_current_user)):
    # Şemalarımızda (schemas.py) 'favorites' listesini bağladığımız için,
    # FastAPI burada kullanıcının bilgilerini dönerken favori ürünlerini de otomatik getirecek.
    return current_user