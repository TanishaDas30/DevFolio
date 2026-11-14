import os
import sys
import datetime
from typing import List, Optional

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base, get_db
import models
import schemas
from github_service import GitHubService
from compatibility_service import CompatibilityEngine
from insights_service import InsightsService

# Create SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DevFolio API",
    description="GitHub Developer Intelligence & Portfolio Platform API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Health & Diagnostic Endpoints ---

@app.get("/api/health")
def health_check():
    has_token = bool(os.getenv("GITHUB_TOKEN", "").strip())
    return {
        "status": "healthy",
        "service": "DevFolio API",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "has_github_token": has_token,
        "database": "SQLite (devfolio.db)"
    }


@app.get("/api/demo/users")
def get_demo_users():
    return [
        {
            "username": "shadcn",
            "name": "shadcn",
            "role": "Creator of shadcn/ui & Radix Enthusiast",
            "avatar": "https://avatars.githubusercontent.com/u/124599",
            "dominant_lang": "TypeScript"
        },
        {
            "username": "gaearon",
            "name": "Dan Abramov",
            "role": "Co-creator of Redux & React Core Contributor",
            "avatar": "https://avatars.githubusercontent.com/u/810438",
            "dominant_lang": "JavaScript"
        },
        {
            "username": "leerob",
            "name": "Lee Robinson",
            "role": "VP of Developer Experience at Vercel",
            "avatar": "https://avatars.githubusercontent.com/u/9113740",
            "dominant_lang": "TypeScript"
        },
        {
            "username": "torvalds",
            "name": "Linus Torvalds",
            "role": "Creator of Linux & Git",
            "avatar": "https://avatars.githubusercontent.com/u/1024025",
            "dominant_lang": "C"
        }
    ]


@app.get("/api/rate-limit")
async def get_github_rate_limit(db: Session = Depends(get_db)):
    svc = GitHubService(db)
    limits = await svc.get_rate_limit()
    return limits


# --- GitHub Endpoints ---

@app.get("/api/github/{username}/profile", response_model=schemas.GitHubProfileResponse)
async def get_profile(username: str, db: Session = Depends(get_db)):
    clean_username = username.strip().lower()
    svc = GitHubService(db)
    try:
        user = await svc.sync_user_data(clean_username)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    limits = await svc.get_rate_limit()
    return schemas.GitHubProfileResponse(
        id=user.id,
        github_username=user.github_username,
        name=user.name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        company=user.company,
        location=user.location,
        blog=user.blog,
        twitter_username=user.twitter_username,
        public_repos=user.public_repos,
        public_gists=user.public_gists,
        followers=user.followers,
        following=user.following,
        total_stars=user.total_stars,
        total_forks=user.total_forks,
        developer_score=user.developer_score,
        github_profile_url=f"https://github.com/{user.github_username}",
        last_synced_at=user.last_synced_at,
        is_cached=True,
        rate_limit_remaining=limits.get("remaining")
    )


