import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

# --- GitHub Profile Schemas ---

class GitHubProfileResponse(BaseModel):
    id: int
    github_username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    blog: Optional[str] = None
    twitter_username: Optional[str] = None
    public_repos: int = 0
    public_gists: int = 0
    followers: int = 0
    following: int = 0
    total_stars: int = 0
    total_forks: int = 0
    developer_score: float = 0.0
    github_profile_url: str
    last_synced_at: Optional[datetime.datetime] = None
    is_cached: bool = False
    rate_limit_remaining: Optional[int] = None

    class Config:
        from_attributes = True


# --- Repository Schemas ---

class RepositoryResponse(BaseModel):
    id: int
    github_repo_id: Optional[int] = None
    name: str
    full_name: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    watchers: int = 0
    topics: List[str] = Field(default_factory=list)
    is_fork: bool = False
    is_archived: bool = False
    updated_at: Optional[datetime.datetime] = None
    created_at_gh: Optional[datetime.datetime] = None
    repository_url: str
    homepage: Optional[str] = None
    byte_languages: Dict[str, int] = Field(default_factory=dict)
    cached_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class RepositoryListResponse(BaseModel):
    username: str
    total_repositories: int
    languages: List[str]
    repositories: List[RepositoryResponse]


# --- Contribution & Streak Schemas ---

class ContributionDay(BaseModel):
    date: str  # YYYY-MM-DD
    count: int
    weekday: int  # 0 to 6
    intensity: int  # 0 to 4


class ContributionWeek(BaseModel):
    days: List[ContributionDay]


class ContributionResponse(BaseModel):
    username: str
    total_contributions: int
    current_streak: int
    longest_streak: int
    active_days: int
    weeks: List[ContributionWeek]
    calendar_start: str
    calendar_end: str
    is_cached: bool = False


# --- Language Analytics Schemas ---

class LanguageStat(BaseModel):
    name: str
    bytes: int
    percentage: float
    color: str
    repo_count: int


class LanguageAnalyticsResponse(BaseModel):
    username: str
    total_bytes: int
    total_languages: int
    languages: List[LanguageStat]
    dominant_language: Optional[str] = None


# --- Growth Insights Schemas ---

class MonthlyTrend(BaseModel):
    month: str  # e.g., "Jan 2026"
    contributions: int
    repo_creations: int


class DayOfWeekStat(BaseModel):
    day: str  # "Sun", "Mon", etc.
    day_index: int
    contributions: int
    percentage: float


class RepoGrowthPoint(BaseModel):
    date: str  # YYYY-MM
    cumulative_repos: int


class GrowthInsightsResponse(BaseModel):
    username: str
    most_productive_month: str
    most_productive_month_count: int
    most_active_day: str
    most_active_day_percentage: float
    average_contributions_per_week: float
    current_streak: int
    longest_streak: int
    total_contributions: int
    monthly_trends: List[MonthlyTrend]
    day_of_week_stats: List[DayOfWeekStat]
    repo_growth_history: List[RepoGrowthPoint]
    top_languages_by_volume: List[str]
    insights_narrative: List[str]


# --- Vibe Check / Tech Stack Compatibility Schemas ---

class CompatibilityAnalyzeRequest(BaseModel):
    username: str
    job_description: str = Field(..., min_length=15, description="Full job description text")
    job_title: Optional[str] = Field("Software Engineer", description="Optional job title")
    company: Optional[str] = Field("", description="Optional company name")


class SkillEvidence(BaseModel):
    name: str
    category: str  # "Languages", "Frontend", "Backend", "Databases", "DevOps/Cloud", "AI/ML", "Tools"
    demonstrated: bool  # True if code/repo proved, False if inferred or missing
    weight: float
    evidence: List[str]  # e.g., ["Used in 4 repos: my-repo (Python)", "Repo topic: fastapi"]


class CategoryScore(BaseModel):
    category: str
    required_count: int
    matched_count: int
    score_percentage: float


class CompatibilityResponse(BaseModel):
    id: Optional[int] = None
    username: str
    job_title: str
    company: Optional[str] = None
    compatibility_score: float  # 0 to 100
    matched_skills: List[str]
    demonstrated_skills: List[SkillEvidence]
    inferred_skills: List[SkillEvidence]
    missing_skills: List[str]
    category_breakdown: List[CategoryScore]
    explanation: str
    recommendations: List[str]
    created_at: Optional[datetime.datetime] = None


class CompatibilityHistoryItem(BaseModel):
    id: int
    username: str
    job_title: str
    company: Optional[str] = None
    compatibility_score: float
    matched_skills_count: int
    missing_skills_count: int
    matched_skills: List[str]
    missing_skills: List[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Portfolio Schemas ---

class PortfolioVisibilitySettings(BaseModel):
    show_heatmap: bool = True
    show_languages: bool = True
    show_growth: bool = True
    show_vibe_check: bool = True
    show_stats: bool = True


class PortfolioSettingsUpdate(BaseModel):
    headline: Optional[str] = None
    introduction: Optional[str] = None
    custom_bio: Optional[str] = None
    contact_email: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    featured_repositories: Optional[List[str]] = None  # repo names
    visibility_settings: Optional[PortfolioVisibilitySettings] = None


class PublicPortfolioResponse(BaseModel):
    username: str
    headline: str
    introduction: str
    custom_bio: Optional[str] = None
    contact_email: Optional[str] = None
    social_links: Dict[str, str]
    profile: GitHubProfileResponse
    featured_repositories: List[RepositoryResponse]
    all_repositories: List[RepositoryResponse]
    languages: LanguageAnalyticsResponse
    contributions: Optional[ContributionResponse] = None
    growth_insights: Optional[GrowthInsightsResponse] = None
    latest_vibe_check: Optional[CompatibilityResponse] = None
    visibility_settings: PortfolioVisibilitySettings
    share_url: str
    updated_at: datetime.datetime


# --- Common Status / Health ---

class RefreshResponse(BaseModel):
    success: bool
    message: str
    username: str
    synced_at: datetime.datetime
