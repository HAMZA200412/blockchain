from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any

# --- User & Auth Models ---

class UserRegistration(BaseModel):
    name: str
    email: EmailStr
    role: str  # "STUDENT" or "TEACHER"

class WalletResponse(BaseModel):
    address: str
    public_key: str
    role: str
    name: str
    email: str

# --- Blockchain Models ---

class BlockchainInfo(BaseModel):
    length: int
    difficulty: int
    participants: int
    is_valid: bool
    pending_transactions: int
    latest_block: Dict[str, Any]

class MiningRequest(BaseModel):
    miner_address: str

class TransactionResponse(BaseModel):
    success: bool
    transaction_id: Optional[str]
    message: str
    data: Optional[Dict[str, Any]] = None

# --- Education Models ---

class AssignmentCreate(BaseModel):
    title: str
    description: str
    due_date: str
    teacher_address: str

class SubmissionCreate(BaseModel):
    assignment_id: str
    student_address: str
    content: str  # URL or text content
    student_name: str

class GradeCreate(BaseModel):
    submission_id: str
    student_address: str
    grade: float
    comment: str
    teacher_address: str
