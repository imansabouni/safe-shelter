import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface RiskLog {
    timestamp: string;
    risk_score: number;
    occupancy: number;
    readiness: number;
    level: string;
}

interface RiskChartProps {
    data: RiskLog[];
}

export default function RiskChart({ data }: RiskChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-medium">Yeterli veri bulunamadı. Değişimler gerçekleştikçe burada listelenecektir.</p>
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map(log => ({
        ...log,
        shortTime: new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        shortDate: new Date(log.timestamp).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
    }));

    return (
        <div className="space-y-6">
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="shortTime"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            hide
                            domain={[0, 100]}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    return (
                                        <div className="bg-white p-3 shadow-xl rounded-lg border border-gray-100 min-w-[120px]">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{item.shortDate} {item.shortTime}</p>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-xs font-bold text-gray-700">Risk Skoru:</span>
                                                <span className="text-sm font-black text-blue-600">{item.risk_score}%</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-xs font-bold text-gray-700">Doluluk:</span>
                                                <span className="text-sm font-black text-gray-900">{item.occupancy}%</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="risk_score"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRisk)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.slice(-2).reverse().map((log, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tight">
                                {i === 0 ? 'Son Değişim' : 'Önceki Durum'}
                            </p>
                            <p className="text-xs font-bold text-gray-700">{log.timestamp}</p>
                        </div>
                        <div className="text-right">
                            <span className={`text-sm font-black ${log.risk_score >= 75 ? 'text-red-600' : log.risk_score >= 50 ? 'text-orange-600' : 'text-green-600'}`}>
                                {log.risk_score}%
                            </span>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{log.level}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
