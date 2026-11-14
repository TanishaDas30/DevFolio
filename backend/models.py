import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_username = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    company = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    blog = Column(String(500), nullable=True)
    twitter_username = Column(String(100), nullable=True)
    public_repos = Column(Integer, default=0)
    public_gists = Column(Integer, default=0)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    total_stars = Column(Integer, default=0)
    total_forks = Column(Integer, default=0)
    developer_score = Column(Float, default=0.0)
    profile_data = Column(JSON, default=dict)  # raw profile metadata
    last_synced_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    repositories = relationship("Repository", back_populates="user", cascade="all, delete-orphan")
    contributions = relationship("ContributionData", back_populates="user", cascade="all, delete-orphan")
    portfolio_settings = relationship("PortfolioSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    job_analyses = relationship("JobAnalysis", back_populates="user", cascade="all, delete-orphan")


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    github_repo_id = Column(Integer, nullable=True, index=True)
    name = Column(String(200), nullable=False)
    full_name = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    language = Column(String(100), nullable=True, index=True)
    stars = Column(Integer, default=0, index=True)
    forks = Column(Integer, default=0)
    open_issues = Column(Integer, default=0)
    watchers = Column(Integer, default=0)
    topics = Column(JSON, default=list)
    is_fork = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    updated_at = Column(DateTime, nullable=True)
    created_at_gh = Column(DateTime, nullable=True)
    pushed_at = Column(DateTime, nullable=True)
    repository_url = Column(String(500), nullable=False)
    homepage = Column(String(500), nullable=True)
    byte_languages = Column(JSON, default=dict)  # {"Python": 124500, "TypeScript": 45000}
    cached_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="repositories")

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_user_repo_name"),
    )


class ContributionData(Base):
    __tablename__ = "contribution_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    contribution_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    contribution_count = Column(Integer, default=0)
    weekday = Column(Integer, default=0)  # 0: Sun ... 6: Sat
    intensity = Column(Integer, default=0)  # 0 to 4

    user = relationship("User", back_populates="contributions")

    __table_args__ = (
        UniqueConstraint("user_id", "contribution_date", name="uq_user_contribution_date"),
    )


class PortfolioSettings(Base):
    __tablename__ = "portfolio_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    headline = Column(String(300), default="Full-Stack Engineer & Open Source Contributor")
    introduction = Column(Text, default="Passionate developer turning complex problems into elegant, high-impact digital experiences.")
    custom_bio = Column(Text, nullable=True)
    contact_email = Column(String(200), nullable=True)
    social_links = Column(JSON, default=lambda: {"twitter": "", "linkedin": "", "website": ""})
    featured_repositories = Column(JSON, default=list)  # list of repo names or IDs to pin
    visibility_settings = Column(JSON, default=lambda: {
        "show_heatmap": True,
        "show_languages": True,
        "show_growth": True,
        "show_vibe_check": True,
        "show_stats": True
    })
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="portfolio_settings")


class JobAnalysis(Base):
    __tablename__ = "job_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_title = Column(String(200), default="Software Engineering Role")
    company = Column(String(200), nullable=True)
    job_description = Column(Text, nullable=False)
    compatibility_score = Column(Float, nullable=False)  # 0.0 to 100.0
    matched_skills = Column(JSON, default=list)  # list of matched tech names
    demonstrated_skills = Column(JSON, default=list)  # verified from code/repos
    inferred_skills = Column(JSON, default=list)  # inferred from topics/descriptions
    missing_skills = Column(JSON, default=list)  # missing required tech
    category_breakdown = Column(JSON, default=dict)  # e.g. {"Languages": 85, "Frameworks": 60, ...}
    explanation = Column(Text, nullable=True)
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="job_analyses")
