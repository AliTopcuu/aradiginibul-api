from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Railway üzerinden gelecek URL'i alıyoruz. Lokal testler için varsayılan bir değer atıyoruz.
# Canlıya alırken .env veya Railway paneli üzerinden bu linki değiştireceğiz.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kullanici:sifre@localhost/aradiginibul_db")

# SQLAlchemy motorunu başlat
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Veritabanı bağlantısını sağlayan Dependency (bağımlılık) fonksiyonu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()