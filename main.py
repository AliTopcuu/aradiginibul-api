
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
from routers.favorites_router import router as favorites_router

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

# Başlangıç ürünlerini veritabanına ekle - Her startup'ta rastgele stock ile güncelle
def seed_products():
    from database import SessionLocal
    import random
    try:
        db = SessionLocal()
        # Her startup'ta ürünleri sil ve yeniden ekle (rastgele stock ile)
        db.execute(text("DELETE FROM products"))
        db.commit()

        products = [
            # === MOTOR PARÇALARI ===
            ("Piston Seti (4 Adet)", "Yüksek performanslı döküm piston seti, standart ölçü", 1850, 45, "YP-MOT-001"),
                ("Silindir Kapak Contası", "Çelik takviyeli silindir kapak contası, orijinal uyumlu", 420, 120, "YP-MOT-002"),
                ("Krank Mili", "CNC işlenmiş krank mili, dinamik balanslanmış", 3200, 18, "YP-MOT-003"),
                ("Eksantrik Mili", "Yüksek karbonlu çelik eksantrik mili", 2750, 22, "YP-MOT-004"),
                ("Supap Takımı (8'li)", "Krom vanadyum çelik emme ve egzoz supap seti", 680, 85, "YP-MOT-005"),
                ("Segman Seti", "3 kanallı krom kaplı segman seti", 320, 150, "YP-MOT-006"),
                ("Yağ Pompası", "Dişli tip motor yağ pompası, yüksek basınç", 890, 40, "YP-MOT-007"),
                ("Motor Kulağı (Takoz)", "Hidrolik motor takozu, titreşim sönümleyici", 450, 65, "YP-MOT-008"),
                # === FREN SİSTEMİ ===
                ("Ön Fren Disk Takımı", "Havalandırmalı delikli ön fren diski, 280mm çap", 1250, 55, "YP-FRN-001"),
                ("Arka Fren Disk Takımı", "Düz tip arka fren diski, 260mm çap", 980, 48, "YP-FRN-002"),
                ("Ön Fren Balata Seti", "Seramik karışımlı düşük tozlu ön balata", 380, 200, "YP-FRN-003"),
                ("Arka Fren Balata Seti", "Yarı metalik arka fren balata seti", 320, 180, "YP-FRN-004"),
                ("Fren Kaliperi Sol", "Yeniden üretilmiş ön sol fren kaliperi", 1450, 25, "YP-FRN-005"),
                ("Fren Kaliperi Sağ", "Yeniden üretilmiş ön sağ fren kaliperi", 1450, 25, "YP-FRN-006"),
                ("Fren Hidroliği DOT4 (1L)", "Sentetik fren hidrolik yağı, DOT4 standart", 180, 300, "YP-FRN-007"),
                ("El Fren Teli", "Paslanmaz çelik örgülü el fren teli", 220, 90, "YP-FRN-008"),
                ("ABS Sensörü Ön", "Manyetik tip ABS tekerlek hız sensörü", 350, 70, "YP-FRN-009"),
                # === SÜSPANSİYON ===
                ("Ön Amortisör (Çift)", "Gaz basınçlı ön amortisör takımı", 2200, 35, "YP-SUS-001"),
                ("Arka Amortisör (Çift)", "Gaz basınçlı arka amortisör takımı", 1800, 38, "YP-SUS-002"),
                ("Viraj Demir Lastiği", "Poliüretan viraj denge çubuğu burcu", 120, 160, "YP-SUS-003"),
                ("Rotil (Sol)", "Dövme çelik sol rotil başı", 280, 75, "YP-SUS-004"),
                ("Rotil (Sağ)", "Dövme çelik sağ rotil başı", 280, 75, "YP-SUS-005"),
                ("Salıncak Alt (Sol)", "Alüminyum döküm alt salıncak kolu", 950, 30, "YP-SUS-006"),
                ("Salıncak Alt (Sağ)", "Alüminyum döküm alt salıncak kolu", 950, 30, "YP-SUS-007"),
                ("Amortisör Takozu Ön", "Güçlendirilmiş ön amortisör üst takozu", 190, 100, "YP-SUS-008"),
                ("Helezon Yay Ön (Çift)", "HD kalınlıkta ön helezon yay takımı", 680, 40, "YP-SUS-009"),
                # === ELEKTRİK SİSTEMİ ===
                ("Marş Motoru", "12V 1.4kW yeniden üretilmiş marş motoru", 1650, 20, "YP-ELK-001"),
                ("Alternatör 90A", "12V 90 Amper alternatör, regülatörlü", 2100, 15, "YP-ELK-002"),
                ("Ateşleme Bobini", "Çift çıkışlı yüksek performans ateşleme bobini", 380, 85, "YP-ELK-003"),
                ("Buji Takımı (4 Adet)", "İridyum uçlu uzun ömürlü buji seti", 450, 200, "YP-ELK-004"),
                ("Buji Kablosu Seti", "Silikon izolasyonlu 8mm buji kablosu takımı", 320, 90, "YP-ELK-005"),
                ("Akü 60Ah", "12V 60Ah MF akü, 540A marş gücü", 2800, 30, "YP-ELK-006"),
                ("Far Seti Ön Sol", "H7 projektör tip ön sol far grubu", 1900, 18, "YP-ELK-007"),
                ("Far Seti Ön Sağ", "H7 projektör tip ön sağ far grubu", 1900, 18, "YP-ELK-008"),
                ("Sensör Oksijen (Lambda)", "4 kablolu geniş bant lambda sensörü", 520, 60, "YP-ELK-009"),
                ("Cam Silecek Motoru", "12V ön cam silecek motoru, 2 hızlı", 750, 25, "YP-ELK-010"),
                # === ŞANZIMAN ===
                ("Debriyaj Seti Komple", "Baskı, balata ve bilya dahil debriyaj kiti", 2400, 22, "YP-SNZ-001"),
                ("Debriyaj Balatası", "Organik sürtünme malzemeli debriyaj diski", 850, 45, "YP-SNZ-002"),
                ("Debriyaj Baskısı", "Diyafram yaylı debriyaj baskı plakası", 1100, 35, "YP-SNZ-003"),
                ("Şanzıman Yağı 75W90 (1L)", "Tam sentetik şanzıman dişli yağı", 280, 150, "YP-SNZ-004"),
                ("Vites Teli", "Çelik örgülü vites kumanda teli", 350, 55, "YP-SNZ-005"),
                ("Aks Kafası İç", "Tripod tipi iç aks kafası, gresli", 780, 35, "YP-SNZ-006"),
                ("Aks Kafası Dış", "Sabit hızlı dış aks kafası, körüklü", 950, 30, "YP-SNZ-007"),
                ("Aks Körüğü", "Termoplastik aks körüğü, kelepçeli", 120, 180, "YP-SNZ-008"),
                # === SOĞUTMA SİSTEMİ ===
                ("Radyatör Komple", "Alüminyum çekirdekli motor radyatörü", 2800, 12, "YP-SOG-001"),
                ("Su Pompası", "Mekanik tahrikli motor su pompası", 650, 40, "YP-SOG-002"),
                ("Termostat", "82°C açılma sıcaklıklı termostat", 180, 120, "YP-SOG-003"),
                ("Radyatör Fanı Komple", "Elektrikli radyatör soğutma fan motoru", 1200, 20, "YP-SOG-004"),
                ("Antifriz 3L", "Organik bazlı -40°C antifriz konsantresi", 250, 200, "YP-SOG-005"),
                ("Radyatör Hortumu Üst", "EPDM kauçuk üst radyatör hortumu", 150, 80, "YP-SOG-006"),
                ("Radyatör Hortumu Alt", "EPDM kauçuk alt radyatör hortumu", 140, 80, "YP-SOG-007"),
                ("Genleşme Kabı", "Şeffaf polipropilen genleşme deposu", 220, 50, "YP-SOG-008"),
                # === EGZOZ SİSTEMİ ===
                ("Egzoz Manifoldu", "Döküm demir egzoz manifoldu, contası dahil", 1650, 15, "YP-EGZ-001"),
                ("Katalitik Konvertör", "Euro 5 uyumlu katalitik konvertör", 4500, 8, "YP-EGZ-002"),
                ("Egzoz Orta Boru", "Paslanmaz çelik esnek bağlantılı orta boru", 850, 25, "YP-EGZ-003"),
                ("Egzoz Susturucu Arka", "Çift çıkışlı arka susturucu", 1100, 20, "YP-EGZ-004"),
                ("Egzoz Contası", "Grafit dolgulu egzoz flanş contası", 65, 250, "YP-EGZ-005"),
                ("Egzoz Askı Lastiği", "Silikon bazlı egzoz askı takozu", 45, 300, "YP-EGZ-006"),
                # === YAKIT SİSTEMİ ===
                ("Yakıt Pompası Elektrikli", "Depo içi elektrikli yakıt pompası", 1350, 28, "YP-YAK-001"),
                ("Enjektör Takımı (4 Adet)", "Çok delikli yüksek basınç enjektör seti", 3200, 15, "YP-YAK-002"),
                ("Yakıt Filtresi", "10 mikron yakıt filtresi, su ayırıcılı", 180, 200, "YP-YAK-003"),
                ("Yakıt Deposu Kapağı", "Kilitli yakıt depo kapağı", 120, 100, "YP-YAK-004"),
                ("Gaz Teli", "Çelik örgülü gaz kumanda kablosu", 190, 70, "YP-YAK-005"),
                ("Yakıt Hortumu (1m)", "Benzin/Dizel uyumlu yakıt hortumu, 8mm", 85, 150, "YP-YAK-006"),
                ("Karbüratör Tamir Takımı", "Komple conta ve memeli karbüratör kit", 350, 40, "YP-YAK-007"),
                # === DİREKSİYON ===
                ("Direksiyon Pompası", "Hidrolik direksiyon servo pompası", 1850, 18, "YP-DIR-001"),
                ("Direksiyon Kutusu", "Kremayer tip direksiyon kutusu, yeni", 3500, 8, "YP-DIR-002"),
                ("Rot Başı Sol", "Dövme çelik sol dış rot başı", 220, 90, "YP-DIR-003"),
                ("Rot Başı Sağ", "Dövme çelik sağ dış rot başı", 220, 90, "YP-DIR-004"),
                ("Direksiyon Yağı 1L", "ATF III direksiyon hidrolik yağı", 160, 120, "YP-DIR-005"),
                ("Direksiyon Simidi Kılıfı", "Hakiki deri direksiyon kılıfı, universal", 280, 60, "YP-DIR-006"),
                # === FİLTRELER ===
                ("Yağ Filtresi", "Tam akışlı spin-on motor yağ filtresi", 85, 400, "YP-FLT-001"),
                ("Hava Filtresi", "Panel tip motor hava filtresi, orijinal uyum", 120, 300, "YP-FLT-002"),
                ("Polen Filtresi", "Aktif karbonlu kabin polen filtresi", 140, 250, "YP-FLT-003"),
                ("Yakıt Filtresi Dizel", "Su ayırıcılı dizel yakıt filtresi", 210, 180, "YP-FLT-004"),
                ("Şanzıman Filtresi", "Otomatik şanzıman yağ filtresi, contası dahil", 350, 60, "YP-FLT-005"),
                # === KAYIŞLAR & ZİNCİRLER ===
                ("Triger Seti Komple", "Kayış, gergi ve avare kasnak dahil triger kiti", 1450, 30, "YP-KYS-001"),
                ("V Kayışı Alternatör", "EPDM oluklu V kayışı, 6PK1750", 120, 150, "YP-KYS-002"),
                ("Triger Zinciri Seti", "Çift sıra sessiz zincir, kızaklar dahil", 2200, 20, "YP-KYS-003"),
                ("Gergi Rulmanı Triger", "Otomatik gergi mekanizmalı triger gergisi", 450, 55, "YP-KYS-004"),
                ("Avare Kasnak", "Kapalı rulmanli düz avare kasnak", 280, 70, "YP-KYS-005"),
                # === RULMANLAR ===
                ("Ön Teker Rulmanı", "Çift sıra konik makaralı teker rulmanı", 380, 80, "YP-RUL-001"),
                ("Arka Teker Rulmanı", "Sabit bilyalı arka teker rulmanı", 320, 80, "YP-RUL-002"),
                ("Debriyaj Bilyası", "Hidrolik debriyaj baskı bilyası", 550, 40, "YP-RUL-003"),
                ("Şaft Askı Rulmanı", "Kauçuk yataklı şaft orta askı rulmanı", 420, 35, "YP-RUL-004"),
                ("Alternatör Rulmanı", "6303-2RS kapalı tip alternatör rulmanı", 85, 120, "YP-RUL-005"),
                # === CONTALAR & KEÇELER ===
                ("Motor Conta Takımı Komple", "Tüm motor contaları, tam set", 1200, 20, "YP-CNT-001"),
                ("Karter Contası", "Silikon bazlı karter alt contası", 120, 100, "YP-CNT-002"),
                ("Supap Kapağı Contası", "Kauçuk supap kapağı contası", 95, 130, "YP-CNT-003"),
                ("Krank Keçesi Ön", "FKM (Viton) krank mili ön yağ keçesi", 65, 150, "YP-CNT-004"),
                ("Krank Keçesi Arka", "PTFE dudaklı krank mili arka keçe", 80, 140, "YP-CNT-005"),
                # === AYDINLATMA ===
                ("Stop Lambası Sol", "LED arka stop lambası sol taraf", 850, 25, "YP-AYD-001"),
                ("Stop Lambası Sağ", "LED arka stop lambası sağ taraf", 850, 25, "YP-AYD-002"),
                ("Sis Farı Ön (Çift)", "H11 ampullü ön sis farı seti", 650, 30, "YP-AYD-003"),
                ("Sinyal Lambası Yan", "LED yan sinyal tekrarlayıcı, kristal", 120, 100, "YP-AYD-004"),
                ("Far Ampulü H7 (Çift)", "%150 daha fazla ışık H7 performans ampul", 280, 200, "YP-AYD-005"),
                ("LED Gündüz Farı (Çift)", "6 LED'li DRL gündüz sürüş ışığı", 450, 45, "YP-AYD-006"),
                # === KAPORTA PARÇALARI ===
                ("Ön Tampon", "ABS plastik ön tampon, boyasız", 2200, 10, "YP-KPR-001"),
                ("Arka Tampon", "ABS plastik arka tampon, boyasız", 1900, 10, "YP-KPR-002"),
                ("Çamurluk Sol Ön", "Galvanizli çelik sol ön çamurluk", 1100, 15, "YP-KPR-003"),
                ("Çamurluk Sağ Ön", "Galvanizli çelik sağ ön çamurluk", 1100, 15, "YP-KPR-004"),
                ("Kaput", "Çelik motor kaputu, boyasız", 2800, 6, "YP-KPR-005"),
                ("Dış Dikiz Aynası Sol", "Elektrikli ısıtmalı sol dış ayna komple", 780, 20, "YP-KPR-006"),
                ("Dış Dikiz Aynası Sağ", "Elektrikli ısıtmalı sağ dış ayna komple", 780, 20, "YP-KPR-007"),
                ("Ön Cam", "Lamine güvenlik ön cam, orijinal ölçü", 3500, 5, "YP-KPR-008"),
            ]
            for name, desc, price, _, sku in products:
                random_stock = random.randint(19000, 40000)
                db.execute(text(
                    "INSERT INTO products (name, description, price, stock_quantity, sku) VALUES (:n, :d, :p, :s, :k)"
                ), {"n": name, "d": desc, "p": price, "s": random_stock, "k": sku})
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
app.include_router(favorites_router)

@app.get("/")
def read_root():
    return {
        "mesaj": "AradığınıBul Motoru Çalışıyor! 🚀",
        "durum": "Sistemler Çevrimiçi",
       
        "moduller": ["Katalog", "B2B İskonto", "İstek Listesi", "Sipariş İşlem Motoru", "Değerlendirme Sistemi", "Yapay Zeka Destekli Stok Analitiği"]
    }