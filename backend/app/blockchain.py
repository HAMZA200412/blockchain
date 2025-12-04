"""
Blockchain Core Module - Système de Gestion des Contrôles Éducatifs
"""
import hashlib
import json
import time
from typing import List, Dict, Optional
from datetime import datetime


class Block:
    """Classe représentant un bloc dans la blockchain"""
    
    def __init__(self, index: int, timestamp: float, transactions: List[Dict], 
                 previous_hash: str, nonce: int = 0):
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calcule le hash SHA-256 du bloc"""
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty: int):
        """Mine le bloc avec la difficulté spécifiée (Proof of Work)"""
        target = "0" * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
    
    def to_dict(self) -> Dict:
        """Convertit le bloc en dictionnaire"""
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
            "hash": self.hash
        }


class Transaction:
    """Classe représentant une transaction dans la blockchain"""
    
    def __init__(self, sender: str, receiver: str, transaction_type: str, 
                 data: Dict, signature: Optional[str] = None):
        self.sender = sender
        self.receiver = receiver
        self.transaction_type = transaction_type  # ASSIGNMENT, SUBMISSION, GRADE, ANNOUNCEMENT
        self.data = data
        self.timestamp = time.time()
        self.signature = signature
        self.transaction_id = self.generate_id()
    
    def generate_id(self) -> str:
        """Génère un ID unique pour la transaction"""
        transaction_string = json.dumps({
            "sender": self.sender,
            "receiver": self.receiver,
            "type": self.transaction_type,
            "timestamp": self.timestamp
        }, sort_keys=True)
        return hashlib.sha256(transaction_string.encode()).hexdigest()
    
    def to_dict(self) -> Dict:
        """Convertit la transaction en dictionnaire"""
        return {
            "transaction_id": self.transaction_id,
            "sender": self.sender,
            "receiver": self.receiver,
            "type": self.transaction_type,
            "data": self.data,
            "timestamp": self.timestamp,
            "signature": self.signature
        }


class Blockchain:
    """Classe principale de la blockchain"""
    
    def __init__(self, difficulty: int = 4):
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        self.difficulty = difficulty
        self.mining_reward = 10
        self.participants: Dict[str, Dict] = {}  # Stocke les participants (étudiants et enseignants)
        
        # Créer le bloc genesis
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Crée le premier bloc de la chaîne"""
        genesis_block = Block(0, time.time(), [], "0")
        genesis_block.mine_block(self.difficulty)
        self.chain.append(genesis_block)
    
    def get_latest_block(self) -> Block:
        """Retourne le dernier bloc de la chaîne"""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Transaction) -> bool:
        """Ajoute une transaction à la liste des transactions en attente"""
        if not transaction.sender or not transaction.receiver:
            return False
        
        self.pending_transactions.append(transaction)
        return True
    
    def mine_pending_transactions(self, miner_address: str):
        """Mine les transactions en attente et crée un nouveau bloc"""
        if not self.pending_transactions:
            return None
        
        # Créer un nouveau bloc avec les transactions en attente
        block = Block(
            len(self.chain),
            time.time(),
            [tx.to_dict() for tx in self.pending_transactions],
            self.get_latest_block().hash
        )
        
        # Miner le bloc
        block.mine_block(self.difficulty)
        
        # Ajouter le bloc à la chaîne
        self.chain.append(block)
        
        # Réinitialiser les transactions en attente et ajouter une récompense
        self.pending_transactions = [
            Transaction("SYSTEM", miner_address, "REWARD", {"amount": self.mining_reward})
        ]
        
        return block
    
    def is_chain_valid(self) -> bool:
        """Vérifie l'intégrité de la blockchain"""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # Vérifier le hash du bloc actuel
            if current_block.hash != current_block.calculate_hash():
                return False
            
            # Vérifier la liaison avec le bloc précédent
            if current_block.previous_hash != previous_block.hash:
                return False
            
            # Vérifier la preuve de travail
            if not current_block.hash.startswith("0" * self.difficulty):
                return False
        
        return True
    
    def register_participant(self, address: str, role: str, public_key: str, 
                           name: str, email: str) -> Dict:
        """Enregistre un participant (étudiant ou enseignant)"""
        if address in self.participants:
            return {"error": "Participant already exists"}
        
        self.participants[address] = {
            "address": address,
            "role": role,  # "TEACHER" ou "STUDENT"
            "public_key": public_key,
            "name": name,
            "email": email,
            "registered_at": time.time()
        }
        
        # Créer une transaction d'enregistrement
        registration_tx = Transaction(
            "SYSTEM",
            address,
            "REGISTRATION",
            {
                "role": role,
                "name": name,
                "email": email,
                "public_key": public_key
            }
        )
        self.add_transaction(registration_tx)
        
        return self.participants[address]
    
    def get_transactions_by_address(self, address: str) -> List[Dict]:
        """Récupère toutes les transactions liées à une adresse"""
        transactions = []
        
        for block in self.chain[1:]:  # Ignorer le bloc genesis
            for tx in block.transactions:
                if tx["sender"] == address or tx["receiver"] == address:
                    tx_with_block = tx.copy()
                    tx_with_block["block_index"] = block.index
                    tx_with_block["block_hash"] = block.hash
                    transactions.append(tx_with_block)
        
        return transactions
    
    def get_assignments(self, student_address: Optional[str] = None) -> List[Dict]:
        """Récupère les devoirs (assignments)"""
        assignments = []
        
        for block in self.chain[1:]:
            for tx in block.transactions:
                if tx["type"] == "ASSIGNMENT":
                    if student_address is None or tx["receiver"] == student_address or tx["receiver"] == "ALL":
                        assignment = tx.copy()
                        assignment["block_index"] = block.index
                        assignments.append(assignment)
        
        return assignments
    
    def get_submissions(self, assignment_id: str) -> List[Dict]:
        """Récupère les soumissions pour un devoir spécifique"""
        submissions = []
        
        for block in self.chain[1:]:
            for tx in block.transactions:
                if tx["type"] == "SUBMISSION" and tx["data"].get("assignment_id") == assignment_id:
                    submission = tx.copy()
                    submission["block_index"] = block.index
                    submissions.append(submission)
        
        return submissions
    
    def get_grades(self, student_address: str) -> List[Dict]:
        """Récupère les notes d'un étudiant"""
        grades = []
        
        for block in self.chain[1:]:
            for tx in block.transactions:
                if tx["type"] == "GRADE" and tx["receiver"] == student_address:
                    grade = tx.copy()
                    grade["block_index"] = block.index
                    grades.append(grade)
        
        return grades
    
    def get_chain_info(self) -> Dict:
        """Retourne les informations sur la blockchain"""
        return {
            "length": len(self.chain),
            "difficulty": self.difficulty,
            "pending_transactions": len(self.pending_transactions),
            "participants": len(self.participants),
            "is_valid": self.is_chain_valid(),
            "latest_block": self.get_latest_block().to_dict()
        }
    
    def export_chain(self) -> List[Dict]:
        """Exporte toute la chaîne"""
        return [block.to_dict() for block in self.chain]