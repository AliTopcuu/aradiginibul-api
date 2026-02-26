import antigravity
from fastapi import FastAPI
import models
from database import engine

from routers import auth_router, products_router, users_router, orders_router
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AradığınıBul API - Metro Market Edition",
    description="Toptan ve Perakende e-ticaret altyapısı, B2B sipariş motoru.",
    version="2.0.0"
)

app.include_router(auth_router.router)
app.include_router(products_router.router) # YENİ: Ürünler API'si ana motora bağlandı
app.include_router(users_router.router)
app.include_router(orders_router.router)

@app.get("/")
def read_root():
    return {
        "mesaj": "AradığınıBul Motoru Çalışıyor! 🚀",
        "durum": "Sistemler Çevrimiçi",
        "moduller": ["Katalog", "B2B İskonto", "Stok Analitiği", "İstek Listesi", "Sipariş İşlem Motoru"]
    }