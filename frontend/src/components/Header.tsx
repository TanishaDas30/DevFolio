import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  ExternalLink,
  MapPin,
  Building,
  Star,
  GitFork,
  BookMarked,
  Users,
  Award,
  Globe,
  CalendarCheck
} from 'lucide-react';
import { TwitterIcon } from './Icons';
import { GitHubProfile } from '../types';

interface HeaderProps {
  profile: GitHubProfile | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onSearchUser: (username: string) => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  isLoading,
  isRefreshing,
  onSearchUser,
  onRefresh,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchUser(searchInput.trim());
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-teal-400 text-emerald-400 border-emerald-500/30';
    if (score >= 70) return 'from-indigo-500 to-purple-400 text-indigo-400 border-indigo-500/30';
    if (score >= 50) return 'from-cyan-500 to-blue-400 text-cyan-400 border-cyan-500/30';
    return 'from-amber-500 to-orange-400 text-amber-400 border-amber-500/30';
  };

  const getScoreTier = (score: number) => {
    if (score >= 90) return 'ELITE ARCHITECT';
    if (score >= 80) return 'SENIOR CONTRIBUTOR';
    if (score >= 65) return 'ACTIVE BUILDER';
    if (score >= 50) return 'RISING DEVELOPER';
    return 'EMERGING TALENT';
  };

  return (
    <div className="w-full bg-[#111827]/90 border-b border-white/5 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      {/* Top Bar: Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        {/* Username Search Form */}
        <form onSubmit={handleSubmit} className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search any GitHub developer (e.g. torvalds, shadcn, gaearon)..."
            className="w-full bg-[#162032] border border-white/10 rounded-xl pl-10 pr-24 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Analyze
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing || isLoading || !profile}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#162032] hover:bg-[#1E2B42] border border-white/10 text-xs font-medium text-gray-200 hover:text-white transition-all disabled:opacity-50 shadow-sm"
            title="Refresh GitHub API Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : 'text-gray-400'}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync GitHub'}</span>
          </button>

          {profile && (
            <a
              href={profile.github_profile_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-gray-200 hover:text-white transition-all"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          )}
        </div>
      </div>

      {/* Profile Details Banner */}
      {profile && (
        <div className="mt-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar and Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={profile.avatar_url || `https://avatars.githubusercontent.com/${profile.github_username}`}
                alt={profile.name || profile.github_username}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-xl shadow-indigo-950/50"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-[#111827] rounded-lg border border-white/10">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {profile.name || profile.github_username}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-gray-300 border border-white/5">
                  @{profile.github_username}
                </span>
                {profile.is_cached && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Cached in SQLite
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl line-clamp-2 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-gray-400">
                {profile.company && (
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    {profile.company}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {profile.location}
                  </span>
                )}
                {profile.blog && (
                  <a
                    href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
                {profile.twitter_username && (
                  <a
                    href={`https://twitter.com/${profile.twitter_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:underline"
                  >
                    <TwitterIcon className="w-3.5 h-3.5" />
                    <span>@{profile.twitter_username}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Developer Scorecard & Key Stats */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            {/* Scorecard Widget */}
            <div className="flex items-center gap-3.5 px-4 py-2.5 bg-gradient-to-br from-[#162032] to-[#121B2C] border border-white/10 rounded-2xl shadow-lg">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center">
                  <Award className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dev Score</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {getScoreTier(profile.developer_score)}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    {profile.developer_score}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">/ 100</span>
                </div>
              </div>
            </div>

            {/* Micro Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="px-3 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400/20" />
                  <span className="text-white font-bold">{profile.total_stars.toLocaleString()}</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Stars</span>
              </div>

              <div className="px-3 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-medium">
                  <GitFork className="w-3.5 h-3.5" />
                  <span className="text-white font-bold">{profile.total_forks.toLocaleString()}</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Forks</span>
              </div>

              <div className="px-3 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-indigo-400 text-xs font-medium">
                  <BookMarked className="w-3.5 h-3.5" />
                  <span className="text-white font-bold">{profile.public_repos.toLocaleString()}</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Repos</span>
              </div>

              <div className="px-3 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-purple-400 text-xs font-medium">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-white font-bold">{profile.followers.toLocaleString()}</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Followers</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
