import { UserX, Plus, Building2, Users, Minus, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function Unregistered() {

  const { t } = useLanguage();
  const { user } = useAuth();

  const [shelter, setShelter] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [notes, setNotes] = useState('');

  const [entries, setEntries] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);

  const selectedShelter = shelters.find(s => s.id === Number(shelter));

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
        const [entriesRes, sheltersRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/unregistered'),
          axios.get('http://127.0.0.1:8000/api/shelters')
        ]);
        
        let fetchedEntries = entriesRes.data || [];
        let fetchedShelters = sheltersRes.data.shelters || [];

        if (user?.role === 'staff') {
          let nearestId: number | null = null;
          if (lat != null && lng != null) {
            let minDistance = Infinity;
            fetchedShelters.forEach((s: any) => {
              if (s.lat && s.lng) {
                const dist = calculateDistance(lat, lng, parseFloat(s.lat), parseFloat(s.lng));
                if (dist < minDistance) {
                  minDistance = dist;
                  nearestId = s.id;
                }
              }
            });
          }

          if (nearestId) {
            fetchedShelters = fetchedShelters.filter((s: any) => s.id === nearestId);
            fetchedEntries = fetchedEntries.filter((e: any) => e.shelter_id === nearestId || e.shelter?.id === nearestId);
            setShelter(String(nearestId));
          } else {
            fetchedShelters = [];
            fetchedEntries = [];
          }
        }

        setEntries(fetchedEntries);
        setShelters(fetchedShelters);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?.role === 'staff') {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchData(pos.coords.latitude, pos.coords.longitude),
          (err) => fetchData(null, null)
        );
      } else {
        fetchData(null, null);
      }
    } else {
      fetchData(null, null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/unregistered', {
        shelter_id: shelter,
        people_count: peopleCount,
        notes: notes
      });

      setEntries([
        {
          ...res.data,
          shelter: selectedShelter
        },
        ...entries
      ]);

      setShelter('');
      setPeopleCount(1);
      setNotes('');

    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {

      await axios.delete(`http://127.0.0.1:8000/api/unregistered/${id}`);

      setEntries(entries.filter(e => e.id !== id));

    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (id: number, newCount: number) => {

    if (newCount < 1) return;

    try {

      await axios.put(`http://127.0.0.1:8000/api/unregistered/${id}`, {
        people_count: newCount
      });

      setEntries(entries.map(entry =>
        entry.id === id
          ? { ...entry, people_count: newCount }
          : entry
      ));

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('unregistered_management')}
        </h1>
        <p className="text-gray-800 font-semibold">
          {t('unregistered_desc')}
        </p>
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">

        <div className="flex items-center gap-3 mb-8">
          <Plus className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {t('add_record')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="flex gap-6 items-end">

            {/* Shelter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('select_shelter')}
              </label>

              <select
                value={shelter}
                onChange={(e) => setShelter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-black text-gray-900 uppercase tracking-tight"
                style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                required
              >
                {user?.role !== 'staff' && <option value="">{t('select_shelter')}</option>}

                {shelters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}

              </select>
            </div>

            {/* People Count */}
            <div className="w-20">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t('people_count_label')}
              </label>

              <input
                type="number"
                min="1"
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-black text-gray-900"
                style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                required
              />
            </div>

          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('notes')}
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">

            <button
              type="submit"
              className="px-3 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {t('save')}
            </button>

            <button
              type="button"
              onClick={() => {
                setShelter('');
                setPeopleCount(1);
                setNotes('');
              }}
              className="px-3 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
            >
              {t('cancel')}
            </button>

          </div>

        </form>

      </div>

      {/* Entries List */}
      <div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('recent_entries')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {entries.map((entry) => (

            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-md border border-gray-50 p-4 hover:shadow-lg transition-shadow"
            >

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    {entry.shelter?.name || 'Unknown Shelter'}
                  </h3>
                </div>

                <div className="flex items-center justify-between mb-3">

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-gray-900 text-base">
                      {entry.people_count}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {t('unregistered')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">

                    <button
                      onClick={() => handleUpdate(entry.id, entry.people_count - 1)}
                      className="p-1 hover:bg-blue-50 rounded transition-all border border-200"
                      disabled={entry.people_count <= 1}
                    >
                      <Minus className="w-4 h-4 text-orange-500" />
                    </button>

                    <button
                      onClick={() => handleUpdate(entry.id, entry.people_count + 1)}
                      className="p-1 hover:bg-blue-50 rounded transition-all border border-200"
                    >
                      <Plus className="w-4 h-4 text-green-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 hover:bg-red-50 rounded transition-all border border-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>

                  </div>

                </div>
              </div>

              {entry.notes && (
                <div className="mt-3">
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {entry.notes}
                  </span>
                </div>
              )}

            </div>


          ))}

        </div>

      </div>

    </div>
  );
}