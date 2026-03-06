from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/users", tags=["Kullanıcılar"])

# 1. KULLANICI PROFİLİNİ GÖRME
@router.get("/me", response_model=schemas.UserResponse)
def get_my_profile(current_user: models.User = Depends(auth.get_current_user)):
    # Şemalarımızda (schemas.py) 'favorites' listesini bağladığımız için,
    # FastAPI burada kullanıcının bilgilerini dönerken favori ürünlerini de otomatik getirecek.
    return current_user