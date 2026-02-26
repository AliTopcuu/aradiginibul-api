import antigravity
from fastapi import FastAPI
import models
from database import engine

<<<<<<< HEAD
from routers import auth_router, products_router, users_router, orders_router, reviews_router
=======
from routers import auth_router, products_router, users_router, orders_router
>>>>>>> 3adb9188a5aa6a0dfc1877f853f2548605659fe3
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AradığınıBul API - Metro Market Edition",
    description="Toptan ve Perakende e-ticaret altyapısı, B2B sipariş motoru.",
    version="2.0.0"
)

app.include_router(auth_router.router)
app.include_router(products_router.router) 
app.include_router(users_router.router)
<<<<<<< HEAD
app.include_router(reviews_router.router)
=======
app.include_router(orders_router.router)
>>>>>>> 3adb9188a5aa6a0dfc1877f853f2548605659fe3

@app.get("/")
def read_root():
    return {
        "mesaj": "AradığınıBul Motoru Çalışıyor! 🚀",
        "durum": "Sistemler Çevrimiçi",
<<<<<<< HEAD
        "moduller": ["Katalog", "B2B İskonto", "Stok Analitiği", "İstek Listesi", "Sipariş İşlem Motoru", "Değerlendirme Sistemi"]
=======
        "moduller": ["Katalog", "B2B İskonto", "Stok Analitiği", "İstek Listesi", "Sipariş İşlem Motoru"]
>>>>>>> 3adb9188a5aa6a0dfc1877f853f2548605659fe3
    }