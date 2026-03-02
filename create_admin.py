"""
Admin hesabı oluşturma scripti
Sadece bir kez çalıştırılması yeterlidir.
"""
import os
import sys

# Proje kök dizininde olduğumuzdan emin ol
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User
from auth import get_password_hash

def create_admin():
    db = SessionLocal()
    
    email = "admin@aradiginibul.com"
    password = "admin12356890.!"
    
    # Zaten var mı kontrol et
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print(f"⚠️  '{email}' zaten kayıtlı!")
        # Eğer admin değilse admin yap
        if existing.role != "admin":
            existing.role = "admin"
            db.commit()
            print("✅ Mevcut hesap admin rolüne yükseltildi!")
        else:
            print("ℹ️  Zaten admin rolünde.")
        db.close()
        return
    
    # Yeni admin hesabı oluştur
    admin_user = User(
        email=email,
        hashed_password=get_password_hash(password),
        first_name="Admin",
        last_name="1",
        phone=None,
        role="admin",
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    db.close()
    
    print("✅ Admin hesabı başarıyla oluşturuldu!")
    print(f"   📧 E-posta: {email}")
    print(f"   🔑 Şifre:   {password}")
    print(f"   👤 Ad:      Admin 1")
    print(f"   🛡️  Rol:     admin")

if __name__ == "__main__":
    create_admin()
