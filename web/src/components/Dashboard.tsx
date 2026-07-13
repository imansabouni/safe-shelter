import { useState, useEffect } from 'react';
import {
  ShieldCheck, History, ShieldAlert, Users, Heart, Zap, Plus, ChevronRight, UserX, MapPin, Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen p-6 md:p-16 ${isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-8 px-2">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('dashboard')}
            </h1>
            <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('dashboard_desc')}
            </p>
          </div>
        </div>

        {/* Staff Location Widget */}
        {user?.role === 'staff' && (
          <StaffLocationWidget isDark={isDark} />
        )}

        {/* Navigation List */}
        <div className="grid grid-cols-1 gap-4">
          <PageLink
            icon={ShieldCheck}
            title={t('shelters_title')}
            desc={t('shelters_dashboard_desc')}
            link="/shelters"
            isDark={isDark}
            colorClasses="bg-green-50 text-green-600"
            titleColor="text-green-700"
          />
          <PageLink
            icon={History}
            title={t('qr_logs_title')}
            desc={t('qr_logs_dashboard_desc')}
            link="/qr-logs"
            isDark={isDark}
            colorClasses="bg-indigo-50 text-indigo-600"
            titleColor="text-indigo-600"
          />
          <PageLink
            icon={UserX}
            title={t('unregistered_title')}
            desc={t('unregistered_dashboard_desc')}
            link="/unregistered"
            isDark={isDark}
            colorClasses="bg-purple-50 text-purple-600"
            titleColor="text-purple-700"
          />

          <PageLink
            icon={Zap}
            title={t('resources_title')}
            desc={t('resources_dashboard_desc')}
            link="/resources"
            isDark={isDark}
            colorClasses="bg-orange-50 text-orange-600"
            titleColor="text-orange-700"
          />

          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <>
              <PageLink
                icon={ShieldAlert}
                title={t('emergency_title')}
                desc={t('emergency_dashboard_desc')}
                link="/emergency"
                isDark={isDark}
                colorClasses="bg-red-50 text-red-600"
                titleColor="text-red-700"
              />
              <PageLink
                icon={Users}
                title={t('families_title')}
                desc={t('families_dashboard_desc')}
                link="/families"
                isDark={isDark}
                colorClasses="bg-pink-50 text-pink-600"
                titleColor="text-pink-700"
              />
              <PageLink
                icon={Heart}
                title={t('donations_title')}
                desc={t('donations_dashboard_desc')}
                link="/donations"
                isDark={isDark}
                colorClasses="bg-red-50 text-red-600"
                titleColor="text-red-700"
              />
            </>
          )}

          {user?.role === 'super_admin' && (
            <PageLink
              icon={Plus}
              title={t('invite_title')}
              desc={t('invite_dashboard_desc')}
              link="/invite"
              isDark={isDark}
              colorClasses="bg-green-50 text-green-600"
              titleColor="text-green-700"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PageLink({ icon: Icon, title, desc, link, isDark, highlight, colorClasses, titleColor }: any) {
  return (
    <a
      href={link}
      className={`group flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${highlight
          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
          : isDark
            ? 'bg-white/5 border-white/5 hover:border-blue-500/30 hover:bg-white/10'
            : 'bg-white border-slate-100 hover:border-blue-500/30 shadow-sm hover:shadow-md'
        }`}
    >
      <div className="flex items-center gap-6">
        <div className={`p-3 rounded-xl transition-colors duration-300 ${highlight ? 'bg-white/20' : isDark ? 'bg-white/5' : colorClasses
          }`}>
          <Icon size={24} className={highlight ? 'text-white' : ''} />
        </div>
        <div>
          <h3
            className={`font-medium tracking-tight text-xl leading-none mb-1 font-outfit ${highlight ? 'text-white' : isDark ? 'text-white' : titleColor || 'text-blue-600'}`}
          >
            {title}
          </h3>
          <p className={`text-sm font-semibold ${highlight ? 'text-blue-50/80' : isDark ? 'text-gray-400' : 'text-gray-900'}`}>{desc}</p>
        </div>
      </div>
      <ChevronRight
        size={20}
        className={`transition-all duration-300 group-hover:translate-x-1 ${highlight ? 'text-white' : 'text-slate-400'}`}
      />
    </a>
  );
}

function StaffLocationWidget({ isDark }: { isDark: boolean }) {
  const [nearestShelter, setNearestShelter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    const findNearest = async (lat: number, lng: number) => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/shelters");
        const rawShelters = Array.isArray(res.data?.shelters) ? res.data.shelters : (Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
        
        let minDistance = Infinity;
        let nearest = null;

        rawShelters.forEach((shelter: any) => {
          if (shelter.lat && shelter.lng) {
            const dist = calculateDistance(lat, lng, parseFloat(shelter.lat), parseFloat(shelter.lng));
            if (dist < minDistance) {
              minDistance = dist;
              nearest = shelter;
            }
          }
        });

        if (nearest) {
          setNearestShelter(nearest);
        } else {
          setError('Konumlu sığınak bulunamadı.');
        }
      } catch (err) {
        setError('Sığınaklar yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          findNearest(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError('Konum izni alınamadı veya konum bulunamadı.');
          setLoading(false);
        }
      );
    } else {
      setError('Konum özelliği desteklenmiyor.');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className={`p-6 rounded-2xl border-2 flex items-center gap-4 ${isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="font-semibold">Konumunuz belirleniyor, en yakın sığınak aranıyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-2xl border-2 flex items-center gap-4 ${isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-red-50 border-red-100 text-red-700'}`}>
        <MapPin className="w-6 h-6 text-red-500" />
        <span className="font-semibold">{error}</span>
      </div>
    );
  }

  if (nearestShelter) {
    return (
      <div className={`p-6 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${isDark ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
            <MapPin className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <div>
            <h3 className={`font-bold text-xl ${isDark ? 'text-emerald-400' : 'text-emerald-900'}`}>
              Şu anki Konumunuz: {nearestShelter.name}
            </h3>
            <p className={`font-semibold ${isDark ? 'text-emerald-500/80' : 'text-emerald-700'}`}>
              Saha operasyonunu bu sığınakta yürütüyorsunuz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
