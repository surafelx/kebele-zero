import React from 'react';
import { Settings } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="retro-title text-3xl">Settings</h2>
          <p className="retro-text text-base opacity-80 mt-2">Configure your platform settings</p>
        </div>
      </div>

      <div className="retro-window">
        <div className="p-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-xl font-semibold retro-text">Site Title</label>
              <input
                type="text"
                className="retro-input w-full text-lg py-4"
                defaultValue="Kebele Zero"
                placeholder="Enter site title"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-xl font-semibold retro-text">Site Description</label>
              <textarea
                className="retro-input w-full resize-none text-base py-4"
                rows={4}
                defaultValue="Empowering Ethiopian communities through culture, commerce, and connection"
                placeholder="Enter site description"
              />
            </div>
            <div className="space-y-6">
              <label className="block text-xl font-semibold retro-text">System Settings</label>
              <div className="retro-window p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 retro-title text-lg">Maintenance Mode</h4>
                    <p className="retro-text text-base opacity-80 mt-1">Temporarily disable public access to the site</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" id="maintenance" />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t-4 border-mustard">
              <button className="retro-btn px-8 py-4 text-lg">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;