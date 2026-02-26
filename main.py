
from fastapi import FastAPI
import models
from database import engine
from fastapi.middleware.cors import CORSMiddleware

from routers.auth_router import router as auth_router
from routers.products_router import router as products_router
from routers.users_router import router as users_router
from routers.orders_router import router as orders_router
from routers.reviews_router import router as reviews_router
from routers.analytics_router import router as analytics_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AradığınıBul API - AUT Market Edition",
    description="Toptan ve Perakende e-ticaret altyapısı, B2B sipariş motoru.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Bu satırı "*" yaparak tüm dünyadan gelen isteklere kapıyı açıyoruz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(users_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(analytics_router)

@app.get("/")
def read_root():
    return {
        "mesaj": "AradığınıBul Motoru Çalışıyor! 🚀",
        "durum": "Sistemler Çevrimiçi",
       
        "moduller": ["Katalog", "B2B İskonto", "İstek Listesi", "Sipariş İşlem Motoru", "Değerlendirme Sistemi", "Yapay Zeka Destekli Stok Analitiği"]
    }