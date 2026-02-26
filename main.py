from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import models, database # Kendi dosya yapınıza göre kontrol edin

app = FastAPI(title="AradığınıBul API")

# 🛡️ CORS Ayarları - Her yerden erişime izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
SECRET_KEY = "YAZDIGIN_SECRET_KEY" 
ALGORITHM = "HS256"

@app.get("/auth/me")
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # PostgreSQL'den kullanıcıyı bul
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception

    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name, # Ali
        "last_name": user.last_name,   # Topçu
        "phone": user.phone
    }

# Diğer routerlar (auth_router, products_router vb.) buraya eklenebilir