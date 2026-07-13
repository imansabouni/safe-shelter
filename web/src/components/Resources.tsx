import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Droplet, Pill, BedDouble, Apple, Building2, Plus, Activity, Check, Flame, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

axios.defaults.baseURL = 'http://127.0.0.1:8000/api';

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

// ✅ GLOBAL STANDARDS
const DAILY_WATER_L = 3;
const DAILY_FOOD_MEALS = 2;
const DAILY_FUEL_UNITS = 2;
const COVERAGE_DAYS = 5;

interface Resource {
  type: string;
  current: number;
  min: number;
  icon: any;
  color: string;
  lastDelivery?: string;
  incomingSupply?: string;
}

interface ActiveRequest {
  id?: number;
  stage: 'requested' | 'on-way' | 'delivered';
  deliveredAt?: number;
  amount: number;
  startTime: number;
}

interface ShelterData {
  id: number;
  name: string;
  status: string;
  people_count: number;
  resources: Resource[];
}

export default function Resources() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [shelters, setShelters] = useState<ShelterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ show: boolean, message: string, color: string }>({ show: false, message: '', color: '#0d9488' });
  const [activeRequests, setActiveRequests] = useState<Record<string, ActiveRequest>>({});
  const prevStocks = useRef<Record<string, number>>({});
  const nearestIdRef = useRef<number | null>(null);

  const triggerToast = (message: string, color: string = '#0d9488') => {
    const colorMap: Record<string, string> = {
      'red': '#dc2626',
      'orange': '#f97316',
      'green': '#0d9488',
      'blue': '#2563eb'
    };
    const finalColor = colorMap[color] || color;
    setToast({ show: true, message, color: finalColor });
    setTimeout(() => setToast({ show: false, message: '', color: '#0d9488' }), 3000);
  };

  const fetchActiveRequests = async () => {
    try {
      const response = await axios.get('/requests');
      const backendRequests = Array.isArray(response.data) ? response.data : (response.data.data || []);

      const newActiveRequests: Record<string, ActiveRequest> = {};
      backendRequests.forEach((req: any) => {
        // ✅ Sadece yolda veya beklemede olanları takip et
        // Teslim edilenleri buradan silerek döngüyü (loop) engelliyoruz
        if (req.status === 'on_way' || req.status === 'on-way') {
          const key = `${req.shelter_id}-${req.type}`;
          newActiveRequests[key] = {
            id: req.id,
            startTime: req.created_at ? new Date(req.created_at).getTime() : Date.now(),
            amount: req.amount || 0,
            stage: 'on-way'
          };
        } else if (req.status === 'requested') {
          const key = `${req.shelter_id}-${req.type}`;
          newActiveRequests[key] = {
            id: req.id,
            startTime: req.created_at ? new Date(req.created_at).getTime() : Date.now(),
            amount: req.amount || 0,
            stage: 'requested'
          };
        }
      });
      setActiveRequests(newActiveRequests);
    } catch (err) {
      console.error("Fetch requests error:", err);
    }
  };

  const fetchInitialData = async (userLat?: number | null, userLng?: number | null) => {
    try {
      const response = await axios.get('/shelter-resources');
      let data = Array.isArray(response.data) ? response.data : (response.data.data || []);

      if (user?.role === 'staff') {
        if (userLat != null && userLng != null) {
          // fetch shelters to get coordinates
          const sheltersRes = await axios.get('/shelters');
          const sheltersData = Array.isArray(sheltersRes.data?.shelters) ? sheltersRes.data.shelters : (sheltersRes.data?.data || []);

          let minDistance = Infinity;
          let nearestId: number | null = null;

          sheltersData.forEach((shelter: any) => {
            if (shelter.lat && shelter.lng) {
              const dist = calculateDistance(userLat, userLng, parseFloat(shelter.lat), parseFloat(shelter.lng));
              if (dist < minDistance) {
                minDistance = dist;
                nearestId = shelter.id;
              }
            }
          });

          if (nearestId) {
            nearestIdRef.current = nearestId;
            data = data.filter((s: any) => s.id === nearestId);
          } else {
            nearestIdRef.current = null;
            data = [];
          }
        } else if (nearestIdRef.current) {
          data = data.filter((s: any) => s.id === nearestIdRef.current);
        } else {
          data = [];
        }
      }

      const mapped: ShelterData[] = data.map((bs: any) => {
        const peopleCount = (Number(bs.capacity_current) || 0) + 100;
        const resourceMap = (bs.resources || []).reduce((acc: any, r: any) => {
          acc[r.type] = r.current;
          return acc;
        }, {});

        const resources: Resource[] = [
          { type: 'water', current: Number(resourceMap['water']) || 0, min: peopleCount * 6, icon: Droplet, color: 'blue' },
          { type: 'food', current: Number(resourceMap['food']) || 0, min: peopleCount * 4, icon: Apple, color: 'green' },
          { type: 'blankets', current: Number(resourceMap['blankets']) || 0, min: peopleCount, icon: BedDouble, color: 'purple' },
          { type: 'medicine', current: Number(resourceMap['medicine']) || 0, min: 50, icon: Pill, color: 'red' },
          { type: 'fuel', current: Number(resourceMap['fuel']) || 0, min: peopleCount * 4, icon: Flame, color: 'orange' },
          { type: 'hygiene', current: Number(resourceMap['hygiene']) || 0, min: 50, icon: Sparkles, color: 'pink' },
        ];

        return {
          id: bs.id,
          name: bs.name,
          status: bs.status === 'open' || bs.status?.key === 'open' ? 'good' : bs.status,
          people_count: peopleCount,
          resources
        };
      });

      setShelters(mapped);

      // ✅ STOCK DEĞİŞİMİNİ YAKALA
      mapped.forEach((sh: ShelterData) => {
        sh.resources.forEach((res: Resource) => {
          const key = `${sh.id}-${res.type}`;
          const prev = prevStocks.current[key];

          // 📈 STOCK ARTTIYSA (Teslimat yapılmıştır)
          if (prev !== undefined && res.current > prev) {
            setActiveRequests((prevReq) => ({
              ...prevReq,
              [key]: {
                stage: 'delivered',
                deliveredAt: Date.now(),
                amount: 0,
                startTime: Date.now()
              }
            }));
          }

          // Güncelle
          prevStocks.current[key] = res.current;
        });
      });

      setLoading(false);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("Fetch initial data error:", error);
      triggerToast(error.response?.data?.message || "Veri yüklenemedi", 'red');
      setLoading(false);
    }
  };

  const handleSendResource = async (shelterId: number, resourceType: string) => {
    try {
      await axios.post('/send-resource', {
        shelter_id: shelterId,
        type: resourceType,
        amount: resourceType === 'water' ? 1000 : 500,
        is_request: user?.role === 'staff'
      });
      triggerToast(user?.role === 'staff' ? `📦 Talep merkeze iletildi!` : `🚚 ${t(resourceType)} gönderildi!`, 'green');
      fetchActiveRequests();
    } catch (err: any) {
      console.log("FULL ERROR:", err);
      console.log("RESPONSE:", err?.response);
      console.log("DATA:", err?.response?.data);

      triggerToast(err?.response?.data?.error || "HATA!", 'red');
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await axios.put(`/requests/${requestId}/approve`);
      triggerToast(`✅ Talep onaylandı ve yola çıktı!`, 'green');
      fetchActiveRequests();
    } catch (err: any) {
      triggerToast("Onaylanamadı!", 'red');
    }
  };

  useEffect(() => {
    let activeIntervals: number[] = [];

    const initializeData = async (lat: number | null, lng: number | null) => {
      await fetchInitialData(lat, lng);
      fetchActiveRequests();

      const inv2 = setInterval(fetchActiveRequests, 5000);
      const inv3 = setInterval(() => {
        const now = Date.now();
        setActiveRequests(prev => {
          let changed = false;
          const copy = { ...prev };

          Object.keys(copy).forEach(key => {
            if (copy[key].stage === 'delivered' && copy[key].deliveredAt) {
              if (now - (copy[key].deliveredAt || 0) >= 3000) {
                delete copy[key];
                changed = true;
              }
            }
          });

          return changed ? copy : prev;
        });
      }, 1000);

      activeIntervals.push(inv2 as unknown as number);
      activeIntervals.push(inv3 as unknown as number);
    };

    if (user?.role === 'staff') {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            initializeData(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.error("Location error:", err);
            initializeData(null, null);
          }
        );
      } else {
        initializeData(null, null);
      }
    } else {
      initializeData(null, null);
    }

    return () => {
      activeIntervals.forEach(clearInterval);
    };
  }, [user]);



  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Activity className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-black uppercase tracking-widest">{t('loading')}</p>
      </div>
    );
  }

  const getStatusBadge = (shelter: ShelterData) => {
    const hasCritical = shelter.resources.some(r => {
      let days = 0;
      const people = Math.max(shelter.people_count, 1);
      if (r.type === 'blankets') return r.current < people;
      if (r.type === 'medicine') return r.current < r.min;
      if (r.type === 'water') days = (r.current / (people * DAILY_WATER_L));
      else if (r.type === 'food') days = (r.current / (people * DAILY_FOOD_MEALS));
      else if (r.type === 'fuel') days = (r.current / (people * DAILY_FUEL_UNITS));
      else days = (r.current / people) * COVERAGE_DAYS;
      return days < 2;
    });

    if (hasCritical) {
      return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full animate-pulse border border-red-200 uppercase tracking-tighter self-center">⚠️ KRİTİK</span>;
    }
    return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase tracking-tighter self-center">✓ İYİ DURUM</span>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-8 px-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('resource_management')}</h1>
          <p className="text-gray-800 font-semibold">{t('resource_desc')}</p>
        </div>
        {lastUpdated && (
          <div className="text-right pb-2">
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest">{t('last_updated')}</span>
            <span className="text-sm font-bold text-gray-900">{lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {shelters.map((shelter) => {
          return (
            <div
              key={shelter.id}
              className={`bg-white dark:bg-slate-900 rounded-xl shadow-xl border-2 border-slate-900 dark:border-white overflow-hidden`}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Building2 className="w-4 h-4" /></div>
                  <h3 className="text-2xl font-semibold text-gray-900 uppercase tracking-tight">
                    {shelter.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-500 text-[10px] font-black rounded-md">{shelter.people_count} {t('people')}</span>
                </div>
                {getStatusBadge(shelter)}
              </div>

              <div
                className="p-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(2, auto)',
                  columnGap: '12px',
                  rowGap: '32px'
                }}
              >
                {shelter.resources.map((res) => {
                  const Icon = res.icon;
                  let days = 0;
                  const people = Math.max(Number(shelter.people_count) || 0, 1);
                  const currentStock = Number(res.current) || 0;

                  if (res.type === 'water') days = currentStock / (people * DAILY_WATER_L);
                  else if (res.type === 'food') days = currentStock / (people * DAILY_FOOD_MEALS);
                  else if (res.type === 'fuel') days = currentStock / (people * DAILY_FUEL_UNITS);
                  else if (res.type === 'medicine') days = (currentStock / (Number(res.min) || 1)) * 2;
                  else days = (currentStock / people) * COVERAGE_DAYS;

                  const fillPercent = Math.min((days / 5) * 100, 100);
                  let statusColor = 'red';
                  if (days >= 5) statusColor = 'green';
                  else if (days >= 3) statusColor = 'orange';

                  const labelText = days >= 5 ? '5+ GÜN' : days >= 1 ? `${Math.floor(days)} GÜN` : 'KRİTİK';
                  const unitMap: Record<string, string> = {
                    water: ' L',
                    food: ' Pors.',
                    medicine: ' adet',
                    blankets: ' adet',
                    fuel: ' L',
                    hygiene: ' set'
                  };
                  const unit = unitMap[res.type] || '';
                  const displayDurum = res.type === 'blankets' ? `${Math.max(0, Math.floor(currentStock - people))}` : (res.type === 'medicine' ? 'TAKİP' : labelText);

                  return (
                    <div
                      key={res.type}
                      className={`bg-white border-2 shadow-sm rounded-xl px-3 py-2.5 transition-all flex flex-col h-full hover:shadow-md ${statusColor === 'red' ? 'border-red-100 bg-red-50/10' :
                        statusColor === 'orange' ? 'border-orange-100' : 'border-gray-200'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl ${res.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                          res.color === 'green' ? 'bg-green-50 text-green-600' :
                            res.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                              res.color === 'red' ? 'bg-red-50 text-red-600' :
                                res.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-pink-50 text-pink-600'
                          }`}>
                          <Icon className="w-5 h-5 shadow-sm text-white/90 dark:text-blue-300" />
                        </div>
                        <h4 className="font-bold text-black text-[12px] uppercase tracking-tight truncate">{t(res.type)}</h4>
                      </div>

                      <div className="flex-grow space-y-1 mb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-black font-black uppercase tracking-tight text-[11px] font-outfit">{t('stock')}:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 font-mono font-black tracking-tighter text-[9px]">
                              {Math.floor(currentStock).toLocaleString('tr-TR')}
                              <span className="text-[7px] opacity-40 ml-0.5">{unit}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-black font-black uppercase tracking-tight text-[11px] font-outfit">{res.type === 'blankets' ? t('spare') : t('condition')}:</span>
                          <span className={`${statusColor === 'red' ? 'text-red-600' : statusColor === 'orange' ? 'text-orange-500' : 'text-gray-500'} font-black tracking-tighter uppercase text-[9px]`}>{displayDurum}</span>
                        </div>

                      </div>

                      <div className="pt-2 mt-auto">
                        {(() => {
                          const key = `${shelter.id}-${res.type}`;
                          const reqData = activeRequests[key];

                          if (reqData) {
                            // ✅ TESLİM EDİLDİ 3 SN GÖRÜNSÜN
                            if (reqData.stage === 'delivered') {
                              const now = Date.now();
                              const diff = now - (reqData.deliveredAt || now);

                              if (diff < 3000) {
                                return (
                                  <div className="w-full bg-green-50 py-1.5 text-center text-[10px] font-black text-green-600 rounded-md animate-pulse uppercase tracking-tighter border border-green-100">
                                    ✅ TESLİM EDİLDİ
                                  </div>
                                );
                              }
                            }

                            // 🚚 YOLDA / 📦 BEKLEMEDE
                            if (reqData.stage !== 'delivered') {
                              if (reqData.stage === 'on-way') {
                                return (
                                  <div className="w-full bg-blue-50/50 py-1.5 text-center text-[8px] font-black text-blue-600 rounded-md animate-pulse uppercase tracking-tighter">
                                    🚚 YOLDA
                                  </div>
                                );
                              } else if (reqData.stage === 'requested') {
                                if (user?.role === 'staff') {
                                  return (
                                    <div className="w-full bg-gray-100 py-1.5 text-center text-[10px] font-bold text-black rounded-md animate-pulse uppercase tracking-tighter border border-black">
                                      📦 TALEP İLETİLDİ
                                    </div>
                                  );
                                } else {
                                  return (
                                    <button
                                      type="button"
                                      className="group w-full py-2.5 bg-green-50 hover:bg-green-500 border-2 border-green-500 text-green-700 hover:text-white text-[11px] font-bold uppercase rounded-xl transition-all duration-150 transform hover:scale-[1.03] active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                      onClick={() => handleApproveRequest(reqData.id!)}
                                    >
                                      <span>🟢 ONAYLA</span>
                                    </button>
                                  );
                                }
                              }
                            }
                          }

                          // ⚡ HİÇBİRİ DEĞİLSE BUTON
                          return <button
                                type="button"
                                className={`group w-full py-2.5 border-2 text-[11px] font-bold uppercase rounded-xl transition-all duration-150 transform hover:scale-[1.03] active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                                  user?.role === 'staff' 
                                    ? 'bg-white hover:bg-orange-500 border-orange-500 text-black hover:text-white hover:shadow-orange-200' 
                                    : 'bg-white hover:bg-blue-600 border-blue-600 text-black hover:text-white hover:shadow-blue-200'
                                }`}
                                onClick={() => handleSendResource(shelter.id, res.type)}
                              >
                                <span>{user?.role === 'staff' ? t('request_supply') : t('send')}</span>
                              </button>
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>

      {toast.show && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, backgroundColor: toast.color, color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '900', fontSize: '13px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none', animation: 'slideIn 0.3s ease-out' }}>
          <Check style={{ width: '16px', height: '16px' }} />
          <span>{toast.message}</span>
        </div>
      )}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
