from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/products", tags=["Ürünler Kataloğu"])

# 1. YENİ ÜRÜN EKLEME (Sadece Adminler Yapabilir!)
@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_admin_user) # Güvenlik görevlisi devrede!
):
    # Pydantic şemasındaki veriyi SQLAlchemy modeline çevirip veritabanına yazıyoruz
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

# 2. TÜM ÜRÜNLERİ LİSTELEME (Herkes Görebilir)
@router.get("/", response_model=List[schemas.ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Ürünleri getirirken, eğer varsa altındaki indirim kurallarını ve yorumları da otomatik getirir
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

# 3. TEKİL ÜRÜN DETAYI
@router.get("/{id}", response_model=schemas.ProductResponse)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Aradığınız ürün bulunamadı.")
    return product