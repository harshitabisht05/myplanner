import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Checkbox from '../components/common/Checkbox';
import { Settings as SettingsIcon, User, Palette, Sliders, LogOut, Save, Sparkles } from 'lucide-react';

const THEME_CARDS = [
  { id: 'lavender', label: 'Lavender', colorBg: 'bg-purple-100 border-purple-300 text-purple-900', emoji: '🪻' },
  { id: 'pink', label: 'Baby Pink', colorBg: 'bg-pink-100 border-pink-300 text-pink-900', emoji: '🌸' },
  { id: 'blue', label: 'Sky Blue', colorBg: 'bg-sky-100 border-sky-300 text-sky-900', emoji: '☁️' },
  { id: 'peach', label: 'Soft Peach', colorBg: 'bg-orange-100 border-orange-300 text-orange-900', emoji: '🍑' },
  { id: 'dark', label: 'Cozy Dark', colorBg: 'bg-slate-800 border-slate-700 text-slate-100', emoji: '🌙' },
];

const Settings = () => {
  const { user, updateProfile, updatePreferences, logout } = useAuth();
  const { theme, setTheme, weekStart, setWeekStart, animations, setAnimations } = useTheme();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
      showSuccess(`Theme changed to ${newTheme}! ✨`);
    } catch (err) {
      // Local state is already updated
    }
  };

  const handleWeekStartChange = async (newWeekStart) => {
    setWeekStart(newWeekStart);
    try {
      await updatePreferences({ theme, weekStart: newWeekStart, animations });
      showSuccess(`Week start changed to ${newWeekStart}!`);
    } catch (err) {
      // Local state is already updated
    }
  };

  const handleAnimationsChange = async (val) => {
    setAnimations(val);
    try {
      await updatePreferences({ theme, weekStart, animations: val });
      showSuccess(`Animations ${val ? 'enabled' : 'disabled'}`);
    } catch (err) {
      // Local state is already updated
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings & Themes"
        subtitle="Personalize your planner appearance, start of week, and account settings"
        icon={SettingsIcon}
      />

      {/* Profile Section */}
      <Card className="p-6 space-y-4">
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
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-planner-border">
          <Palette className="w-5 h-5 text-planner-primary" />
          <div>
            <h2 className="text-lg font-bold text-planner-text">Theme Selection</h2>
            <p className="text-xs text-planner-muted">Choose your cozy color theme</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {THEME_CARDS.map((tCard) => {
            const isSelected = theme === tCard.id;
            return (
              <button
                key={tCard.id}
                type="button"
                onClick={() => handleThemeChange(tCard.id)}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  tCard.colorBg
                } ${isSelected ? 'ring-2 ring-planner-primary scale-105 shadow-cozy' : 'opacity-80 hover:opacity-100'}`}
              >
                <span className="text-2xl">{tCard.emoji}</span>
                <span className="text-xs font-bold">{tCard.label}</span>
                {isSelected && <Sparkles className="w-3.5 h-3.5 fill-current" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Display & Layout Preferences */}
      <Card className="p-6 space-y-4">
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
      <Card className="p-6">
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
