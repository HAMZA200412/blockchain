import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, User } from 'lucide-react';

const AnnouncementCard = ({ announcement, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all"
        >
            <div className="flex items-start gap-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0"
                >
                    <Bell className="w-6 h-6 text-white" />
                </motion.div>

                <div className="flex-1">
                    <h4 className="font-bold text-xl text-gray-800 mb-2">
                        {announcement.data.title}
                    </h4>

                    <p className="text-gray-700 leading-relaxed mb-3">
                        {announcement.data.message}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(announcement.timestamp * 1000).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>

                        {announcement.sender && (
                            <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Enseignant
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnnouncementCard;
