from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import models, database, auth # Kendi dosyalarınızı import edin

app = FastAPI(title="AradığınıBul B2B API")

# 🛡️ CORS Ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "Sizin_Sabit_Anahtariniz" 
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- KAYIT (REGISTER) ---
@app.post("/auth/register")
async def register(user_in: dict, db: Session = Depends(database.get_db)):
    # Not Found hatasını önlemek için bu endpoint'in varlığı kritiktir
    new_user = models.User(
        email=user_in["email"],
        password=auth.get_password_hash(user_in["password"]),
        first_name=user_in["first_name"],
        last_name=user_in["last_name"],
        phone=user_in["phone"]
    )
    db.add(new_user)
    db.commit()
    return {"message": "Kayıt başarılı"}

# --- GİRİŞ (LOGIN) ---
@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="E-posta veya şifre hatalı")
    
    access_token = jwt.encode({"sub": user.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

# --- KULLANICI BİLGİLERİ (ME) ---
@app.get("/auth/me")
async def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user = db.query(models.User).filter(models.User.email == email).first()
        
        # Frontend'in beklediği kolon isimleri
        return {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Oturum geçersiz")