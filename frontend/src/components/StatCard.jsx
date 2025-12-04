import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, valueClass = "text-blue-600", delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
        >
            <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                {label}
            </p>
            <motion.p
                className={`text-3xl font-bold ${valueClass}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
            >
                {value}
            </motion.p>
        </motion.div>
    );
};

export default StatCard;
