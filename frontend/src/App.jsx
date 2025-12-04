import React, { useState, useEffect } from 'react';
import { 
  Users, Book, FileText, Award, Bell, Lock, 
  CheckCircle, AlertCircle, TrendingUp, Activity 
} from 'lucide-react';

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

  const renderHome = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">
          Système de Gestion des Contrôles Blockchain
        </h1>
        <p className="text-xl mb-6">
          Une plateforme éducative sécurisée, transparente et équitable
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentView('register')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            S'inscrire
          </button>
          <button
            onClick={() => setCurrentView('login')}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Se connecter
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Lock className="w-8 h-8" />}
          title="Sécurité"
          description="Chiffrement RSA pour protéger les soumissions des étudiants"
        />
        <FeatureCard
          icon={<CheckCircle className="w-8 h-8" />}
          title="Transparence"
          description="Toutes les transactions sont traçables et immuables"
        />
        <FeatureCard
          icon={<Users className="w-8 h-8" />}
          title="Équité"
          description="Droits égaux pour tous les participants du système"
        />
      </div>

      {/* Blockchain Info */}
      {blockchainInfo && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            État de la Blockchain
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Blocs" value={blockchainInfo.length} />
            <StatCard label="Difficulté" value={blockchainInfo.difficulty} />
            <StatCard label="Participants" value={blockchainInfo.participants} />
            <StatCard 
              label="État" 
              value={blockchainInfo.is_valid ? "Valide" : "Invalide"}
              valueClass={blockchainInfo.is_valid ? "text-green-600" : "text-red-600"}
            />
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Statistiques du Système
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Enseignants" value={stats.participants?.teachers || 0} />
            <StatCard label="Étudiants" value={stats.participants?.students || 0} />
            <StatCard label="Devoirs" value={stats.transactions?.ASSIGNMENT || 0} />
            <StatCard label="Soumissions" value={stats.transactions?.SUBMISSION || 0} />
            <StatCard label="Notes" value={stats.transactions?.GRADE || 0} />
            <StatCard label="Annonces" value={stats.transactions?.ANNOUNCEMENT || 0} />
          </div>
        </div>
      )}
    </div>
  );

  const renderRegister = () => (
    <RegisterForm 
      onSuccess={(address, role, name) => {
        setUserAddress(address);
        setUserRole(role);
        setUserName(name);
        setCurrentView(role === 'TEACHER' ? 'teacher' : 'student');
      }}
      onCancel={() => setCurrentView('home')}
    />
  );

  const renderLogin = () => (
    <LoginForm
      onSuccess={(address, role, name) => {
        setUserAddress(address);
        setUserRole(role);
        setUserName(name);
        setCurrentView(role === 'TEACHER' ? 'teacher' : 'student');
      }}
      onCancel={() => setCurrentView('home')}
    />
  );

  const renderTeacher = () => (
    <TeacherDashboard 
      address={userAddress}
      name={userName}
      onLogout={() => {
        setUserAddress(null);
        setUserRole(null);
        setUserName('');
        setCurrentView('home');
      }}
    />
  );

  const renderStudent = () => (
    <StudentDashboard
      address={userAddress}
      name={userName}
      onLogout={() => {
        setUserAddress(null);
        setUserRole(null);
        setUserName('');
        setCurrentView('home');
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Book className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">
                EduChain
              </span>
            </div>
            {userRole && (
              <div className="flex items-center gap-4">
                <span className="text-gray-700">
                  {userName} ({userRole})
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && renderHome()}
        {currentView === 'register' && renderRegister()}
        {currentView === 'login' && renderLogin()}
        {currentView === 'teacher' && renderTeacher()}
        {currentView === 'student' && renderStudent()}
      </main>
    </div>
  );
}

// Components
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ label, value, valueClass = "text-blue-600" }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

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
        // Auto-login après inscription
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
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Inscription Réussie!
          </h2>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-sm text-yellow-800 font-semibold mb-2">
            ⚠️ Informations importantes - Conservez ces données en sécurité!
          </p>
          <p className="text-xs text-yellow-700">
            Votre adresse et clé publique sont nécessaires pour vous connecter.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse (ID de connexion)
            </label>
            <input
              type="text"
              value={wallet.address}
              readOnly
              className="w-full p-2 border rounded bg-gray-50 font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <input
              type="text"
              value={wallet.role}
              readOnly
              className="w-full p-2 border rounded bg-gray-50"
            />
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Redirection automatique dans quelques secondes...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Inscription</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rôle
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="STUDENT">Étudiant</option>
            <option value="TEACHER">Enseignant</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

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
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Connexion</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse (ID)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Entrez votre adresse blockchain"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

// Les composants TeacherDashboard et StudentDashboard seront dans les prochains artifacts
function TeacherDashboard({ address, name, onLogout }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tableau de Bord Enseignant</h2>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Déconnexion
        </button>
      </div>
      <p>Bienvenue, {name}!</p>
      <p className="text-sm text-gray-600 mt-2">Adresse: {address}</p>
      <p className="mt-4 text-gray-600">Fonctionnalités à venir...</p>
    </div>
  );
}

function StudentDashboard({ address, name, onLogout }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tableau de Bord Étudiant</h2>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Déconnexion
        </button>
      </div>
      <p>Bienvenue, {name}!</p>
      <p className="text-sm text-gray-600 mt-2">Adresse: {address}</p>
      <p className="mt-4 text-gray-600">Fonctionnalités à venir...</p>
    </div>
  );
}