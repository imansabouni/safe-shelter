import { useState } from 'react';
import axios from 'axios';
import { Mail, Shield, Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Invite() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'staff'>('staff');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [inviteLink, setInviteLink] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setInviteLink(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/invite',
                { email, role },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.message === 'Invite created' || response.status === 200 || response.status === 201) {
                setMessage({
                    type: 'success',
                    text: t('invitation_sent_success') || 'Davetiye başarıyla gönderildi!'
                });
                if (response.data.link) {
                    const correctedLink = response.data.link.replace('192.168.1.173', 'localhost');
                    setInviteLink(correctedLink);
                }
                setEmail('');
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('invitation_failed') || 'Davetiye gönderilemedi.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="p-8 space-y-8">
            {/* Standard Header Area */}
            <div className="flex flex-col sm:flex-row items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('invite_new_user') || 'Yeni Kullanıcı Davet Et'}
                    </h1>

                </div>
                <div className="hidden sm:block">
                    <span
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase rounded-full border border-blue-200 dark:border-blue-800 tracking-widest"
                        style={{ textShadow: '0.4px 0 0 currentColor' }}
                    >
                        {t('superadmin') || 'SÜPER ADMİN'}
                    </span>
                </div>
            </div>


            {/* Main Invite Card & Info Section */}
            <div className="flex flex-row gap-6 items-start w-full">
                {/* Invite Form Card */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden h-full">
                        <div className="h-2 bg-blue-600 w-full"></div>
                        <div className="p-6 md:p-8">
                            {/* Card Header Title */}
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50 dark:border-slate-800">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <h2
                                    className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight"
                                    style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                                >
                                    YENİ DAVET OLUŞTUR
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col space-y-8 w-full">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <label
                                            className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight"
                                            style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                                        >
                                            {t('email_address') || 'E-POSTA ADRESİ'}
                                        </label>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@safeshelter.com"
                                        className="w-full pr-5 py-3 bg-gray-50 dark:bg-slate-800/50 border-2 border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white font-bold text-sm transition-all focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none"
                                        style={{ paddingLeft: '20px' }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <p
                                        className="text-gray-500 font-black mt-2"
                                        style={{ fontSize: '15px' }}
                                    >
                                        * Davet bağlantısı bu adrese e-posta olarak da gönderilecektir.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <label
                                                className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight"
                                                style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                                            >
                                                {t('user_role') || 'KULLANICI ROLÜ'}
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['admin', 'staff'] as const).map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setRole(r)}
                                                    className={`py-3 px-4 rounded-xl border-2 font-bold text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${role === r
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                        : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 font-bold hover:border-blue-200 shadow-sm'
                                                        }`}
                                                >
                                                    {r === 'admin' ? (t('admin') || 'ADMİN') : (t('staff') || 'STAFF')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                            style={{ textShadow: '0.4px 0 0 white, -0.4px 0 0 white' }}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    <span>{t('send_invitation') || 'DAVETİYE GÖNDER'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            {(message || inviteLink) && (
                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 space-y-4">
                                    {message && (
                                        <div className={`p-4 rounded-xl text-center font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                            {message.text}
                                        </div>
                                    )}
                                    {inviteLink && (
                                        <div className="bg-blue-50/50 dark:bg-blue-600/5 border border-blue-100 dark:border-blue-900/40 p-6 rounded-xl space-y-3">
                                            <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">
                                                {t('invite_link') || 'DAVET BAĞLANTISI'}
                                            </div>
                                            <div className="flex gap-3">
                                                <input
                                                    readOnly
                                                    value={inviteLink}
                                                    className="flex-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-sm font-black text-blue-600 truncate outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(inviteLink)}
                                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-black text-xs uppercase shadow-md active:scale-95"
                                                >
                                                    KOPYALA
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Role Information Card */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden h-full flex flex-col">
                        <div className="h-2 bg-emerald-600 w-full"></div>
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h2
                                    className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight"
                                    style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                                >
                                    {t('role_permissions') || 'ROL YETKİLERİ'}
                                </h2>
                            </div>

                            <div className="flex flex-col space-y-6 flex-1">
                                <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1.5 bg-blue-600 text-white text-base font-bold rounded-lg uppercase tracking-widest">ADMİN</span>
                                        <span className="text-base font-black text-gray-900 dark:text-white" style={{ textShadow: '0.4px 0 0 currentColor' }}>{t('admin_full_access') || 'Tam Erişim Yetkisi'}</span>
                                    </div>
                                    <ul className="space-y-3 font-black text-gray-900 dark:text-gray-200">
                                        <li className="flex items-center gap-3 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            Tüm paneller ve detaylı istatistikler
                                        </li>
                                        <li className="flex items-center gap-3 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            Kullanıcı/Davet/Silme yönetimi
                                        </li>
                                        <li className="flex items-center gap-3 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            Sistem ayarları ve ham veri erişimi
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1.5 bg-emerald-600 text-white text-base font-bold rounded-lg uppercase tracking-widest">STAFF</span>
                                        <span className="text-base font-black text-gray-900 dark:text-white" style={{ textShadow: '0.4px 0 0 currentColor' }}>{t('staff_field_access') || 'Saha Operasyon Yetkisi'}</span>
                                    </div>
                                    <ul className="space-y-3 font-black text-gray-900 dark:text-gray-200">
                                        <li className="flex items-center gap-3 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                            Kapasite ve kaynak yönetimi
                                        </li>
                                        <li className="flex items-center gap-3 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                            Yardım taleplerini yanıtlama
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-rose-600 italic font-black">
                                            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                                            Kullanıcı ekleyemez/silemez
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
