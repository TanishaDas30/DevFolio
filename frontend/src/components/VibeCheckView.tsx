import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { apiService } from '../services/api';
import { CompatibilityResponse, CompatibilityHistoryItem } from '../types';
import { useToast } from './Toast';

interface VibeCheckViewProps {
  username: string;
}

const SAMPLE_JOB_DESCRIPTIONS = [
  {
    title: 'Senior Full-Stack Engineer (Python & React)',
    company: 'Fintech Scaleup',
    text: `We are looking for a Senior Full-Stack Developer with hands-on expertise building scalable distributed systems.
Requirements:
- 4+ years building production microservices in Python using FastAPI or Django.
- Strong proficiency in modern React, TypeScript, Tailwind CSS, and state management.
- Hands-on experience with PostgreSQL, Redis caching, and database query optimization.
- Familiarity with Docker containerization, Kubernetes, and AWS cloud infrastructure.
- Experience writing comprehensive unit tests (Pytest, Jest) and CI/CD pipelines.`
  },
  {
    title: 'AI/ML Platform & Systems Engineer',
    company: 'NextGen AI Labs',
    text: `Seeking an innovative AI/ML Engineer to architect our inference and agent pipeline.
Key Qualifications:
- Demonstrated experience with Python, PyTorch or TensorFlow, and Deep Learning models.
- Practical knowledge of LLMs & GenAI, LangChain, RAG architecture, and NLP embeddings.
- Backend proficiency building high-throughput APIs using FastAPI and Docker.
- Experience with vector databases, NumPy, Pandas, and distributed model serving.
- Familiarity with Git, Linux environments, and automated continuous integration.`
  },
  {
    title: 'Cloud Infrastructure & Distributed Systems Engineer',
    company: 'CloudScale Inc',
    text: `Looking for a Systems / Backend Engineer passionate about reliability and cloud scale.
Requirements:
- Deep experience in Go or Rust and high-performance concurrency.
- Strong foundation in distributed systems, gRPC, and REST APIs.
- Production experience with Kubernetes, Docker, Terraform, and AWS or GCP.
- Mastery of Linux systems, CI/CD pipelines, and microservice monitoring.
- Database expertise in PostgreSQL and Redis.`
  }
];

