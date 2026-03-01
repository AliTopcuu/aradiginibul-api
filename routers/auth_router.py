from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

import models
import schemas
import auth
from database import get_db

# API'mizde bu rotaların /auth altında toplanmasını sağlıyoruz
router = APIRouter(prefix="/auth", tags=["Kimlik Doğrulama"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. E-posta sistemde var mı kontrol et (Aynı maille iki kez kayıt olunamaz)
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı!")
    
    # 2. Şifreyi şifreleme motoruna (Bcrypt) gönder ve gizli halini kaydet
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Kullanıcıyı e-postaya göre bul (OAuth2 standardında email 'username' alanından gelir)
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # 2. Kullanıcı yoksa veya şifre veritabanındaki hash ile eşleşmiyorsa kapıdan çevir
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı e-posta veya şifre girdiniz",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Her şey doğruysa, kullanıcının rolünü (admin/customer) de içeren token'ı üret
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    # Token'ı teslim et
    return {"access_token": access_token, "token_type": "bearer"}

# Giriş yapmış kullanıcının kendi profil bilgilerini döner
@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: models.User = Depends(auth.get_current_user)):
    return current_user