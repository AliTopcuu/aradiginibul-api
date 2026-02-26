from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/reviews", tags=["Yorumlar & Değerlendirmeler"])

# 1. ÜRÜNE YORUM VE PUAN EKLEME (Sadece giriş yapmış müşteriler)
@router.post("/{product_id}", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_review(
    product_id: int, 
    review: schemas.ReviewCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # Ürün gerçekten var mı kontrol et
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Yorum yapmak istediğiniz ürün bulunamadı.")
    
    # SPAM KORUMASI: Kullanıcı daha önce bu ürüne yorum yapmış mı?
    existing_review = db.query(models.Review).filter(
        models.Review.product_id == product_id,
        models.Review.user_id == current_user.id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="Bu ürüne zaten bir değerlendirme yaptınız. Her ürüne sadece 1 kez yorum yapılabilir.")
    
    # Yeni yorumu oluştur ve veritabanına kaydet
    new_review = models.Review(
        **review.model_dump(),
        user_id=current_user.id,
        product_id=product_id
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return new_review