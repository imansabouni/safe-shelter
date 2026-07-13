import { Bell, Send, MapPin, Users, Clock, Loader2, Megaphone, ShieldAlert, Info, Building2, Activity, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  region: string;
  target: string;
  status: string;
  created_at: string;
}

export default function Notifications() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notifType, setNotifType] = useState('general');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [region, setRegion] = useState('all');
  const [shelterList, setShelterList] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      console.log('Fetching notifications from backend...');
      const [notifRes, shelterRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/notifications'),
        axios.get('http://127.0.0.1:8000/api/shelters')
      ]);

      console.log('Notifications Res:', notifRes.data);
      console.log('Shelters Res:', shelterRes.data);

      if (notifRes.data.success || Array.isArray(notifRes.data.data)) {
        setNotifications(notifRes.data.data || []);
      } else if (Array.isArray(notifRes.data)) {
        setNotifications(notifRes.data);
      }

      if (shelterRes.data.shelters) {
        setShelterList(shelterRes.data.shelters);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Veriler çekilirken bir hata oluştu.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'emergency': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <ShieldAlert className="w-4 h-4" /> };
      case 'earthquake': return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: <Activity className="w-4 h-4" /> };
      case 'shelter_update': return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: <Building2 className="w-4 h-4" /> };
      case 'instruction': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: <Info className="w-4 h-4" /> };
      case 'general': return { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: <Megaphone className="w-4 h-4" /> };
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: <Bell className="w-4 h-4" /> };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSending(true);
      const res = await axios.post('http://127.0.0.1:8000/api/notifications', {
        type: notifType,
        title,
        message,
        region,
        target: 'all'
      });

      if (res.data.success) {
        setTitle('');
        setMessage('');
        await fetchData(true); // Silent refresh to update list immediately
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-transparent"></div>
          </div>
          <p className="text-gray-500 font-black uppercase tracking-[0.2em]">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="p-8 max-w-[1400px] mx-auto">

        {/* Header - Perfect Mirror of SecondaryShelters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('notification_management')}</h1>
            <p className="text-gray-500 font-black uppercase tracking-widest">{t('loading')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Notification Form (Sticky) */}
          <div className="lg:col-span-4 space-y-6 sticky top-8">
            <div className="bg-white rounded-[1.25rem] border border-gray-100 shadow-sm overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Type Selection with Labels */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">BİLDİRİM AYARLARI</label>
                  <div className="grid grid-cols-2 gap-3 focus-within:ring-0">
                    {[
                      { id: 'earthquake', emoji: '🌋', color: 'orange', label: 'DEPREM UYARISI' },
                      { id: 'shelter_update', emoji: '🏢', color: 'green', label: 'BARINAK GÜNCELLEMESİ' },
                      { id: 'instruction', emoji: '📋', color: 'blue', label: 'SİSTEM TALİMATI' },
                      { id: 'emergency', emoji: '🚨', color: 'red', label: 'ACİL DURUM' },
                      { id: 'general', emoji: '📢', color: 'purple', label: 'GENEL DUYURU' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNotifType(type.id)}
                        className={`flex items-center gap-3 px-4 py-7 rounded-xl border-2 transition-all duration-300 w-full text-left group ${notifType === type.id
                          ? `border-${type.color}-500 bg-${type.color}-50 shadow-sm`
                          : 'border-gray-50 bg-gray-50/30 hover:bg-white hover:border-gray-200'
                          }`}
                      >
                        <span className="text-2xl shrink-0">{type.emoji}</span>
                        <span className={`text-[12px] font-black uppercase tracking-tight leading-tight ${notifType === type.id ? `text-${type.color}-700` : 'text-gray-400'
                          }`}>
                          {type.label}
                        </span>
                      </button>
                    ))}

                    {/* Integrated Shelter Filter as 6th Item */}
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-2xl">
                        📍
                      </div>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full h-full pl-12 pr-4 py-7 bg-gray-100/50 border-2 border-gray-900 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-black text-[12px] text-gray-500 cursor-pointer appearance-none transition-all uppercase tracking-tight"
                        style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                      >
                        <option value="all">TÜM BÖLGELER</option>
                        {shelterList.map(s => (
                          <option key={s.id} value={s.name}>{s.name.toUpperCase()}</option>
                        ))}
                      </select>

                    </div>
                  </div>
                </div>

                {/* Title & Message */}
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[7px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block ml-1">BAŞLIK</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-xs text-gray-900 transition-all placeholder:text-gray-300"
                      placeholder="Örn: Güvenli Alan Güncellemesi"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="text-[7px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block ml-1">BİLGİ METNİ</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-medium text-xs text-gray-700 resize-none transition-all placeholder:text-gray-300"
                      placeholder="Vatandaşlara iletilecek mesajı buraya yazın..."
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-[90%] mx-auto px-12 py-4 bg-blue-600 text-white rounded-xl font-black text-lg uppercase tracking-widest shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 mt-10 mb-6"
                >
                  <div className="w-6 h-6" /> {/* Spacer Left */}
                  {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  <span>{sending ? 'GÖNDER' : 'GÖNDER'}</span>
                  <div className="w-6 h-6" /> {/* Spacer Right */}
                </button>
              </form>
            </div>
          </div>

          <div className="h-6"></div>

          {/* Right Panel: History Grid */}
          <div className="lg:col-span-8 space-y-6 mt-1">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">YAYINLANMIŞ DUYURULAR</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData()}
                  className="flex items-center gap-2 bg-green-50/30 px-3 py-2.5 text-sm rounded-lg border border-green-200 shadow-sm hover:bg-green-50 transition-all font-black text-green-600 uppercase tracking-widest"
                  style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                >
                  <Activity className="w-3.5 h-3.5 text-green-600" />
                  YENİLE
                </button>
                <div className="flex items-center gap-2 bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-100">
                  <Bell className="w-2.5 h-2.5 text-blue-600" />
                  <span
                    className="font-black uppercase text-sm tracking-widest text-gray-900"
                    style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                  >
                    {notifications.length} DUYURU
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center gap-3">
                <ShieldAlert className="w-5 h-5" />
                <span>Backend Bağlantı Hatası: {error} - Lütfen sunucunun (PHP Artisan) çalıştığından emin olun.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notifications.length === 0 && !error ? (
                <div className="col-span-full py-32 text-center bg-white rounded-[1.25rem] border border-dashed border-gray-100 shadow-sm">
                  <Bell className="w-3.5 h-3.5 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Henüz bir duyuru yayınlanmadı</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const style = getTypeStyle(notif.type);
                  // Map type to Turkish Label
                  const typeLabel = {
                    'emergency': 'ACİL DURUM',
                    'earthquake': 'DEPREM',
                    'shelter_update': 'GÜNCELLEME',
                    'instruction': 'TALİMAT',
                    'general': 'GENEL'
                  }[notif.type] || 'DUYURU';

                  // Format time safely
                  let dateStr = '--/--';
                  let timeStr = '--:--';
                  try {
                    if (notif.created_at) {
                      const date = new Date(notif.created_at);
                      if (!isNaN(date.getTime())) {
                        dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
                        timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                      }
                    }
                  } catch (e) {
                    console.error('Date parsing error:', e);
                  }

                  return (
                    <div
                      key={notif.id}
                      className="group bg-white rounded-[1.25rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border-l-[6px] border-l-blue-600/80 p-5 cursor-default space-y-3">
                      {/* Top Row: Type Badge & Time */}
                      <div className="flex items-center justify-between ">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border}`}>
                          <div className={`w-5 h-5 flex items-center justify-center ${style.color}`}>
                            {style.icon}
                          </div>
                          <span className={`text-[8px] font-black tracking-widest ${style.color} uppercase`}>
                            {typeLabel}
                          </span>
                        </div>
                        <div className="flex flex-col items-end text-gray-900 bg-white px-2 py-1 rounded-md border border-gray-100 mr-0 ">
                          <span className="text-sm font-black tabular-nums leading-none mb-1">
                            {dateStr}
                          </span>
                          <span className="text-sm font-black tabular-nums leading-none">
                            {timeStr}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="space-y-2 px-2 mt-5">
                        <h3 className="font-black text-gray-900 text-sm tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                          {notif.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-7">
                          {notif.message}
                        </p>
                      </div>
                      <div className="h-3"></div>

                      {/* Region Tag */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3 h-3 text-blue-600 opacity-40 mb-4 ml-12" />
                        <span className="text-xs font-black text-gray-900 mb-4">
                          {notif.region === 'all' ? 'TÜM BÖLGELER' : notif.region.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div >

        </div >
      </div >
    </div >
  );
}
