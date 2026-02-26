from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import models, database, auth

app = FastAPI(title="AradığınıBul B2B API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Tüm dış kaynaklara izin ver
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "Sizin_Sabit_Secret_Keyiniz" 
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@app.post("/auth/register")
async def register(user_in: dict, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in["email"]).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")
    
    new_user = models.User(
        email=user_in["email"],
        # Modelindeki gerçek alan adı hashed_password ise ona eşitle:
        hashed_password=auth.get_password_hash(user_in["password"]), 
        first_name=user_in.get("first_name"),
        last_name=user_in.get("last_name"),
        phone=user_in.get("phone")
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Kayıt başarılı"}

@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    
    access_token = jwt.encode({"sub": user.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me")
async def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user: raise HTTPException(status_code=404)
        return {
            "first_name": user.first_name, 
            "last_name": user.last_name, 
            "email": user.email,
            "phone": user.phone
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Oturum geçersiz")