from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.blockchain import Blockchain
from app.crypto import WalletManager
from app.routers import blockchain, student, teacher

# État global de l'application
class AppState:
    def __init__(self):
        self.blockchain = Blockchain()
        self.wallet_manager = WalletManager()

    def get_blockchain(self):
        return self.blockchain

    def get_wallet_manager(self):
        return self.wallet_manager

# Initialisation au démarrage
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialiser la blockchain et le wallet manager
    app.state = AppState()
    print("Blockchain system initialized")
    yield
    # Nettoyage à l'arrêt (si nécessaire)
    print("Shutting down blockchain system")

app = FastAPI(
    title="Blockchain Education System",
    description="API pour le système de gestion des contrôles éducatifs basé sur la blockchain",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
origins = [
    "http://localhost:5173",  # Frontend Vite par défaut
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["Blockchain"])
app.include_router(student.router, prefix="/api/student", tags=["Student"])
app.include_router(teacher.router, prefix="/api/teacher", tags=["Teacher"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Blockchain Education System API",
        "status": "running",
        "docs": "/docs"
    }
