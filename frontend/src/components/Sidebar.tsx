import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  FolderGit2,
  PieChart,
  Sparkles,
  TrendingUp,
  Globe,
  Zap,
  Users
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { DemoUser } from '../types';

export type TabType = 'overview' | 'activity' | 'repositories' | 'languages' | 'vibe-check' | 'insights' | 'portfolio';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUsername: string;
  onSelectUser: (username: string) => void;
  demoUsers: DemoUser[];
  rateLimitRemaining?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUsername,
  onSelectUser,
  demoUsers,
  rateLimitRemaining
}) => {
  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'activity', label: 'GitHub Activity', icon: Calendar },
    { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
    { id: 'languages', label: 'Tech Stack', icon: PieChart },
    { id: 'vibe-check', label: 'Vibe Check', icon: Sparkles },
    { id: 'insights', label: 'Growth Insights', icon: TrendingUp },
    { id: 'portfolio', label: 'My Portfolio', icon: Globe },
  ];

  return (
    <aside className="w-64 bg-[#0E1424] border-r border-white/5 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FolderGit2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">DevFolio</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">Dev Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 py-4 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[11px] font-medium tracking-wider uppercase text-gray-400">
          Analytics & Showcase
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.id === 'vibe-check' && (
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </button>
          );
        })}

        {/* Demo Profiles Dropdown / Quick Switch */}
        <div className="pt-6">
          <div className="px-3 pb-2 text-[11px] font-medium tracking-wider uppercase text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Demo Profiles
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Quick Switch</span>
          </div>
          <div className="space-y-1">
            {demoUsers.map((u) => {
              const isSelected = currentUsername.toLowerCase() === u.username.toLowerCase();
              return (
                <button
                  key={u.username}
                  onClick={() => onSelectUser(u.username)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.username}
                    className="w-5 h-5 rounded-full border border-white/10 shrink-0"
                  />
                  <span className="truncate font-mono">@{u.username}</span>
                  <span className="ml-auto text-[10px] text-gray-400 font-sans">{u.dominant_lang}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info & API Rate Limit */}
      <div className="p-3 border-t border-white/5 bg-[#090D18]/80 text-xs">
        <div className="flex items-center justify-between text-gray-400 px-2 py-1">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            API Rate Limit
          </span>
          <span className="font-mono text-gray-300">
            {rateLimitRemaining !== undefined ? `${rateLimitRemaining}/60+` : 'Cached'}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between px-2 text-[11px] text-gray-500">
          <span>DevFolio v1.0</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <GithubIcon className="w-3 h-3" />
            GitHub API
          </a>
        </div>
      </div>
    </aside>
  );
};
