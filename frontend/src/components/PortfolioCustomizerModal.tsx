import React, { useState } from 'react';
import { X, Save, Eye, Check, Star } from 'lucide-react';
import { PublicPortfolioResponse, PortfolioSettingsUpdate } from '../types';

interface PortfolioCustomizerModalProps {
  portfolio: PublicPortfolioResponse;
  isOpen: boolean;
  onClose: () => void;
  onSave: (update: PortfolioSettingsUpdate) => Promise<void>;
}

export const PortfolioCustomizerModal: React.FC<PortfolioCustomizerModalProps> = ({
  portfolio,
  isOpen,
  onClose,
  onSave,
}) => {
  const [headline, setHeadline] = useState(portfolio.headline);
  const [introduction, setIntroduction] = useState(portfolio.introduction);
  const [contactEmail, setContactEmail] = useState(portfolio.contact_email || '');
  const [twitter, setTwitter] = useState(portfolio.social_links?.twitter || '');
  const [linkedin, setLinkedin] = useState(portfolio.social_links?.linkedin || '');
  const [website, setWebsite] = useState(portfolio.social_links?.website || '');
  const [featuredRepos, setFeaturedRepos] = useState<string[]>(
    portfolio.featured_repositories.map((r) => r.name)
  );
  const [visibility, setVisibility] = useState(portfolio.visibility_settings);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleRepo = (repoName: string) => {
    if (featuredRepos.includes(repoName)) {
      setFeaturedRepos(featuredRepos.filter((n) => n !== repoName));
    } else {
      if (featuredRepos.length >= 6) return; // limit to 6 pins
      setFeaturedRepos([...featuredRepos, repoName]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        headline,
        introduction,
        contact_email: contactEmail,
        social_links: { twitter, linkedin, website },
        featured_repositories: featuredRepos,
        visibility_settings: visibility,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151D2E] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Customize Public Portfolio</h3>
            <p className="text-xs text-gray-400">Settings are persisted in SQLite for @{portfolio.username}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Headline */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Portfolio Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer & Open Source Contributor"
              className="w-full bg-[#101726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Introduction */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Personal Bio / Introduction
            </label>
            <textarea
              rows={3}
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="Describe your engineering focus, passions, and background..."
              className="w-full bg-[#101726] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Contact & Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-[#101726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Personal Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://mysite.dev"
                className="w-full bg-[#101726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Twitter / X Username</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="username"
                className="w-full bg-[#101726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-[#101726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Featured Repositories Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300 block">
                Pinned Featured Repositories ({featuredRepos.length}/6 selected)
              </label>
              <span className="text-[10px] text-gray-400">Click to pin / unpin</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {portfolio.all_repositories.map((repo) => {
                const isSelected = featuredRepos.includes(repo.name);
                return (
                  <div
                    key={repo.name}
                    onClick={() => toggleRepo(repo.name)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-xs truncate">{repo.name}</div>
                      <div className="text-[10px] text-gray-400">{repo.language || 'Code'} • {repo.stars} stars</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              Section Visibility Settings
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { key: 'show_heatmap', label: 'Contribution Heatmap' },
                { key: 'show_languages', label: 'Languages Chart' },
                { key: 'show_growth', label: 'Growth Insights' },
                { key: 'show_vibe_check', label: 'Tech Compatibility' },
                { key: 'show_stats', label: 'Statistics Cards' },
              ].map((item) => {
                const isVisible = visibility[item.key as keyof typeof visibility];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setVisibility({
                        ...visibility,
                        [item.key]: !isVisible,
                      })
                    }
                    className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-between transition-colors ${
                      isVisible
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/[0.02] border-white/5 text-gray-500'
                    }`}
                  >
                    <span>{item.label}</span>
                    <Eye className="w-3.5 h-3.5 ml-1" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#101726] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
