import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/api';
import { UserData } from '../types/user';

interface AppContextType {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  login: (data: Partial<UserData>) => void;
  logout: () => void;
  language: 'tr' | 'en' | 'ar';
  setLanguage: (lang: 'tr' | 'en' | 'ar') => void;
  hasUnread: boolean;
  setHasUnread: (val: boolean) => void;
  checkNotifications: () => Promise<void>;
  markNotificationsRead: () => void;
  globalAlert: string | null;
  setGlobalAlert: (val: string | null) => void;
  hasPromptedHealth: boolean;
  setHasPromptedHealth: (val: boolean) => void;
  pendingSosRequests: any[];
  addPendingSosRequest: (req: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [language, setLanguage] = useState<'tr' | 'en' | 'ar'>('tr');
  const [hasUnread, setHasUnread] = useState(false);
  const [lastSeenId, setLastSeenId] = useState(0);
  const [globalAlert, setGlobalAlert] = useState<string | null>(null);
  const [hasPromptedHealth, setHasPromptedHealth] = useState(false);
  const [pendingSosRequests, setPendingSosRequests] = useState<any[]>([]);
  const pendingSosRequestsRef = useRef(pendingSosRequests);

  useEffect(() => {
    pendingSosRequestsRef.current = pendingSosRequests;
  }, [pendingSosRequests]);

  const addPendingSosRequest = useCallback((req: any) => {
    setPendingSosRequests(prev => [...prev, req]);
  }, []);

  const checkNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data && response.data.length > 0) {
        const latestId = response.data[0].id;
        if (latestId > lastSeenId) {
          setHasUnread(true);
          setGlobalAlert(response.data[0].title || "Yeni bildiriminiz var");
          setLastSeenId(latestId);
        }
      }
    } catch (error) {
      console.log('Notification poll error:', error);
    }
  }, [lastSeenId, setGlobalAlert]);

  const checkNearbyFriends = useCallback(async () => {
    if (!userData?.user_code) return;
    try {
      const res = await api.get(`/friends/${userData.user_code}`);
      const friends = res.data.friends || [];
      
      // Filter friends who are 'outside' and simulate distance
      const nearby = friends.filter((f: any) => {
        return f.status === 'outside'; // Simplified for poll demonstration
      });

      if (nearby.length > 0) {
        setGlobalAlert(`${nearby.length} arkadaşın şu an yakında!`);
        // Auto hide after 10 seconds
        setTimeout(() => setGlobalAlert(null), 10000);
      }
    } catch (e) { 
      console.log("Global Poll Error:", e); 
    }
  }, [userData?.user_code]);

  const login = (data: any) => {
    console.log("SİSTEME KAYDEDİLEN KULLANICI (DEBUG):", data);
    setUserData(data);
  };

  const logout = () => {
    setUserData(null);
    setHasPromptedHealth(false);
  };

  useEffect(() => {
    // Poll for notifications every minute
    const notifTimer = setInterval(checkNotifications, 60000);
    // Poll for nearby friends every 5 minutes (as requested)
    const friendTimer = setInterval(checkNearbyFriends, 300000);
    
    // Offline queue processing every 5 seconds
    const offlineSyncTimer = setInterval(async () => {
      const currentRequests = pendingSosRequestsRef.current;
      if (currentRequests.length > 0) {
        console.log(`Attempting to sync ${currentRequests.length} offline SOS requests...`);
        let remaining = [...currentRequests];
        let syncedCount = 0;
        
        for (const req of currentRequests) {
          try {
            await api.post('help-requests', req);
            console.log("Successfully synced offline SOS request!");
            syncedCount++;
            remaining = remaining.filter(r => r !== req);
          } catch (err: any) {
            const isStillOffline = !err.response || err.message === 'Network Error' || err.message?.toLowerCase().includes('network') || err.code === 'ECONNABORTED';
            if (!isStillOffline) {
              remaining = remaining.filter(r => r !== req);
              console.log("SOS sync error (removed from queue):", err.message);
            }
          }
        }
        
        if (syncedCount > 0) {
          setPendingSosRequests(remaining);
          setGlobalAlert("İnternet bağlantısı sağlandı. Bekleyen talepleriniz gönderildi.");
          setTimeout(() => setGlobalAlert(null), 5000);
        } else if (remaining.length !== pendingSosRequests.length) {
          setPendingSosRequests(remaining); // Some were removed due to non-network errors
        }
      }
    }, 5000);

    return () => {
      clearInterval(notifTimer);
      clearInterval(friendTimer);
      clearInterval(offlineSyncTimer);
    };
  }, [checkNotifications, checkNearbyFriends]);

  return (
    <AppContext.Provider value={{ 
      userData, setUserData, 
      login, logout,
      language, setLanguage, 
      hasUnread, setHasUnread,
      checkNotifications,
      markNotificationsRead: () => setHasUnread(false),
      globalAlert,
      setGlobalAlert,
      hasPromptedHealth,
      setHasPromptedHealth,
      pendingSosRequests,
      addPendingSosRequest
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
