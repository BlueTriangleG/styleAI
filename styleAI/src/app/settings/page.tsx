'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    theme: 'light',
    language: 'zh',
  });

  const handleToggleNotifications = () => {
    setSettings((prev) => ({
      ...prev,
      notifications: !prev.notifications,
    }));
  };

  const handleThemeChange = (theme: string) => {
    setSettings((prev) => ({
      ...prev,
      theme,
    }));
  };

  const handleLanguageChange = (language: string) => {
    setSettings((prev) => ({
      ...prev,
      language,
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Notifications</h3>
            <p className="text-sm text-gray-500">
              Receive system notifications and updates
            </p>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Theme</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`px-4 py-2 rounded-md ${
                settings.theme === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100'
              }`}>
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`px-4 py-2 rounded-md ${
                settings.theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100'
              }`}>
              Dark
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Language</h3>
          <select
            value={settings.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="zh">Chinese</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );
}
