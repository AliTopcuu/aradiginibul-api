import antigravity # Uçuş modu devrede! 🎈
from fastapi import FastAPI
import models
from database import engine
from routers import auth_router # YENİ: Rota dosyamızı içeri aldık

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AradığınıBul API - Metro Market Edition",
    description="Toptan ve Perakende e-ticaret altyapısı, B2B sipariş motoru.",
    version="2.0.0"
)

# YENİ: Auth rotalarımızı ana uygulamaya bağladık
app.include_router(auth_router.router)

@app.get("/")
def read_root():
    return {
        "mesaj": "AradığınıBul Motoru Çalışıyor! 🚀",
        "durum": "Sistemler Çevrimiçi",
        "moduller": ["Katalog", "B2B İskonto", "Stok Analitiği"]
    }