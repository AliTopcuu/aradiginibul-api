from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# --- ÇOKA-ÇOK İLİŞKİ: İSTEK LİSTESİ (WISHLIST) ---
# Kullanıcılar ve Ürünler arasındaki favori ilişkisini tutan ara tablo
user_favorites = Table(
    'user_favorites', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.id', ondelete="CASCADE"), primary_key=True)
)

# --- 1. KULLANICI (USER) TABLOSU ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="customer") # 'admin' veya 'customer'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # İlişkiler
    orders = relationship("Order", back_populates="owner")
    reviews = relationship("Review", back_populates="owner")
    favorites = relationship("Product", secondary=user_favorites, back_populates="favorited_by")

# --- 2. ÜRÜN (PRODUCT) TABLOSU ---
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)
    sku = Column(String, unique=True, index=True) # Barkod veya Orijinal Ürün Kodu (OEM)
    
    # İlişkiler
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    favorited_by = relationship("User", secondary=user_favorites, back_populates="favorites")
    discount_rules = relationship("DiscountRule", back_populates="product")

# --- 3. HACİMSEL FİYATLANDIRMA (DISCOUNT RULES) TABLOSU ---
# SAP SD'deki Pricing Conditions mantığı: Belli miktarın üzerine çıkınca uygulanacak indirim
class DiscountRule(Base):
    __tablename__ = "discount_rules"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    min_quantity = Column(Integer, nullable=False) # Örn: En az 50 koli alımda
    discount_percentage = Column(Float, nullable=False) # Örn: %15 indirim (15.0)

    product = relationship("Product", back_populates="discount_rules")

# --- 4. YORUM VE PUAN (REVIEW) TABLOSU ---
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    rating = Column(Integer, nullable=False) # 1-5 arası puan
    comment = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

# --- 5. SİPARİŞ BAŞLIĞI (ORDER) TABLOSU ---
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_price = Column(Float, default=0.0)
    current_status = Column(String, default="pending") # pending, processing, shipped, delivered
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    history = relationship("OrderHistory", back_populates="order")

# --- 6. SİPARİŞ KALEMLERİ (ORDER ITEMS) TABLOSU ---
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False) # Satın alındığı anki fiyat (İndirimli hali)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

# --- 7. SİPARİŞ DURUM TARİHÇESİ (ORDER HISTORY) TABLOSU ---
# Timeline (Zaman Çizelgesi) özelliğimiz için
class OrderHistory(Base):
    __tablename__ = "order_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String) # Örn: "Kargo firmasına teslim edildi, Takip No: 12345"

    order = relationship("Order", back_populates="history")