import pytest
import os
import sys
import datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
import models
from github_service import GitHubService, calculate_developer_score
from compatibility_service import CompatibilityEngine
from insights_service import InsightsService


@pytest.fixture(scope="function")
def db_session():
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def mock_user_with_repos(db_session):
    user = models.User(
        github_username="alexdev",
        name="Alex Developer",
        avatar_url="https://avatars.githubusercontent.com/alexdev",
        bio="Full-Stack Engineer building Python & React systems.",
        followers=250,
        following=40,
        public_repos=3,
        total_stars=120,
        total_forks=25,
        developer_score=78.5,
        last_synced_at=datetime.datetime.utcnow()
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    repo1 = models.Repository(
        user_id=user.id,
        name="fastapi-microservice",
        description="High-performance backend API with FastAPI, Redis, and PostgreSQL.",
        language="Python",
        stars=85,
        forks=18,
        topics=["fastapi", "python", "redis", "postgresql", "docker"],
        byte_languages={"Python": 95000, "Docker": 2000},
        repository_url="https://github.com/alexdev/fastapi-microservice",
        created_at_gh=datetime.datetime(2025, 4, 1),
        updated_at=datetime.datetime(2026, 1, 15)
    )

    repo2 = models.Repository(
        user_id=user.id,
        name="react-analytics-ui",
        description="Dashboard UI built with React, TypeScript, and Tailwind CSS.",
        language="TypeScript",
        stars=35,
        forks=7,
        topics=["react", "typescript", "tailwindcss", "vite"],
        byte_languages={"TypeScript": 80000, "CSS": 5000},
        repository_url="https://github.com/alexdev/react-analytics-ui",
        created_at_gh=datetime.datetime(2025, 7, 10),
        updated_at=datetime.datetime(2026, 2, 1)
    )

    db_session.add(repo1)
    db_session.add(repo2)

    # Add 14 days of contributions
    today = datetime.date.today()
    for i in range(14):
        d_str = (today - datetime.timedelta(days=13 - i)).strftime("%Y-%m-%d")
        c = models.ContributionData(
            user_id=user.id,
            contribution_date=d_str,
            contribution_count=3 if i % 2 == 0 else 5,
            weekday=(i % 7),
            intensity=2
        )
        db_session.add(c)

    db_session.commit()
    db_session.refresh(user)
    return user


def test_calculate_developer_score():
    score = calculate_developer_score(
        stars=150,
        forks=30,
        contributions=500,
        longest_streak=21,
        followers=200,
        public_repos=15
    )
    assert 15.0 <= score <= 99.4
    assert score > 60.0


def test_sqlite_caching_and_validity(db_session, mock_user_with_repos):
    svc = GitHubService(db_session)
    assert svc.is_cache_valid(mock_user_with_repos) is True

    # Artificially expire cache
    mock_user_with_repos.last_synced_at = datetime.datetime.utcnow() - datetime.timedelta(hours=5)
    db_session.commit()
    assert svc.is_cache_valid(mock_user_with_repos) is False


def test_languages_byte_breakdown(db_session, mock_user_with_repos):
    svc = GitHubService(db_session)
    langs = svc.get_languages_breakdown(mock_user_with_repos)
    assert langs["username"] == "alexdev"
    assert langs["total_bytes"] > 0
    lang_names = [l["name"] for l in langs["languages"]]
    assert "Python" in lang_names
    assert "TypeScript" in lang_names


def test_compatibility_scoring_engine(db_session, mock_user_with_repos):
    engine = CompatibilityEngine(db_session)
    job_desc = """
    We are looking for a Senior Full-Stack Engineer with strong experience in
    Python, FastAPI, React, TypeScript, and PostgreSQL. Docker experience is a plus.
    """
    res = engine.analyze_compatibility(
        user=mock_user_with_repos,
        job_description=job_desc,
        job_title="Senior Full-Stack Engineer",
        company="Acme Tech"
    )

    assert res["compatibility_score"] > 60.0
    assert "Python" in res["matched_skills"]
    assert "FastAPI" in res["matched_skills"]
    assert "TypeScript" in res["matched_skills"]
    assert len(res["recommendations"]) > 0
    assert len(res["category_breakdown"]) > 0

    # Test history retrieval
    history = engine.get_user_history(mock_user_with_repos)
    assert len(history) >= 1
    assert history[0]["job_title"] == "Senior Full-Stack Engineer"


def test_growth_insights_generation(db_session, mock_user_with_repos):
    svc = InsightsService(db_session)
    insights = svc.generate_growth_insights(mock_user_with_repos)

    assert insights["username"] == "alexdev"
    assert insights["total_contributions"] > 0
    assert insights["longest_streak"] >= 10
    assert len(insights["day_of_week_stats"]) == 7
    assert len(insights["insights_narrative"]) >= 3


def test_empty_or_invalid_job_description(db_session, mock_user_with_repos):
    engine = CompatibilityEngine(db_session)
    # Generic non-tech text should still extract cleanly without crashing
    text = "General office management and communication skills."
    res = engine.analyze_compatibility(
        user=mock_user_with_repos,
        job_description=text
    )
    assert isinstance(res["compatibility_score"], float)
    assert len(res["missing_skills"]) >= 0
