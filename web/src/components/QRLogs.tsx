import { ArrowDown, ArrowUp, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function QRLogs() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedShelterId, setSelectedShelterId] = useState<string>('all');

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const fetchData = async (lat: number | null, lng: number | null) => {
      try {
        const [sheltersRes, logsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/shelters'),
          axios.get('http://127.0.0.1:8000/api/qr-logs')
        ]);
        
        let fetchedShelters = sheltersRes.data.shelters;
        let formattedLogs = logsRes.data.success ? logsRes.data.logs.map((log: any) => ({
          id: log.id,
          type: log.exited_at ? 'exit' : 'entry',
          name: log.member?.name || 'Unknown',
          userId: log.member?.id,
          shelter: log.shelter?.name,
          shelterId: log.shelter?.id,
          section: '-',
          people: 1,
          time: new Date(log.entered_at).toLocaleString('tr-TR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
          }).replace(',', ''),
          qrCode: log.member?.qr_code
        })) : [];

        if (user?.role === 'staff') {
          let nearestId: number | null = null;
          if (lat != null && lng != null) {
            let minDistance = Infinity;
            fetchedShelters.forEach((shelter: any) => {
              if (shelter.lat && shelter.lng) {
                const dist = calculateDistance(lat, lng, parseFloat(shelter.lat), parseFloat(shelter.lng));
                if (dist < minDistance) {
                  minDistance = dist;
                  nearestId = shelter.id;
                }
              }
            });
          }
          if (nearestId) {
            fetchedShelters = fetchedShelters.filter((s: any) => s.id === nearestId);
            formattedLogs = formattedLogs.filter((l: any) => l.shelterId === nearestId);
            setSelectedShelterId(String(nearestId));
          } else {
            fetchedShelters = [];
            formattedLogs = [];
            setSelectedShelterId('all');
          }
        }

        setShelters(fetchedShelters);
        setLogs(formattedLogs);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (user?.role === 'staff') {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => fetchData(position.coords.latitude, position.coords.longitude),
          (err) => fetchData(null, null)
        );
      } else {
        fetchData(null, null);
      }
    } else {
      fetchData(null, null);
    }
  }, [user]);

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesShelter = selectedShelterId === 'all' || String(log.shelterId) === selectedShelterId;
    return matchesType && matchesShelter;
  });

  const totalLogs = filteredLogs.length;
  const totalEntries = filteredLogs.filter(l => l.type === 'entry').length;
  const totalExits = filteredLogs.filter(l => l.type === 'exit').length;
  const netChange = totalEntries - totalExits;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('qr_logs')}</h1>
          <p className="text-gray-800 font-semibold">{t('qr_logs_desc')}</p>
        </div>
      </div>

      {/* Unified QR Dashboard Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col gap-6">
          {/* Top Row: Shelter Selection */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-50 dark:border-slate-800/50">
            <span 
              className="text-[38px] text-blue-600 dark:text-blue-400 uppercase tracking-tighter whitespace-nowrap"
              style={{ fontWeight: 900 }}
            >
              SIĞINAK:
            </span>
            <div className="relative w-full md:w-80">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <select
                value={selectedShelterId}
                onChange={(e) => setSelectedShelterId(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/60 text-gray-900 dark:text-slate-200 pl-12 pr-6 py-4 rounded-[16px] text-base font-black tracking-widest outline-none appearance-none cursor-pointer hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: 'none'
                }}
              >
                {user?.role !== 'staff' && <option value="all" className="bg-white dark:bg-slate-900 text-black dark:text-white font-black">TÜM SIĞINAKLAR</option>}
                {shelters.map((s) => (
                  <option key={s.id} value={String(s.id)} className="bg-white dark:bg-slate-900 text-black dark:text-white font-black">
                    {s.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Row: Type Toggle (Giriş/Çıkış/QR) */}
          <div className="flex justify-center py-8">
            <div className="flex items-center px-12 py-6 rounded-full border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 shadow-sm">
              {['all', 'entry', 'exit', 'qr'].map((f) => (
                <button
                  key={`type-btn-${f}`}
                  onClick={() => setFilterType(f)}
                  className={`transition-all duration-500 font-black tracking-widest mx-8 px-6 py-2 text-2xl whitespace-nowrap bg-transparent border-none outline-none cursor-pointer ${filterType === f
                    ? 'text-blue-600 scale-125'
                    : 'text-gray-400 hover:text-gray-500'
                    }`}
                >
                  {f === 'all' ? 'TÜMÜ' : f === 'entry' ? 'GİRİŞ' : f === 'exit' ? 'ÇIKIŞ' : 'QR'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

          {/* Grid Container (Shown ONLY in 'QR' mode) */}
          {filterType === 'qr' && (
            <div className={`grid gap-6 ${selectedShelterId === 'all'
                ? 'grid-cols-2 md:grid-cols-4'
                : 'grid-cols-2' + ' max-w-4xl mx-auto w-full'
              }`}>
              {shelters
                .filter(s => selectedShelterId === 'all' || String(s.id) === selectedShelterId)
                .flatMap((s) => {
                  const elements = [];
                  const sId = s.id;

                  /* Entry Card */
                  elements.push(
                    <div
                      key={`entry-${sId}`}
                      className={`group flex flex-col items-center gap-4 p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[32px] border border-gray-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-500 ${selectedShelterId !== 'all' ? 'p-8' : ''
                        }`}
                    >
                      <div className={`px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800/50`}>
                        <span className={`font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter ${selectedShelterId === 'all' ? 'text-[9px]' : 'text-[11px]'
                          }`}>
                          GİRİŞ
                        </span>
                      </div>
                      <div className={`bg-white p-4 rounded-[24px] shadow-lg shadow-gray-200/50 dark:shadow-none group-hover:scale-105 transition-transform duration-500 ${selectedShelterId === 'all' ? 'w-24 h-24' : 'w-44 h-44'
                        }`}>
                        <img
                          src={`/qrs/s${sId}_entry.png`}
                          alt={`${s.name} Entry`}
                          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(s.name)}_Giris`;
                          }}
                        />
                      </div>
                    </div>
                  );

                  /* Exit Card */
                  elements.push(
                    <div
                      key={`exit-${sId}`}
                      className={`group flex flex-col items-center gap-4 p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[32px] border border-gray-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:border-red-500/40 transition-all duration-500 ${selectedShelterId !== 'all' ? 'p-8' : ''
                        }`}
                    >
                      <div className={`px-4 py-1.5 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-100 dark:border-red-800/50`}>
                        <span className={`font-black text-red-600 dark:text-red-400 uppercase tracking-tighter ${selectedShelterId === 'all' ? 'text-[9px]' : 'text-[11px]'
                          }`}>
                          ÇIKIŞ
                        </span>
                      </div>
                      <div className={`bg-white p-4 rounded-[24px] shadow-lg shadow-gray-200/50 dark:shadow-none group-hover:scale-105 transition-transform duration-500 ${selectedShelterId === 'all' ? 'w-24 h-24' : 'w-44 h-44'
                        }`}>
                        <img
                          src={`/qrs/s${sId}_exit.png`}
                          alt={`${s.name} Exit`}
                          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(s.name)}_Cikis`;
                          }}
                        />
                      </div>
                    </div>
                  );

                  return elements;
                })}
            </div>
          )}

      {/* Stats (Force side-by-side - Compact Style) - Hidden in QR Mode */}
      {filterType !== 'qr' && (
        <div className="flex flex-row gap-4 overflow-x-auto pb-2">
          {/* Total Transactions */}
          <div className="flex-1 min-w-[200px] bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all">
            <div className="text-sm text-blue-600 mb-4 uppercase tracking-widest opacity-100" style={{ fontWeight: 900 }}>TOPLAM KAYITLAR</div>
            <div className="text-6xl font-black text-slate-900 drop-shadow-sm">{filteredLogs.length}</div>
          </div>
          
          {/* Last Entry */}
          <div className="flex-1 min-w-[200px] bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all">
            <div className="text-sm text-green-600 mb-4 uppercase tracking-widest opacity-100" style={{ fontWeight: 900 }}>SON GİRİŞ</div>
            <div className="text-lg font-black text-slate-800 line-clamp-1 truncate drop-shadow-sm">
              {filteredLogs.find(l => l.type === 'entry')?.name.toUpperCase() || '-'}
            </div>
          </div>

          {/* Last Exit */}
          <div className="flex-1 min-w-[200px] bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all">
            <div className="text-sm text-red-600 mb-4 uppercase tracking-widest opacity-100" style={{ fontWeight: 900 }}>SON ÇIKIŞ</div>
            <div className="text-lg font-black text-slate-800 line-clamp-1 truncate drop-shadow-sm">
              {filteredLogs.find(l => l.type === 'exit')?.name.toUpperCase() || '-'}
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Table (Hidden in QR-Only Mode) */}
      {filterType !== 'qr' && (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-500">
          <div className="px-6 py-6 bg-gray-50/50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800/50 flex items-center justify-between">
            <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">EN SON AKTİVİTE</h3>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50/30 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-black uppercase tracking-widest text-left">{t('type')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-black uppercase tracking-widest text-left">{t('name')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-black uppercase tracking-widest text-left">{t('shelter')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-black uppercase tracking-widest text-left">
                  {t('people_count')}
                </th>
                <th className="px-3 py-3 text-[10px] font-bold text-black uppercase tracking-widest text-right">{t('time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-70 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {log.type === 'entry' ? (
                        <>
                          <div className="w-12 h-12 flex items-center justify-center rounded-xl dark:bg-black/20 border border-green-500/20 dark:border-green-500/30">
                            <ArrowUp className="w-6 h-6 text-green-600 dark:text-green-500" />
                          </div>
                          <span className="text-base font-black text-green-600 uppercase tracking-widest">GİRİŞ</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 flex items-center justify-center rounded-xl dark:bg-black/20 border border-red-500/20 dark:border-red-500/30">
                            <ArrowDown className="w-6 h-6 text-red-600 dark:text-red-500" />
                          </div>
                          <span className="text-base font-black text-red-600 uppercase tracking-widest">ÇIKIŞ</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-gray-500">{log.name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-gray-600">{log.shelter}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg dark:bg-black/20 border border-blue-500/20 dark:border-blue-500/30">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                      </div>
                      <span className="text-sm font-bold text-gray-500">{log.people}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-gray-500">{log.time}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center">
              {t('auto_update_qr')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
