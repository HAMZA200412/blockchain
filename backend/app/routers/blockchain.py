"""
Routes pour la blockchain et la gestion des utilisateurs
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List

from app.models import (
    UserRegistration, WalletResponse, BlockchainInfo,
    MiningRequest, TransactionResponse
)


router = APIRouter()


def get_blockchain(request: Request):
    """Dépendance pour obtenir la blockchain"""
    return request.app.state.get_blockchain()


def get_wallet_manager(request: Request):
    """Dépendance pour obtenir le wallet manager"""
    return request.app.state.get_wallet_manager()


@router.post("/register", response_model=WalletResponse)
async def register_user(
    user: UserRegistration,
    blockchain=Depends(get_blockchain),
    wallet_manager=Depends(get_wallet_manager)
):
    """
    Enregistrer un nouveau participant (étudiant ou enseignant)
    """
    try:
        # Créer un portefeuille pour l'utilisateur
        wallet = wallet_manager.create_wallet(
            role=user.role,
            name=user.name,
            email=user.email
        )
        
        # Enregistrer dans la blockchain
        participant = blockchain.register_participant(
            address=wallet["address"],
            role=user.role,
            public_key=wallet["public_key"],
            name=user.name,
            email=user.email
        )
        
        # Retourner le portefeuille (sans la clé privée dans la réponse principale)
        return WalletResponse(
            address=wallet["address"],
            public_key=wallet["public_key"],
            role=wallet["role"],
            name=wallet["name"],
            email=wallet["email"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wallet/{address}")
async def get_wallet(
    address: str,
    wallet_manager=Depends(get_wallet_manager)
):
    """
    Récupérer les informations d'un portefeuille
    """
    wallet = wallet_manager.get_wallet(address)
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Ne pas exposer la clé privée dans cette route
    return {
        "address": wallet["address"],
        "public_key": wallet["public_key"],
        "role": wallet["role"],
        "name": wallet["name"],
        "email": wallet["email"]
    }


@router.post("/mine", response_model=TransactionResponse)
async def mine_block(
    mining_request: MiningRequest,
    blockchain=Depends(get_blockchain)
):
    """
    Miner les transactions en attente
    """
    try:
        if len(blockchain.pending_transactions) == 0:
            raise HTTPException(status_code=400, detail="No transactions to mine")
        
        block = blockchain.mine_pending_transactions(mining_request.miner_address)
        
        if block:
            return TransactionResponse(
                success=True,
                transaction_id=None,
                message=f"Block mined successfully. Block index: {block.index}",
                data={
                    "block_index": block.index,
                    "block_hash": block.hash,
                    "transactions_count": len(block.transactions)
                }
            )
        else:
            raise HTTPException(status_code=500, detail="Mining failed")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/info", response_model=BlockchainInfo)
async def get_blockchain_info(blockchain=Depends(get_blockchain)):
    """
    Obtenir les informations sur la blockchain
    """
    try:
        info = blockchain.get_chain_info()
        return BlockchainInfo(**info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chain")
async def get_full_chain(blockchain=Depends(get_blockchain)):
    """
    Récupérer toute la chaîne de blocs
    """
    try:
        chain = blockchain.export_chain()
        return {
            "success": True,
            "length": len(chain),
            "chain": chain
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/validate")
async def validate_chain(blockchain=Depends(get_blockchain)):
    """
    Valider l'intégrité de la blockchain
    """
    try:
        is_valid = blockchain.is_chain_valid()
        return {
            "success": True,
            "is_valid": is_valid,
            "message": "Blockchain is valid" if is_valid else "Blockchain is corrupted"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/participants")
async def get_all_participants(blockchain=Depends(get_blockchain)):
    """
    Récupérer tous les participants
    """
    try:
        participants = list(blockchain.participants.values())
        
        # Grouper par rôle
        teachers = [p for p in participants if p["role"] == "TEACHER"]
        students = [p for p in participants if p["role"] == "STUDENT"]
        
        return {
            "success": True,
            "total": len(participants),
            "teachers": teachers,
            "students": students,
            "teachers_count": len(teachers),
            "students_count": len(students)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/participant/{address}")
async def get_participant(
    address: str,
    blockchain=Depends(get_blockchain)
):
    """
    Récupérer les informations d'un participant
    """
    if address not in blockchain.participants:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    return {
        "success": True,
        "participant": blockchain.participants[address]
    }


@router.get("/transactions/{address}")
async def get_user_transactions(
    address: str,
    blockchain=Depends(get_blockchain)
):
    """
    Récupérer toutes les transactions d'un utilisateur
    """
    try:
        if address not in blockchain.participants:
            raise HTTPException(status_code=404, detail="User not found")
        
        transactions = blockchain.get_transactions_by_address(address)
        
        # Grouper par type
        by_type = {}
        for tx in transactions:
            tx_type = tx["type"]
            if tx_type not in by_type:
                by_type[tx_type] = []
            by_type[tx_type].append(tx)
        
        return {
            "success": True,
            "address": address,
            "total_transactions": len(transactions),
            "transactions": transactions,
            "by_type": by_type
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pending-transactions")
async def get_pending_transactions(blockchain=Depends(get_blockchain)):
    """
    Récupérer les transactions en attente
    """
    try:
        pending = [tx.to_dict() for tx in blockchain.pending_transactions]
        return {
            "success": True,
            "count": len(pending),
            "transactions": pending
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics")
async def get_statistics(blockchain=Depends(get_blockchain)):
    """
    Récupérer des statistiques sur le système
    """
    try:
        # Compter les différents types de transactions
        transaction_counts = {
            "ASSIGNMENT": 0,
            "SUBMISSION": 0,
            "GRADE": 0,
            "ANNOUNCEMENT": 0,
            "REGISTRATION": 0,
            "REWARD": 0
        }
        
        for block in blockchain.chain[1:]:  # Ignorer le bloc genesis
            for tx in block.transactions:
                tx_type = tx.get("type")
                if tx_type in transaction_counts:
                    transaction_counts[tx_type] += 1
        
        participants = blockchain.participants
        teachers_count = sum(1 for p in participants.values() if p["role"] == "TEACHER")
        students_count = sum(1 for p in participants.values() if p["role"] == "STUDENT")
        
        return {
            "success": True,
            "blockchain": {
                "total_blocks": len(blockchain.chain),
                "difficulty": blockchain.difficulty,
                "is_valid": blockchain.is_chain_valid()
            },
            "participants": {
                "total": len(participants),
                "teachers": teachers_count,
                "students": students_count
            },
            "transactions": transaction_counts,
            "pending_transactions": len(blockchain.pending_transactions)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))