import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MessageSquare, Clock, Search,
  Filter, Star, ChevronRight,
  ThumbsUp, Trash2, Flag,
  CheckCircle2, Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Comment {
  id: string;
  user: string;
  text: string;
  date: string;
  rating: number;
  shelter: string;
  avatarColor: string;
  status: 'published' | 'pending' | 'flagged';
}

const StarRating = ({ rating }: { rating: number }) => {
  // ✅ Puanın tam sayı ve 0-5 aralığında olmasını garantiye al
  const safeRating = Math.max(0, Math.min(5, Number(rating || 0)));

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={16}
          fill={s <= safeRating ? "#eab308" : "transparent"}
          stroke={s <= safeRating ? "#eab308" : "currentColor"}
          className={s <= safeRating ? "text-yellow-500" : "text-muted-foreground/30"}
        />
      ))}
    </div>
  );
};

export default function Comments() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        // Backend API
        const res = await axios.get('http://127.0.0.1:8000/api/comments');
        // API response structure: res.data.data (Laravel style)
        const data = res.data.data || res.data || [];

        const avatarColors = [
          '#3b82f6', '#a855f7', '#10b981',
          '#f97316', '#6366f1', '#f43f5e'
        ];

        const mappedComments = data.map((c: any, index: number) => {
          // 🔥 KRİTİK DÜZELTME: API'deki doğru field isimlerini okuyoruz (name, display_name)
          const rawName = c.display_name || c.name || c.user_name || (c.card ? c.card.family_name : (c.member ? c.member.name : t('misafir_kullanici')));
          const userName = String(rawName).trim() || 'U';

          // 🌟 Yıldız puanı için de aynı şekilde geniş tarama:
          const finalRating = c.rating != null
            ? Number(c.rating)
            : (c.comment?.rating != null
              ? Number(c.comment.rating)
              : (c.stars || c.score || 0));

          return {
            id: String(c.id),
            user: userName,
            text: c.comment?.text || c.comment || c.text || '',
            date: c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR') : '-',
            rating: finalRating,
            shelter: c.shelter_name || c.shelter || t('genel_merkez'),
            avatarColor: avatarColors[index % avatarColors.length],
            status: c.status === 'approved' || c.status === 'published' ? 'published' : (c.status === 'flagged' ? 'flagged' : 'pending')
          };
        });

        setComments(mappedComments);
      } catch (err) {
        console.error("Comments fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, []);

  const filteredComments = comments.filter(c =>
    c.text.toLowerCase().includes(search.toLowerCase()) ||
    c.user.toLowerCase().includes(search.toLowerCase())
  );

  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1)
    : "0.0";

  const repliedCount = comments.filter(c => c.status === 'published').length;
  const responseRate = comments.length > 0 ? Math.round((repliedCount / comments.length) * 100) : 0;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-8 px-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-blue-500 mb-2">{t('comments_management')}</h1>
          <p className="text-gray-800 dark:text-gray-400 font-semibold">{t('comments_desc')}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-6 group hover:border-yellow-500/30 transition-all">
          <div className="w-16 h-16 bg-yellow-500/10 text-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <Star className="w-8 h-8 fill-yellow-500" />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-1">
              {t('average_rating')}
            </h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white font-mono tracking-tighter">{averageRating}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-6 group hover:border-blue-500/30 transition-all">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-1">
              {t('total_comments')}
            </h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white font-mono tracking-tighter">{comments.length}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-6 group hover:border-emerald-500/30 transition-all">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-1">
              {t('response_rate')}
            </h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white font-mono tracking-tighter">%{responseRate}</p>
          </div>
        </div>
      </div>
      <div className="h-4" />

      {/* Comments Main Area */}
      <div className="bg-card rounded-[1.5rem] border border-border shadow-md overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="text-xl font-black text-foreground uppercase tracking-[0.1em]">{t('recent_feedback')}</h2>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-yellow-600" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('loading_feedback')}</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center bg-card rounded-2xl border border-border">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-md font-black text-foreground uppercase tracking-tight mb-1">{t('no_comments_found')}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('search_no_results')}</p>
            </div>
          ) : filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card p-6 rounded-2xl border-2 border-gray-100 dark:border-slate-800 hover:border-blue-500/20 hover:shadow-xl transition-all duration-300 group relative shadow-sm"
            >
              <div className="flex items-start justify-between gap-6 mb-4">
                {/* User Profile Info - LEFT */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="w-12 h-12 text-white rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundColor: comment.avatarColor }}
                  >
                    {comment.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4
                      className="text-lg font-black text-gray-900 dark:text-white truncate uppercase tracking-tight font-outfit"
                      style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                    >
                      {comment.user}
                    </h4>
                  </div>
                </div>

                {/* Meta Info - RIGHT */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <StarRating rating={comment.rating} />
                  <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                    <Clock className="w-3 h-3" />
                    <div className="w-2" />
                    {comment.date}
                  </div>
                </div>
              </div>

              {/* Content Area - BELOW */}
              <div className="bg-gray-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-200 leading-relaxed italic max-w-4xl">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="p-6 border-t border-border flex justify-center bg-muted/10">
          <button className="px-6 py-2 bg-card border border-border rounded-lg text-[9px] font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all uppercase tracking-[0.2em]">
            {t('load_more')}
          </button>
        </div>
      </div>
    </div>
  );
}
