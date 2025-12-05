from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List
from app.models import (
    AssignmentCreate, GradeCreate, TransactionResponse,
    EncryptionKeyPair, DecryptRequest, AnnouncementCreate
)
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
        
        # Récupérer ou générer la clé de chiffrement de l'enseignant
        encryption_keys = wallet_manager.get_encryption_keys(assignment.teacher_address)
        if not encryption_keys:
            encryption_keys = wallet_manager.generate_encryption_keypair(assignment.teacher_address)
        
        # Créer la transaction
        tx_data = {
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "encryption_public_key": encryption_keys["public_key"]  # Inclure la clé publique
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
        
        # Récupérer la soumission par son ID
        submission = blockchain.get_submission_by_id(grade_data.submission_id)
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        assignment_id = submission["data"].get("assignment_id")
        
        # Vérifier si l'enseignant a déjà noté cet étudiant pour ce devoir
        if blockchain.has_teacher_graded(grade_data.teacher_address, grade_data.student_address, assignment_id):
            raise HTTPException(
                status_code=400,
                detail="You have already submitted a correction for this student for this assignment"
            )
            
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

@router.post("/encryption-keys", response_model=EncryptionKeyPair)
async def generate_encryption_keys(
    teacher_address: str,
    wallet_manager=Depends(get_wallet_manager)
):
    """
    Génère une paire de clés RSA pour le chiffrement des soumissions
    """
    try:
        # Vérifier si les clés existent déjà
        existing_keys = wallet_manager.get_encryption_keys(teacher_address)
        if existing_keys:
            return EncryptionKeyPair(**existing_keys)
        
        # Générer de nouvelles clés
        keypair = wallet_manager.generate_encryption_keypair(teacher_address)
        return EncryptionKeyPair(**keypair)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/encryption-keys/{teacher_address}")
async def get_encryption_public_key(
    teacher_address: str,
    wallet_manager=Depends(get_wallet_manager)
):
    """
    Récupère la clé publique de chiffrement d'un enseignant
    """
    keys = wallet_manager.get_encryption_keys(teacher_address)
    if not keys:
        raise HTTPException(status_code=404, detail="Encryption keys not found for this teacher")
    
    return {
        "public_key": keys["public_key"],
        "address": keys["address"]
    }

@router.post("/announcements", response_model=TransactionResponse)
async def create_announcement(
    announcement: AnnouncementCreate,
    blockchain=Depends(get_blockchain),
    wallet_manager=Depends(get_wallet_manager)
):
    """
    Créer une annonce pour les étudiants
    """
    try:
        # Vérifier que c'est bien un prof
        teacher = blockchain.participants.get(announcement.teacher_address)
        if not teacher or teacher["role"] != "TEACHER":
            raise HTTPException(status_code=403, detail="Only teachers can create announcements")
        
        # Créer la transaction
        tx_data = {
            "title": announcement.title,
            "message": announcement.message
        }
        
        # Déterminer le destinataire
        receiver = "ALL" if not announcement.target_students else ",".join(announcement.target_students)
        
        transaction = Transaction(
            sender=announcement.teacher_address,
            receiver=receiver,
            transaction_type="ANNOUNCEMENT",
            data=tx_data
        )
        
        # Signer
        wallet = wallet_manager.get_wallet(announcement.teacher_address)
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
                message="Announcement created and pending mining"
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to create announcement")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/decrypt-submission")
async def decrypt_submission(
    request: DecryptRequest,
    wallet_manager=Depends(get_wallet_manager)
):
    """
    Déchiffre une soumission avec la clé privée de l'enseignant
    """
    try:
        # Récupérer les clés de chiffrement
        keys = wallet_manager.get_encryption_keys(request.teacher_address)
        if not keys:
            raise HTTPException(status_code=404, detail="Encryption keys not found")
        
        # Déchiffrer le contenu
        decrypted_content = wallet_manager.decrypt_with_private_key(
            request.encrypted_content,
            keys["private_key"]
        )
        
        if decrypted_content is None:
            raise HTTPException(status_code=400, detail="Failed to decrypt content")
        
        return {
            "success": True,
            "decrypted_content": decrypted_content
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
