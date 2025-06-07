
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function Admin() {
  const [setting, setSetting] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Load user-specific setting from Supabase
  const loadSetting = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('admin_config')
      .select('value')
      .eq('setting_key', 'homepage_title')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Load error:', error.message);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } else if (data) {
      setSetting(data.value);
    }
  };

  // Save user-specific setting to Supabase
  const saveSetting = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from('admin_config')
      .upsert({
        setting_key: 'homepage_title',
        value: setting,
        user_id: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    if (user) {
      loadSetting();
    }
  }, [user]);

  if (!user) {
    return null; // This will be handled by the App routing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Homepage Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="homepage-title" className="block text-sm font-medium text-gray-700 mb-2">
                Homepage Title
              </label>
              <Input
                id="homepage-title"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="Enter homepage title"
                className="w-full"
              />
            </div>
            <Button 
              onClick={saveSetting} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
