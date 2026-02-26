from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# Gizli Anahtarımız (Projeyi canlıya alırken bunu .env dosyasına taşıyıp gizleyeceğiz)
SECRET_KEY = "aradiginibul_b2b_super_gizli_anahtar_2026"
ALGORITHM = "HS256"
# Toptan market alışverişleri uzun sürebilir, token süresini 1 gün (1440 dakika) yapıyoruz
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 

# Şifreleme motorumuz (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Şifre Doğrulama (Kullanıcının girdiği şifre ile veritabanındaki hash eşleşiyor mu?)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Şifreyi Hashleme (Kayıt olurken şifreyi gizlemek için)
def get_password_hash(password):
    return pwd_context.hash(password)

# JWT Token Üretme (Kullanıcıya verilecek dijital giriş kartı)
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt