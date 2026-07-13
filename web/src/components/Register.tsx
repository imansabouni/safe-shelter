import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  // 🔥 token from link
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  // ❌ prevent access without invite
  useEffect(() => {
    if (!token) {
      setError('Bu sayfaya erişim izniniz yok (Invite gerekli)');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const success = await register(name, email, password, token);
      if (success) {
        navigate('/login');
      } else {
        setError('Kayıt başarısız');
      }
    } catch {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      {/* ── CARD CONTAINER (Fixed Width: 860px) ── */}
      <div
        className="flex rounded-3xl overflow-hidden shadow-2xl shadow-slate-400/25 bg-white"
        style={{ minHeight: '460px', width: '860px', flexShrink: 0 }}
      >
        
        {/* ── LEFT: Brand Panel (Fixed Width: 400px) ── */}
        <div 
          className="flex flex-col items-center justify-center relative p-12 overflow-hidden"
          style={{ width: '400px', flexShrink: 0, background: 'linear-gradient(160deg, #1a3a8c 0%, #1a2f73 50%, #152560 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute rounded-full" style={{ width: '320px', height: '320px', top: '-80px', left: '-100px', background: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute rounded-full" style={{ width: '240px', height: '240px', top: '60px', right: '-80px', background: 'rgba(255,255,255,0.04)' }} />

          {/* Circular Icon - Enlarged Outer Glow */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="absolute rounded-full" style={{ width: '200px', height: '200px', background: 'rgba(100,140,255,0.15)' }} />
            <div 
              className="relative rounded-full flex items-center justify-center border"
              style={{ width: '100px', height: '100px', background: 'linear-gradient(145deg, #4a7ef5, #2b5ce6)', borderColor: 'rgba(255,255,255,0.25)', boxShadow: '0 8px 32px rgba(30,60,160,0.5)' }}
            >
              <ShieldCheck className="w-12 h-12 text-white" strokeWidth={1.8} />
            </div>
          </div>

          {/* Spacer Div */}
          <div className="h-16" />

          {/* Branding Title */}
          <h1 className="relative z-10 text-xl text-white font-outfit uppercase tracking-[0.3em] text-center whitespace-nowrap">
            <span className="font-black">SAFE</span> &nbsp; <span className="font-thin opacity-70">SHELTER</span>
          </h1>
        </div>

        {/* ── RIGHT: Register Form ── */}
        <div className="flex-1 bg-white flex items-start">
          <div className="w-8 flex-shrink-0" />
          <div className="flex-1 space-y-12 py-12">
            <div className="h-10" />

            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Hesap Oluşturun</h2>
              <p className="text-gray-400 text-sm mt-3">Devam etmek için bilgilerinizi girin.</p>
            </div>

            {/* Spacer between title and form */}
            <div className="h-6" />

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-lg font-black text-blue-700 uppercase tracking-tight font-outfit">Ad Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="iman sabouni"
                  className="w-full px-4 py-3 bg-slate-50 border border-blue-600 focus:border-blue-700 focus:bg-white rounded-xl text-gray-900 font-outfit font-medium text-base transition-all outline-none placeholder:text-gray-300 shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-lg font-black text-blue-700 uppercase tracking-tight font-outfit">E-Posta Adresi</label>
                <input
                  type="email"
                  required
                  placeholder="isim@safeshelter.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-blue-600 focus:border-blue-700 focus:bg-white rounded-xl text-gray-900 font-outfit font-medium text-base transition-all outline-none placeholder:text-gray-300 shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-lg font-black text-blue-700 uppercase tracking-tight font-outfit">Şifre</label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-blue-600 focus:border-blue-700 focus:bg-white rounded-xl text-gray-900 font-outfit font-medium text-base transition-all outline-none pr-12 shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors flex items-center justify-center"
                    style={{ right: '16px', left: 'auto', height: '100%' }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Spacer between password and button */}
              <div className="h-2" />

              {error && (
                <div className="bg-red-50 text-red-500 text-xs py-2.5 px-4 rounded-xl text-center font-semibold border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-2/3 mx-auto text-white rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 flex flex-col items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #2b5ce6, #1a3a8c)' }}
              >
                <div className="h-3" />
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4" />
                    <span>Kayıt Ol</span>
                    <ChevronRight size={16} />
                    <div className="w-3" />
                  </div>
                )}
                <div className="h-3" />
              </button>
            </form>

            {/* Spacer between form and login link */}
            <div className="h-4" />

            <p className="text-center text-base font-outfit">
              <span className="text-black font-medium">Zaten hesabınız var mı?</span>{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Giriş Yap</Link>
            </p>

            {/* Bottom spacer */}
            <div className="h-8" />
          </div>
          <div className="w-8 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}