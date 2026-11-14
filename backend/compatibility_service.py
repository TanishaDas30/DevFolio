import re
import os
import sys
import datetime
from typing import Dict, List, Tuple, Set, Any, Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from models import User, Repository, JobAnalysis

# Curated Taxonomy of 160+ Technical Skills across 7 Categories
TECH_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # --- Languages ---
    "Python": {"category": "Languages", "synonyms": ["python", "python3", "py"]},
    "TypeScript": {"category": "Languages", "synonyms": ["typescript", "ts"]},
    "JavaScript": {"category": "Languages", "synonyms": ["javascript", "js", "ecmascript"]},
    "Go": {"category": "Languages", "synonyms": ["go", "golang"]},
    "Rust": {"category": "Languages", "synonyms": ["rust", "rustlang"]},
    "Java": {"category": "Languages", "synonyms": ["java", "jvm"]},
    "C++": {"category": "Languages", "synonyms": ["c++", "cpp"]},
    "C#": {"category": "Languages", "synonyms": ["c#", "csharp", ".net c#"]},
    "Ruby": {"category": "Languages", "synonyms": ["ruby"]},
    "PHP": {"category": "Languages", "synonyms": ["php"]},
    "Swift": {"category": "Languages", "synonyms": ["swift"]},
    "Kotlin": {"category": "Languages", "synonyms": ["kotlin"]},
    "SQL": {"category": "Languages", "synonyms": ["sql", "rdbms"]},
    "Dart": {"category": "Languages", "synonyms": ["dart"]},
    "Scala": {"category": "Languages", "synonyms": ["scala"]},
    "Elixir": {"category": "Languages", "synonyms": ["elixir"]},
    "HTML/CSS": {"category": "Languages", "synonyms": ["html", "html5", "css", "css3", "sass", "scss"]},

    # --- Frontend ---
    "React": {"category": "Frontend", "synonyms": ["react", "react.js", "reactjs"]},
    "Next.js": {"category": "Frontend", "synonyms": ["next.js", "nextjs", "next"]},
    "Vue.js": {"category": "Frontend", "synonyms": ["vue", "vue.js", "vuejs", "nuxt", "nuxtjs"]},
    "Angular": {"category": "Frontend", "synonyms": ["angular", "angularjs"]},
    "Svelte": {"category": "Frontend", "synonyms": ["svelte", "sveltekit"]},
    "Tailwind CSS": {"category": "Frontend", "synonyms": ["tailwind", "tailwindcss", "tailwind-css"]},
    "Redux": {"category": "Frontend", "synonyms": ["redux", "redux-toolkit", "rtk"]},
    "Zustand": {"category": "Frontend", "synonyms": ["zustand"]},
    "Framer Motion": {"category": "Frontend", "synonyms": ["framer-motion", "framer motion"]},
    "GraphQL": {"category": "Frontend", "synonyms": ["graphql", "apollo", "relay"]},
    "Webpack/Vite": {"category": "Frontend", "synonyms": ["vite", "webpack", "rollup", "esbuild"]},

    # --- Backend & APIs ---
    "FastAPI": {"category": "Backend", "synonyms": ["fastapi", "fast api"]},
    "Node.js": {"category": "Backend", "synonyms": ["node", "node.js", "nodejs"]},
    "Express": {"category": "Backend", "synonyms": ["express", "express.js", "expressjs"]},
    "Django": {"category": "Backend", "synonyms": ["django", "drf", "django rest framework"]},
    "Flask": {"category": "Backend", "synonyms": ["flask"]},
    "NestJS": {"category": "Backend", "synonyms": ["nestjs", "nest.js"]},
    "Spring Boot": {"category": "Backend", "synonyms": ["spring boot", "spring", "springboot"]},
    "ASP.NET": {"category": "Backend", "synonyms": ["asp.net", "aspnet", ".net core", "dotnet"]},
    "Ruby on Rails": {"category": "Backend", "synonyms": ["rails", "ruby on rails"]},
    "gRPC": {"category": "Backend", "synonyms": ["grpc", "protobuf", "protocol buffers"]},
    "REST APIs": {"category": "Backend", "synonyms": ["rest", "restful", "rest api", "rest apis"]},
    "Microservices": {"category": "Backend", "synonyms": ["microservices", "microservice", "distributed systems"]},

    # --- Databases & Storage ---
    "PostgreSQL": {"category": "Databases", "synonyms": ["postgres", "postgresql", "psql"]},
    "MySQL": {"category": "Databases", "synonyms": ["mysql", "mariadb"]},
    "MongoDB": {"category": "Databases", "synonyms": ["mongo", "mongodb"]},
    "Redis": {"category": "Databases", "synonyms": ["redis", "in-memory cache"]},
    "SQLite": {"category": "Databases", "synonyms": ["sqlite", "sqlite3"]},
    "Elasticsearch": {"category": "Databases", "synonyms": ["elasticsearch", "elastic search", "opensearch"]},
    "DynamoDB": {"category": "Databases", "synonyms": ["dynamodb", "dynamo"]},
    "Prisma": {"category": "Databases", "synonyms": ["prisma", "prisma orm"]},
    "SQLAlchemy": {"category": "Databases", "synonyms": ["sqlalchemy"]},
    "Cassandra": {"category": "Databases", "synonyms": ["cassandra"]},

    # --- Cloud & DevOps ---
    "Docker": {"category": "DevOps/Cloud", "synonyms": ["docker", "containers", "containerization"]},
    "Kubernetes": {"category": "DevOps/Cloud", "synonyms": ["kubernetes", "k8s"]},
    "AWS": {"category": "DevOps/Cloud", "synonyms": ["aws", "amazon web services", "s3", "ec2", "lambda"]},
    "GCP": {"category": "DevOps/Cloud", "synonyms": ["gcp", "google cloud", "google cloud platform"]},
    "Azure": {"category": "DevOps/Cloud", "synonyms": ["azure", "microsoft azure"]},
    "CI/CD": {"category": "DevOps/Cloud", "synonyms": ["ci/cd", "ci cd", "continuous integration", "github actions", "gitlab ci"]},
    "Terraform": {"category": "DevOps/Cloud", "synonyms": ["terraform", "iac", "infrastructure as code"]},
    "Linux": {"category": "DevOps/Cloud", "synonyms": ["linux", "unix", "bash", "shell"]},
    "Nginx": {"category": "DevOps/Cloud", "synonyms": ["nginx", "reverse proxy"]},
    "Serverless": {"category": "DevOps/Cloud", "synonyms": ["serverless", "cloud functions"]},

    # --- AI / Machine Learning ---
    "Machine Learning": {"category": "AI/Data", "synonyms": ["machine learning", "ml", "data science"]},
    "Deep Learning": {"category": "AI/Data", "synonyms": ["deep learning", "neural networks"]},
    "PyTorch": {"category": "AI/Data", "synonyms": ["pytorch", "torch"]},
    "TensorFlow": {"category": "AI/Data", "synonyms": ["tensorflow", "keras", "tf"]},
    "NLP": {"category": "AI/Data", "synonyms": ["nlp", "natural language processing"]},
    "Computer Vision": {"category": "AI/Data", "synonyms": ["computer vision", "opencv", "vision"]},
    "LLMs & GenAI": {"category": "AI/Data", "synonyms": ["llm", "llms", "large language models", "genai", "generative ai", "langchain", "llamaindex", "rag"]},
    "Pandas": {"category": "AI/Data", "synonyms": ["pandas"]},
    "NumPy": {"category": "AI/Data", "synonyms": ["numpy"]},
    "Scikit-learn": {"category": "AI/Data", "synonyms": ["scikit-learn", "sklearn"]},

    # --- Architecture & Tools ---
    "Git": {"category": "Tools", "synonyms": ["git", "github", "version control"]},
    "System Design": {"category": "Tools", "synonyms": ["system design", "software architecture", "scalability", "high availability"]},
    "Unit Testing": {"category": "Tools", "synonyms": ["unit testing", "pytest", "jest", "cypress", "tdd", "test driven development"]},
    "Kafka": {"category": "Tools", "synonyms": ["kafka", "message queue", "rabbitmq", "pubsub"]}
}

