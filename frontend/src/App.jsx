import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, Users, Activity, TrendingUp } from 'lucide-react';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCard from './components/FeatureCard';
import StatCard from './components/StatCard';
import LoadingSpinner from './components/LoadingSpinner';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

const API_URL = 'http://localhost:8000/api';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [userName, setUserName] = useState('');
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchBlockchainInfo();
    fetchStatistics();
  }, []);

  const fetchBlockchainInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/blockchain/info`);
      const data = await response.json();
      setBlockchainInfo(data);
    } catch (error) {
      console.error('Error fetching blockchain info:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/blockchain/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const renderHome = () => (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-12"
    >
      <Hero
        onRegister={() => setCurrentView('register')}
        onLogin={() => setCurrentView('login')}
      />

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Lock className="w-8 h-8" />}
          title="Sécurité"
          description="Chiffrement RSA pour protéger les soumissions des étudiants"
          delay={0.1}
        />
        <FeatureCard
          icon={<CheckCircle className="w-8 h-8" />}
          title="Transparence"
          description="Toutes les transactions sont traçables et immuables"
          delay={0.2}
        />
        <FeatureCard
          icon={<Users className="w-8 h-8" />}
          title="Équité"
          description="Droits égaux pour tous les participants du système"
          delay={0.3}
        />
      </div>

      {/* Blockchain Info */}
      {blockchainInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              État de la Blockchain
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Blocs" value={blockchainInfo.length} delay={0.5} />
            <StatCard label="Difficulté" value={blockchainInfo.difficulty} delay={0.6} />
            <StatCard label="Participants" value={blockchainInfo.participants} delay={0.7} />
            <StatCard
              label="État"
              value={blockchainInfo.is_valid ? "Valide ✓" : "Invalide ✗"}
              valueClass={blockchainInfo.is_valid ? "text-green-600" : "text-red-600"}
              delay={0.8}
            />
          </div>
        </motion.div>
      )}

      {/* Statistics */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl shadow-xl border border-blue-100"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            Statistiques du Système
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <StatCard label="Enseignants" value={stats.participants?.teachers || 0} delay={0.7} valueClass="text-purple-600" />
            <StatCard label="Étudiants" value={stats.participants?.students || 0} delay={0.75} valueClass="text-blue-600" />
            <StatCard label="Devoirs" value={stats.transactions?.ASSIGNMENT || 0} delay={0.8} valueClass="text-green-600" />
            <StatCard label="Soumissions" value={stats.transactions?.SUBMISSION || 0} delay={0.85} valueClass="text-orange-600" />
            <StatCard label="Notes" value={stats.transactions?.GRADE || 0} delay={0.9} valueClass="text-pink-600" />
            <StatCard label="Annonces" value={stats.transactions?.ANNOUNCEMENT || 0} delay={0.95} valueClass="text-indigo-600" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar userRole={userRole} userName={userName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'home' && <div key="home">{renderHome()}</div>}
          {currentView === 'register' && (
            <RegisterForm
              key="register"
              onSuccess={(address, role, name) => {
                setUserAddress(address);
                setUserRole(role);
                setUserName(name);
                setCurrentView(role === 'TEACHER' ? 'teacher' : 'student');
              }}
              onCancel={() => setCurrentView('home')}
            />
          )}
          {currentView === 'login' && (
            <LoginForm
              key="login"
              onSuccess={(address, role, name) => {
                setUserAddress(address);
                setUserRole(role);
                setUserName(name);
                setCurrentView(role === 'TEACHER' ? 'teacher' : 'student');
              }}
              onCancel={() => setCurrentView('home')}
            />
          )}
          {currentView === 'teacher' && (
            <TeacherDashboard
              key="teacher"
              address={userAddress}
              name={userName}
              onLogout={() => {
                setUserAddress(null);
                setUserRole(null);
                setUserName('');
                setCurrentView('home');
              }}
            />
          )}
          {currentView === 'student' && (
            <StudentDashboard
              key="student"
              address={userAddress}
              name={userName}
              onLogout={() => {
                setUserAddress(null);
                setUserRole(null);
                setUserName('');
                setCurrentView('home');
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Register Form Component
function RegisterForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STUDENT'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/blockchain/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setWallet(data);
        setTimeout(() => {
          onSuccess(data.address, data.role, data.name);
        }, 3000);
      } else {
        setError(data.detail || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (wallet) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800">
            Inscription Réussie!
          </h2>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 p-6 rounded-xl mb-6">
          <p className="text-sm font-bold mb-2 text-yellow-900 flex items-center gap-2">
            ⚠️ Informations importantes
          </p>
          <p className="text-xs text-yellow-800">
            Conservez précieusement votre adresse pour vous reconnecter.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse (ID de connexion)
            </label>
            <input
              type="text"
              value={wallet.address}
              readOnly
              className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rôle
            </label>
            <input
              type="text"
              value={wallet.role}
              readOnly
              className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-semibold"
            />
          </div>
        </div>

        <motion.div
          className="mt-6 text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <LoadingSpinner size="sm" />
          <p className="text-sm text-gray-600 mt-2">
            Redirection automatique...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-2xl"
    >
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Inscription
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 border-2 border-red-200 p-4 rounded-xl mb-4"
        >
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom complet
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rôle
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="STUDENT">Étudiant</option>
            <option value="TEACHER">Enseignant</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <LoadingSpinner size="sm" /> : "S'inscrire"}
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Annuler
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

// Login Form Component
function LoginForm({ onSuccess, onCancel }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/blockchain/participant/${address}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const participant = data.participant;
        onSuccess(participant.address, participant.role, participant.name);
      } else {
        setError('Utilisateur non trouvé');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-2xl"
    >
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Connexion
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 border-2 border-red-200 p-4 rounded-xl mb-4"
        >
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Adresse (ID)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Entrez votre adresse blockchain"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Se connecter'}
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Annuler
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}