import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function Admin() {
  const [setting, setSetting] = useState('');

  // Load from Supabase
  const loadSetting = async () => {
    const { data, error } = await supabase
      .from('admin_config')
      .select('value')
      .eq('setting_key', 'homepage_title')
      .single();

    if (error) {
      console.error('Load error:', error.message);
    } else if (data) {
      setSetting(data.value);
    }
  };

  // Save to Supabase
  const saveSetting = async () => {
    const { error } = await supabase
      .from('admin_config')
      .upsert({
        setting_key: 'homepage_title',
        value: setting,
      });

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      alert('Saved!');
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Admin Settings</h2>
      <input
        className="border p-2 w-64"
        value={setting}
        onChange={(e) => setSetting(e.target.value)}
        placeholder="Homepage Title"
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 ml-3"
        onClick={saveSetting}
      >
        Save
      </button>
    </div>
  );
}
