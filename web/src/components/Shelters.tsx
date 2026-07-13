import { useState, useEffect, useRef } from 'react';
import { Home, ShieldCheck, Building2, MapPin, Edit, Trash2, Plus, ToggleRight, ToggleLeft, Loader2, ChevronDown, Filter, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function Shelters() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const nearestIdRef = useRef<number | null>(null);

  const [shelters, setShelters] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Secondary shelters state
  const [mainGroups, setMainGroups] = useState<any[]>([]);
  const [secondaryLoading, setSecondaryLoading] = useState(true);
  const [selectedMainId, setSelectedMainId] = useState<number | null>(null);

  const [newShelter, setNewShelter] = useState({
    name: '',
    district: '',
    address: '',
    capacity_total: '',
    status: 'open',
    lat: '',
    lng: ''
  });

  const fetchShelters = async (userLat?: number | null, userLng?: number | null) => {
    try {
      setSecondaryLoading(true);
      const [mainRes, secondaryRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/shelters"),
        axios.get('http://127.0.0.1:8000/api/secondary-shelters')
      ]);

      // Main Shelters Formatting
      let rawShelters = Array.isArray(mainRes.data?.shelters)
        ? mainRes.data.shelters
        : (Array.isArray(mainRes.data?.data) ? mainRes.data.data : (Array.isArray(mainRes.data) ? mainRes.data : []));

      // Staff Filtering
      if (user?.role === 'staff') {
        if (userLat != null && userLng != null) {
          let minDistance = Infinity;
          let nearestId = null;

          rawShelters.forEach((shelter: any) => {
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
            rawShelters = rawShelters.filter((s: any) => s.id === nearestId);
          } else {
            nearestIdRef.current = null;
            rawShelters = [];
          }
        } else if (nearestIdRef.current) {
          // Fallback to the ref if no location is passed (e.g. from toggleStatus)
          rawShelters = rawShelters.filter((s: any) => s.id === nearestIdRef.current);
        } else {
          rawShelters = [];
        }
      }

      const formatted = rawShelters.map((s: any) => ({
        id: s.id,
        name: s.name,
        location: s.district,
        status: s.status?.key ?? 'open',
        capacity: s.capacity_current || s.capacity?.current || 0,
        latitude: s.lat,
        longitude: s.lng,
        max: s.capacity_total || s.capacity?.total || 100,
        linkedTo: null
      }));
      setShelters(formatted);

      // Secondary Shelters Grouping
      if (secondaryRes.data.success) {
        const secondaries = secondaryRes.data.data;
        const groupsMap = new Map<string, any>();

        rawShelters.forEach((main: any) => {
          const secondaryForThis = secondaries.filter((s: any) => s.main_shelter_id === main.id);
          groupsMap.set(main.name, {
            id: main.id,
            name: main.name,
            secondary_shelters: secondaryForThis
          });
        });

        setMainGroups(Array.from(groupsMap.values()));

        // Varsayılan olarak ilk sığınağı seç (Eğer seçili bir şey yoksa)
        if (!selectedMainId && rawShelters.length > 0) {
          setSelectedMainId(rawShelters[0].id);
        } else if (rawShelters.length === 0) {
          setSelectedMainId(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSecondaryLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'staff') {
      if ("geolocation" in navigator) {
        setSecondaryLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchShelters(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.error("Location error:", err);
            fetchShelters(null, null);
          }
        );
      } else {
        fetchShelters(null, null);
      }
    } else {
      fetchShelters();
    }
  }, [user]);

  const handleAddShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/shelters", {
        ...newShelter,
        capacity_total: parseInt(newShelter.capacity_total),
        lat: newShelter.lat ? parseFloat(newShelter.lat) : null,
        lng: newShelter.lng ? parseFloat(newShelter.lng) : null
      });
      setIsAddModalOpen(false);
      setNewShelter({
        name: '',
        district: '',
        address: '',
        capacity_total: '',
        status: 'open',
        lat: '',
        lng: ''
      });
      fetchShelters();
    } catch (err) {
      console.error(err);
      alert(t('error_occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: number) => {
    const currentShelter = shelters.find(s => s.id === id);
    if (!currentShelter) return;

    const newStatus = currentShelter.status === 'open' ? 'closed' : 'open';

    try {
      await axios.put(`http://127.0.0.1:8000/api/shelters/${id}`, {
        status: newStatus
      });

      // Backend'den gerçek veriyi tekrar çek
      fetchShelters();
    } catch (err) {
      console.error("Status update error:", err);
      alert(t('error_occurred'));
    }
  };


  const openShelters = shelters.filter(s => s.status === 'open').length;

  return (
    <div className="p-3 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('shelter_management')}</h1>
          <p className="text-gray-800 font-semibold">{t('manage_shelters_desc')}</p>
        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{shelters.length}</div>
          <div
            className="text-sm font-black text-gray-600 uppercase tracking-widest"
            style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
          >{t('total_shelters')}</div>
        </div>
        <div className="bg-emerald-50 rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{openShelters}</div>
          <div
            className="text-sm font-black text-emerald-600 uppercase tracking-widest"
            style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
          >{t('open')} {t('total_shelters')}</div>
        </div>
      </div>

      {/* Table */}
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
        <div className="p-3.5 bg-blue-600/10 text-blue-600 dark:text-blue-500 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-500/10">
          <ShieldCheck className="w-8 h-8" />
        </div>
        {user?.role === 'staff' ? (t('current_shelter') || 'Bulunduğunuz Sığınak') : t('main_shelters')}
      </h2>
      <div className="bg-white rounded-2xl shadow-lg w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">{t('shelter_name')}</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">{t('location')}</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">{t('status')}</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">{t('capacity')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shelters.map((shelter) => {
                return (
                  <tr key={shelter.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{shelter.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin
                          className="w-4 h-4 cursor-pointer text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            if (shelter.latitude && shelter.longitude) {
                              window.open(
                                `https://www.google.com/maps?q=${shelter.latitude},${shelter.longitude}`,
                                "_blank"
                              );
                            } else {
                              alert(t('no_location'));
                            }
                          }}
                        />
                        <span>{shelter.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(shelter.id)}
                        className="flex items-center gap-2 transition-colors"
                      >
                        {shelter.status === 'open' ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">{t('open')}</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-500">{t('closed')}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {shelter.capacity} / {shelter.max}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-7" />
      <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-12 mt-12">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-blue-600/10 text-blue-600 dark:text-blue-500 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-500/10">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">{t('safe_spots')}</h2>
              <p
                className="text-gray-600 text-[11px] font-black uppercase tracking-widest"
                style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
              >{t('secondary_shelters')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-900 dark:border-white shadow-xl mb-12 mt-6 overflow-hidden transition-all duration-300">
          {/* Top Filter Area */}
          <div className="flex flex-row items-center p-6 gap-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20">
            <div className="pl-2 shrink-0">
              <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700">
                <Search className="w-7 h-7 text-blue-600" />
              </div>
            </div>

            <div className="w-8" /> {/* SPACER DIV */}

            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-4">
              <div className="flex-1">
                <div className="relative">
                  <select
                    value={selectedMainId ?? ""}
                    onChange={(e) => setSelectedMainId(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-gray-900 dark:text-white text-xl font-black outline-none cursor-pointer appearance-none uppercase transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                  >
                    {mainGroups.map(group => (
                      <option key={group.id} value={group.id} className="text-base uppercase">
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-2" /> {/* SPACER DIV */}
                <p
                  className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1"
                  style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                >Bağlı Güvenli Alanlar</p>
              </div>

            </div>
          </div>

          {/* Results Area */}
          <div className="p-0">
            {secondaryLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {mainGroups
                  .filter(group => selectedMainId === null || group.id === selectedMainId)
                  .map((group) => (
                    <div key={group.id}>
                      <div className="divide-y divide-gray-50 dark:divide-slate-900">
                        {group.secondary_shelters.map((spot: any) => (
                          <div
                            key={spot.id}
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`, '_blank')}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-8 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-300 cursor-pointer border-l-4 border-transparent hover:border-blue-400"
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-50 dark:bg-green-600/10 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-all duration-300 shadow-sm border border-transparent dark:border-green-500/10">
                                <MapPin className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                              </div>
                              <div className="w-8" /> {/* SPACER DIV */}
                              <div>
                                <h4 className="font-black text-gray-900 dark:text-white text-base tracking-tight group-hover:text-blue-600 transition-colors uppercase"
                                  style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}>
                                  {spot.name}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-medium tracking-tight">
                                  {spot.address || spot.district}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
