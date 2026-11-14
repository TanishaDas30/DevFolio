import React, { useState, useMemo } from 'react';
import {
  Star,
  GitFork,
  ExternalLink,
  Search,
  SlidersHorizontal,
  FolderGit2,
  Calendar,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';
import { Repository } from '../types';

interface RepoShowcaseProps {
  repositories: Repository[];
  languages: string[];
  isLoading: boolean;
  onFilterChange?: (sortBy: string, language: string, search: string) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Rust: '#DEA584',
  Go: '#00ADD8',
  Java: '#B07219',
  'C++': '#F34B7D',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Shell: '#89E051',
  Vue: '#41B883',
  Svelte: '#FF3E00'
};

export const RepoShowcase: React.FC<RepoShowcaseProps> = ({
  repositories,
  languages,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated' | 'name'>('stars');

  // Filter and sort client-side for immediate responsiveness
  const filteredRepos = useMemo(() => {
    let result = [...repositories];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          r.topics.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedLanguage !== 'All') {
      result = result.filter(
        (r) => r.language && r.language.toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    if (sortBy === 'stars') {
      result.sort((a, b) => b.stars - a.stars);
    } else if (sortBy === 'forks') {
      result.sort((a, b) => b.forks - a.forks);
    } else if (sortBy === 'updated') {
      result.sort(
        (a, b) =>
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      );
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [repositories, searchTerm, selectedLanguage, sortBy]);

  // Determine top 2 repos for highlight badges
  const topRepoNames = useMemo(() => {
    const sortedByStars = [...repositories].sort((a, b) => b.stars - a.stars);
    return new Set(sortedByStars.slice(0, 2).map((r) => r.name));
  }, [repositories]);

  return (
    <div className="space-y-6">
      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#151D2E] border border-white/5 rounded-2xl p-4 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repositories by name, topic, or description..."
            className="w-full bg-[#101726] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language filter */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#101726] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none pr-8"
            >
              <option value="All">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="flex rounded-xl bg-[#101726] p-1 border border-white/10 text-xs">
            <button
              onClick={() => setSortBy('stars')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                sortBy === 'stars'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stars
            </button>
            <button
              onClick={() => setSortBy('forks')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                sortBy === 'forks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Forks
            </button>
            <button
              onClick={() => setSortBy('updated')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                sortBy === 'updated'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Updated
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Repository Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-[#151D2E] rounded-2xl border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-12 text-center">
          <FolderGit2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No repositories match your criteria</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset language filters to inspect all public repositories.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedLanguage('All');
            }}
            className="mt-4 px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-medium rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRepos.map((repo) => {
            const isTop = topRepoNames.has(repo.name);
            const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] || '#6366F1') : '#8B949E';

            return (
              <div
                key={repo.id}
                className={`glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between relative group ${
                  isTop ? 'border-indigo-500/30' : ''
                }`}
              >
                {/* Top Highlight Badge */}
                {isTop && (
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-bold tracking-wide uppercase text-white shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </div>
                )}

                <div>
                  {/* Top Bar: Title and External Link */}
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={repo.repository_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors line-clamp-1 flex items-center gap-1.5"
                    >
                      <FolderGit2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{repo.name}</span>
                    </a>
                    <a
                      href={repo.repository_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-white p-1 transition-colors"
                      title="Open on GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed min-h-[36px]">
                    {repo.description || 'No description provided for this repository.'}
                  </p>

                  {/* Topics Tags */}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-indigo-300 border border-white/5"
                        >
                          #{topic}
                        </span>
                      ))}
                      {repo.topics.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-mono px-1 py-0.5">
                          +{repo.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Language and Stats */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  {/* Language */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: langColor }}
                    />
                    <span className="font-mono text-gray-300">{repo.language || 'Plain text'}</span>
                  </div>

                  {/* Star and Fork counts */}
                  <div className="flex items-center gap-3 font-mono">
                    <span className="flex items-center gap-1 text-amber-400/90" title="Stars">
                      <Star className="w-3.5 h-3.5 fill-amber-400/30" />
                      {repo.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400/90" title="Forks">
                      <GitFork className="w-3.5 h-3.5" />
                      {repo.forks.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Updated timestamp */}
                {repo.updated_at && (
                  <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