export const VibeCheckView: React.FC<VibeCheckViewProps> = ({ username }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Full-Stack Engineer');
  const [company, setCompany] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CompatibilityResponse | null>(null);
  const [history, setHistory] = useState<CompatibilityHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'demonstrated' | 'inferred'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadHistory();
  }, [username]);

  const loadHistory = async () => {
    try {
      const pastAnalyses = await apiService.getCompatibilityHistory(username);
      setHistory(pastAnalyses);
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async (descToUse?: string, titleToUse?: string, companyToUse?: string) => {
    const text = descToUse || jobDescription;
    if (!text.trim() || text.trim().length < 15) {
      showToast('Please provide a complete job description (at least 15 characters).', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await apiService.analyzeCompatibility({
        username,
        job_description: text,
        job_title: titleToUse || jobTitle,
        company: companyToUse || company,
      });
      setResult(res);
      showToast(`Compatibility analyzed! Score: ${res.compatibility_score}%`, 'success');
      loadHistory();
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze job compatibility.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySampleJob = (sample: typeof SAMPLE_JOB_DESCRIPTIONS[0]) => {
    setJobDescription(sample.text);
    setJobTitle(sample.title);
    setCompany(sample.company);
    handleAnalyze(sample.text, sample.title, sample.company);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { stroke: '#10B981', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { stroke: '#6366F1', text: 'text-indigo-400', bg: 'bg-indigo-500/10' };
    if (score >= 40) return { stroke: '#F59E0B', text: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { stroke: '#F43F5E', text: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  return (
    <div className="space-y-8">
      {/* Feature Title Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-[#151D2E] to-purple-950/40 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider mb-2 font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI Compatibility Matcher
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Vibe Check – How Well Do You Match Your Dream Job?
          </h1>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            Paste any job description to evaluate your GitHub repositories against required skills.
            Our explainable NLP engine analyzes languages, code volume, topics, and architecture to quantify match percentage and suggest high-impact additions.
          </p>

          {/* Quick Presets */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">Try presets:</span>
            {SAMPLE_JOB_DESCRIPTIONS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => applySampleJob(sample)}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-gray-200 transition-all font-medium flex items-center gap-1.5"
              >
                <span>{sample.title.split('(')[0]}</span>
                <ChevronRight className="w-3 h-3 text-indigo-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Analyzer Grid: Input on Left, Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Job Description Details
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">Explainable Engine</span>
          </div>

          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1">Target Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full bg-[#101726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1">Company / Team (Optional)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, OpenAI, Vercel"
              className="w-full bg-[#101726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1">
              Job Description / Requirements <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste full job requirements, technical qualifications, responsibilities, or stack here..."
              className="w-full bg-[#101726] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !jobDescription.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting Skills & Cross-Referencing Repos...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Run Vibe Check Analysis</span>
              </>
            )}
          </button>

          {/* Past Analyses History Accordion */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <span className="text-xs font-semibold text-gray-400 block mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Past Analyses ({history.length})
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      setJobTitle(h.job_title);
                      setCompany(h.company || '');
                    }}
                    className="p-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-xl cursor-pointer text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-medium text-white truncate max-w-[200px]">
                        {h.job_title}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {h.matched_skills_count} matched • {h.missing_skills_count} missing
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-indigo-400">
                      {h.compatibility_score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Results & Explainable Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !isAnalyzing ? (
            <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-12 text-center shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-white">Ready for your Vibe Check</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                Paste any job description on the left or select a pre-configured role template to see your match score, verified GitHub evidence, and upskilling roadmap.
              </p>
            </div>
          ) : isAnalyzing ? (
            <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-12 text-center animate-pulse shadow-xl space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/10 mx-auto" />
              <div className="h-6 w-48 bg-white/10 rounded mx-auto" />
              <div className="h-4 w-72 bg-white/5 rounded mx-auto" />
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Score & Radial Progress Banner */}
              <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="text-xs uppercase font-mono tracking-wider font-semibold text-gray-400">
                    Match Compatibility
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">
                    {result.job_title}
                  </h2>
                  {result.company && (
                    <div className="text-xs text-indigo-300 font-medium">@ {result.company}</div>
                  )}
                  <p className="text-xs text-gray-300 max-w-md leading-relaxed pt-1">
                    {result.explanation}
                  </p>
                </div>

                {/* Circular Score Gauge */}
                <div className="relative shrink-0 flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#1E293B"
                      strokeWidth="9"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={getScoreColor(result.compatibility_score).stroke}
                      strokeWidth="9"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={
                        2 * Math.PI * 40 * (1 - result.compatibility_score / 100)
                      }
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-white font-mono">
                      {result.compatibility_score}%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Matched vs Missing Skills breakdown */}
              <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Technical Skills Breakdown
                  </h3>

                  {/* Filter tabs */}
                  <div className="flex rounded-lg bg-[#101726] p-1 border border-white/10 text-xs">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-400'
                      }`}
                    >
                      All ({result.matched_skills.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('demonstrated')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeTab === 'demonstrated' ? 'bg-indigo-600 text-white' : 'text-gray-400'
                      }`}
                    >
                      Demonstrated ({result.demonstrated_skills.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('inferred')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeTab === 'inferred' ? 'bg-indigo-600 text-white' : 'text-gray-400'
                      }`}
                    >
                      Inferred ({result.inferred_skills.length})
                    </button>
                  </div>
                </div>

                {/* Matched Skills with Evidence */}
                <div>
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Technologies ({result.matched_skills.length})</span>
                  </div>

                  <div className="space-y-2">
                    {(activeTab === 'all'
                      ? [...result.demonstrated_skills, ...result.inferred_skills]
                      : activeTab === 'demonstrated'
                      ? result.demonstrated_skills
                      : result.inferred_skills
                    ).map((skill) => (
                      <div
                        key={skill.name}
                        className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-emerald-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{skill.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-gray-300">
                              {skill.category}
                            </span>
                            {skill.demonstrated ? (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                Verified Code
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                Inferred
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-emerald-400 font-semibold">
                            +{skill.weight * 100}%
                          </span>
                        </div>

                        {/* Evidence list */}
                        {skill.evidence.length > 0 && (
                          <div className="mt-1.5 pl-2 border-l border-white/10 text-[11px] text-gray-400 space-y-0.5 font-mono">
                            {skill.evidence.map((ev, i) => (
                              <div key={i}>• {ev}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                {result.missing_skills.length > 0 && (
                  <div className="pt-3 border-t border-white/5">
                    <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Missing / Underrepresented Skills ({result.missing_skills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-mono px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Progress Bars */}
                {result.category_breakdown.length > 0 && (
                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Match by Category
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.category_breakdown.map((cat) => (
                        <div key={cat.category} className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300 font-medium">{cat.category}</span>
                            <span className="text-white font-mono font-bold">
                              {cat.matched_count}/{cat.required_count} ({cat.score_percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                              style={{ width: `${cat.score_percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actionable Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="bg-[#151D2E] border border-white/5 rounded-2xl p-6 shadow-xl space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Actionable Recommendations to Improve Compatibility
                  </h3>
                  <div className="space-y-2 text-xs text-gray-300">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 bg-amber-500/[0.04] border border-amber-500/20 rounded-xl">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Info className="w-3.5 h-3.5" />
                    <span>Indicative match based solely on publicly demonstrated GitHub repository artifacts.</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
