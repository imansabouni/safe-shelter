import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Play, 
  Ambulance, 
  Stethoscope, 
  HelpCircle,
  Activity,
  Users
} from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
// Dialog imported removed due to local dialog.tsx forwardRef bug
import L from 'leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';

export default function Emergency() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [membersMap, setMembersMap] = useState<Record<number, string>>({});
  const [cardsMap, setCardsMap] = useState<Record<number, string>>({});

  const fetchData = () => {
    axios
      .get("http://127.0.0.1:8000/api/help-requests")
      .then((res) => {
        // Enforce sorting: Pending (1) -> In Progress (2) -> Resolved (3)
        const sortedData = [...res.data.data.data].sort((a, b) => {
          const statusOrder: Record<string, number> = { pending: 1, in_progress: 2, resolved: 3 };
          const orderA = statusOrder[a.status] || 4;
          const orderB = statusOrder[b.status] || 4;

          if (orderA !== orderB) return orderA - orderB;

          // Secondary sort: Priority (descending)
          if (b.priority !== a.priority) return (Number(b.priority) || 0) - (Number(a.priority) || 0);

          // Tertiary sort: Date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setRequests(sortedData);

        setLoading(false);
      })
      .catch((err) => {
        console.error("HelpRequest fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();

    // Fetch cards to resolve IDs to names
    axios.get('http://127.0.0.1:8000/api/cards')
      .then(res => {
        const cards = res.data || [];
        const newMembersMap: Record<number, string> = {};
        const newCardsMap: Record<number, string> = {};
        cards.forEach((card: any) => {
          if (card.id) newCardsMap[card.id] = card.family_name || card.name;
          if (card.members && Array.isArray(card.members)) {
            card.members.forEach((m: any) => {
              if (m.id) newMembersMap[m.id] = m.name;
            });
          }
        });
        setMembersMap(newMembersMap);
        setCardsMap(newCardsMap);
      })
      .catch(err => console.error('Error fetching cards:', err));

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000); // Update every 10 seconds for better precision
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
  console.log("FUNCTION CALLED", id, newStatus);

  // 🔥 1️⃣ FRONTEND’TE ANINDA GÜNCELLE
  if (newStatus === "in_progress") {
    setRequests(prev =>
      prev.map(req =>
        req.id === id
          ? { ...req, status: "in_progress", started_at: new Date().toISOString() }
          : req
      )
    );
  } else if (newStatus === "resolved") {
    setRequests(prev => prev.filter(req => req.id !== id));
  }

  try {
    if (newStatus === "resolved") {
      await axios.delete("http://localhost:8000/api/help-requests/" + id);
      console.log("SUCCESSFULLY DELETED FROM BACKEND");
    } else {
      const response = await axios.put(
        "http://localhost:8000/api/help-requests/" + id,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log("SUCCESS RESPONSE:", response.data);
    }

    fetchData(); // backend senkronizasyon

  } catch (error: any) {
    console.log("AXIOS ERROR:", error);
  }
};
  const getRawTime = (dateString: string) => {
    if (!dateString) return '--:--';
    // Extract HH:mm directly from string "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss..."
    const parts = dateString.split(/[T ]/);
    if (parts.length < 2) return '--:--';
    const timePart = parts[1]; // HH:mm:ss...
    return timePart.substring(0, 5);
  };

  const getDiffInMinutes = (startedAt: string) => {
    if (!startedAt) return 0;

    // Laravel formatı: "2026-02-28 08:15:00"
    // Bunu ISO formatına çeviriyoruz ama 'Z' (UTC) eklemiyoruz çünkü yerel saat
    const isoString = startedAt.replace(" ", "T");

    const start = new Date(isoString).getTime();
    const diff = now - start;

    return Math.max(0, Math.floor(diff / 60000));
  };

  const getTimeInfo = (request: any) => {
    if (request.status !== 'in_progress') {
      return { label: '', colorClass: '' };
    }

    const minutes = getDiffInMinutes(request.started_at);

    let colorClass = 'text-gray-600';

    if (minutes >= 10) colorClass = 'text-red-600 font-bold';
    else if (minutes >= 5) colorClass = 'text-orange-600 font-semibold';

    return {
      label: `${minutes} ${t('in_progress_for')}`,
      colorClass
    };
  };

  const [activeFilter, setActiveFilter] = useState('all');

  const stats = [
    { id: 'all', label: 'HEPSİ', value: requests.length, color: 'gray' },
    { id: 'pending', label: 'YENİ / BEKLEYEN', value: requests.filter(r => r.status === 'pending').length, color: 'red' },
    { id: 'in_progress', label: 'DEVAM EDEN', value: requests.filter(r => r.status === 'in_progress').length, color: 'yellow' },
    { id: 'resolved', label: 'TAMAMLANDI', value: requests.filter(r => r.status === 'resolved').length, color: 'green' },
    { id: 'trapped', label: 'ACİL', value: requests.filter(r => r.type === 'trapped').length, color: 'red' },
    { id: 'injured', label: 'YARALILAR', value: requests.filter(r => r.type === 'injured').length, color: 'blue' },
    { id: 'needs_transport', label: 'ULAŞIM TALEBİ', value: requests.filter(r => r.type === 'needs_transport').length, color: 'gray' },
    { id: 'other', label: 'BAŞKASI İÇİN YARDIM', value: requests.filter(r => r.type === 'other' || r.type === 'others').length, color: 'gray' },
  ];

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return r.status === 'pending';
    if (activeFilter === 'in_progress') return r.status === 'in_progress';
    if (activeFilter === 'resolved') return r.status === 'resolved';
    if (activeFilter === 'high_priority') return r.priority === 'high' || r.priority === 3;
    if (activeFilter === 'injured') return r.type === 'injured';
    if (activeFilter === 'trapped') return r.type === 'trapped';
    if (activeFilter === 'needs_transport') return r.type === 'needs_transport';
    if (activeFilter === 'other') return r.type === 'other' || r.type === 'others';
    return true;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    // 1. Status Order: pending (0) < in_progress (1) < resolved (2)
    const statusOrder: Record<string, number> = { pending: 0, in_progress: 1, resolved: 2 };
    const statusA = statusOrder[a.status] ?? 3;
    const statusB = statusOrder[b.status] ?? 3;
    if (statusA !== statusB) return statusA - statusB;

    // 2. Priority Order: 3/high (high) > 2/medium (medium) > 1/low (low)
    const getPriorityScore = (p: any) => {
      if (p === 'high' || p === 3) return 3;
      if (p === 'medium' || p === 2) return 2;
      return 1;
    };
    const priorityA = getPriorityScore(a.priority);
    const priorityB = getPriorityScore(b.priority);
    if (priorityA !== priorityB) return priorityB - priorityA; // High score first

    // 3. Time Order: Newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }).filter(r => {
    // RESOLVED items cleanup: Hide after 2 hours
    if (r.status === 'resolved') {
      const resolvedAt = new Date(r.updated_at || r.created_at).getTime();
      const twoHoursInMs = 2 * 60 * 60 * 1000;
      return (Date.now() - resolvedAt) < twoHoursInMs;
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'injured': return Activity;
      case 'trapped': return AlertTriangle;
      case 'needs_transport': return Ambulance;
      case 'other': return Users;
      default: return AlertTriangle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'injured': return 'text-blue-600';
      case 'trapped': return 'text-red-600';
      case 'needs_transport': return 'text-emerald-600';
      case 'other': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'injured': return 'border-red-300';
      case 'trapped': return 'border-orange-300';
      case 'needs_transport': return 'border-blue-300';
      case 'other': return 'border-gray-300';
      default: return 'border-gray-300';
    }
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: t("new"), color: "bg-red-100 text-red-700" },
    in_progress: { label: t("in_progress"), color: "bg-yellow-100 text-yellow-700" },
    resolved: { label: t("completed"), color: "bg-green-100 text-green-700" },
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status];

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${config ? config.color : "bg-gray-100 text-gray-600"
          }`}
      >
        {config ? config.label : status}
      </span>
    );
  };

  const getPriorityDot = (priority: string | number) => {
    switch (priority) {
      case 'high':
      case 3:
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      case 'medium':
      case 2:
        return <div className="w-3 h-3 bg-orange-500 rounded-full"></div>;
      case 'low':
      case 1:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
      default:
        return null;
    }
  };

  const handleOpenMap = () => {
    const validLocs = sortedRequests.filter(r => r.lat && r.lng && !isNaN(parseFloat(r.lat)));
    if (validLocs.length === 0) {
      alert(t('no_location') || "Haritada gösterilecek konum bulunamadı.");
      return;
    }

    const markersCode = validLocs.map(req => {
      const lat = parseFloat(req.lat);
      const lng = parseFloat(req.lng);
      
      const resolvedName = req.card_member_id ? membersMap?.[req.card_member_id] : (req.card_id ? cardsMap?.[req.card_id] : null);
      const reqName = req.card_member?.name || req.member?.name || req.card?.family_name || req.card?.name || req.user?.name || req.name || req.full_name || resolvedName || "İSİMSİZ TALEP";
      
      let pinColor = "#6b7280"; 
      if (req.type === 'trapped') pinColor = "#ef4444"; 
      else if (req.type === 'injured') pinColor = "#3b82f6"; 
      else if (req.type === 'needs_transport') pinColor = "#10b981"; 
      else if (req.type === 'other' || req.type === 'others') pinColor = "#8b5cf6";

      let statusClass = '';
      let statusBadgeHtml = '';
      if (req.status === 'in_progress') {
        statusClass = ' marker-in-progress';
        statusBadgeHtml = '<div style="background:#fef3c7; color:#d97706; border:1px solid #fde68a; padding:4px 8px; border-radius:6px; font-weight:900; font-size:11px;">🚗 YARDIM YOLDA</div>';
      } else if (req.status === 'resolved') {
        statusClass = ' marker-resolved';
        statusBadgeHtml = '<div style="background:#d1fae5; color:#059669; border:1px solid #a7f3d0; padding:4px 8px; border-radius:6px; font-weight:900; font-size:11px;">✅ TAMAMLANDI</div>';
      } else {
        statusBadgeHtml = '<div style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; padding:4px 8px; border-radius:6px; font-weight:900; font-size:11px;">🚨 BEKLİYOR</div>';
      }

      // Kaçış karakterleri ekleyerek JS string hatalarını önle
      const safeName = String(reqName).replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;');
      const safeNote = String(req.note || "Not bulunmuyor").replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/\n/g, '<br>');

      return `
        L.marker([${lat}, ${lng}], {
          icon: L.divIcon({
            className: 'custom-pin' + '${statusClass}',
            html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${pinColor}" stroke="white" stroke-width="2" style="width: 40px; height: 40px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); transform: translate(-50%, -100%);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>',
            iconSize: [0, 0], iconAnchor: [0, 0], popupAnchor: [0, -40]
          })
        }).addTo(map)
          .bindPopup(
            '<div style="font-family: sans-serif; min-width: 220px; padding: 4px;">' +
              '<div style="font-weight: 900; font-size: 15px; text-transform: uppercase; color: ${pinColor}; border-bottom: 2px solid ${pinColor}; padding-bottom: 6px; margin-bottom: 8px;">' +
                '${safeName}' +
              '</div>' +
              '<div style="font-size: 13px; color: #374151; max-height: 120px; overflow-y: auto; font-weight: 500; margin-bottom: 12px;">' +
                '${safeNote}' +
              '</div>' +
              '<div style="display: flex; justify-content: flex-start; align-items: center; margin-bottom: 12px;">' +
                '${statusBadgeHtml}' +
              '</div>' +
              '<div style="font-size: 12px; color: #fff; background: #3b82f6; padding: 8px; text-align: center; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(59,130,246,0.3);" onclick="window.open(\\'https://www.google.com/maps/search/?api=1&query=${lat},${lng}\\', \\'_blank\\')">' +
                'Google Haritalar\\'da Aç' +
              '</div>' +
            '</div>'
          )
          .bindTooltip('<div style="font-weight:bold; font-size:12px;">${safeName}</div>', { direction: 'top', offset: [0, -40], opacity: 0.95 });
      `;
    }).join('');

    const pointsDataCode = validLocs.map(req => `{lat: ${parseFloat(req.lat)}, lng: ${parseFloat(req.lng)}}`).join(',\n');

    const htmlContent = `<!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Talepler Haritası</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; font-family: sans-serif; background: #f3f4f6; }
        #map { height: 100%; width: 100%; z-index: 1; }
        .header { position: absolute; top: 0; left: 0; right: 0; z-index: 1000; background: #111827; color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .header h1 { margin: 0; font-size: 1.5rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
        .header p { margin: 4px 0 0 0; font-size: 0.75rem; color: #9ca3af; font-weight: 700; text-transform: uppercase; }
        .header-right { display: flex; gap: 12px; align-items: center; }
        .action-btn { background: #3b82f6; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 900; text-transform: uppercase; cursor: pointer; letter-spacing: 0.05em; transition: all 0.2s; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); }
        .action-btn:hover { background: #2563eb; transform: translateY(-1px); }
        .action-btn.active { background: #ef4444; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3); }
        .action-btn.active:hover { background: #dc2626; }
        .close-btn { background: #374151; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 900; text-transform: uppercase; cursor: pointer; letter-spacing: 0.05em; transition: all 0.2s; border: 1px solid #4b5563; }
        .close-btn:hover { background: #4b5563; }
        .leaflet-container { font-family: sans-serif; }
        
        /* Harita Açıklama (Legend) Stilleri */
        .legend-box { position: absolute; bottom: 30px; left: 30px; z-index: 1000; background: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.5); }
        .legend-title { margin: 0 0 16px 0; font-size: 15px; text-transform: uppercase; font-weight: 900; color: #111827; letter-spacing: 0.05em; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; }
        .legend-item { display: flex; align-items: center; margin-bottom: 12px; font-size: 13px; color: #4b5563; font-weight: 700; }
        .legend-item:last-child { margin-bottom: 0; }
        .color-dot { width: 16px; height: 16px; border-radius: 50%; margin-right: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid white; }
        .pulse-dot { width: 16px; height: 16px; border-radius: 50%; background: #f59e0b; margin-right: 12px; animation: pulse-ring 1.5s infinite; border: 2px solid white; }
        .dimmed-dot { width: 16px; height: 16px; border-radius: 50%; background: #9ca3af; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; border: 2px solid white; }
        
        /* Durum Animasyonları */
        .marker-in-progress svg { animation: marker-pulse 1.5s infinite; filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.9)) !important; }
        .marker-resolved svg { opacity: 0.4; filter: grayscale(100%) !important; }

        @keyframes marker-pulse {
          0% { transform: translate(-50%, -100%) scale(1); }
          50% { transform: translate(-50%, -100%) scale(1.2); }
          100% { transform: translate(-50%, -100%) scale(1); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Talepler Haritası</h1>
          <p>Tüm taleplerin renkli konumları</p>
        </div>
        <div class="header-right">
          <button class="action-btn" id="btn-density">Yoğun Bölgeyi Analiz Et</button>
          <button class="close-btn" onclick="window.close()">Sekmeyi Kapat</button>
        </div>
      </div>
      
      <div class="legend-box">
        <h3 class="legend-title">Harita Açıklamaları</h3>
        <div class="legend-item"><span class="color-dot" style="background:#ef4444;"></span> Enkaz / Acil</div>
        <div class="legend-item"><span class="color-dot" style="background:#3b82f6;"></span> Yaralı</div>
        <div class="legend-item"><span class="color-dot" style="background:#10b981;"></span> Ulaşım Talebi</div>
        <div class="legend-item"><span class="color-dot" style="background:#8b5cf6;"></span> Başkası İçin Yardım</div>
        <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e5e7eb;">
        <div class="legend-item"><span class="pulse-dot"></span> <span style="color:#d97706; font-weight:900;">Yardım Gidiyor (Hareketli Simge)</span></div>
        <div class="legend-item"><span class="color-dot" style="background:#6b7280; border-color:#9ca3af;"></span> <span style="color:#4b5563; font-weight:700;">Henüz Başlanmadı (Sabit Simge)</span></div>
        <div class="legend-item"><span class="dimmed-dot">✓</span> <span style="color:#9ca3af; font-weight:700;">Tamamlandı (Soluk Simge)</span></div>
      </div>

      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const map = L.map('map', { zoomControl: false }).setView([39.0, 35.0], 6);
          L.control.zoom({ position: 'bottomright' }).addTo(map);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          
          try {
            ${markersCode}
          } catch(e) {
            console.error("Marker ekleme hatasi:", e);
          }

          // Yogunluk Analizi
          const points = [
            ${pointsDataCode}
          ];
          
          let densityCircle = null;

          document.getElementById('btn-density').addEventListener('click', function() {
            if (densityCircle) {
              map.removeLayer(densityCircle);
              densityCircle = null;
              this.innerText = 'Yoğun Bölgeyi Analiz Et';
              this.classList.remove('active');
              map.flyTo([39.0, 35.0], 6, { animate: true, duration: 1.5 });
              return;
            }

            if (points.length === 0) return alert('Yeterli konum verisi yok!');

            let maxCount = 0;
            let denseCenter = null;
            const radiusKm = 5; // 5 km yarıçap (daha dar bölge)

            function getDistance(lat1, lon1, lat2, lon2) {
              const R = 6371; 
              const dLat = (lat2 - lat1) * Math.PI / 180;
              const dLon = (lon2 - lon1) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
              return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
            }

            // En yoğun noktayı bul
            points.forEach(p1 => {
              let count = 0;
              points.forEach(p2 => {
                if (getDistance(p1.lat, p1.lng, p2.lat, p2.lng) <= radiusKm) {
                  count++;
                }
              });
              if (count > maxCount) {
                maxCount = count;
                denseCenter = p1;
              }
            });

            if (denseCenter) {
              densityCircle = L.circle([denseCenter.lat, denseCenter.lng], {
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.25,
                weight: 3,
                dashArray: '10, 10',
                radius: radiusKm * 1000 // metre
              }).addTo(map)
              .bindPopup('<div style="font-weight:900; color:#ef4444; text-align:center; font-size:16px; margin-bottom:4px;">KRİTİK YOĞUNLUK BÖLGESİ</div><div style="font-size:13px; text-align:center; color:#374151;">Bu 5 km\\'lik alanda toplam <b>' + maxCount + '</b> yardım talebi bulunuyor.</div>')
              .openPopup();

              map.flyTo([denseCenter.lat, denseCenter.lng], 13, {
                animate: true,
                duration: 1.5
              });

              this.innerText = 'Analizi Kapat';
              this.classList.add('active');
            }
          });

        });
      </script>
    </body>
    </html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="p-8 text-gray-600 font-black uppercase tracking-widest">{t('loading_requests')}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sticky Filter & Header Section */}
      <div className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-md border-b border-gray-200 shadow-sm p-8 space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-none uppercase italic">{t('emergency_management')}</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{t('emergency_desc')}</p>
          </div>
          <button 
            onClick={handleOpenMap}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Tümünü Haritada Gör
          </button>
        </div>

        {/* Stats as Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats.map((stat) => (
            <button
              key={stat.id}
              onClick={() => setActiveFilter(stat.id)}
              className={`bg-white rounded-xl shadow-sm p-4 text-center transition-all border-2 relative overflow-hidden group ${activeFilter === stat.id ? 'border-orange-500 ring-4 ring-orange-100 shadow-lg scale-105' : 'border-transparent hover:border-gray-200'
                }`}
            >
              <div className={`text-2xl font-black ${stat.color === 'red' ? 'text-red-600' :
                stat.color === 'yellow' ? 'text-yellow-600' :
                  stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'orange' ? 'text-orange-600' :
                      stat.color === 'blue' ? 'text-blue-600' :
                        'text-gray-900'
                }`}>
                {stat.value}
              </div>
              <div className="text-[9px] uppercase font-black tracking-tighter text-gray-400 mt-1">{stat.label}</div>
              {activeFilter === stat.id && (
                <div className="absolute top-0 right-0 p-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Requests List */}
        <div className="space-y-4 max-w-7xl mx-auto">
          {sortedRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-gray-400 font-bold uppercase tracking-widest">Bu kategoride şu an talep bulunmuyor.</p>
            </div>
          ) : (
            sortedRequests.map((request, index) => (
              <RequestCard 
                key={request.id} 
                request={request}
                index={index + 1}
                membersMap={membersMap}
                cardsMap={cardsMap}
                handleStatusUpdate={handleStatusUpdate} 
                t={t} 
                getTypeIcon={getTypeIcon}
                getBorderColor={getBorderColor}
                getTypeColor={getTypeColor}
                getPriorityDot={getPriorityDot}
                getRawTime={getRawTime}
                getTimeInfo={getTimeInfo}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RequestCard({ request, index, membersMap, cardsMap, handleStatusUpdate, t, getTypeIcon, getBorderColor, getTypeColor, getPriorityDot, getRawTime, getTimeInfo, getStatusBadge }: any) {
  const Icon = getTypeIcon(request.type);
  const { label, colorClass } = getTimeInfo(request);

  const resolvedName = request.card_member_id ? membersMap?.[request.card_member_id] : (request.card_id ? cardsMap?.[request.card_id] : null);
  const requesterName = request.card_member?.name || request.member?.name || request.card?.family_name || request.card?.name || request.user?.name || request.name || request.full_name || resolvedName || (request.card_member_id ? `Üye ID: ${request.card_member_id}` : null) || (request.card_id ? `Kart ID: ${request.card_id}` : null) || "İSİMSİZ TALEP";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-6">
        
        {/* 1. Icon */}
        <div className={`shrink-0 p-3.5 rounded-xl bg-gray-50 border border-gray-100 ${getTypeColor(request.type)}`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* 2. Identity & Status */}
        <div className="shrink-0 w-48 min-w-0">
          <h3 className="text-lg font-black text-black truncate uppercase leading-tight mb-1" title={requesterName}>
            {index}. {requesterName}
          </h3>
          <div className="flex items-center gap-2">
            {getPriorityDot(request.priority)}
            {getStatusBadge(request.status)}
          </div>
        </div>

        {/* 3. The NOTE (Flexible but wide) */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100/50 italic truncate" title={request.note}>
            &quot;{request.note}&quot;
          </div>
        </div>

        {/* 4. The TIME (Hour) */}
        <div className="shrink-0 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-dashed border-gray-200">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-black text-gray-900 tracking-tighter italic">{getRawTime(request.created_at)}</span>
        </div>

        {/* 5. Respond Hub (Buttons) */}
        <div className="shrink-0 flex items-center gap-2 border-l border-gray-100 pl-4 ml-2">
          
          {request.status === 'in_progress' && label && (
            <div className={`px-2 py-1 rounded-md bg-yellow-50 ${colorClass} text-[9px] font-black uppercase tracking-tighter border border-yellow-100`}>
              {label}
            </div>
          )}

          <div className="flex flex-row-reverse items-center gap-4">
            <button 
              onClick={() => {
                if (request.lat && request.lng) {
                  window.open(`https://www.google.com/maps/search/?api=1&query=${request.lat},${request.lng}`, '_blank');
                } else {
                  alert(t('no_location'));
                }
              }}
              className="px-12 py-6 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl border border-blue-100 flex items-center justify-center"
              title="Haritada Gör"
            >
              <MapPin className="w-8 h-8" />
            </button>

            {request.status === 'pending' && (
              <button
                onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                className="w-64 py-6 bg-orange-500 text-white rounded-2xl text-xl font-black transition-all hover:bg-orange-600 uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6 fill-current" />
                {t('start')}
              </button>
            )}

            {request.status === 'in_progress' && (
              <button
                onClick={() => handleStatusUpdate(request.id, 'resolved')}
                className="w-64 py-6 bg-emerald-600 text-white rounded-2xl text-xl font-black transition-all hover:bg-emerald-700 uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                <CheckCircle className="w-6 h-6" />
                {t('complete')}
              </button>
            )}

            {request.status === 'resolved' && (
              <div className="px-6 py-2.5 bg-gray-50 text-gray-400 rounded-lg text-xs font-black text-center uppercase tracking-widest border border-gray-100">
                {t('completed')}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
