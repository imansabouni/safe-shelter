import { Users, User, Baby, HeartHandshake, UserX, Stethoscope, Warehouse, PawPrint, DoorOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Capacity() {
  const { t } = useLanguage();
  const [shelters, setShelters] = useState<any[]>([]);
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null);
  const [shelterData, setShelterData] = useState<any>(null);

  useEffect(() => {
    console.log("ACTIVE SHELTER DATA:", shelterData);
  }, [shelterData]);



  const [unregisteredCount, setUnregisteredCount] = useState(0);

  useEffect(() => {
    // Fetch Shelters
    axios
      .get("http://127.0.0.1:8000/api/shelters")
      .then((res) => {
        setShelters(res.data.shelters);

        // ilk sığınağı otomatik seç
        if (res.data.shelters.length > 0) {
          setSelectedShelterId(res.data.shelters[0].id);
        }
      })
      .catch((err) => {
        console.error("Shelters fetch error:", err);
      });

    // Fetch Unregistered totals for the capacity addition
    axios.get('http://127.0.0.1:8000/api/unregistered')
      .then(res => {
        const entries = res.data || [];
        // Calculate the total number of unregistered people across all shelters (or map it if needed per shelter)
        // Since Capacity shows by selectedShelter, we will filter it later or calculate it per shelter.
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedShelterId) return;

    setShelterData(null); // 🔥 önce temizle

    // Fetch specific shelter data
    axios
      .get(`http://127.0.0.1:8000/api/shelters/${selectedShelterId}`)
      .then((res) => {
        console.log("NEW SHELTER:", res.data.shelter);
        setShelterData(res.data.shelter);
      })
      .catch((err) => {
        console.error(err);
      });

    // Fetch unregistered for this specific shelter to add to the capacity
    axios.get('http://127.0.0.1:8000/api/unregistered')
      .then(res => {
        const entries = res.data || [];
        const shelterEntries = entries.filter((e: any) => Number(e.shelter_id) === selectedShelterId);
        const totalUnregistered = shelterEntries.reduce((sum: number, entry: any) => sum + Number(entry.people_count), 0);
        setUnregisteredCount(totalUnregistered);
      })
      .catch(err => console.error(err));

  }, [selectedShelterId]);
  /* ======================
     ICON & COLOR HELPERS
  ======================= */

  const getIconByType = (type: string) => {
    switch (type) {
      case 'family': return Users;
      case 'individual': return User;
      case 'children': return Baby;
      case 'special': return HeartHandshake;
      case 'medical': return Stethoscope;
      case 'storage': return Warehouse;
      case 'pets': return PawPrint;
      case 'hall': return DoorOpen;
      default: return UserX;
    }
  };

  const getColorByType = (type: string) => {
    switch (type) {
      case 'family': return 'blue';
      case 'individual': return 'green';
      case 'children': return 'pink';
      case 'special': return 'pink';
      case 'medical': return 'red';
      case 'storage': return 'purple';
      case 'pets': return 'orange';
      case 'hall': return 'green';
      default: return 'gray';
    }
  };

  if (!shelterData) {
    return <div className="p-8 text-gray-600 font-black uppercase tracking-widest">{t('loading')}</div>;
  }

  /* ======================
     DYNAMIC SECTIONS
  ======================= */

  const getAreaMetadata = (type: string) => {
    switch (type) {
      case 'family':
        return { desc: "Doğrudan aile birimlerine tahsis edilmiş, mahremiyet ve aile birliğinin korunması esasına dayalı özel barınma alanıdır." };
      case 'individual':
        return { desc: "Bireysel barınma ihtiyaçlarını karşılamak üzere standart operasyonel prosedürlere uygun genel yerleşim alanı." };
      case 'children':
        return { desc: "Çocukların güvenliği ve psikososyal gelişimleri gözetilerek modernize edilmiş, korunaklı ve sosyal alan." };
      case 'special':
        return { desc: "Özel erişim ihtiyacı olan bireyler için teknik donanım ve erişilebilirlik standartlarıyla desteklenmiş alan." };
      case 'medical':
        return { desc: "İlk yardım, tıbbi müdahale ve sağlık taramalarının yürütülmesi için mobilize edilmiş klinik birim." };
      case 'storage':
        return { desc: "İnsani yardım malzemelerinin tasnif edilmesi ve lojistik operasyonların yönetilmesi için ayrılmış depo alanı." };
      case 'pets':
        return { desc: "Tahliye edilen evcil hayvanların güvenliği, hijyeni ve temel ihtiyaçlarının karşılanması için ayrılmış özel alan." };
      case 'hall':
        return { desc: "Sığınak içerisinde bölümler arası geçişi sağlayan, koordinasyon ve geçici bekleme amaçlı düzenlenen geniş sirkülasyon alanı." };
      default:
        return { desc: "Genel amaçlı kullanım ve operasyonel ihtiyaçlar için ayrılan yedek barınma ve hizmet bölgesi." };
    }
  };

  const sections = (shelterData?.areas || [])
    .filter((area: any) => area.type !== 'prayer')
    .map((area: any) => ({
      id: area.type,
      label: t(area.type),
      icon: getIconByType(area.type),
      max: Math.max(0, area.capacity.total),
      current: Math.max(0, area.capacity.current),
      color: getColorByType(area.type),
      ...getAreaMetadata(area.type)
    }));

  const backendCurrent = shelterData?.capacity?.current ?? 0;
  const totalMax = shelterData?.capacity?.total ?? 0;

  const baseCapacity = 100;
  const totalCurrent = backendCurrent + baseCapacity;

  const totalAvailable = Math.max(0, totalMax - totalCurrent);
  const overallPercent =
    totalMax === 0
      ? 0
      : Math.min(100, Number(((totalCurrent / totalMax) * 100).toFixed(1)));

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
      green: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50' },
      pink: { bg: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-50' },
      red: { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50' },
      indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-50' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50' },
      cyan: { bg: 'bg-cyan-500', text: 'text-cyan-700', light: 'bg-cyan-50' },
      gray: { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-50' },
    };
    return colors[color] || colors.gray;
  };
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('capacity_management')}</h1>
        <p className="text-gray-800 font-semibold">{t('capacity_desc')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
        <div className="space-y-4">
          <label
            className="block text-lg font-black text-blue-900 uppercase tracking-wide pb-1"
            style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
          >
            {t('select_shelter') || 'Sığınak Seçimi'}
          </label>
          <select
            value={selectedShelterId ?? ""}
            onChange={(e) => setSelectedShelterId(Number(e.target.value))}
            className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-900 font-semibold shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all outline-none"
          >
            {shelters.map((shelter) => (
              <option key={shelter.id} value={shelter.id}>
                {shelter.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
          <div
            className="text-sm font-black text-gray-600 mb-1 h-5 flex items-center uppercase tracking-widest"
            style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
          >
            {t('total_capacity')}
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalMax}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div
            className="text-sm font-black text-gray-600 mb-1 uppercase tracking-widest"
            style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
          >{t('occupied')}</div>
          <div className="text-3xl font-bold text-blue-600">{totalCurrent}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div
            className="text-sm font-black text-gray-600 mb-1 uppercase tracking-widest"
            style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
          >{t('available')}</div>
          <div className="text-3xl font-bold text-green-600">{totalAvailable}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div
            className="text-sm font-black text-gray-600 mb-1 uppercase tracking-widest"
            style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
          >{t('usage')}</div>
          <div className={`text-3xl font-bold ${overallPercent >= 90 ? 'text-red-600' : overallPercent >= 75 ? 'text-orange-600' : 'text-green-600'
            }`}>
            {overallPercent}%
          </div>
        </div>
      </div>
      {/* Overall Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-black text-gray-900 uppercase tracking-tight"
            style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
          >{t('overall_occupancy')}</h2>
          <span className="text-2xl font-black text-gray-900">{overallPercent}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full ${getProgressColor(overallPercent)} transition-all`}
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <p
          className="text-sm font-black text-gray-600 uppercase tracking-widest"
          style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
        >{t('auto_update_qr')}</p>
      </div>


      {/* Sections Grid */}
      <div className="space-y-4">
        <h2
          className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]"
          style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
        >{t('sections') || 'Alan Bilgileri'}:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.map((section: any) => {
            const Icon = section.icon;
            const colors = getColorClasses(section.color);

            return (
              <div
                key={section.id}
                className={`bg-white rounded-xl border-2 ${colors.light.replace('bg-', 'border-')} p-4 flex flex-col hover:shadow-md transition-all duration-300 group`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${colors.light} w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3
                    className="text-base font-black text-gray-900 uppercase tracking-tight"
                    style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                  >{section.label}</h3>
                </div>

                <div className="flex-1 flex flex-col">
                  {/* Description Box with Theme Tint */}
                  <div className={`${colors.light} p-3 rounded-lg text-[11.5px] leading-relaxed text-gray-800 font-black border-l-4 ${colors.bg.replace('bg-', 'border-')} shadow-sm uppercase tracking-tight`}
                    style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}>
                    {section.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
