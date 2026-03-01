
from fastapi import FastAPI
from sqlalchemy import text
import models
from database import engine
from fastapi.middleware.cors import CORSMiddleware

from routers.auth_router import router as auth_router
from routers.products_router import router as products_router
from routers.users_router import router as users_router
from routers.orders_router import router as orders_router
from routers.reviews_router import router as reviews_router
from routers.analytics_router import router as analytics_router
from routers.admin_router import router as admin_router

models.Base.metadata.create_all(bind=engine)

# Mevcut veritabanına yeni sütunları güvenli şekilde ekle
# (create_all mevcut tablolara sütun eklemez, bu yüzden ALTER TABLE kullanıyoruz)
def run_migrations():
    new_columns = [
        ("users", "first_name", "VARCHAR"),
        ("users", "last_name", "VARCHAR"),
        ("users", "phone", "VARCHAR"),
        ("products", "image_url", "VARCHAR"),
    ]
    with engine.connect() as conn:
        for table, column, col_type in new_columns:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                conn.commit()
            except Exception:
                conn.rollback()  # Sütun zaten varsa hata verir, bunu yoksay

run_migrations()

# Admin hesabını kontrol et ve rolünü güncelle
def seed_admin():
    from database import SessionLocal
    try:
        db = SessionLocal()
        db.execute(text("UPDATE users SET role = 'admin' WHERE email = 'admin@aradiginibul.com'"))
        db.commit()
        db.close()
    except Exception:
        pass

seed_admin()

# Başlangıç ürünlerini veritabanına ekle (yoksa)
def seed_products():
    from database import SessionLocal
    try:
        db = SessionLocal()
        existing = db.execute(text("SELECT COUNT(*) FROM products")).scalar()
        if existing == 0:
            products = [
                ("Endüstriyel Rulman Seti", "Yüksek kaliteli endüstriyel rulman seti", 2450, 45, "SKU-RULMAN-001"),
                ("Yüksek Devirli Motor", "Profesyonel yüksek devirli motor", 18200, 12, "SKU-MOTOR-001"),
                ("Dijital Kumpas Pro", "Hassas dijital kumpas", 850, 120, "SKU-KUMPAS-001"),
                ("Çelik Dişli Takımı", "Dayanıklı çelik dişli takımı", 4100, 8, "SKU-DISLI-001"),
                ("Lazer Hizalama Cihazı", "Profesyonel lazer hizalama cihazı", 12750, 5, "SKU-LAZER-001"),
            ]
            for name, desc, price, stock, sku in products:
                db.execute(text(
                    "INSERT INTO products (name, description, price, stock_quantity, sku) VALUES (:n, :d, :p, :s, :k)"
                ), {"n": name, "d": desc, "p": price, "s": stock, "k": sku})
            db.commit()
        db.close()
    except Exception:
        pass

seed_products()

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
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {
        "mesaj": "AradığınıBul Motoru Çalışıyor! 🚀",
        "durum": "Sistemler Çevrimiçi",
       
        "moduller": ["Katalog", "B2B İskonto", "İstek Listesi", "Sipariş İşlem Motoru", "Değerlendirme Sistemi", "Yapay Zeka Destekli Stok Analitiği"]
    }