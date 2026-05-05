from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
import uvicorn

# Настройки
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="Streamlit Builder API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
security = HTTPBearer()

# Модели
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    name: str
    email: str

class TokenWithUser(Token):
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

# In-memory база данных (для демо)
users_db = {}
user_id_counter = 1

# Утилиты
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(email: str):
    return users_db.get(email)

def authenticate_user(email: str, password: str):
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = get_user(email)
    if user is None:
        raise credentials_exception
    return user

# Роуты
@app.post("/auth/register", response_model=TokenWithUser)
async def register(user: UserCreate):
    if get_user(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    global user_id_counter
    hashed_password = get_password_hash(user.password)
    user_dict = {
        "id": user_id_counter,
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password
    }
    users_db[user.email] = user_dict
    user_id_counter += 1

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user_dict["id"], "name": user_dict["name"], "email": user.email}
    }

@app.post("/auth/login", response_model=TokenWithUser)
async def login(user: UserLogin):
    user_db = authenticate_user(user.email, user.password)
    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user_db["id"], "name": user_db["name"], "email": user.email}
    }

@app.get("/auth/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "name": current_user["name"], "email": current_user["email"]}

@app.get("/")
async def root():
    return {"message": "Streamlit Builder API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)