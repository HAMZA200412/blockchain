import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Hero = ({ onRegister, onLogin }) => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white rounded-2xl shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative p-8 md:p-12 lg:p-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                        <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                            Plateforme Éducative Blockchain
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        Système de Gestion des Contrôles
                        <span className="block bg-white text-transparent bg-clip-text">
                            Transparent & Sécurisé
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl leading-relaxed">
                        Une solution blockchain innovante garantissant la sécurité, la transparence
                        et l'équité dans la gestion des devoirs et des évaluations académiques.
                    </p>

                    <motion.div
                        className="flex flex-wrap gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.button
                            onClick={onRegister}
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            S'inscrire Maintenant
                        </motion.button>
                        <motion.button
                            onClick={onLogin}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
                        >
                            Se Connecter
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
