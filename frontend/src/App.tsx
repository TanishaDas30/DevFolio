import React, { useState, useEffect, useCallback } from 'react';
import {
  Sidebar,
  TabType
} from './components/Sidebar';
import { Header } from './components/Header';
import { ContributionHeatmap } from './components/ContributionHeatmap';
import { RepoShowcase } from './components/RepoShowcase';
import { LanguagesChart } from './components/LanguagesChart';
import { VibeCheckView } from './components/VibeCheckView';
import { GrowthInsightsView } from './components/GrowthInsightsView';
import { PortfolioView } from './components/PortfolioView';
import { ToastProvider, useToast } from './components/Toast';
import { apiService } from './services/api';
import {
  GitHubProfile,
  Repository,
  ContributionResponse,
  LanguageAnalyticsResponse,
  GrowthInsightsResponse,
  PublicPortfolioResponse,
  PortfolioSettingsUpdate,
  DemoUser
} from './types';
import { Sparkles, ArrowRight, ShieldAlert, Award, FolderGit2 } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentUsername, setCurrentUsername] = useState('shadcn');
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repoLanguages, setRepoLanguages] = useState<string[]>([]);
  const [contributions, setContributions] = useState<ContributionResponse | null>(null);
  const [languages, setLanguages] = useState<LanguageAnalyticsResponse | null>(null);
  const [insights, setInsights] = useState<GrowthInsightsResponse | null>(null);
  const [portfolio, setPortfolio] = useState<PublicPortfolioResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; limit: number } | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  // Check URL pathname on mount: /portfolio/:username
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/portfolio\/([^/]+)/);
    if (match && match[1]) {
      setCurrentUsername(match[1]);
      setActiveTab('portfolio');
    }
  }, []);

  // Fetch demo users and rate limits once
  useEffect(() => {
    apiService.getDemoUsers().then(setDemoUsers).catch(() => {});
    apiService.getRateLimit().then(setRateLimit).catch(() => {});
  }, []);

  // Main loader for all user intelligence data
  const loadUserData = useCallback(async (username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch profile
      const prof = await apiService.getProfile(username);
      setProfile(prof);

      // Fetch repos, contributions, languages, insights, and portfolio in parallel
      const [repoRes, contribRes, langRes, insightRes, portRes] = await Promise.all([
        apiService.getRepositories(username),
        apiService.getContributions(username),
        apiService.getLanguages(username),
        apiService.getInsights(username),
        apiService.getPortfolio(username),
      ]);

      setRepositories(repoRes.repositories);
      setRepoLanguages(repoRes.languages);
      setContributions(contribRes);
      setLanguages(langRes);
      setInsights(insightRes);
      setPortfolio(portRes);

      // Update rate limit status
      apiService.getRateLimit().then(setRateLimit).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Failed to load developer intelligence data.');
      showToast(err.message || 'Error retrieving GitHub data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUserData(currentUsername);
  }, [currentUsername, loadUserData]);

  const handleSearchUser = (newUsername: string) => {
    setCurrentUsername(newUsername.trim());
  };

  const handleRefresh = async () => {
    if (!currentUsername) return;
    setIsRefreshing(true);
    try {
      const res = await apiService.refreshData(currentUsername);
      showToast(res.message, 'success');
      await loadUserData(currentUsername);
    } catch (err: any) {
      showToast(err.message || 'Failed to refresh GitHub data.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdatePortfolioSettings = async (update: PortfolioSettingsUpdate) => {
    if (!currentUsername) return;
    try {
      const res = await apiService.updatePortfolio(currentUsername, update);
      showToast(res.message, 'success');
      // Reload portfolio
      const updatedPort = await apiService.getPortfolio(currentUsername);
      setPortfolio(updatedPort);
    } catch (err: any) {
      showToast(err.message || 'Failed to update portfolio.', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUsername={currentUsername}
        onSelectUser={(u) => {
          setCurrentUsername(u);
          if (activeTab === 'portfolio') {
            window.history.pushState({}, '', `/portfolio/${u}`);
          }
        }}
        demoUsers={demoUsers}
        rateLimitRemaining={rateLimit?.remaining}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          profile={profile}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onSearchUser={handleSearchUser}
          onRefresh={handleRefresh}
        />

        {/* View Content */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => loadUserData(currentUsername)}
                className="px-3 py-1 bg-rose-600/30 hover:bg-rose-600/50 rounded-lg text-white font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Vibe Check Quick Teaser Card */}
              <div
                onClick={() => setActiveTab('vibe-check')}
                className="cursor-pointer bg-gradient-to-r from-indigo-900/40 via-[#151D2E] to-purple-900/30 border border-indigo-500/30 hover:border-indigo-500/60 p-5 rounded-2xl shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/30 border border-cyan-500/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono font-bold tracking-wider text-cyan-400">
                        Feature Spotlight
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                        Vibe Check
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      How Well Do You Match Your Dream Job?
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Paste a job description to cross-reference required skills against verified GitHub code repositories.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 shrink-0">
                  <span>Run Analysis</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Heatmap Section */}
              <ContributionHeatmap data={contributions} isLoading={isLoading} />

              {/* Grid: Languages Donut on Left (5 cols), Quick Growth on Right (7 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-6 flex">
                  <LanguagesChart data={languages} isLoading={isLoading} />
                </div>

                <div className="lg:col-span-6 flex">
                  {insights && (
                    <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl w-full flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-sm font-bold text-white">Developer Cadence Highlights</h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('insights')}
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                        >
                          <span>Full Insights</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 my-4">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] uppercase font-mono text-gray-400 block">Peak Month</span>
                          <span className="text-sm font-bold text-white mt-1 block">
                            {insights.most_productive_month}
                          </span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] uppercase font-mono text-gray-400 block">Peak Day</span>
                          <span className="text-sm font-bold text-amber-400 mt-1 block">
                            {insights.most_active_day}
                          </span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] uppercase font-mono text-gray-400 block">Avg Weekly Velocity</span>
                          <span className="text-sm font-bold text-cyan-400 mt-1 block font-mono">
                            {insights.average_contributions_per_week} / wk
                          </span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] uppercase font-mono text-gray-400 block">Peak Streak</span>
                          <span className="text-sm font-bold text-emerald-400 mt-1 block font-mono">
                            {insights.longest_streak} days
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-gray-300">
                        {insights.insights_narrative.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <p className="line-clamp-2 leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Repositories Showcase Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Repository Showcase</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('repositories')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <span>View All ({repositories.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <RepoShowcase
                  repositories={repositories}
                  languages={repoLanguages}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="space-y-6 animate-fade-in">
              <ContributionHeatmap data={contributions} isLoading={isLoading} />
              {insights && (
                <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white">Annual Contribution Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="text-2xl font-black text-white font-mono">
                        {contributions?.total_contributions.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Total Contributions</div>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {contributions?.active_days}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Days with Verified Commits</div>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        {contributions?.longest_streak}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Longest Day Streak</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REPOSITORIES TAB */}
          {activeTab === 'repositories' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white">Repository Showcase & Explorer</h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Filter, search, and inspect public repositories for @{currentUsername}
                  </p>
                </div>
              </div>
              <RepoShowcase
                repositories={repositories}
                languages={repoLanguages}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* LANGUAGES TAB */}
          {activeTab === 'languages' && (
            <div className="space-y-6 animate-fade-in">
              <LanguagesChart data={languages} isLoading={isLoading} />
            </div>
          )}

          {/* VIBE CHECK TAB */}
          {activeTab === 'vibe-check' && (
            <div className="animate-fade-in">
              <VibeCheckView username={currentUsername} />
            </div>
          )}

          {/* GROWTH INSIGHTS TAB */}
          {activeTab === 'insights' && (
            <div className="animate-fade-in">
              <GrowthInsightsView data={insights} isLoading={isLoading} />
            </div>
          )}

          {/* MY PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <div className="animate-fade-in">
              <PortfolioView
                portfolio={portfolio}
                isLoading={isLoading}
                onUpdateSettings={handleUpdatePortfolioSettings}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