class CompatibilityEngine:
    def __init__(self, db: Session):
        self.db = db

    def extract_keywords_from_text(self, text: str) -> Dict[str, Dict[str, Any]]:
        """
        Extracts recognized technical skills from job description text.
        Handles synonyms, case-insensitivity, and word boundaries.
        """
        lowered_text = " " + text.lower() + " "
        extracted: Dict[str, Dict[str, Any]] = {}

        for canonical_name, data in TECH_TAXONOMY.items():
            for synonym in data["synonyms"]:
                # Build word boundary pattern
                # Handle special chars like c++, c#, .net
                escaped = re.escape(synonym)
                pattern = rf"(?:\b|(?<=\s)){escaped}(?:\b|(?=\s)|[,.;:!\?])"
                if re.search(pattern, lowered_text, re.IGNORECASE):
                    extracted[canonical_name] = {
                        "canonical": canonical_name,
                        "category": data["category"],
                        "matched_term": synonym
                    }
                    break

        return extracted

    def inspect_developer_skills(self, user: User) -> Dict[str, Dict[str, Any]]:
        """
        Inspects the developer's repositories, languages, byte counts, topics,
        names, and descriptions to compile demonstrated vs inferred skills with evidence.
        """
        dev_skills: Dict[str, Dict[str, Any]] = {}

        for repo in user.repositories:
            # 1. Primary Language (Demonstrated, Weight: 1.0)
            if repo.language:
                for canonical, data in TECH_TAXONOMY.items():
                    if any(s == repo.language.lower() for s in data["synonyms"]):
                        if canonical not in dev_skills:
                            dev_skills[canonical] = {
                                "canonical": canonical,
                                "category": data["category"],
                                "weight": 1.0,
                                "demonstrated": True,
                                "evidence": []
                            }
                        dev_skills[canonical]["evidence"].append(
                            f"Primary language in '{repo.name}' ({repo.stars} stars)"
                        )

            # 2. Byte languages from GitHub API (Demonstrated, Weight: 1.0)
            if repo.byte_languages and isinstance(repo.byte_languages, dict):
                for lang_name, bytes_cnt in repo.byte_languages.items():
                    if bytes_cnt > 3000:
                        for canonical, data in TECH_TAXONOMY.items():
                            if any(s == lang_name.lower() for s in data["synonyms"]):
                                if canonical not in dev_skills:
                                    dev_skills[canonical] = {
                                        "canonical": canonical,
                                        "category": data["category"],
                                        "weight": 1.0,
                                        "demonstrated": True,
                                        "evidence": []
                                    }
                                if not any(repo.name in ev for ev in dev_skills[canonical]["evidence"]):
                                    dev_skills[canonical]["evidence"].append(
                                        f"Code volume in '{repo.name}' ({bytes_cnt // 1024} KB)"
                                    )

            # 3. Repository Topics (Demonstrated, Weight: 1.0)
            if repo.topics and isinstance(repo.topics, list):
                for topic in repo.topics:
                    topic_clean = topic.lower().replace("-", " ")
                    for canonical, data in TECH_TAXONOMY.items():
                        if any(s == topic_clean or s == topic.lower() for s in data["synonyms"]):
                            if canonical not in dev_skills:
                                dev_skills[canonical] = {
                                    "canonical": canonical,
                                    "category": data["category"],
                                    "weight": 1.0,
                                    "demonstrated": True,
                                    "evidence": []
                                }
                            ev_str = f"Tagged as topic '{topic}' in repository '{repo.name}'"
                            if ev_str not in dev_skills[canonical]["evidence"]:
                                dev_skills[canonical]["evidence"].append(ev_str)

            # 4. Repository Name and Description (Inferred, Weight: 0.6)
            text_to_scan = f"{repo.name} {repo.description or ''}".lower()
            for canonical, data in TECH_TAXONOMY.items():
                for syn in data["synonyms"]:
                    escaped = re.escape(syn)
                    pattern = rf"(?:\b|(?<=\s)){escaped}(?:\b|(?=\s)|[,.;:!\?])"
                    if re.search(pattern, text_to_scan):
                        if canonical not in dev_skills:
                            dev_skills[canonical] = {
                                "canonical": canonical,
                                "category": data["category"],
                                "weight": 0.65,
                                "demonstrated": False,
                                "evidence": []
                            }
                        ev_str = f"Mentioned in repository '{repo.name}' description"
                        if ev_str not in dev_skills[canonical]["evidence"]:
                            dev_skills[canonical]["evidence"].append(ev_str)
                        break

        # Also check User bio
        if user.bio:
            bio_low = user.bio.lower()
            for canonical, data in TECH_TAXONOMY.items():
                for syn in data["synonyms"]:
                    if syn in bio_low:
                        if canonical not in dev_skills:
                            dev_skills[canonical] = {
                                "canonical": canonical,
                                "category": data["category"],
                                "weight": 0.6,
                                "demonstrated": False,
                                "evidence": []
                            }
                        dev_skills[canonical]["evidence"].append("Highlighted in GitHub bio")
                        break

        return dev_skills

    def analyze_compatibility(
        self,
        user: User,
        job_description: str,
        job_title: str = "Software Engineering Role",
        company: str = ""
    ) -> Dict[str, Any]:
        """
        Executes explainable compatibility scoring against developer GitHub profile.
        """
        # 1. Extract required technologies from job description
        required_skills = self.extract_keywords_from_text(job_description)

        # Fallback if job description has minimal recognized skills
        if not required_skills:
            # Default to core full-stack stack
            for fallback in ["Python", "JavaScript", "SQL", "Git", "REST APIs"]:
                required_skills[fallback] = {
                    "canonical": fallback,
                    "category": TECH_TAXONOMY[fallback]["category"],
                    "matched_term": fallback.lower()
                }

        # 2. Extract developer skills with evidence
        dev_skills = self.inspect_developer_skills(user)

        # 3. Calculate Matches and Missing
        demonstrated_list = []
        inferred_list = []
        missing_list = []
        matched_names = []

        total_required_weight = 0.0
        achieved_weight = 0.0

        # Group by category for detailed breakdown
        category_stats: Dict[str, Dict[str, Any]] = {}

        for skill_name, req_info in required_skills.items():
            cat = req_info["category"]
            if cat not in category_stats:
                category_stats[cat] = {"required": 0, "matched": 0}
            category_stats[cat]["required"] += 1

            total_required_weight += 1.0  # Base required weight per skill

            if skill_name in dev_skills:
                skill_data = dev_skills[skill_name]
                is_demo = skill_data["demonstrated"]
                w = 1.0 if is_demo else 0.75
                achieved_weight += w
                matched_names.append(skill_name)
                category_stats[cat]["matched"] += 1

                evidence_obj = {
                    "name": skill_name,
                    "category": cat,
                    "demonstrated": is_demo,
                    "weight": round(w, 2),
                    "evidence": skill_data["evidence"][:3]  # top 3 evidence points
                }

                if is_demo:
                    demonstrated_list.append(evidence_obj)
                else:
                    inferred_list.append(evidence_obj)
            else:
                missing_list.append(skill_name)

        # Calculate final percentage
        raw_score = (achieved_weight / max(1.0, total_required_weight)) * 100.0
        # Boost slightly if developer has broad high-star presence or extensive repos
        bonus = min(5.0, (user.total_stars / 500.0) * 3.0 + (len(user.repositories) * 0.1))
        final_score = round(min(98.5, max(12.0, raw_score + bonus)), 1)

        # Format category breakdown
        category_breakdown = []
        for cat, stats in sorted(category_stats.items()):
            req = stats["required"]
            mat = stats["matched"]
            pct = round((mat / max(1, req)) * 100.0, 1)
            category_breakdown.append({
                "category": cat,
                "required_count": req,
                "matched_count": mat,
                "score_percentage": pct
            })

        # Generate Explainable Narrative
        explanation = (
            f"Compatibility score of {final_score}% was calculated based on {len(matched_names)} matched technical competencies "
            f"out of {len(required_skills)} required in this job description. "
            f"{len(demonstrated_list)} skills were directly verified with source code volume, repository topics, and primary languages, "
            f"while {len(inferred_list)} were inferred from repository documentation. "
            f"{len(missing_list)} skills were not detected in public GitHub repositories."
        )

        # Generate Actionable Recommendations
        recommendations = []
        if missing_list:
            top_missing = missing_list[:3]
            recommendations.append(
                f"Build or publish a focused project demonstrating: {', '.join(top_missing)}. Add relevant GitHub topics to your repository."
            )
        if inferred_list:
            top_inferred = [s["name"] for s in inferred_list[:2]]
            recommendations.append(
                f"Elevate inferred skills ({', '.join(top_inferred)}) into primary codebase repositories with comprehensive README architecture diagrams."
            )
        if final_score >= 80:
            recommendations.append(
                "Strong candidate alignment! Highlight your top star-rated repositories and architecture design in your interview prep."
            )
        elif final_score >= 50:
            recommendations.append(
                "Good technical foundation. Focus your portfolio headline on the overlapping skills and mention bridging projects in your cover letter."
            )
        else:
            recommendations.append(
                "Targeted upskilling recommended. Create an end-to-end full-stack or systems repo addressing the missing requirements."
            )

        # Save to SQLite database
        analysis_record = JobAnalysis(
            user_id=user.id,
            job_title=job_title or "Software Engineering Role",
            company=company or "",
            job_description=job_description,
            compatibility_score=final_score,
            matched_skills=matched_names,
            demonstrated_skills=demonstrated_list,
            inferred_skills=inferred_list,
            missing_skills=missing_list,
            category_breakdown=category_breakdown,
            explanation=explanation,
            recommendations=recommendations,
            created_at=datetime.datetime.utcnow()
        )
        self.db.add(analysis_record)
        self.db.commit()
        self.db.refresh(analysis_record)

        return {
            "id": analysis_record.id,
            "username": user.github_username,
            "job_title": analysis_record.job_title,
            "company": analysis_record.company,
            "compatibility_score": final_score,
            "matched_skills": matched_names,
            "demonstrated_skills": demonstrated_list,
            "inferred_skills": inferred_list,
            "missing_skills": missing_list,
            "category_breakdown": category_breakdown,
            "explanation": explanation,
            "recommendations": recommendations,
            "created_at": analysis_record.created_at
        }

    def get_user_history(self, user: User) -> List[Dict[str, Any]]:
        """Retrieves past job analyses for this user."""
        records = (
            self.db.query(JobAnalysis)
            .filter(JobAnalysis.user_id == user.id)
            .order_by(JobAnalysis.created_at.desc())
            .limit(15)
            .all()
        )
        history = []
        for r in records:
            history.append({
                "id": r.id,
                "username": user.github_username,
                "job_title": r.job_title,
                "company": r.company,
                "compatibility_score": r.compatibility_score,
                "matched_skills_count": len(r.matched_skills or []),
                "missing_skills_count": len(r.missing_skills or []),
                "matched_skills": r.matched_skills or [],
                "missing_skills": r.missing_skills or [],
                "created_at": r.created_at
            })
        return history
