from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Railway veritabanı URL'sini alır, bulamazsa hata vermemesi için localhost'u yedek tutar.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# EĞER DATABASE_URL "postgres://" ile başlıyorsa, SQLAlchemy 2.0 uyumu için "postgresql://" yapmamız gerekebilir.
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Eğer URL hala yoksa (Lokalde çalışıyorsan) diye bir varsayılan belirleyelim
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()