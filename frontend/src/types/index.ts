export interface GitHubProfile {
  id: number;
  github_username: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  total_stars: number;
  total_forks: number;
  developer_score: number;
  github_profile_url: string;
  last_synced_at: string | null;
  is_cached?: boolean;
  rate_limit_remaining?: number;
}

export interface Repository {
  id: number;
  github_repo_id?: number | null;
  name: string;
  full_name?: string | null;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  watchers: number;
  topics: string[];
  is_fork: boolean;
  is_archived: boolean;
  updated_at: string | null;
  created_at_gh: string | null;
  repository_url: string;
  homepage?: string | null;
  byte_languages?: Record<string, number>;
  cached_at?: string | null;
}

export interface RepositoryListResponse {
  username: string;
  total_repositories: number;
  languages: string[];
  repositories: Repository[];
}

export interface ContributionDay {
  date: string;
  count: number;
  weekday: number;
  intensity: number;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionResponse {
  username: string;
  total_contributions: number;
  current_streak: number;
  longest_streak: number;
  active_days: number;
  weeks: ContributionWeek[];
  calendar_start: string;
  calendar_end: string;
  is_cached?: boolean;
}

export interface LanguageStat {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
  repo_count: number;
}

export interface LanguageAnalyticsResponse {
  username: string;
  total_bytes: number;
  total_languages: number;
  languages: LanguageStat[];
  dominant_language: string | null;
}

export interface MonthlyTrend {
  month: string;
  contributions: number;
  repo_creations: number;
}

export interface DayOfWeekStat {
  day: string;
  day_index: number;
  contributions: number;
  percentage: number;
}

export interface RepoGrowthPoint {
  date: string;
  cumulative_repos: number;
}

export interface GrowthInsightsResponse {
  username: string;
  most_productive_month: string;
  most_productive_month_count: number;
  most_active_day: string;
  most_active_day_percentage: number;
  average_contributions_per_week: number;
  current_streak: number;
  longest_streak: number;
  total_contributions: number;
  monthly_trends: MonthlyTrend[];
  day_of_week_stats: DayOfWeekStat[];
  repo_growth_history: RepoGrowthPoint[];
  top_languages_by_volume: string[];
  insights_narrative: string[];
}

export interface SkillEvidence {
  name: string;
  category: string;
  demonstrated: boolean;
  weight: number;
  evidence: string[];
}

export interface CategoryScore {
  category: string;
  required_count: number;
  matched_count: number;
  score_percentage: number;
}

export interface CompatibilityResponse {
  id?: number;
  username: string;
  job_title: string;
  company?: string | null;
  compatibility_score: number;
  matched_skills: string[];
  demonstrated_skills: SkillEvidence[];
  inferred_skills: SkillEvidence[];
  missing_skills: string[];
  category_breakdown: CategoryScore[];
  explanation: string;
  recommendations: string[];
  created_at?: string;
}

export interface CompatibilityHistoryItem {
  id: number;
  username: string;
  job_title: string;
  company?: string | null;
  compatibility_score: number;
  matched_skills_count: number;
  missing_skills_count: number;
  matched_skills: string[];
  missing_skills: string[];
  created_at: string;
}

export interface PortfolioVisibilitySettings {
  show_heatmap: boolean;
  show_languages: boolean;
  show_growth: boolean;
  show_vibe_check: boolean;
  show_stats: boolean;
}

export interface PortfolioSettingsUpdate {
  headline?: string;
  introduction?: string;
  custom_bio?: string;
  contact_email?: string;
  social_links?: Record<string, string>;
  featured_repositories?: string[];
  visibility_settings?: PortfolioVisibilitySettings;
}

export interface PublicPortfolioResponse {
  username: string;
  headline: string;
  introduction: string;
  custom_bio?: string | null;
  contact_email?: string | null;
  social_links: Record<string, string>;
  profile: GitHubProfile;
  featured_repositories: Repository[];
  all_repositories: Repository[];
  languages: LanguageAnalyticsResponse;
  contributions?: ContributionResponse | null;
  growth_insights?: GrowthInsightsResponse | null;
  latest_vibe_check?: CompatibilityResponse | null;
  visibility_settings: PortfolioVisibilitySettings;
  share_url: string;
  updated_at: string;
}

export interface DemoUser {
  username: string;
  name: string;
  role: string;
  avatar: string;
  dominant_lang: string;
}
