from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import pandas as pd
import models, auth
from database import get_db

router = APIRouter(prefix="/analytics", tags=["Veri Bilimi & Akıllı Stok Tahmini"])

@router.get("/stock-predictions")
def predict_stock_needs(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_admin_user)):
    # 1. Son 30 günün geçmiş satış verilerini çek
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Gerçek bir sistemde bu on binlerce satır demektir!
    items = db.query(models.OrderItem).join(models.Order).filter(
        models.Order.created_at >= thirty_days_ago,
        models.Order.current_status != "cancelled"
    ).all()
    
    if not items:
        return {"mesaj": "Sistemde analiz edilecek yeterli satış verisi henüz yok."}

    # 2. Veriyi Pandas DataFrame'e çevir (Veri Analizi başlıyor)
    data = [{"product_id": item.product_id, "quantity": item.quantity} for item in items]
    df = pd.DataFrame(data)
    
    # 3. Her ürün için toplam kaç adet satıldığını grupla ve hesapla
    sales_summary = df.groupby("product_id")["quantity"].sum().reset_index()
    
    alerts = []
    
    # 4. Geleceği Tahmin Etme (Predictive Model)
    for _, row in sales_summary.iterrows():
        pid = int(row["product_id"])
        total_sold_30_days = row["quantity"]
        
        # Günlük ortalama satış hızı
        daily_avg_sales = total_sold_30_days / 30
        # Önümüzdeki 7 gün beklenen talep
        predicted_7_days_demand = daily_avg_sales * 7 
        
        product = db.query(models.Product).filter(models.Product.id == pid).first()
        
        # Eğer beklenen 7 günlük talep, elimizdeki stoktan fazlaysa KRİTİK UYARI ver!
        if product and product.stock_quantity < predicted_7_days_demand:
            alerts.append({
                "urun_id": product.id,
                "urun_adi": product.name,
                "mevcut_stok": product.stock_quantity,
                "beklenen_7_gunluk_talep": round(predicted_7_days_demand, 1),
                "durum": "🚨 KRİTİK: Acil tedarikçiye sipariş geçilmeli!",
                # İhtiyacımız olandan biraz fazlasını alalım ki rafta güvenlik stoğu (Safety Stock) kalsın
                "gerekli_minimum_alim": int(predicted_7_days_demand - product.stock_quantity) + 10 
            })
            
    return {
        "analiz_edilen_sure": "Son 30 Gün",
        "riskli_urunler": alerts,
        "bilgi": "Sistem geçmiş verileri analiz ederek yaklaşan stok tükenme risklerini otomatik hesapladı."
    }