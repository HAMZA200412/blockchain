import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Send, ArrowLeft, User, Calendar, Key, Bell, Lock, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import AnnouncementCard from './AnnouncementCard';
import { formatPublicKeyPreview } from '../utils/crypto';

const API_URL = 'http://localhost:8000/api';

const TeacherDashboard = ({ address, name, onLogout }) => {
    const [view, setView] = useState('assignments');
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [encryptionKeys, setEncryptionKeys] = useState(null);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        fetchAssignments();
        fetchEncryptionKeys();
        fetchAnnouncements();
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

    const fetchEncryptionKeys = async () => {
        try {
            const response = await fetch(`${API_URL}/teacher/encryption-keys/${address}`);
            if (response.ok) {
                const data = await response.json();
                setEncryptionKeys(data);
            }
        } catch (error) {
            console.error('Error fetching encryption keys:', error);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(`${API_URL}/student/announcements`);
            const data = await response.json();
            if (data.success) {
                // Filter to show only this teacher's announcements
                const myAnnouncements = data.announcements.filter(a => a.sender === address);
                setAnnouncements(myAnnouncements);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const generateEncryptionKeys = async () => {
        try {
            const response = await fetch(`${API_URL}/teacher/encryption-keys?teacher_address=${address}`, {
                method: 'POST'
            });
            if (response.ok) {
                const data = await response.json();
                setEncryptionKeys(data);
            }
        } catch (error) {
            console.error('Error generating encryption keys:', error);
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
                <div className="flex gap-4 mt-6 overflow-x-auto">
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
                    <TabButton
                        active={view === 'keys'}
                        onClick={() => setView('keys')}
                        icon={<Key className="w-5 h-5" />}
                        label="Clés de Chiffrement"
                    />
                    <TabButton
                        active={view === 'announcements'}
                        onClick={() => setView('announcements')}
                        icon={<Bell className="w-5 h-5" />}
                        label="Annonces"
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
                            )}\n                        </motion.div>
                    )}

                    {view === 'keys' && (
                        <EncryptionKeysView
                            key="keys"
                            encryptionKeys={encryptionKeys}
                            onGenerate={generateEncryptionKeys}
                        />
                    )}

                    {view === 'announcements' && (
                        <motion.div
                            key="announcements"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Créer une Annonce</h3>
                            <CreateAnnouncementForm teacherAddress={address} onSuccess={() => {
                                fetchAnnouncements();
                                setView('announcements');
                            }} />

                            <h3 className="text-2xl font-bold text-gray-800 mb-6 mt-8">Mes Annonces Publiées</h3>
                            {announcements.length === 0 ? (
                                <EmptyState message="Aucune annonce publiée pour le moment." />
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
    const [decrypted, setDecrypted] = useState(false);
    const [decryptedContent, setDecryptedContent] = useState('');
    const [decrypting, setDecrypting] = useState(false);

    // Vérifier au montage si l'enseignant a déjà noté cet étudiant pour ce devoir
    useEffect(() => {
        const checkGrade = async () => {
            try {
                const response = await fetch(`${API_URL}/student/grades/${submission.sender}`);
                if (response.ok) {
                    const data = await response.json();
                    // Vérifier si une note existe pour ce devoir
                    const existingGrade = data.grades?.some(
                        g => g.data.submission_id === submission.transaction_id
                    );
                    if (existingGrade) {
                        setGraded(true);
                    }
                }
            } catch (error) {
                console.error('Error checking grade:', error);
            }
        };
        checkGrade();
    }, [submission.transaction_id, submission.sender]);

    const handleDecrypt = async () => {
        setDecrypting(true);
        try {
            const response = await fetch(`${API_URL}/teacher/decrypt-submission`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    encrypted_content: submission.data.encrypted_content,
                    teacher_address: teacherAddress,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setDecryptedContent(data.decrypted_content);
                setDecrypted(true);
            } else {
                alert('Erreur lors du déchiffrement');
            }
        } catch (error) {
            console.error(error);
            alert('Erreur réseau');
        } finally {
            setDecrypting(false);
        }
    };

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
            } else {
                // Gérer l'erreur de notation déjà effectuée
                const errorData = await response.json();
                if (response.status === 400 && errorData.detail.includes("already submitted a correction")) {
                    alert('❌ Vous avez déjà noté cet étudiant pour ce devoir. Une seule notation par étudiant par devoir est autorisée.');
                } else {
                    alert(`Erreur: ${errorData.detail || 'Erreur lors de la notation'}`);
                }
            }
        } catch (error) {
            console.error(error);
            alert('Erreur réseau lors de la notation');
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
                <div className="flex items-center gap-2 text-green-600 text-xs font-semibold bg-green-50 px-3 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    Chiffré
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 mb-4">
                {!decrypted ? (
                    <div className="text-center py-8">
                        <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 mb-4 text-sm">Contenu chiffré - Cliquez pour déchiffrer</p>
                        <motion.button
                            onClick={handleDecrypt}
                            disabled={decrypting}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all inline-flex items-center gap-2"
                        >
                            {decrypting ? <LoadingSpinner size="sm" /> : <><Eye className="w-4 h-4" /> Déchiffrer</>}
                        </motion.button>
                    </div>
                ) : (
                    <p className="text-gray-800 leading-relaxed">{decryptedContent}</p>
                )}
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

const EncryptionKeysView = ({ encryptionKeys, onGenerate }) => {
    const [showPrivateKey, setShowPrivateKey] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Clés de Chiffrement RSA</h3>

            {!encryptionKeys ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 p-8 rounded-2xl text-center">
                    <Key className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Aucune clé de chiffrement</h4>
                    <p className="text-gray-600 mb-6">
                        Générez une paire de clés RSA pour permettre aux étudiants de chiffrer leurs soumissions.
                    </p>
                    <motion.button
                        onClick={onGenerate}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                    >
                        <Key className="w-5 h-5" />
                        Générer les Clés RSA
                    </motion.button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-800">Clés RSA Actives</h4>
                                <p className="text-sm text-gray-600">Utilisées pour chiffrer/déchiffrer les soumissions</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    🔓 Clé Publique (partagée avec les étudiants)
                                </label>
                                <textarea
                                    readOnly
                                    value={encryptionKeys.public_key}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white font-mono text-xs h-32 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Cette clé est automatiquement incluse dans vos devoirs
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-700">
                                        🔐 Clé Privée (confidentielle)
                                    </label>
                                    <motion.button
                                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                    >
                                        {showPrivateKey ? (
                                            <><EyeOff className="w-4 h-4" /> Masquer</>
                                        ) : (
                                            <><Eye className="w-4 h-4" /> Afficher</>
                                        )}
                                    </motion.button>
                                </div>
                                <textarea
                                    readOnly
                                    value={showPrivateKey ? encryptionKeys.private_key : '••••••••••••••••••••••••••••••••'}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white font-mono text-xs h-32 resize-none"
                                />
                                <p className="text-xs text-red-600 mt-1">
                                    ⚠️ Ne partagez JAMAIS votre clé privée
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const CreateAnnouncementForm = ({ teacherAddress, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/teacher/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    teacher_address: teacherAddress,
                }),
            });
            if (response.ok) {
                // Mine the transaction
                await fetch(`${API_URL}/blockchain/mine`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ miner_address: teacherAddress }),
                });
                setFormData({ title: '', message: '' });
                onSuccess();
            } else {
                alert("Erreur lors de la création de l'annonce");
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
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l'annonce</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Ex: Rappel - Date limite TP Blockchain"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                        placeholder="Rédigez votre annonce..."
                        required
                    />
                </div>

                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <LoadingSpinner size="sm" /> : <><Bell className="w-5 h-5" /> Publier l'Annonce</>}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default TeacherDashboard;

