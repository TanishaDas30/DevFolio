import React, { useState } from 'react';
import { Flame, Trophy, Calendar, Sparkles } from 'lucide-react';
import { ContributionResponse } from '../types';

interface ContributionHeatmapProps {
  data: ContributionResponse | null;
  isLoading: boolean;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ data, isLoading }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  if (isLoading || !data) {
    return (
      <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-white/10 rounded mb-4"></div>
        <div className="h-32 bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  // Intensity color map (GitHub dark style with vibrant emerald accents)
  const getCellColor = (intensity: number) => {
    switch (intensity) {
      case 1:
        return 'bg-[#0E4429] border-[#006D32]/40';
      case 2:
        return 'bg-[#006D32] border-[#26A641]/50';
      case 3:
        return 'bg-[#26A641] border-[#39D353]/60';
      case 4:
        return 'bg-[#39D353] border-white/60 shadow-[0_0_8px_rgba(57,211,83,0.4)]';
      default:
        return 'bg-[#161B22] border-white/[0.03]';
    }
  };

  // Helper to get month labels across the 52 weeks
  const getMonthLabels = () => {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = '';

    data.weeks.forEach((week, idx) => {
      if (week.days.length > 0) {
        const firstDay = week.days[0];
        const dateObj = new Date(firstDay.date);
        const month = dateObj.toLocaleString('default', { month: 'short' });
        if (month !== lastMonth) {
          labels.push({ label: month, weekIndex: idx });
          lastMonth = month;
        }
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Glow decorative accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header with Title and Streak Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Contribution Activity Heatmap</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Last 12 Months
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Tracking {data.total_contributions.toLocaleString()} total commits, PRs, and issues across active GitHub projects.
          </p>
        </div>

        {/* Streaks counters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400/20" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-gray-400">Current Streak</div>
              <div className="text-sm font-bold text-white font-mono">{data.current_streak} days</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
            <Trophy className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-gray-400">Longest Streak</div>
              <div className="text-sm font-bold text-white font-mono">{data.longest_streak} days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="mt-6 overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          {/* Month labels */}
          <div className="flex text-[11px] font-mono text-gray-400 mb-2 pl-8">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  width: `${(data.weeks.length > 0 ? (100 / data.weeks.length) * 4.3 : 8)}%`,
                  textAlign: 'left'
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid with Weekday Labels on Left */}
          <div className="flex gap-2">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between text-[10px] font-mono text-gray-400 pr-1 py-1 h-[104px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3.5px]">
              {data.weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3.5px]">
                  {week.days.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          date: day.date,
                          count: day.count,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-[11.5px] h-[11.5px] rounded-[2.5px] border heatmap-cell cursor-pointer ${getCellColor(
                        day.intensity
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg bg-[#0D1117] border border-white/20 text-white text-xs shadow-2xl backdrop-blur-md"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <div className="font-semibold text-emerald-400">
            {hoveredCell.count === 0 ? 'No contributions' : `${hoveredCell.count} contribution${hoveredCell.count > 1 ? 's' : ''}`}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">
            {new Date(hoveredCell.date).toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      )}

      {/* Footer: Legend and Stats Summary */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active on <strong className="text-white font-mono">{data.active_days}</strong> days in the past 52 weeks</span>
        </div>

        {/* Intensity Legend */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-[2px] bg-[#161B22] border border-white/[0.03]"></span>
            <span className="w-3 h-3 rounded-[2px] bg-[#0E4429] border border-[#006D32]/40"></span>
            <span className="w-3 h-3 rounded-[2px] bg-[#006D32] border border-[#26A641]/50"></span>
            <span className="w-3 h-3 rounded-[2px] bg-[#26A641] border border-[#39D353]/60"></span>
            <span className="w-3 h-3 rounded-[2px] bg-[#39D353] border border-white/60"></span>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
