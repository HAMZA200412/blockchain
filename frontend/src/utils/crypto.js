/**
 * RSA Encryption Utilities for Client-Side
 * Uses node-forge library for RSA-OAEP with SHA-256 (compatible with PyCryptodome backend)
 */

import forge from 'node-forge';

/**
 * Encrypts a message with a teacher's RSA public key using RSA-OAEP with SHA-256
 * @param {string} message - The plaintext message to encrypt
 * @param {string} publicKeyPEM - The teacher's RSA public key in PEM format
 * @returns {string|null} - The encrypted message in base64, or null if encryption fails
 */
export function encryptWithPublicKey(message, publicKeyPEM) {
    try {
        // Convert PEM to forge public key
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPEM);

        // Encrypt using RSA-OAEP with SHA-256 (matching backend configuration)
        const encrypted = publicKey.encrypt(message, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha256.create()
            }
        });

        // Encode to base64 (matching backend encoding)
        const encryptedBase64 = forge.util.encode64(encrypted);

        return encryptedBase64;
    } catch (error) {
        console.error('Error during encryption:', error);
        return null;
    }
}

/**
 * Formats a public key for display (shows first and last characters)
 * @param {string} publicKeyPEM - The public key in PEM format
 * @returns {string} - Formatted key preview
 */
export function formatPublicKeyPreview(publicKeyPEM) {
    if (!publicKeyPEM) return 'N/A';

    // Remove PEM headers and whitespace
    const keyBody = publicKeyPEM
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s/g, '');

    if (keyBody.length < 20) return keyBody;

    return `${keyBody.substring(0, 10)}...${keyBody.substring(keyBody.length - 10)}`;
}

/**
 * Validates if a string is properly formatted PEM public key
 * @param {string} publicKeyPEM - The public key to validate
 * @returns {boolean} - True if valid PEM format
 */
export function isValidPublicKey(publicKeyPEM) {
    if (!publicKeyPEM || typeof publicKeyPEM !== 'string') {
        return false;
    }

    return publicKeyPEM.includes('-----BEGIN PUBLIC KEY-----') &&
        publicKeyPEM.includes('-----END PUBLIC KEY-----');
}
