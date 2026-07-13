import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Wallet, Package, TrendingUp,
  Heart, Loader2, ArrowRight,
  Clock, DollarSign, CheckCircle2, Check, Hourglass, User
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MoneyDonation {
  id: string;
  donor: string;
  amount: number;
  currency: string;
  date: string;
  type: 'one-time' | 'monthly';
  status: 'completed' | 'pending';
}

interface SupplyDonation {
  id: string;
  donor: string;
  item: string;
  quantity: string;
  date: string;
  status: 'received' | 'processing';
}

export default function Donations() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'money' | 'supply'>('money');
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/donations');
        const data = res.data.data || res.data || [];
        setDonations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Donation fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const getDonorName = (d: any) => {
    let name = d.donor_name || d.donor;
    if (d.card) name = d.card.family_name;
    if (d.member) name = d.member.name;

    if (!name || name === 'Bilinmeyen Bağışçı' || name === 'Unknown Donor') {
      return 'ANONİM';
    }
    return name;
  };

  const moneyDonations: MoneyDonation[] = donations
    .filter(d => d.type === 'money')
    .map(d => ({
      id: String(d.id),
      donor: getDonorName(d),
      amount: Number(d.amount) || 0,
      currency: d.currency || 'TL',
      date: d.created_at ? new Date(d.created_at).toLocaleDateString('tr-TR') : (d.date || '-'),
      type: d.donation_type || 'one-time',
      status: d.status || 'completed'
    }));

  const supplyDonations: SupplyDonation[] = donations
    .filter(d => d.type === 'resource' || d.type === 'supply')
    .map(d => ({
      id: String(d.id),
      donor: getDonorName(d),
      item: t(d.resource_type || d.item) || d.resource_type || d.item || '-',
      quantity: `${d.quantity || d.amount} ${d.unit || 'Birim'}`,
      date: d.created_at ? new Date(d.created_at).toLocaleDateString('tr-TR') : (d.date || '-'),
      status: d.status === 'received' || d.status === 'delivered' ? 'received' : 'processing'
    }));

  const totalMoney = moneyDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalTransactions = donations.length;

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 max-w-6xl mx-auto">

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-8 px-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('donations') || 'Bağış Yönetimi'}</h1>
          <p className="text-gray-800 font-semibold">{t('donations_desc') || 'Tüm ayni ve nakdi yardımların takibi'}</p>
        </div>
      </div>

      {/* 🧭 Centered Tabs - FULL WIDTH ELITE VERSION */}
      <div className="flex justify-center">
        <div className="flex w-full bg-muted p-2 rounded-[2rem] border-2 border-border shadow-inner">
          <button
            onClick={() => setActiveTab('money')}
            className={`flex-1 flex items-center justify-center gap-6 py-5 rounded-[1.5rem] text-xl font-black transition-all duration-300 ${activeTab === 'money' ? 'bg-background text-blue-600 shadow-2xl scale-[1.02] border border-border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Wallet className="w-8 h-8" /> {t('monetary').toUpperCase()}
          </button>
          <button
            onClick={() => setActiveTab('supply')}
            className={`flex-1 flex items-center justify-center gap-6 py-5 rounded-[1.5rem] text-xl font-black transition-all duration-300 ${activeTab === 'supply' ? 'bg-background text-indigo-600 shadow-2xl scale-[1.02] border border-border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Package className="w-8 h-8" /> {t('in_kind').toUpperCase()}
          </button>
        </div>
      </div>

      <div className="h-10" />

      {/* 📊 LARGE Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card p-10 rounded-3xl border border-border shadow-lg flex items-center gap-8 group hover:border-blue-500/30 transition-all">
          <div className="w-20 h-20 bg-blue-500/10 text-blue-600 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
            {activeTab === 'money' ? <DollarSign className="w-10 h-10" /> : <Package className="w-10 h-10" />}
          </div>
          <div className="flex items-center">
            <h3
              className="text-xl font-black text-gray-500 uppercase tracking-[0.2em] shrink-0"
              style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
            >
              {activeTab === 'money' ? t('toplam_bagis_miktari') : t('toplam_kayitli_birim')}
            </h3>
            <div className="w-8 shrink-0" />
            <p className="text-8xl font-black text-foreground font-mono tracking-tighter">
              {activeTab === 'money' ? `₺${totalMoney.toLocaleString('tr-TR')}` : `${supplyDonations.length} ${t('adet')}`}
            </p>
          </div>
        </div>

        <div className="bg-card p-10 rounded-3xl border border-border shadow-lg flex items-center gap-8 group hover:border-red-500/30 transition-all">
          <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-inner">
            <Heart className="w-10 h-10 fill-current" />
          </div>
          <div className="flex items-center">
            <h3
              className="text-xl font-black text-gray-500 uppercase tracking-[0.2em] shrink-0"
              style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
            >
              {t('toplam_islem_adedi')}
            </h3>
            <div className="w-8 shrink-0" />
            <p className="text-8xl font-black text-foreground font-mono tracking-tighter">{totalTransactions}</p>
          </div>
        </div>
      </div>

      <div className="h-10" />

      {/* 📜 LARGE Feed List */}
      <div className="space-y-2">
        {loading ? (
          <div className="bg-card border border-border rounded-[2.5rem] p-40 flex flex-col items-center justify-center gap-6 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Sistem Verileri Alınıyor...</span>
          </div>
        ) : (
          (activeTab === 'money' ? moneyDonations : supplyDonations).map((item: any) => (
            <div key={item.id} className="bg-card border border-border rounded-[2rem] p-4 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 flex items-center justify-between group shadow-sm">
              <div className="flex items-center flex-1 min-w-0">
                <div className={`w-16 h-16 ${activeTab === 'money' ? 'bg-blue-600/10 text-blue-600' : 'bg-indigo-600/10 text-indigo-600'} rounded-2xl flex items-center justify-center font-black text-xl shrink-0 border border-border shadow-sm group-hover:rotate-[360deg] transition-transform duration-1000`}>
                  <User className="w-8 h-8" />
                </div>
                <div className="w-6 shrink-0" />
                <div className="min-w-0 space-y-2 flex-1">
                  <h4 className="text-lg font-black text-foreground truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight">{item.donor}</h4>
                  <div className="flex items-center gap-10 mt-1">
                    <span className="text-lg font-black text-blue-600 font-mono tracking-tighter italic scale-[0.9] origin-left">
                      {activeTab === 'money' ? `₺${item.amount.toLocaleString('tr-TR')}` : item.item}
                    </span>
                    {activeTab === 'supply' && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-border rounded-full"></div>
                        <span
                          className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1"
                          style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                        >
                          {item.quantity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12 shrink-0">
                <div className="hidden lg:flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                    >
                      Islem Tarihi
                    </span>
                  </div>
                  <span className="text-lg font-black text-foreground/70 font-mono tracking-tight">{item.date}</span>
                </div>
                <div className="w-8 shrink-0" />
                <div className="min-w-[150px] flex justify-center items-center">
                  {(item.status === 'completed' || item.status === 'received') ? (
                    <CheckCircle2 className="w-12 h-12 text-green-600 stroke-[3]" />
                  ) : (
                    <Clock className="w-12 h-12 text-orange-600 animate-pulse stroke-[3]" />
                  )}
                </div>
                <div className="w-8 shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
