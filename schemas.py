from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- 1. YORUM (REVIEW) ŞEMALARI ---
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Puan 1 ile 5 arasında olmalıdır")
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- 2. İNDİRİM KURALI (DISCOUNT RULE) ŞEMALARI ---
class DiscountRuleBase(BaseModel):
    min_quantity: int
    discount_percentage: float

class DiscountRuleCreate(DiscountRuleBase):
    pass

class DiscountRuleResponse(DiscountRuleBase):
    id: int

    class Config:
        from_attributes = True

# --- 3. ÜRÜN (PRODUCT) ŞEMALARI ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int
    sku: Optional[str] = None # Barkod/QR Numarası
    image_url: Optional[str] = None # Ürün resmi URL'si

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    discount_rules: List[DiscountRuleResponse] = [] # Ürünün toptan indirim kuralları
    reviews: List[ReviewResponse] = [] # Ürüne yapılan yorumlar

    class Config:
        from_attributes = True

# --- 4. SİPARİŞ TARİHÇESİ (ORDER HISTORY) ŞEMALARI ---
class OrderHistoryResponse(BaseModel):
    id: int
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- 5. SİPARİŞ KALEMİ (ORDER ITEM) ŞEMALARI ---
class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True

# --- 6. SİPARİŞ (ORDER) ŞEMALARI ---
class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    current_status: str
    created_at: datetime
    items: List[OrderItemResponse] = [] # Siparişteki ürünler
    history: List[OrderHistoryResponse] = [] # Siparişin kargo/hazırlık aşamaları

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: Optional[float] = None  # Frontend'den gelen indirimli KDV'li fiyat

class OrderCreate(BaseModel):
    items: List[OrderItemCreate] # Müşteri sadece ürün ID'si ve Miktar yollayacak
    total_price: Optional[float] = None  # Frontend'den gelen toplam tutar (KDV+İndirim dahil)

# --- 7. KULLANICI (USER) ŞEMALARI ---
class UserBase(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    favorites: List[ProductResponse] = [] # Müşterinin Wishlist (Favori) ürünleri

    class Config:
        from_attributes = True