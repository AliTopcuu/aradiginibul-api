from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/saved-cards", tags=["Kayıtlı Kartlar"])

# 1. KAYITLI KARTLARı LISTELE
@router.get("/", response_model=list[schemas.SavedCardResponse])
def get_saved_cards(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Geçerli kullanıcının tüm kayıtlı kartlarını getirir."""
    cards = db.query(models.SavedCard).filter(
        models.SavedCard.user_id == current_user.id
    ).all()
    return cards

# 2. YENİ KART KAYDET
@router.post("/", response_model=schemas.SavedCardResponse)
def save_card(
    card_data: schemas.SavedCardCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Yeni bir ödeme kartı kaydeder."""
    # Eğer bu kart varsayılan olarak işaretlenirse, diğerlerini varsayılan olmaktan çıkar
    if card_data.is_default:
        db.query(models.SavedCard).filter(
            models.SavedCard.user_id == current_user.id
        ).update({"is_default": False})
    
    new_card = models.SavedCard(
        user_id=current_user.id,
        card_holder=card_data.card_holder,
        card_number=card_data.card_number,
        card_expiry=card_data.card_expiry,
        is_default=card_data.is_default
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    return new_card

# 3. KARTI SİL
@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının kaydedilmiş kartını siler."""
    card = db.query(models.SavedCard).filter(
        models.SavedCard.id == card_id,
        models.SavedCard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kart bulunamadı"
        )
    
    db.delete(card)
    db.commit()

# 4. KARTI GÜNCELLE (Varsayılan Kart Değişimi vb.)
@router.put("/{card_id}", response_model=schemas.SavedCardResponse)
def update_card(
    card_id: int,
    card_update: schemas.SavedCardCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının kaydedilmiş kartını günceller."""
    card = db.query(models.SavedCard).filter(
        models.SavedCard.id == card_id,
        models.SavedCard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kart bulunamadı"
        )
    
    # Eğer bu kart varsayılan olarak işaretlenirse, diğerlerini varsayılan olmaktan çıkar
    if card_update.is_default and not card.is_default:
        db.query(models.SavedCard).filter(
            models.SavedCard.user_id == current_user.id
        ).update({"is_default": False})
    
    card.card_holder = card_update.card_holder
    card.card_number = card_update.card_number
    card.card_expiry = card_update.card_expiry
    card.is_default = card_update.is_default
    
    db.commit()
    db.refresh(card)
    return card
