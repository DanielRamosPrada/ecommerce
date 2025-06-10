from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Annotated
from supabase import create_client, client
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext


# Cargar las variables de entorno
load_dotenv()

# Inicializar la aplicación FastAPI
app = FastAPI()

# Configuración de Supabase
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: client = create_client(url, key)

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#creacion de modelos

# PRODUCTOS -----------------------------------------------
class ProductBase(BaseModel):
    name: str
    price: float
    size: int
    quantity: int
    gender: Optional[str] = None
    img_url: str

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: str

# USUARIOS -----------------------------------------------

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    rol: str = "USER"
    pass

class UserCreate(UserBase):
    password: Annotated[str, Field(min_length=6)]

class UserOut(UserBase):
    id: str

class UserInDB(UserBase):
    id: str
    hashed_password: str

# ORDENES -----------------------------------------------

class OrderItem(BaseModel):
    name: str
    price: float

class OrderCreate(BaseModel):
    user_email: str
    items: List[OrderItem]
    total: float
    date: str
    status: str

# Configuración de seguridad para el hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
    
# Función para manejar las respuestas de Supabase
def handle_supabase_response(response):
    if not response.data:
        raise HTTPException(status_code=500, detail="Supabase error: No data returned")
    return response.data

# PRODUCTOS -----------------------------------------------

# Lista de productos
@app.get("/products", response_model=List[Product])
def get_products():
    response = supabase.table("products").select("*").execute()
    return handle_supabase_response(response)

# Crear producto
@app.post("/products", response_model=Product)
def create_product(product: ProductCreate):
    response = supabase.table("products").insert(product.model_dump()).execute()
    data = handle_supabase_response(response)
    # Supabase devuelve una lista con el nuevo producto
    return data[0]

# Actualizar producto
@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: str, product: ProductCreate):
    response = supabase.table("products").update(product.model_dump(exclude_unset=True)).eq("id", product_id).execute()
    data = handle_supabase_response(response)
    if not data:
        raise HTTPException(status_code=404, detail="Product not found")
    return data[0]

# Eliminar producto
@app.delete("/products/{product_id}")
def delete_product(product_id: str):  # <-- str en vez de int
    response = supabase.table("products").delete().eq("id", product_id).execute()
    data = handle_supabase_response(response)
    if not data:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted"}

# USUARIOS -----------------------------------------------

# lista de usuarios
@app.get("/users", response_model=List[UserOut])
def get_users():
    response = supabase.table("users").select("*").execute()
    return handle_supabase_response(response)

# Crear usuario
@app.post("/users", response_model=UserOut)
def create_user(user: UserCreate):
    hashed_pw = hash_password(user.password)
    user_data = user.model_dump(exclude={"password"})
    user_data["hashed_password"] = hashed_pw
    response = supabase.table("users").insert(user_data).execute()
    data = handle_supabase_response(response)
    return data[0]

@app.post("/login")
def login(user: UserCreate):
    # Buscar usuario por email
    response = supabase.table("users").select("*").eq("email", user.email).execute()
    data = handle_supabase_response(response)
    if not data:
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    user_db = data[0]
    # Verificar contraseña
    if not verify_password(user.password, user_db["hashed_password"]):
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    # Devuelve también full_name
    return {
        "message": "Login exitoso",
        "user": {
            "id": user_db["id"],
            "email": user_db["email"],
            "full_name": user_db["full_name"],  # <-- agregado aquí
            "rol": user_db["rol"]
        }
    }

# ORDENES -----------------------------------------------
@app.get("/orders")
def get_orders():
    response = supabase.table("orders").select("*").execute()
    # La mayoría de versiones modernas no tienen .error, solo .data
    if not hasattr(response, "data") or response.data is None:
        return []
    return response.data

@app.post("/orders")
def create_order(order: OrderCreate):
    print(order)
    response = supabase.table("orders").insert(order.model_dump()).execute()
    data = handle_supabase_response(response)
    return {"message": "Orden guardada", "order": data[0] if data else order}