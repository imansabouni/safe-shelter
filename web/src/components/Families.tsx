import { Users, User, CheckCircle, XCircle, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function Families() {
  const { t } = useLanguage();
  const [families, setFamilies] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'families' | 'individuals'>('families');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/cards')
      .then(res => setFamilies(res.data || []))
      .catch(err => console.error('Error fetching cards:', err));
  }, []);

  const displayFamilies = families.filter(f => f.is_family === 1 || f.is_family === true);

  const standaloneIndividuals = families
    .filter(f => f.is_family === 0 || f.is_family === false)
    .map(f => {
      const firstMember = f.members?.[0] || {};
      return {
        name: f.family_name,
        role: 'individual',
        status: f.status || firstMember.status || 'outside',
        familyName: t('independent_record'),
        shelter: f.shelter || firstMember.shelter || null
      };
    });

  const formatFamilyName = (name: string) => {
    if (!name) return '';
    const nameStr = String(name);
    const suffix = t('family_suffix');
    if (nameStr.toLowerCase().includes(suffix.trim().toLowerCase())) return nameStr;
    return `${nameStr}${suffix}`;
  };

  const getStatusBadge = (family: any) => {
    const total = family.members?.length || 0;
    const inside = family.members?.filter((m: any) => m.status === 'inside').length || 0;
    const shelters = new Set(family.members?.filter((m: any) => m.shelter).map((m: any) => m.shelter.name));

    if (total === 0) return null;

    if (inside === total && shelters.size <= 1) {
      return (
        <span className="px-6 py-2.5 bg-green-600 text-white text-[14px] font-black rounded-xl border-2 border-green-500 uppercase tracking-wider shadow-lg flex items-center justify-center">
          {t('family_status_complete')}
        </span>
      );
    }

    if (shelters.size > 1) {
      return (
        <span className="px-6 py-2.5 bg-orange-500 text-white text-[14px] font-black rounded-xl border-2 border-orange-400 uppercase tracking-wider shadow-lg flex items-center justify-center">
          {t('family_status_separated')}
        </span>
      );
    }

    return (
      <span className="px-6 py-2.5 bg-orange-500 text-white text-[14px] font-black rounded-xl border-2 border-orange-400 uppercase tracking-wider shadow-lg flex items-center justify-center">
        {t('family_status_incomplete')}
      </span>
    );
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getRoleLabel = (role: string) => {
    if (!role) return '';
    const r = role.toLowerCase();
    const translated = t(r);
    return translated !== r ? translated : role;
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto px-4 sm:px-8">
      {/* Header & Integrated Toggle */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-8 px-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('family_management')}
          </h1>
          <p className="text-gray-800 font-semibold">
            {t('family_desc')}
          </p>
        </div>
        <div className="flex justify-center">
          <div className="flex items-center p-2 bg-gray-100/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
            <button
              onClick={() => setViewMode('families')}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === 'families'
                ? 'bg-white text-blue-600 shadow-md border border-gray-100 scale-[1.02]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              <div className="w-1" />
              <Users className={`w-6 h-6 ${viewMode === 'families' ? 'text-blue-600' : 'text-gray-400'
                }`} />
              {t('families')} ({displayFamilies.length})
            </button>

            <button
              onClick={() => setViewMode('individuals')}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === 'individuals'
                ? 'bg-white text-blue-600 shadow-md border border-gray-100 scale-[1.02]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              <div className="w-1" />
              <User className={`w-6 h-6 ${viewMode === 'individuals' ? 'text-blue-600' : 'text-gray-400'
                }`} />
              {t('individuals')} ({standaloneIndividuals.length})
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'families' ? (
        <div className="space-y-4">
          {displayFamilies.map((family) => {
            const isExpanded = expandedId === family.id;
            const totalMembers = family.members?.length || 0;
            const arrivedMembers = family.members?.filter((m: any) => m.status === 'inside').length || 0;
            return (
              <div
                key={family.id}
                className={`group bg-white rounded-xl border transition-all duration-200 ${isExpanded ? 'shadow-md border-blue-200 ring-1 ring-blue-50' : 'hover:border-gray-300 shadow-sm border-gray-100'
                  }`}
              >
                {/* Family Row / Compact Header */}
                <div
                  onClick={() => toggleExpand(family.id)}
                  className="flex items-center justify-between p-6 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4" />
                    <div className={`p-3 rounded-xl transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-400'}`}>
                      <Users className="w-8 h-8 shadow-sm" />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-widest"
                        style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                      >
                        {formatFamilyName(family.family_name)}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                          {arrivedMembers}  / {totalMembers} {t('member_count')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(family)}
                    <div className={`p-1 rounded-md transition-transform duration-200 ${isExpanded ? 'rotate-180 bg-gray-100' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>


                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-300 shadow-inner">
                    <div className="flex flex-col gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      {family.members?.map((member: any, index: number) => {
                        const isInside = member.status === 'inside';

                        return (
                          <div
                            key={index}
                            className={`py-6 px-5 rounded-2xl border-2 bg-white flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md ${isInside
                              ? 'border-green-100 ring-4 ring-green-50/10'
                              : 'border-gray-100 bg-gray-50/30'
                              }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-1" />
                              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                                <User className="w-6 h-6" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-3">
                                  <span
                                    className="font-black text-gray-900 text-[15px] tracking-tight truncate"
                                    style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                                  >
                                    {member.name}
                                  </span>
                                  <span
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5"
                                    style={{ textShadow: '0.3px 0 0 currentColor, -0.3px 0 0 currentColor' }}
                                  >
                                    {getRoleLabel(member.role)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0 ml-4 mr-8">
                              {isInside && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild side="left">
                                      <div className="p-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100 cursor-pointer transition-all hover:scale-110 shadow-sm">
                                        <MapPin className="w-4 h-4 fill-current/10" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs font-bold px-3 py-1.5 bg-gray-900 text-blue-100 rounded-lg shadow-xl border-none">
                                      {member.shelter && typeof member.shelter === "object"
                                        ? member.shelter.name || t('unknown_shelter')
                                        : member.shelter}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {isInside ? (
                                <div className="p-1.5 bg-green-100 rounded-full border border-green-200 shadow-sm">
                                  <CheckCircle className="w-8 h-8 text-green-600 fill-green-50" />
                                </div>
                              ) : (
                                <div className="p-1.5 bg-red-100 rounded-full border border-red-200 shadow-sm">
                                  <XCircle className="w-8 h-8 text-red-600 fill-red-50" />
                                </div>
                              )}
                              <div className="w-2" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {standaloneIndividuals.map((member: any, index: number) => {
            const isInside = member.status === 'inside';

            return (
              <div
                key={index}
                className={`py-6 px-5 rounded-2xl border-2 bg-white flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md ${isInside
                  ? 'border-green-100 ring-4 ring-green-50/20'
                  : 'border-gray-100 bg-gray-50/30'
                  }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-1" />
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-black text-gray-900 text-[15px] tracking-tight truncate"
                        style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
                      >
                        {member.name}
                      </span>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5"
                        style={{ textShadow: '0.3px 0 0 currentColor, -0.3px 0 0 currentColor' }}
                      >
                        {member.familyName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4 mr-12">
                  {isInside && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild side="left">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100 cursor-pointer transition-all hover:scale-110 shadow-sm">
                            <MapPin className="w-4 h-4 fill-current/10" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs font-bold px-3 py-1.5 bg-gray-900 text-white rounded-lg shadow-xl border-none">
                          {member.shelter && typeof member.shelter === "object"
                            ? member.shelter.name || t('unknown_shelter')
                            : member.shelter}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {isInside ? (
                    <div className="p-1.5 bg-green-100 rounded-full border border-green-200 shadow-sm">
                      <CheckCircle className="w-8 h-8 text-green-600 fill-green-50" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-red-100 rounded-full border border-red-200 shadow-sm">
                      <XCircle className="w-8 h-8 text-red-600 fill-red-50" />
                    </div>
                  )}
                  <div className="w-2" />
                </div>
              </div>
            );
          })}
        </div>

      )}
    </div>
  );
}