import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Send, ArrowLeft, User, Calendar } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const API_URL = 'http://localhost:8000/api';

const TeacherDashboard = ({ address, name, onLogout }) => {
    const [view, setView] = useState('assignments');
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await fetch(`${API_URL}/student/assignments?student_address=ALL`);
            const data = await response.json();
            if (data.success) {
                setAssignments(data.assignments.filter((a) => a.sender === address));
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        try {
            const response = await fetch(`${API_URL}/teacher/submissions/${assignmentId}`);
            const data = await response.json();
            if (data.success) {
                setSubmissions(data.submissions);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Espace Enseignant</h2>
                        <p className="text-purple-100 flex items-center gap-2">
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
                        active={view === 'assignments'}
                        onClick={() => setView('assignments')}
                        icon={<FileText className="w-5 h-5" />}
                        label="Mes Devoirs"
                    />
                    <TabButton
                        active={view === 'create'}
                        onClick={() => setView('create')}
                        icon={<Plus className="w-5 h-5" />}
                        label="Nouveau Devoir"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <AnimatePresence mode="wait">
                    {view === 'assignments' && (
                        <motion.div
                            key="assignments"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Vos Devoirs Publiés</h3>
                            {assignments.length === 0 ? (
                                <EmptyState message="Aucun devoir publié pour le moment." />
                            ) : (
                                <div className="grid gap-6">
                                    {assignments.map((assignment, index) => (
                                        <AssignmentCard
                                            key={assignment.transaction_id}
                                            assignment={assignment}
                                            index={index}
                                            onViewSubmissions={() => {
                                                setSelectedAssignment(assignment);
                                                fetchSubmissions(assignment.transaction_id);
                                                setView('submissions');
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {view === 'create' && (
                        <CreateAssignmentForm
                            key="create"
                            teacherAddress={address}
                            onSuccess={() => {
                                fetchAssignments();
                                setView('assignments');
                            }}
                            onCancel={() => setView('assignments')}
                        />
                    )}

                    {view === 'submissions' && selectedAssignment && (
                        <motion.div
                            key="submissions"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <motion.button
                                onClick={() => setView('assignments')}
                                whileHover={{ x: -5 }}
                                className="mb-6 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Retour aux devoirs
                            </motion.button>

                            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                                Soumissions : {selectedAssignment.data.title}
                            </h3>

                            {submissions.length === 0 ? (
                                <EmptyState message="Aucune soumission reçue." />
                            ) : (
                                <div className="space-y-6">
                                    {submissions.map((sub, index) => (
                                        <SubmissionCard
                                            key={sub.transaction_id}
                                            submission={sub}
                                            teacherAddress={address}
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

const AssignmentCard = ({ assignment, index, onViewSubmissions }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -4 }}
        className="border-2 border-gray-200 p-6 rounded-2xl hover:shadow-xl transition-all bg-gradient-to-br from-white to-blue-50/30"
    >
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <h4 className="font-bold text-xl text-gray-800 mb-2">{assignment.data.title}</h4>
                <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    Date limite: {assignment.data.due_date}
                </p>
                <p className="text-gray-700 leading-relaxed">{assignment.data.description}</p>
            </div>
            <motion.button
                onClick={onViewSubmissions}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all ml-4"
            >
                Voir Soumissions
            </motion.button>
        </div>
    </motion.div>
);

const CreateAssignmentForm = ({ teacherAddress, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/teacher/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    teacher_address: teacherAddress,
                }),
            });
            if (response.ok) {
                // Mine the transaction immediately to add it to the blockchain
                await fetch(`${API_URL}/blockchain/mine`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ miner_address: teacherAddress }),
                });
                onSuccess();
            } else {
                alert("Erreur lors de la création du devoir");
            }
        } catch (error) {
            console.error(error);
            alert('Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
        >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Créer un Nouveau Devoir</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Titre du devoir</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ex: TP Blockchain & Smart Contracts"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl h-40 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Détaillez les consignes du devoir..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date limite</label>
                    <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : '📤 Publier le Devoir'}
                    </motion.button>
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                        Annuler
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

const SubmissionCard = ({ submission, teacherAddress, index }) => {
    const [grade, setGrade] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [graded, setGraded] = useState(false);

    const handleGrade = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/teacher/grade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submission_id: submission.transaction_id,
                    student_address: submission.sender,
                    grade: parseFloat(grade),
                    comment: comment,
                    teacher_address: teacherAddress,
                }),
            });
            if (response.ok) {
                // Mine the transaction immediately
                await fetch(`${API_URL}/blockchain/mine`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ miner_address: teacherAddress }),
                });
                setGraded(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-2 border-gray-200 p-6 rounded-2xl bg-gradient-to-br from-white to-purple-50/20 shadow-md hover:shadow-lg transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {submission.data.student_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <span className="font-bold text-gray-800">{submission.data.student_name}</span>
                        <p className="text-xs text-gray-500">
                            {new Date(submission.timestamp * 1000).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 mb-4">
                <p className="text-gray-800 leading-relaxed">{submission.data.content}</p>
            </div>

            {!graded ? (
                <form onSubmit={handleGrade} className="flex gap-4 items-end">
                    <div className="w-32">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Note /20</label>
                        <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl text-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Commentaire</label>
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Feedback pour l'étudiant..."
                            required
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : '✓ Noter'}
                    </motion.button>
                </form>
            ) : (
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl text-center font-bold shadow-lg"
                >
                    ✓ Note enregistrée avec succès !
                </motion.div>
            )}
        </motion.div>
    );
};

const EmptyState = ({ message }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
    >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg italic">{message}</p>
    </motion.div>
);

export default TeacherDashboard;
