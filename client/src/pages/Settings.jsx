import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Checkbox from '../components/common/Checkbox';
import { Settings as SettingsIcon, User, Palette, Sliders, LogOut, Save, Sparkles, Smartphone, Download, CheckCircle2, Shield } from 'lucide-react';

const THEME_CARDS = [
  { id: 'lavender', label: 'Lavender', colorBg: 'bg-purple-100 border-purple-300 text-purple-900', emoji: '🪻' },
  { id: 'pink', label: 'Baby Pink', colorBg: 'bg-pink-100 border-pink-300 text-pink-900', emoji: '🌸' },
  { id: 'blue', label: 'Sky Blue', colorBg: 'bg-sky-100 border-sky-300 text-sky-900', emoji: '☁️' },
  { id: 'peach', label: 'Soft Peach', colorBg: 'bg-orange-100 border-orange-300 text-orange-900', emoji: '🍑' },
  { id: 'dark', label: 'Cozy Dark', colorBg: 'bg-slate-800 border-slate-700 text-slate-100', emoji: '🌙' },
  { id: 'gta', label: 'GTA Urban', colorBg: 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border-emerald-500 text-emerald-400 font-bold', emoji: '🌴' },
  { id: 'strange', label: 'Strange World', colorBg: 'bg-gradient-to-br from-slate-950 via-rose-950 to-black border-rose-600 text-rose-400 font-serif font-bold', emoji: '🚲' }
];

const Settings = () => {
  const { user, updateProfile, updatePreferences, logout } = useAuth();
  const { theme, setTheme, weekStart, setWeekStart, animations, setAnimations } = useTheme();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const isStrange = theme === 'strange';

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({ name, avatar });
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try {
      await updatePreferences({ theme: newTheme, weekStart, animations });
      showSuccess(`Theme changed to ${newTheme.toUpperCase()}! ✨`);
    } catch (err) {
      // Local state updated
    }
  };

  const handleWeekStartChange = async (newWeekStart) => {
    setWeekStart(newWeekStart);
    try {
      await updatePreferences({ theme, weekStart: newWeekStart, animations });
      showSuccess(`Week start changed to ${newWeekStart}!`);
    } catch (err) {
      // Local state updated
    }
  };

  const handleAnimationsChange = async (val) => {
    setAnimations(val);
    try {
      await updatePreferences({ theme, weekStart, animations: val });
      showSuccess(`Animations ${val ? 'enabled' : 'disabled'}`);
    } catch (err) {
      // Local state updated
    }
  };

  const handleInstallClick = async () => {
    const installed = await promptInstall();
    if (installed) {
      showSuccess('App installed successfully! 📲');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={isStrange ? 'SYSTEM CONTROL & OPTIONS' : 'Settings & Personalization'}
        subtitle={
          isStrange
            ? 'Configure parallel dimension preferences, install app, and account system'
            : 'Personalize your planner appearance, install mobile app, and manage account settings'
        }
        icon={isStrange ? Shield : SettingsIcon}
      />

      {/* PWA Download / Mobile App Card */}
      <Card className={`p-6 ${isStrange ? 'strange-hud-card border-rose-500/40' : 'bg-gradient-to-r from-purple-500/10 via-planner-card to-pink-500/10 border-purple-200 dark:border-purple-900/60'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${isStrange ? 'bg-rose-600 text-white' : 'bg-planner-primary text-white'}`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-planner-text flex items-center gap-2">
                <span>Download & Install Mobile App</span> 📲
              </h2>
              <p className="text-sm text-planner-muted mt-1 leading-relaxed">
                Use My Little Planner as a native standalone app on your iPhone or Android home screen with offline access.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isInstalled ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> App Installed
              </div>
            ) : isInstallable ? (
              <Button variant="primary" onClick={handleInstallClick} size="lg">
                <Download className="w-4 h-4 mr-1.5" /> Install App Now
              </Button>
            ) : (
              <div className="text-xs bg-planner-bg/80 p-3 rounded-2xl border border-planner-border max-w-xs text-planner-muted">
                <strong>To install on phone:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li><strong>iPhone/Safari:</strong> Tap Share icon → <em>"Add to Home Screen"</em>.</li>
                  <li><strong>Android/Chrome:</strong> Tap Menu (3 dots) → <em>"Add to Home Screen"</em>.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Section */}
      <Card className={`p-6 space-y-4 ${isStrange ? 'strange-hud-card' : ''}`}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-planner-border">
          <User className="w-5 h-5 text-planner-primary" />
          <h2 className="text-lg font-bold text-planner-text">Profile Information</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Avatar Image URL (Optional)"
              placeholder="https://..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSavingProfile}>
              <Save className="w-4 h-4 mr-1.5" /> Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Theme Personalization Section */}
      <Card className={`p-6 space-y-4 ${isStrange ? 'strange-hud-card' : ''}`}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-planner-border">
          <Palette className="w-5 h-5 text-planner-primary" />
          <div>
            <h2 className="text-lg font-bold text-planner-text">Theme Selection</h2>
            <p className="text-xs text-planner-muted">Choose your color theme (7 options)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
          {THEME_CARDS.map((tCard) => {
            const isSelected = theme === tCard.id;
            return (
              <button
                key={tCard.id}
                type="button"
                onClick={() => handleThemeChange(tCard.id)}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  tCard.colorBg
                } ${isSelected ? 'ring-2 ring-planner-primary scale-105 shadow-cozy' : 'opacity-80 hover:opacity-100'}`}
              >
                <span className="text-2xl">{tCard.emoji}</span>
                <span className="text-xs font-bold truncate max-w-full">{tCard.label}</span>
                {isSelected && <Sparkles className="w-3.5 h-3.5 fill-current" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Display & Layout Preferences */}
      <Card className={`p-6 space-y-4 ${isStrange ? 'strange-hud-card' : ''}`}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-planner-border">
          <Sliders className="w-5 h-5 text-planner-primary" />
          <h2 className="text-lg font-bold text-planner-text">Display & Motion Preferences</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Select
              label="First Day of Week"
              value={weekStart}
              onChange={(e) => handleWeekStartChange(e.target.value)}
              options={[
                { value: 'monday', label: 'Monday (Default)' },
                { value: 'sunday', label: 'Sunday' }
              ]}
            />
          </div>

          <div className="p-4 bg-planner-secondary/50 rounded-2xl border border-planner-border flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-planner-text">UI Animations & Transitions</span>
              <p className="text-xs text-planner-muted">Toggle motion for reduced motion preference</p>
            </div>
            <Checkbox checked={animations} onChange={handleAnimationsChange} />
          </div>
        </div>
      </Card>

      {/* Account Section */}
      <Card className={`p-6 ${isStrange ? 'strange-hud-card' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-planner-text">Account Session</h2>
            <p className="text-xs text-planner-muted">Logged in as {user?.email}</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1.5" /> Log Out
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
