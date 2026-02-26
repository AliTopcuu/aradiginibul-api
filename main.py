import antigravity # Uçuş modu devrede! 🎈
from fastapi import FastAPI
import models
from database import engine

# SİHİRLİ SATIR: Bu kod çalıştığında models.py içindeki tüm tabloları veritabanında fiziksel olarak yaratır!
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AradığınıBul API - Metro Market Edition",
    description="Toptan ve Perakende e-ticaret altyapısı, B2B sipariş motoru.",
    version="2.0.0"
)

@app.get("/")
def read_root():
    return {
        "mesaj": "AradığınıBul Motoru Çalışıyor! 🚀",
        "durum": "Sistemler Çevrimiçi",
        "moduller": ["Katalog", "B2B İskonto", "Stok Analitiği"]
    }