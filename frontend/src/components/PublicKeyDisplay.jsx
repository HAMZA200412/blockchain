import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, CheckCircle, Clock, User } from 'lucide-react';

const PublicKeyDisplay = ({ publicKey, address, role, onComplete }) => {
    const [countdown, setCountdown] = useState(15);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Redirect after countdown
                    setTimeout(() => onComplete(), 100);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onComplete]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Erreur lors de la copie. Copiez manuellement l\'adresse.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-block"
                    >
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        🎉 Inscription Réussie !
                    </h2>
                    <p className="text-gray-600">
                        Bienvenue {role === 'TEACHER' ? "Professeur" : "Étudiant"}
                    </p>
                </div>

                {/* Countdown */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-2xl p-4 mb-6 text-center"
                >
                    <div className="flex items-center justify-center gap-3">
                        <Clock className="w-6 h-6 text-orange-600" />
                        <p className="text-lg font-bold text-orange-800">
                            Redirection automatique dans <span className="text-3xl">{countdown}</span> secondes
                        </p>
                    </div>
                </motion.div>

                {/* Address ID Display - MAIN FOCUS */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Votre Address ID (à conserver précieusement pour vous connecter)
                    </label>
                    <div className="relative">
                        <input
                            readOnly
                            value={address}
                            className="w-full p-4 border-2 border-blue-300 rounded-xl bg-blue-50 font-mono text-lg font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.target.select()}
                        />
                        <motion.button
                            onClick={copyToClipboard}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`mt-3 w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Address ID Copié !
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    Copier l'Address ID
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Public Key - Secondary Info (Collapsible) */}
                {publicKey && (
                    <details className="mb-6">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Voir aussi votre Clé Publique (optionnel)
                        </summary>
                        <textarea
                            readOnly
                            value={publicKey}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-mono text-xs h-24 resize-none mt-2"
                        />
                    </details>
                )}

                {/* Important Notice */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
                    <p className="text-sm text-yellow-800 font-semibold">
                        ⚠️ <strong>Important :</strong> Votre Address ID est votre identifiant unique pour vous connecter.
                        Copiez-le et conservez-le en lieu sûr !
                    </p>
                </div>

                {/* Manual Skip Button */}
                <motion.button
                    onClick={onComplete}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                    Passer à mon Dashboard →
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default PublicKeyDisplay;
