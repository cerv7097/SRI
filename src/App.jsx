import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import History from './components/History';
import Login from './components/Login';
import Register from './components/Register';
import SafetyMeetingForm from './components/forms/SafetyMeetingForm';
import VehicleInspectionForm from './components/forms/VehicleInspectionForm';
import DailyLogForm from './components/forms/DailyLogForm';
import ScaffoldInspectionForm from './components/forms/ScaffoldInspectionForm';
import { login, register, logout, getCurrentUser, isAuthenticated } from './utils/Api';

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [authScreen, setAuthScreen] = useState('login');
  const [editingDraft, setEditingDraft] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user:', error);
          setUser(null);
        }
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (username, password) => {
    const data = await login(username, password);
    setUser(data.user);
  };

  const handleRegister = async (userData) => {
    const data = await register(userData);
    setUser(data.user);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCurrentScreen('dashboard');
  };

  const handleEditDraft = (formType, draftData) => {
    setEditingDraft(draftData);
    const screenMap = {
      'daily-log': 'dailyLog',
      'vehicle-inspection': 'vehicleInspection',
      'safety-meeting': 'safetyMeeting',
      'scaffold-inspection': 'scaffoldInspection'
    };
    setCurrentScreen(screenMap[formType] || 'dashboard');
  };

  const handleBackToDashboard = () => {
    setEditingDraft(null);
    setCurrentScreen('dashboard');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'reports':
        return <Reports />;
      case 'history':
        return <History />;
      case 'safetyMeeting':
        return <SafetyMeetingForm onBack={handleBackToDashboard} initialData={editingDraft} />;
      case 'vehicleInspection':
        return <VehicleInspectionForm onBack={handleBackToDashboard} initialData={editingDraft} />;
      case 'dailyLog':
        return <DailyLogForm onBack={handleBackToDashboard} initialData={editingDraft} />;
      case 'scaffoldInspection':
        return <ScaffoldInspectionForm onBack={handleBackToDashboard} initialData={editingDraft} />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} onEditDraft={handleEditDraft} />;
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!user) {
    return authScreen === 'login' ? (
      <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthScreen('register')} />
    ) : (
      <Register onRegister={handleRegister} onSwitchToLogin={() => setAuthScreen('login')} />
    );
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200">
      <Header user={user} onLogout={handleLogout} />
      <Navigation currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      <main className="w-full py-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
}

export default App;
