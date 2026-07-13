import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, Building2, Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface SecondaryShelter {
  id: number;
  main_shelter_id: number;
  name: string;
  district: string;
  address: string;
  lat: string;
  lng: string;
  status: string;
}

interface MainShelterGroup {
  id: number;
  name: string;
  secondary_shelters: SecondaryShelter[];
}

export default function SecondaryShelters() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mainGroups, setMainGroups] = useState<MainShelterGroup[]>([]);
  const [selectedMainId, setSelectedMainId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mainRes, secondaryRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/shelters'),
        axios.get('http://127.0.0.1:8000/api/secondary-shelters')
      ]);

      if (mainRes.data.shelters && secondaryRes.data.success) {
        const mainShelters = mainRes.data.shelters;
        const secondaries = secondaryRes.data.data;

        const groupsMap = new Map<string, MainShelterGroup>();
        
        mainShelters.forEach((main: any) => {
          const secondaryForThis = secondaries.filter((s: any) => s.main_shelter_id === main.id);
          if (groupsMap.has(main.name)) {
            const existing = groupsMap.get(main.name)!;
            existing.secondary_shelters.push(...secondaryForThis);
          } else {
            groupsMap.set(main.name, {
              id: main.id,
              name: main.name,
              secondary_shelters: secondaryForThis
            });
          }
        });

        setMainGroups(Array.from(groupsMap.values()));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const filteredGroups = mainGroups
    .filter(group => selectedMainId === null || group.id === selectedMainId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-24">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-600/10 text-blue-600 dark:text-blue-500 rounded-3xl shadow-sm border border-blue-200/50 dark:border-blue-500/10">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-2 uppercase tracking-tight">{t('safe_spots')}</h1>
              <p className="text-xl text-gray-500 font-bold uppercase tracking-widest opacity-60">{t('secondary_shelters')}</p>
            </div>
          </div>
        </div>

        {/* Filter (Dropdown Style - ULTRA MASSIVE - Side-by-side) */}
        <div className="bg-white dark:bg-slate-900 rounded-[60px] border-8 border-blue-100 dark:border-slate-800 p-12 shadow-2xl mb-24">
          <div className="flex flex-row items-center gap-12">
            <div className="shrink-0">
              <p 
                className="text-[64px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter leading-none"
                style={{ fontWeight: 950 }}
              >
                GRUP FİLTRE:
              </p>
            </div>
            
            <div className="relative flex-1">
              <select
                value={selectedMainId === null ? 'all' : selectedMainId}
                onChange={(e) => setSelectedMainId(e.target.value === 'all' ? null : Number(e.target.value))}
                className="w-full px-12 h-32 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-[42px] font-black rounded-[40px] border-8 border-gray-100 dark:border-slate-700 outline-none appearance-none cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:border-blue-600 transition-all duration-500 shadow-2xl"
                style={{ fontWeight: 950 }}
              >
                <option value="all">{t('all').toUpperCase()}</option>
                {mainGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="h-16" /> {/* Boş Div */}

        {/* Content */}
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-[1.25rem] border border-gray-100 shadow-sm overflow-hidden">
              {/* Group Header */}
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">
                      {group.name}
                    </h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bağlı Güvenli Alanlar</p>
                  </div>
                </div>
                <div 
                  className="bg-blue-600 px-3 py-2 rounded-xl text-[11px] font-black shadow-lg shadow-blue-500/20"
                  style={{ color: 'white' }}
                >
                  {group.secondary_shelters.length} Bölge
                </div>
              </div>

              {/* List Content */}
              <div className="divide-y divide-gray-50">
                {group.secondary_shelters.map((spot) => (
                  <div 
                    key={spot.id}
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`, '_blank')}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-blue-50/40 transition-all duration-300 cursor-pointer border-l-4 border-transparent hover:border-blue-400"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300 shrink-0 shadow-sm"
                        title="Haritada Aç"
                      >
                        <MapPin className="w-4 h-4 text-blue-600 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors uppercase">
                          {spot.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold tracking-tight">
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

        {filteredGroups.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Kayıt Bulunamadı</h3>
            <p className="text-gray-400 text-xs font-medium">Bu sığınak grubunda henüz güvenli alan kaydı bulunmamaktadır.</p>
            <button 
              onClick={() => setSelectedMainId(null)}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
            >
              Filtreyi Temizle
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
