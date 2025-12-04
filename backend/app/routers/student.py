from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List
from app.models import AssignmentCreate, SubmissionCreate, TransactionResponse
from app.blockchain import Transaction

router = APIRouter()

def get_blockchain(request: Request):
    return request.app.state.get_blockchain()

def get_wallet_manager(request: Request):
    return request.app.state.get_wallet_manager()

@router.get("/assignments")
async def get_assignments(
    student_address: str = None,
    blockchain=Depends(get_blockchain)
):
    """
    Liste les devoirs disponibles pour un étudiant
    """
    try:
        assignments = blockchain.get_assignments(student_address)
        return {
            "success": True,
            "count": len(assignments),
            "assignments": assignments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit", response_model=TransactionResponse)
async def submit_assignment(
    submission: SubmissionCreate,
    blockchain=Depends(get_blockchain),
    wallet_manager=Depends(get_wallet_manager)
):
    """
    Soumettre un devoir
    """
    try:
        # Vérifier que l'étudiant existe
        if submission.student_address not in blockchain.participants:
            raise HTTPException(status_code=404, detail="Student not found")
            
        # Créer la transaction de soumission
        tx_data = {
            "assignment_id": submission.assignment_id,
            "content": submission.content,
            "student_name": submission.student_name
        }
        
        transaction = Transaction(
            sender=submission.student_address,
            receiver="SYSTEM", # Ou l'adresse du prof si on l'avait
            transaction_type="SUBMISSION",
            data=tx_data
        )
        
        # Signer la transaction (simulation car on a la clé privée en mémoire)
        wallet = wallet_manager.get_wallet(submission.student_address)
        if wallet:
            signature = wallet_manager.sign_transaction(
                transaction.to_dict(), 
                wallet["private_key"]
            )
            transaction.signature = signature
        
        # Ajouter à la blockchain
        if blockchain.add_transaction(transaction):
            return TransactionResponse(
                success=True,
                transaction_id=transaction.transaction_id,
                message="Submission received and pending mining"
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to add transaction")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/grades/{student_address}")
async def get_grades(
    student_address: str,
    blockchain=Depends(get_blockchain)
):
    """
    Voir ses notes
    """
    try:
        grades = blockchain.get_grades(student_address)
        return {
            "success": True,
            "count": len(grades),
            "grades": grades
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
