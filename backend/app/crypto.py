from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
import binascii
import json

class WalletManager:
    """Gère la création de portefeuilles et la cryptographie"""
    
    def __init__(self):
        self.wallets = {}  # Stockage en mémoire pour la démo (address -> private_key)
    
    def create_wallet(self, role: str, name: str, email: str):
        """Crée une nouvelle paire de clés RSA"""
        key = RSA.generate(2048)
        private_key = key.export_key().decode('utf-8')
        public_key = key.publickey().export_key().decode('utf-8')
        
        # L'adresse est dérivée de la clé publique (simplification)
        address = SHA256.new(public_key.encode('utf-8')).hexdigest()[:40]
        
        wallet_data = {
            "address": address,
            "public_key": public_key,
            "private_key": private_key,
            "role": role,
            "name": name,
            "email": email
        }
        
        self.wallets[address] = wallet_data
        return wallet_data
    
    def get_wallet(self, address: str):
        """Récupère un portefeuille par son adresse"""
        return self.wallets.get(address)
    
    def sign_transaction(self, transaction_dict: dict, private_key_pem: str) -> str:
        """Signe une transaction avec la clé privée"""
        try:
            # Créer le hash de la transaction (sans la signature)
            tx_string = json.dumps(transaction_dict, sort_keys=True)
            h = SHA256.new(tx_string.encode('utf-8'))
            
            # Signer le hash
            key = RSA.import_key(private_key_pem)
            signature = pkcs1_15.new(key).sign(h)
            
            return binascii.hexlify(signature).decode('utf-8')
        except Exception as e:
            print(f"Error signing transaction: {e}")
            return None
    
    def verify_signature(self, transaction_dict: dict, signature: str, public_key_pem: str) -> bool:
        """Vérifie la signature d'une transaction"""
        try:
            # Créer le hash de la transaction
            tx_string = json.dumps(transaction_dict, sort_keys=True)
            h = SHA256.new(tx_string.encode('utf-8'))
            
            # Vérifier la signature
            key = RSA.import_key(public_key_pem)
            pkcs1_15.new(key).verify(h, binascii.unhexlify(signature))
            return True
        except (ValueError, TypeError):
            return False
