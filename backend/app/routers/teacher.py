from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List
from app.models import AssignmentCreate, GradeCreate, TransactionResponse
from app.blockchain import Transaction

router = APIRouter()

def get_blockchain(request: Request):
    return request.app.state.get_blockchain()

def get_wallet_manager(request: Request):
    return request.app.state.get_wallet_manager()

@router.post("/assignments", response_model=TransactionResponse)
async def create_assignment(
    assignment: AssignmentCreate,
    blockchain=Depends(get_blockchain),
    wallet_manager=Depends(get_wallet_manager)
):
    """
    Créer un nouveau devoir
    """
    try:
        # Vérifier que c'est bien un prof
        teacher = blockchain.participants.get(assignment.teacher_address)
        if not teacher or teacher["role"] != "TEACHER":
            raise HTTPException(status_code=403, detail="Only teachers can create assignments")
            
        # Créer la transaction
        tx_data = {
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date
        }
        
        transaction = Transaction(
            sender=assignment.teacher_address,
            receiver="ALL", # Broadcast à tous les étudiants
            transaction_type="ASSIGNMENT",
            data=tx_data
        )
        
        # Signer
        wallet = wallet_manager.get_wallet(assignment.teacher_address)
        if wallet:
            signature = wallet_manager.sign_transaction(
                transaction.to_dict(), 
                wallet["private_key"]
            )
            transaction.signature = signature
            
        if blockchain.add_transaction(transaction):
            return TransactionResponse(
                success=True,
                transaction_id=transaction.transaction_id,
                message="Assignment created and pending mining"
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to create assignment")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/submissions/{assignment_id}")
async def get_submissions(
    assignment_id: str,
    blockchain=Depends(get_blockchain)
):
    """
    Voir les soumissions pour un devoir
    """
    try:
        submissions = blockchain.get_submissions(assignment_id)
        return {
            "success": True,
            "count": len(submissions),
            "submissions": submissions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/grade", response_model=TransactionResponse)
async def grade_submission(
    grade_data: GradeCreate,
    blockchain=Depends(get_blockchain),
    wallet_manager=Depends(get_wallet_manager)
):
    """
    Noter une soumission
    """
    try:
        # Vérifier que c'est bien un prof
        teacher = blockchain.participants.get(grade_data.teacher_address)
        if not teacher or teacher["role"] != "TEACHER":
            raise HTTPException(status_code=403, detail="Only teachers can grade")
            
        tx_data = {
            "submission_id": grade_data.submission_id,
            "grade": grade_data.grade,
            "comment": grade_data.comment
        }
        
        transaction = Transaction(
            sender=grade_data.teacher_address,
            receiver=grade_data.student_address,
            transaction_type="GRADE",
            data=tx_data
        )
        
        # Signer
        wallet = wallet_manager.get_wallet(grade_data.teacher_address)
        if wallet:
            signature = wallet_manager.sign_transaction(
                transaction.to_dict(), 
                wallet["private_key"]
            )
            transaction.signature = signature
            
        if blockchain.add_transaction(transaction):
            return TransactionResponse(
                success=True,
                transaction_id=transaction.transaction_id,
                message="Grade recorded and pending mining"
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to record grade")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