@app.get("/api/github/{username}/repositories", response_model=schemas.RepositoryListResponse)
async def get_repositories(
    username: str,
    sort_by: str = Query("stars"),
    language: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    clean_username = username.strip().lower()
    svc = GitHubService(db)
    user = await svc.sync_user_data(clean_username)

    repos_query = db.query(models.Repository).filter(models.Repository.user_id == user.id)

    if language and language.lower() != "all":
        repos_query = repos_query.filter(models.Repository.language.ilike(language))

    if search:
        search_filter = f"%{search.strip()}%"
        repos_query = repos_query.filter(
            (models.Repository.name.ilike(search_filter)) |
            (models.Repository.description.ilike(search_filter))
        )

    if sort_by == "stars":
        repos_query = repos_query.order_by(models.Repository.stars.desc())
    elif sort_by == "forks":
        repos_query = repos_query.order_by(models.Repository.forks.desc())
    elif sort_by == "updated":
        repos_query = repos_query.order_by(models.Repository.updated_at.desc())
    else:
        repos_query = repos_query.order_by(models.Repository.name.asc())

    all_user_repos = user.repositories
    distinct_languages = sorted(list(set(r.language for r in all_user_repos if r.language)))

    repos = repos_query.all()
    repo_responses = [schemas.RepositoryResponse.model_validate(r) for r in repos]

    return schemas.RepositoryListResponse(
        username=user.github_username,
        total_repositories=len(repo_responses),
        languages=distinct_languages,
        repositories=repo_responses
    )


@app.get("/api/github/{username}/contributions", response_model=schemas.ContributionResponse)
async def get_contributions(username: str, db: Session = Depends(get_db)):
    clean_username = username.strip().lower()
    svc = GitHubService(db)
    user = await svc.sync_user_data(clean_username)

    contrib_rows = (
        db.query(models.ContributionData)
        .filter(models.ContributionData.user_id == user.id)
        .order_by(models.ContributionData.contribution_date.asc())
        .all()
    )

    if not contrib_rows:
        # Generate calendar data
        cal_data = svc.generate_contribution_calendar_fallback(user, user.repositories)
        # Store in db
        for w in cal_data.get("weeks", []):
            for d in w.get("contributionDays", []):
                db.add(models.ContributionData(
                    user_id=user.id,
                    contribution_date=d["date"],
                    contribution_count=d["contributionCount"],
                    weekday=d["weekday"],
                    intensity=d["intensity"]
                ))
        db.commit()
        contrib_rows = (
            db.query(models.ContributionData)
            .filter(models.ContributionData.user_id == user.id)
            .order_by(models.ContributionData.contribution_date.asc())
            .all()
        )

    # Group into weeks (7 days per column)
    weeks: List[schemas.ContributionWeek] = []
    current_week_days: List[schemas.ContributionDay] = []
    total_count = 0
    active_days = 0

    longest_streak = 0
    current_streak = 0
    temp_streak = 0

    for row in contrib_rows:
        total_count += row.contribution_count
        if row.contribution_count > 0:
            active_days += 1
            temp_streak += 1
            if temp_streak > longest_streak:
                longest_streak = temp_streak
        else:
            temp_streak = 0

        day_model = schemas.ContributionDay(
            date=row.contribution_date,
            count=row.contribution_count,
            weekday=row.weekday,
            intensity=row.intensity
        )
        current_week_days.append(day_model)
        if len(current_week_days) == 7:
            weeks.append(schemas.ContributionWeek(days=current_week_days))
            current_week_days = []

    if current_week_days:
        weeks.append(schemas.ContributionWeek(days=current_week_days))

    # Calculate current streak
    for row in reversed(contrib_rows):
        if row.contribution_count > 0:
            current_streak += 1
        else:
            break

    start_date = contrib_rows[0].contribution_date if contrib_rows else ""
    end_date = contrib_rows[-1].contribution_date if contrib_rows else ""

    return schemas.ContributionResponse(
        username=user.github_username,
        total_contributions=total_count,
        current_streak=current_streak,
        longest_streak=longest_streak,
        active_days=active_days,
        weeks=weeks,
        calendar_start=start_date,
        calendar_end=end_date,
        is_cached=True
    )


@app.get("/api/github/{username}/languages", response_model=schemas.LanguageAnalyticsResponse)
async def get_languages(username: str, db: Session = Depends(get_db)):
    clean_username = username.strip().lower()
    svc = GitHubService(db)
    user = await svc.sync_user_data(clean_username)
    data = svc.get_languages_breakdown(user)
    return schemas.LanguageAnalyticsResponse(**data)


@app.get("/api/github/{username}/insights", response_model=schemas.GrowthInsightsResponse)
async def get_insights(username: str, db: Session = Depends(get_db)):
    clean_username = username.strip().lower()
    svc = GitHubService(db)
    user = await svc.sync_user_data(clean_username)
    insights_svc = InsightsService(db)
    insights = insights_svc.generate_growth_insights(user)
    return schemas.GrowthInsightsResponse(**insights)


@app.post("/api/github/{username}/refresh", response_model=schemas.RefreshResponse)
async def refresh_github_data(username: str, db: Session = Depends(get_db)):
    clean_username = username.strip().lower()
    svc = GitHubService(db)
    try:
        user = await svc.sync_user_data(clean_username, force_refresh=True)
        return schemas.RefreshResponse(
            success=True,
            message=f"Fresh GitHub metadata and contribution activity synced successfully for '{clean_username}'.",
            username=user.github_username,
            synced_at=user.last_synced_at or datetime.datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh data: {str(e)}")


# --- Vibe Check / Tech Stack Compatibility Endpoints ---

@app.post("/api/compatibility/analyze", response_model=schemas.CompatibilityResponse)
async def analyze_compatibility(
    req: schemas.CompatibilityAnalyzeRequest,
    db: Session = Depends(get_db)
):
    if len(req.job_description.strip()) < 15:
        raise HTTPException(
            status_code=400,
            detail="Job description must be at least 15 characters long."
        )

    clean_username = req.username.strip().lower()
    svc = GitHubService(db)
    user = await svc.sync_user_data(clean_username)

    engine_svc = CompatibilityEngine(db)
    result = engine_svc.analyze_compatibility(
        user=user,
        job_description=req.job_description,
        job_title=req.job_title or "Software Engineering Role",
        company=req.company or ""
    )
    return schemas.CompatibilityResponse(**result)


@app.get("/api/compatibility/history/{username}", response_model=List[schemas.CompatibilityHistoryItem])
async def get_compatibility_history(username: str, db: Session = Depends(get_db)):
    clean_username = username.strip().lower()
    user = db.query(models.User).filter(models.User.github_username.ilike(clean_username)).first()
    if not user:
        return []

    engine_svc = CompatibilityEngine(db)
    history = engine_svc.get_user_history(user)
    return [schemas.CompatibilityHistoryItem(**item) for item in history]


# --- Shareable Developer Portfolio Endpoints ---

@app.get("/api/portfolio/{username}", response_model=schemas.PublicPortfolioResponse)
async def get_portfolio(username: str, db: Session = Depends(get_db)):
    clean_username = username.strip().lower()
    svc = GitHubService(db)
    user = await svc.sync_user_data(clean_username)

    # Ensure portfolio settings record
    p_settings = user.portfolio_settings
    if not p_settings:
        p_settings = models.PortfolioSettings(
            user_id=user.id,
            headline="Full-Stack Engineer & Open Source Builder",
            introduction=user.bio or "Building high-performance applications.",
            featured_repositories=[r.name for r in sorted(user.repositories, key=lambda x: x.stars, reverse=True)[:4]],
            visibility_settings={
                "show_heatmap": True,
                "show_languages": True,
                "show_growth": True,
                "show_vibe_check": True,
                "show_stats": True
            }
        )
        db.add(p_settings)
        db.commit()
        db.refresh(p_settings)

    # Get featured repositories
    featured_names = [f.lower() for f in (p_settings.featured_repositories or [])]
    featured_repos = []
    other_repos = []

    for r in sorted(user.repositories, key=lambda x: x.stars, reverse=True):
        if r.name.lower() in featured_names:
            featured_repos.append(schemas.RepositoryResponse.model_validate(r))
        else:
            other_repos.append(schemas.RepositoryResponse.model_validate(r))

    if not featured_repos and other_repos:
        # Default top 4
        featured_repos = other_repos[:4]

    # Languages
    languages_data = svc.get_languages_breakdown(user)

    # Contributions
    contrib_res = await get_contributions(clean_username, db)

    # Growth insights
    insights_res = await get_insights(clean_username, db)

    # Latest vibe check if exists
    latest_analysis = (
        db.query(models.JobAnalysis)
        .filter(models.JobAnalysis.user_id == user.id)
        .order_by(models.JobAnalysis.created_at.desc())
        .first()
    )
    latest_vibe = None
    if latest_analysis:
        latest_vibe = schemas.CompatibilityResponse(
            id=latest_analysis.id,
            username=user.github_username,
            job_title=latest_analysis.job_title,
            company=latest_analysis.company,
            compatibility_score=latest_analysis.compatibility_score,
            matched_skills=latest_analysis.matched_skills or [],
            demonstrated_skills=[schemas.SkillEvidence(**s) for s in (latest_analysis.demonstrated_skills or [])],
            inferred_skills=[schemas.SkillEvidence(**s) for s in (latest_analysis.inferred_skills or [])],
            missing_skills=latest_analysis.missing_skills or [],
            category_breakdown=[schemas.CategoryScore(**c) for c in (latest_analysis.category_breakdown or [])],
            explanation=latest_analysis.explanation or "",
            recommendations=latest_analysis.recommendations or [],
            created_at=latest_analysis.created_at
        )

    profile_res = schemas.GitHubProfileResponse(
        id=user.id,
        github_username=user.github_username,
        name=user.name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        company=user.company,
        location=user.location,
        blog=user.blog,
        twitter_username=user.twitter_username,
        public_repos=user.public_repos,
        public_gists=user.public_gists,
        followers=user.followers,
        following=user.following,
        total_stars=user.total_stars,
        total_forks=user.total_forks,
        developer_score=user.developer_score,
        github_profile_url=f"https://github.com/{user.github_username}",
        last_synced_at=user.last_synced_at,
        is_cached=True
    )

    vis_settings = p_settings.visibility_settings or {}
    vis_model = schemas.PortfolioVisibilitySettings(
        show_heatmap=vis_settings.get("show_heatmap", True),
        show_languages=vis_settings.get("show_languages", True),
        show_growth=vis_settings.get("show_growth", True),
        show_vibe_check=vis_settings.get("show_vibe_check", True),
        show_stats=vis_settings.get("show_stats", True)
    )

    return schemas.PublicPortfolioResponse(
        username=user.github_username,
        headline=p_settings.headline or "Full-Stack Engineer & Open Source Builder",
        introduction=p_settings.introduction or (user.bio or "Building high-performance software."),
        custom_bio=p_settings.custom_bio,
        contact_email=p_settings.contact_email,
        social_links=p_settings.social_links or {},
        profile=profile_res,
        featured_repositories=featured_repos,
        all_repositories=[schemas.RepositoryResponse.model_validate(r) for r in user.repositories],
        languages=schemas.LanguageAnalyticsResponse(**languages_data),
        contributions=contrib_res,
        growth_insights=insights_res,
        latest_vibe_check=latest_vibe,
        visibility_settings=vis_model,
        share_url=f"/portfolio/{user.github_username}",
        updated_at=p_settings.updated_at or datetime.datetime.utcnow()
    )


@app.put("/api/portfolio/{username}")
async def update_portfolio(
    username: str,
    update: schemas.PortfolioSettingsUpdate,
    db: Session = Depends(get_db)
):
    clean_username = username.strip().lower()
    svc = GitHubService(db)
    user = await svc.sync_user_data(clean_username)

    p_settings = user.portfolio_settings
    if not p_settings:
        p_settings = models.PortfolioSettings(user_id=user.id)
        db.add(p_settings)

    if update.headline is not None:
        p_settings.headline = update.headline.strip()
    if update.introduction is not None:
        p_settings.introduction = update.introduction.strip()
    if update.custom_bio is not None:
        p_settings.custom_bio = update.custom_bio.strip()
    if update.contact_email is not None:
        p_settings.contact_email = update.contact_email.strip()
    if update.social_links is not None:
        p_settings.social_links = update.social_links
    if update.featured_repositories is not None:
        p_settings.featured_repositories = update.featured_repositories
    if update.visibility_settings is not None:
        p_settings.visibility_settings = update.visibility_settings.model_dump()

    p_settings.updated_at = datetime.datetime.utcnow()
    db.commit()

    return {
        "success": True,
        "message": "Portfolio settings updated successfully.",
        "username": user.github_username
    }
