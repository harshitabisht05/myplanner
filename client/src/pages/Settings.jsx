import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useNotifications } from '../context/NotificationContext';
import { notificationApi } from '../api/notificationApi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Checkbox from '../components/common/Checkbox';
import { Settings as SettingsIcon, User, Palette, Sliders, LogOut, Save, Sparkles, Smartphone, Download, CheckCircle2, Shield, Bell, Mail, Send, Volume2 } from 'lucide-react';

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
  const { hasPermission, requestBrowserPermission, triggerLocalNotification, fetchNotifications } = useNotifications();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingDigest, setIsSendingDigest] = useState(false);

  const isStrange = theme === 'strange';

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleTestEmail = async () => {
    setIsSendingEmail(true);
    try {
      const res = await notificationApi.sendTestEmail();
      showSuccess(res.message || 'Test email sent successfully! 📧');
      fetchNotifications();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to send test email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleMorningDigest = async () => {
    setIsSendingDigest(true);
    try {
      const res = await notificationApi.triggerMorningDigest();
      showSuccess(res.message || "Daily Morning Digest email delivered! 🌅");
      fetchNotifications();
    } catch (err) {
      showError(err.response?.data?.message || err.message || "Failed to send Morning Digest email");
    } finally {
      setIsSendingDigest(false);
    }
  };

  const handleTestBrowserNotification = async () => {
    let permGranted = hasPermission;
    if (!permGranted) {
      const res = await requestBrowserPermission();
      permGranted = res === 'granted';
    }

    triggerLocalNotification('My Little Planner Test 🔔', {
      body: 'Notifications are working! Desktop push notifications & audio chimes are enabled.'
    });

    try {
      await notificationApi.sendTestBrowser();
      fetchNotifications();
      showSuccess('Browser push & sound notification triggered! 🔔');
    } catch (err) {
      // Ignored
    }
  };

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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(dataUrl);
        showSuccess('Avatar image optimized & loaded! Click Save Profile to apply. 📸');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          {/* Avatar Preview & Device Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-planner-secondary/40 rounded-2xl border border-planner-border">
            <div className="relative w-20 h-20 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-planner-primary shrink-0 shadow-md">
              {avatar ? (
                <img src={avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : name ? (
                name.charAt(0).toUpperCase()
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <span className="text-sm font-bold text-planner-text block">Profile Avatar</span>
              <p className="text-xs text-planner-muted">Upload an image directly from your phone/computer device or paste a URL below.</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-planner-primary hover:bg-planner-primaryHover text-white text-xs font-bold transition-all shadow-xs active:scale-95">
                  <Download className="w-4 h-4 rotate-180" /> Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold transition-all"
                  >
                    Remove Avatar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Or Avatar Image URL (Optional)"
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

      {/* Notifications & Email Alerts Section */}
      <Card className={`p-6 space-y-5 ${isStrange ? 'strange-hud-card' : ''}`}>
        <div className="flex items-center justify-between pb-3 border-b border-planner-border flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-planner-primary" />
            <div>
              <h2 className="text-lg font-bold text-planner-text">Notifications & Email Alerts</h2>
              <p className="text-xs text-planner-muted">Manage push notifications, desktop sounds, and Nodemailer digests</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-planner-primary/10 text-planner-primary border border-planner-primary/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> System Ready
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Browser Desktop Notifications Test Card */}
          <div className="p-4 rounded-2xl bg-planner-bg/60 border border-planner-border space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-planner-text flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-purple-500" /> Desktop Push & Chime Sound
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${hasPermission ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
                  {hasPermission ? 'Granted' : 'Needs Action'}
                </span>
              </div>
              <p className="text-xs text-planner-muted leading-relaxed">
                Triggers native browser desktop popups and audio chimes when timers complete or tasks are due.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handleTestBrowserNotification}
              className="w-full justify-center text-xs font-bold"
            >
              <Bell className="w-4 h-4 mr-1.5 text-purple-500" /> Test Push & Audio Alert 🔔
            </Button>
          </div>

          {/* Nodemailer Email Service Card */}
          <div className="p-4 rounded-2xl bg-planner-bg/60 border border-planner-border space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-planner-text flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-sky-500" /> Nodemailer Email Service
                </span>
                <span className="text-[10px] text-planner-muted font-mono truncate max-w-[120px]">{user?.email}</span>
              </div>
              <p className="text-xs text-planner-muted leading-relaxed">
                Connects your SMTP provider to deliver daily digests, task reminders, and notifications.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={handleTestEmail}
              isLoading={isSendingEmail}
              className="w-full justify-center text-xs font-bold"
            >
              <Send className="w-4 h-4 mr-1.5" /> Test Email Connection 📧
            </Button>
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
