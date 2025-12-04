import React from 'react';
import { Book } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ userRole, userName }) => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-white/95"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                            <Book className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                EduChain
                            </span>
                            <p className="text-xs text-gray-500 -mt-1">Blockchain Education</p>
                        </div>
                    </motion.div>

                    {userRole && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                                <p className="text-xs text-gray-500 capitalize">{userRole.toLowerCase()}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
