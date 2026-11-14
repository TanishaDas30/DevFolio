import {
  GitHubProfile,
  RepositoryListResponse,
  ContributionResponse,
  LanguageAnalyticsResponse,
  GrowthInsightsResponse,
  CompatibilityResponse,
  CompatibilityHistoryItem,
  PublicPortfolioResponse,
  PortfolioSettingsUpdate,
  DemoUser
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const apiService = {
  // Profile
  getProfile: (username: string): Promise<GitHubProfile> => {
    return fetchJson<GitHubProfile>(`/github/${encodeURIComponent(username)}/profile`);
  },

  // Repositories
  getRepositories: (
    username: string,
    params?: { sortBy?: string; language?: string; search?: string }
  ): Promise<RepositoryListResponse> => {
    const query = new URLSearchParams();
    if (params?.sortBy) query.append('sort_by', params.sortBy);
    if (params?.language) query.append('language', params.language);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<RepositoryListResponse>(`/github/${encodeURIComponent(username)}/repositories${qs}`);
  },

  // Contributions
  getContributions: (username: string): Promise<ContributionResponse> => {
    return fetchJson<ContributionResponse>(`/github/${encodeURIComponent(username)}/contributions`);
  },

  // Languages
  getLanguages: (username: string): Promise<LanguageAnalyticsResponse> => {
    return fetchJson<LanguageAnalyticsResponse>(`/github/${encodeURIComponent(username)}/languages`);
  },

  // Growth Insights
  getInsights: (username: string): Promise<GrowthInsightsResponse> => {
    return fetchJson<GrowthInsightsResponse>(`/github/${encodeURIComponent(username)}/insights`);
  },

  // Force Refresh
  refreshData: (username: string): Promise<{ success: boolean; message: string; username: string }> => {
    return fetchJson<{ success: boolean; message: string; username: string }>(
      `/github/${encodeURIComponent(username)}/refresh`,
      { method: 'POST' }
    );
  },

  // Vibe Check
  analyzeCompatibility: (payload: {
    username: string;
    job_description: string;
    job_title?: string;
    company?: string;
  }): Promise<CompatibilityResponse> => {
    return fetchJson<CompatibilityResponse>('/compatibility/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getCompatibilityHistory: (username: string): Promise<CompatibilityHistoryItem[]> => {
    return fetchJson<CompatibilityHistoryItem[]>(`/compatibility/history/${encodeURIComponent(username)}`);
  },

  // Portfolio
  getPortfolio: (username: string): Promise<PublicPortfolioResponse> => {
    return fetchJson<PublicPortfolioResponse>(`/portfolio/${encodeURIComponent(username)}`);
  },

  updatePortfolio: (username: string, payload: PortfolioSettingsUpdate): Promise<{ success: boolean; message: string }> => {
    return fetchJson<{ success: boolean; message: string }>(
      `/portfolio/${encodeURIComponent(username)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  // Demo users & rate limits
  getDemoUsers: (): Promise<DemoUser[]> => {
    return fetchJson<DemoUser[]>('/demo/users');
  },

  getRateLimit: (): Promise<{ remaining: number; limit: number; graphql_remaining: number }> => {
    return fetchJson<{ remaining: number; limit: number; graphql_remaining: number }>('/rate-limit');
  },
};
