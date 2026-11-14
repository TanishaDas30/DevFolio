import React from 'react';
import {
  TrendingUp,
  Calendar,
  Flame,
  Award,
  Zap,
  BarChart3,
  GitCommit,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { GrowthInsightsResponse } from '../types';

interface GrowthInsightsViewProps {
  data: GrowthInsightsResponse | null;
  isLoading: boolean;
}

export const GrowthInsightsView: React.FC<GrowthInsightsViewProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#151D2E] rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="h-72 bg-[#151D2E] rounded-2xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title Banner */}
      <div className="bg-gradient-to-r from-purple-950/50 via-[#151D2E] to-indigo-950/40 border border-purple-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono uppercase tracking-wider mb-2 font-semibold">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Developer Intelligence & Momentum
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Developer Growth & Coding Cadence Insights
          </h1>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            Historical analytics evaluating commit momentum, cyclical coding patterns, repository velocity, and verified persistence streaks.
          </p>
        </div>
      </div>

      {/* 4 Key Productivity Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Most Productive Month */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Peak Velocity Month</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {data.most_productive_month}
          </div>
          <p className="text-xs text-indigo-300 font-mono mt-1">
            {data.most_productive_month_count} contributions logged
          </p>
        </div>

        {/* Most Active Day */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Top Cadence Day</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {data.most_active_day}
          </div>
          <p className="text-xs text-amber-300 font-mono mt-1">
            {data.most_active_day_percentage}% of total code pushes
          </p>
        </div>

        {/* Average per Week */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Avg Weekly Cadence</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {data.average_contributions_per_week}
          </div>
          <p className="text-xs text-cyan-300 font-mono mt-1">
            contributions / week
          </p>
        </div>

        {/* Longest Coding Streak */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Streak Record</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {data.longest_streak} days
          </div>
          <p className="text-xs text-emerald-300 font-mono mt-1">
            Current streak: {data.current_streak} days
          </p>
        </div>
      </div>

      {/* Interactive Charts: Monthly Trends & Day-of-Week Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Contribution Velocity (7 cols) */}
        <div className="lg:col-span-7 bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-indigo-400" />
              Monthly Contribution Velocity
            </h3>
            <span className="text-xs font-mono text-gray-400">Past 12 Months</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0D1117] border border-white/20 p-2.5 rounded-xl shadow-2xl text-xs backdrop-blur-md font-mono">
                          <div className="font-bold text-white mb-1">{label}</div>
                          <div className="text-indigo-400">
                            Contributions: {payload[0]?.value}
                          </div>
                          <div className="text-cyan-400">
                            Repos Created: {payload[1]?.value}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="contributions" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repo_creations" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day of the Week Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Weekly Coding Rhythm
            </h3>
            <span className="text-xs font-mono text-gray-400">Day by Day</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {data.day_of_week_stats.map((day) => {
              const isPeak = day.day === data.most_active_day;
              return (
                <div key={day.day} className="flex items-center justify-between text-xs">
                  <span className={`w-10 font-mono font-medium ${isPeak ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                    {day.day}
                  </span>
                  <div className="flex-1 mx-3 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPeak
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm'
                          : 'bg-indigo-500/60'
                      }`}
                      style={{ width: `${Math.max(5, day.percentage)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-gray-300">
                    {day.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cumulative Repository Growth Chart */}
      <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Cumulative Repository Growth Velocity
          </h3>
          <span className="text-xs font-mono text-gray-400">Open Source Portfolio Expansion</span>
        </div>

        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.repo_growth_history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="repoGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0D1117] border border-white/20 p-2 rounded-lg text-xs font-mono">
                        <div className="text-gray-400">{label}</div>
                        <div className="text-purple-400 font-bold">
                          Cumulative Repos: {payload[0]?.value}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative_repos"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#repoGrowthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Automatically Generated Data Narrative Insights */}
      <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Automated Behavioral & Productivity Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {data.insights_narrative.map((insight, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all flex items-start gap-3 text-xs text-gray-300 leading-relaxed"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                {idx + 1}
              </div>
              <p>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
