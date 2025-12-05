import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Award, FileText, User, Calendar, Send, CheckCircle, Bell, Lock } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import AnnouncementCard from './AnnouncementCard';
import { encryptWithPublicKey } from '../utils/crypto';

const API_URL = 'http://localhost:8000/api';

const StudentDashboard = ({ address, name, onLogout }) => {
    const [assignments, setAssignments] = useState([]);
    const [grades, setGrades] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [activeTab, setActiveTab] = useState('assignments');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assResponse, gradesResponse, annResponse] = await Promise.all([
                fetch(`${API_URL}/student/assignments?student_address=${address}`),
                fetch(`${API_URL}/student/grades/${address}`),
                fetch(`${API_URL}/student/announcements?student_address=${address}`),
            ]);

            const assData = await assResponse.json();
            const gradesData = await gradesResponse.json();
            const annData = await annResponse.json();

            if (assData.success) setAssignments(assData.assignments);
            if (gradesData.success) setGrades(gradesData.grades);
            if (annData.success) setAnnouncements(annData.announcements);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Espace Étudiant</h2>
                        <p className="text-blue-100 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Bienvenue, {name}
                        </p>
                    </div>
                    <motion.button
                        onClick={onLogout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
                    >
                        Déconnexion
                    </motion.button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 mt-6">
                    <TabButton
                        active={activeTab === 'assignments'}
                        onClick={() => setActiveTab('assignments')}
                        icon={<BookOpen className="w-5 h-5" />}
                        label="Devoirs"
                    />
                    <TabButton
                        active={activeTab === 'grades'}
                        onClick={() => setActiveTab('grades')}
                        icon={<Award className="w-5 h-5" />}
                        label="Mes Notes"
                    />
                    <TabButton
                        active={activeTab === 'announcements'}
                        onClick={() => setActiveTab('announcements')}
                        icon={<Bell className="w-5 h-5" />}
                        label="Annonces"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'assignments' && (
                        <motion.div
                            key="assignments"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Devoirs Disponibles</h3>
                            {assignments.length === 0 ? (
                                <EmptyState icon={<BookOpen />} message="Aucun devoir disponible pour le moment." />
                            ) : (
                                <div className="grid gap-6">
                                    {assignments.map((assignment, index) => (
                                        <StudentAssignmentCard
                                            key={assignment.transaction_id}
                                            assignment={assignment}
                                            studentAddress={address}
                                            studentName={name}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'grades' && (
                        <motion.div
                            key="grades"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Mes Notes</h3>
                            {grades.length === 0 ? (
                                <EmptyState icon={<Award />} message="Aucune note reçue pour le moment." />
                            ) : (
                                <div className="space-y-6">
                                    {grades.map((grade, index) => (
                                        <GradeCard key={grade.transaction_id} grade={grade} index={index} />
                                    ))}
                                </div>
                            )}\n                        </motion.div>
                    )}

                    {activeTab === 'announcements' && (
                        <motion.div
                            key="announcements"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Annonces des Enseignants</h3>
                            {announcements.length === 0 ? (
                                <EmptyState icon={<Bell />} message="Aucune annonce pour le moment." />
                            ) : (
                                <div className="space-y-4">
                                    {announcements.map((announcement, index) => (
                                        <AnnouncementCard
                                            key={announcement.transaction_id}
                                            announcement={announcement}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// Sub-components
const TabButton = ({ active, onClick, icon, label }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${active
            ? 'bg-white text-blue-600 shadow-lg'
            : 'bg-white/20 text-white hover:bg-white/30'
            }`}
    >
        {icon}
        {label}
    </motion.button>
);

const StudentAssignmentCard = ({ assignment, studentAddress, studentName, index }) => {
    const [submitting, setSubmitting] = useState(false);
    const [content, setContent] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Vérifier au montage si l'étudiant a déjà soumis ce devoir
    useEffect(() => {
        const checkSubmission = async () => {
            try {
                const response = await fetch(`${API_URL}/teacher/submissions/${assignment.transaction_id}`);
                if (response.ok) {
                    const data = await response.json();
                    // Vérifier si une soumission existe pour cet étudiant
                    const alreadySubmitted = data.submissions?.some(
                        sub => sub.sender === studentAddress
                    );
                    if (alreadySubmitted) {
                        setSubmitted(true);
                    }
                }
            } catch (error) {
                console.error('Error checking submission:', error);
            }
        };
        checkSubmission();
    }, [assignment.transaction_id, studentAddress]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Get the teacher's public encryption key from the assignment
            const publicKey = assignment.data.encryption_public_key;

            if (!publicKey) {
                alert('Erreur : Clé de chiffrement introuvable pour ce devoir');
                setSubmitting(false);
                return;
            }

            // Encrypt the submission content
            const encryptedContent = encryptWithPublicKey(content, publicKey);

            if (!encryptedContent) {
                alert('Erreur lors du chiffrement de la réponse');
                setSubmitting(false);
                return;
            }

            const response = await fetch(`${API_URL}/student/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignment_id: assignment.transaction_id,
                    student_address: studentAddress,
                    encrypted_content: encryptedContent,  // Send encrypted content
                    student_name: studentName,
                }),
            });

            if (response.ok) {
                // Mine the transaction immediately
                await fetch(`${API_URL}/blockchain/mine`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ miner_address: studentAddress }),
                });
                setSubmitted(true);
            } else {
                // Gérer les erreurs spécifiques
                const errorData = await response.json();
                if (response.status === 400 && errorData.detail === "Vous avez déjà soumis ce devoir") {
                    alert('❌ Vous avez déjà soumis ce devoir. Une seule soumission par devoir est autorisée.');
                } else {
                    alert(`Erreur: ${errorData.detail || 'Erreur lors de la soumission'}`);
                }
            }
        } catch (error) {
            console.error(error);
            alert('Erreur réseau lors de la soumission');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="border-2 border-gray-200 p-6 rounded-2xl hover:shadow-xl transition-all bg-gradient-to-br from-white to-blue-50/30"
        >
            <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-800">{assignment.data.title}</h3>
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        <FileText className="w-3 h-3 inline mr-1" />
                        DEVOIR
                    </div>
                </div>
                <p className="text-sm font-semibold text-red-600 flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4" />
                    À rendre avant le : {assignment.data.due_date}
                </p>
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 px-3 py-2 rounded-full mb-3 w-fit">
                    <Lock className="w-4 h-4" />
                    <span>Soumission chiffrée - Votre réponse sera protégée</span>
                </div>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                    {assignment.data.description}
                </p>
            </div>

            {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Votre Réponse
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Écrivez votre réponse ou collez un lien vers votre travail..."
                            className="w-full p-4 border-2 border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            required
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={submitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Soumettre le Devoir
                            </>
                        )}
                    </motion.button>
                </form>
            ) : (
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl text-center"
                >
                    <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-bold text-lg">Devoir soumis avec succès !</p>
                    <p className="text-sm text-green-100 mt-1">Votre enseignant recevra votre travail.</p>
                </motion.div>
            )}
        </motion.div>
    );
};

const GradeCard = ({ grade, index }) => {
    const getGradeColor = (gradeValue) => {
        if (gradeValue >= 16) return 'from-green-500 to-emerald-600';
        if (gradeValue >= 12) return 'from-blue-500 to-cyan-600';
        if (gradeValue >= 10) return 'from-orange-500 to-yellow-600';
        return 'from-red-500 to-pink-600';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="border-2 border-gray-200 p-6 rounded-2xl bg-gradient-to-br from-white to-purple-50/30 shadow-md hover:shadow-xl transition-all"
        >
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <Award className="w-6 h-6 text-purple-600" />
                        <p className="font-bold text-lg text-gray-800">Note Reçue</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-100 mb-2">
                        <p className="text-sm text-gray-500 mb-1">Commentaire de l'enseignant :</p>
                        <p className="text-gray-700 italic font-medium">"{grade.data.comment}"</p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(grade.timestamp * 1000).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    className={`ml-6 w-24 h-24 rounded-2xl bg-gradient-to-br ${getGradeColor(
                        grade.data.grade
                    )} flex items-center justify-center text-white shadow-xl`}
                >
                    <div className="text-center">
                        <p className="text-3xl font-bold">{grade.data.grade}</p>
                        <p className="text-xs font-semibold opacity-90">/20</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const EmptyState = ({ icon, message }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
    >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            {React.cloneElement(icon, { className: 'w-12 h-12' })}
        </div>
        <p className="text-gray-500 text-lg italic">{message}</p>
    </motion.div>
);

export default StudentDashboard;
