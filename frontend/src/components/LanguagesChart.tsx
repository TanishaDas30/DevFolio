import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, Code2, Database } from 'lucide-react';
import { LanguageAnalyticsResponse } from '../types';

interface LanguagesChartProps {
  data: LanguageAnalyticsResponse | null;
  isLoading: boolean;
}

export const LanguagesChart: React.FC<LanguagesChartProps> = ({ data, isLoading }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isLoading || !data) {
    return (
      <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-36 bg-white/10 rounded mb-4" />
        <div className="h-64 bg-white/5 rounded-xl" />
      </div>
    );
  }

  // Format bytes nicely (e.g. 1.4 MB)
  const formatBytes = (bytes: number): string => {
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${bytes} B`;
  };

  const chartData = data.languages.map((l) => ({
    name: l.name,
    value: l.bytes,
    percentage: l.percentage,
    color: l.color,
    repo_count: l.repo_count,
  }));

  return (
    <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Top Languages Analytics</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{formatBytes(data.total_bytes)} code volume</span>
        </div>
      </div>

      {/* Chart and Legend Layout */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 items-center gap-6">
        {/* Interactive Recharts Donut */}
        <div className="h-60 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={activeIndex === index ? '#ffffff' : 'rgba(0,0,0,0.4)'}
                    strokeWidth={activeIndex === index ? 2 : 1}
                    className="transition-all duration-200 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0D1117] border border-white/20 p-2.5 rounded-xl shadow-2xl text-xs backdrop-blur-md">
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          <span>{d.name}</span>
                        </div>
                        <div className="text-gray-300 font-mono mt-1">
                          {d.percentage}% ({formatBytes(d.value)})
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Detected in {d.repo_count} repositories
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
              Dominant
            </span>
            <span className="text-base font-extrabold text-white tracking-tight mt-0.5">
              {data.dominant_language || 'Polyglot'}
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">
              {data.languages[0]?.percentage || 0}% share
            </span>
          </div>
        </div>

        {/* Detailed Legend List */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
          {data.languages.map((lang, index) => (
            <div
              key={lang.name}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`p-2 rounded-xl transition-all flex items-center justify-between border cursor-pointer ${
                activeIndex === index
                  ? 'bg-white/[0.08] border-indigo-500/40 translate-x-1'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: lang.color }}
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    {lang.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {formatBytes(lang.bytes)} • {lang.repo_count} repos
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-white block">
                  {lang.percentage}%
                </span>
                <div className="w-16 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] text-gray-400">
        <Database className="w-3.5 h-3.5 text-gray-400" />
        <span>Aggregated by precise source code byte volume across repository branches.</span>
      </div>
    </div>
  );
};
