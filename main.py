from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import models, database, auth

app = FastAPI(title="AradığınıBul B2B API")

# 🛡️ CORS Ayarları - Frontend erişimi için hayati önem taşır
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 Güvenlik Yapılandırması
SECRET_KEY = "Sizin_Sabit_Secret_Keyiniz" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- 🆕 KAYIT OLMA (REGISTER) ---
# image_8aea3d'deki "Not Found" hatasını bu blok çözer
@app.post("/auth/register")
async def register(user_in: dict, db: Session = Depends(database.get_db)):
    # Email kontrolü
    db_user = db.query(models.User).filter(models.User.email == user_in["email"]).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")
    
    new_user = models.User(
        email=user_in["email"],
        password=auth.get_password_hash(user_in["password"]),
        first_name=user_in.get("first_name"),
        last_name=user_in.get("last_name"),
        phone=user_in.get("phone")
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Kayıt başarıyla tamamlandı", "user_id": new_user.id}

# --- 🔑 GİRİŞ YAPMA (LOGIN) ---
@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # form_data.username burada Email adresini temsil eder
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # Şifre kontrolü ve kullanıcı varlık doğrulaması
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Token üretimi
    access_token = jwt.encode({"sub": user.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

# --- 👤 KULLANICI BİLGİLERİ (ME) ---
@app.get("/auth/me")
async def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Geçersiz token")
            
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user: 
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
        # Frontend'in beklediği profil verileri
        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Oturum geçersiz veya süresi dolmuş")