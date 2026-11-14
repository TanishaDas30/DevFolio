import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Settings,
  ExternalLink,
  Star,
  GitFork,
  CheckCircle2,
  Mail,
  Globe,
  Sparkles,
  Award,
  FolderGit2
} from 'lucide-react';
import { TwitterIcon, LinkedinIcon } from './Icons';
import { PublicPortfolioResponse, PortfolioSettingsUpdate } from '../types';
import { ContributionHeatmap } from './ContributionHeatmap';
import { LanguagesChart } from './LanguagesChart';
import { GrowthInsightsView } from './GrowthInsightsView';
import { PortfolioCustomizerModal } from './PortfolioCustomizerModal';
import { useToast } from './Toast';

interface PortfolioViewProps {
  portfolio: PublicPortfolioResponse | null;
  isLoading: boolean;
  onUpdateSettings: (update: PortfolioSettingsUpdate) => Promise<void>;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  isLoading,
  onUpdateSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  if (isLoading || !portfolio) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-[#151D2E] rounded-2xl border border-white/5" />
        <div className="h-96 bg-[#151D2E] rounded-2xl border border-white/5" />
      </div>
    );
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/portfolio/${portfolio.username}`;
    navigator.clipboard.writeText(url);
    showToast('Public portfolio URL copied to clipboard!', 'success');
  };

  const vis = portfolio.visibility_settings;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Portfolio Top Bar: Share & Customizer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#151D2E] border border-white/5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-sm font-bold text-white">Shareable Public Portfolio</div>
            <div className="text-xs text-gray-400 font-mono">devfolio.app/portfolio/{portfolio.username}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Copy Link</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/30"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Customize Portfolio</span>
          </button>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <img
            src={portfolio.profile.avatar_url || `https://avatars.githubusercontent.com/${portfolio.username}`}
            alt={portfolio.profile.name || portfolio.username}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-2xl shadow-indigo-950/60 shrink-0"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {portfolio.profile.name || portfolio.username}
              </h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                @{portfolio.username}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-semibold text-indigo-400 font-sans">
              {portfolio.headline}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              {portfolio.introduction}
            </p>

            {/* Social / Contact Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-400">
              {portfolio.contact_email && (
                <a
                  href={`mailto:${portfolio.contact_email}`}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-gray-200 border border-white/5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{portfolio.contact_email}</span>
                </a>
              )}
              {portfolio.social_links?.twitter && (
                <a
                  href={`https://twitter.com/${portfolio.social_links.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-cyan-400 border border-white/5 transition-colors"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                  <span>@{portfolio.social_links.twitter}</span>
                </a>
              )}
              {portfolio.social_links?.linkedin && (
                <a
                  href={portfolio.social_links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-blue-400 border border-white/5 transition-colors"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {portfolio.social_links?.website && (
                <a
                  href={portfolio.social_links.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-emerald-400 border border-white/5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* GitHub Stats Strip (if enabled) */}
        {vis.show_stats && (
          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider block">Dev Score</span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">
                {portfolio.profile.developer_score}/100
              </span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider block">Total Stars</span>
              <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
                {portfolio.profile.total_stars.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider block">Total Forks</span>
              <span className="text-xl font-bold text-cyan-400 font-mono mt-1 block">
                {portfolio.profile.total_forks.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider block">Public Repos</span>
              <span className="text-xl font-bold text-indigo-400 font-mono mt-1 block">
                {portfolio.profile.public_repos.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider block">Followers</span>
              <span className="text-xl font-bold text-purple-400 font-mono mt-1 block">
                {portfolio.profile.followers.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Optional Vibe Check Badge (if enabled & exists) */}
      {vis.show_vibe_check && portfolio.latest_vibe_check && (
        <div className="p-5 bg-gradient-to-r from-indigo-950/40 to-[#151D2E] border border-indigo-500/20 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-indigo-300 font-semibold">
                Verified Job Compatibility Check
              </div>
              <div className="text-sm font-bold text-white">
                {portfolio.latest_vibe_check.job_title}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Matched {portfolio.latest_vibe_check.matched_skills.join(', ')}
              </div>
            </div>
          </div>

          <div className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-center shrink-0">
            <span className="text-xl font-extrabold text-white font-mono">
              {portfolio.latest_vibe_check.compatibility_score}%
            </span>
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">Match Score</span>
          </div>
        </div>
      )}

      {/* Featured Repositories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            Featured Open Source Repositories
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            {portfolio.featured_repositories.length} pinned projects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.featured_repositories.map((repo) => (
            <div
              key={repo.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-white">{repo.name}</span>
                  <a
                    href={repo.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                  {repo.description || 'Public GitHub repository'}
                </p>
                {repo.topics && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {repo.topics.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-indigo-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="text-indigo-400">{repo.language || 'Code'}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400/20" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <GitFork className="w-3.5 h-3.5" />
                    {repo.forks}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Heatmap (if enabled) */}
      {vis.show_heatmap && portfolio.contributions && (
        <ContributionHeatmap data={portfolio.contributions} isLoading={false} />
      )}

      {/* Languages Breakdown (if enabled) */}
      {vis.show_languages && (
        <LanguagesChart data={portfolio.languages} isLoading={false} />
      )}

      {/* Growth Insights (if enabled) */}
      {vis.show_growth && portfolio.growth_insights && (
        <GrowthInsightsView data={portfolio.growth_insights} isLoading={false} />
      )}

      {/* Customizer Modal */}
      <PortfolioCustomizerModal
        portfolio={portfolio}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onUpdateSettings}
      />
    </div>
  );
};
