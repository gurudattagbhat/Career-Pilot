import express from 'express';
import { groqService } from '../services/groqService.js';
import { dbService } from '../config/db.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(optionalAuth);

function getGroqKey(req) {
  return req.headers['x-groq-api-key'] || req.body?.groqApiKey || process.env.GROQ_API_KEY || '';
}

async function resolveProfile(req, customProfile) {
  if (customProfile) return customProfile;
  if (req.user) {
    if (req.user.resumeProfile) return req.user.resumeProfile;
    return {
      name: req.user.fullName,
      headline: req.user.targetRole || req.user.headline,
      targetRole: req.user.targetRole,
      skills: {
        technical: req.user.skills || []
      },
      location: req.user.location
    };
  }
  return await dbService.getProfile();
}

// Test / Validate Groq API Key
router.post('/test-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const keyToTest = apiKey || getGroqKey(req);
    if (!keyToTest) {
      return res.status(400).json({ valid: false, error: 'Please enter a Groq API key' });
    }

    const result = await groqService.testKey(keyToTest);
    res.json(result);
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

// Calculate AI Match Score & Gap Analysis for a specific job
router.post('/match', async (req, res) => {
  try {
    const { job, profile: customProfile } = req.body;
    const apiKey = getGroqKey(req);
    const profile = await resolveProfile(req, customProfile);

    if (!job) {
      return res.status(400).json({ error: 'Job details required' });
    }
    if (!profile) {
      return res.status(400).json({ error: 'Please upload a resume or create a profile first to calculate match.' });
    }

    if (apiKey) {
      try {
        const matchResult = await groqService.matchJobWithProfile(profile, job, apiKey);
        return res.json({ success: true, match: matchResult, poweredBy: 'Groq LLaMA-3.3' });
      } catch (err) {
        console.warn('Groq match failed, falling back to rule engine:', err.message);
      }
    }

    // Heuristic match fallback
    const userSkills = [
      ...(profile.skills?.technical || []),
      ...(profile.skills?.frameworks || []),
      ...(profile.skills?.databases || [])
    ].map(s => s.toLowerCase());

    const jobTags = (job.tags || []).map(t => t.toLowerCase());
    const matched = jobTags.filter(t => userSkills.some(us => us.includes(t) || t.includes(us)));
    const missing = jobTags.filter(t => !userSkills.some(us => us.includes(t) || t.includes(us)));

    const matchScore = Math.min(
      95,
      Math.max(50, Math.round(50 + (matched.length / Math.max(jobTags.length, 1)) * 45))
    );

    res.json({
      success: true,
      match: {
        matchScore,
        verdict: matchScore >= 80 ? 'Strong Match' : matchScore >= 65 ? 'Moderate Match' : 'Stretch Role',
        matchedSkills: matched.length > 0 ? matched : ['Software Engineering Principles', 'Problem Solving'],
        missingSkills: missing.length > 0 ? missing : ['Specific proprietary stack components'],
        standoutReasons: [
          'Solid baseline technical competency aligns with the core requirements',
          'Demonstrated engineering history that transfers directly into this role'
        ],
        preparationAdvice: 'Highlight relevant past projects during initial screening interviews.'
      },
      poweredBy: 'Algorithmic Matcher (Add Groq API key for deep AI analysis)'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate Tailored AI Cover Letter
router.post('/cover-letter', async (req, res) => {
  try {
    const { job, tone = 'enthusiastic and professional', profile: customProfile } = req.body;
    const apiKey = getGroqKey(req);
    const profile = await resolveProfile(req, customProfile);

    if (!job) {
      return res.status(400).json({ error: 'Job details required' });
    }
    if (!profile) {
      return res.status(400).json({ error: 'Please upload a resume or create a profile to tailor your cover letter.' });
    }

    if (!apiKey) {
      // Return a well-structured template if no Groq key yet
      const candidateName = profile.name || profile.personalInfo?.name || 'Candidate';
      const headline = profile.headline || profile.personalInfo?.headline || 'Software Engineer';
      const skillsStr = [
        ...(profile.skills?.technical || []),
        ...(profile.skills?.frameworks || [])
      ].slice(0, 5).join(', ');

      const draft = `Dear Hiring Team at ${job.company},

I am excited to submit my application for the ${job.title} position. With my background as a ${headline} and deep hands-on expertise in ${skillsStr || 'modern software engineering'}, I am eager to contribute to ${job.company}'s mission.

In my recent projects, I have consistently driven technical velocity, architected resilient solutions, and optimized application performance. Given your focus on ${job.tags ? job.tags.slice(0, 3).join(', ') : 'innovation'}, my technical toolkit and problem-solving mindset align closely with your team's immediate objectives.

I welcome the opportunity to discuss how my experience can deliver measurable value to ${job.company}. Thank you for your time and consideration.

Warm regards,
${candidateName}`;

      return res.json({
        coverLetter: draft,
        usedGroq: false,
        notice: 'Generated using executive template. Enter your Groq API key for hyper-personalized AI generation based on specific past achievements.'
      });
    }

    const coverLetter = await groqService.generateCoverLetter(profile, job, tone, apiKey);
    res.json({
      coverLetter,
      usedGroq: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate AI Interview Prep Copilot
router.post('/interview-prep', async (req, res) => {
  try {
    const { job, profile: customProfile } = req.body;
    const apiKey = getGroqKey(req);
    const profile = customProfile || (await dbService.getProfile());

    if (!job) {
      return res.status(400).json({ error: 'Job details required' });
    }
    if (!profile) {
      return res.status(400).json({ error: 'Please upload a resume or create a profile first.' });
    }

    if (apiKey) {
      try {
        const prep = await groqService.generateInterviewPrep(profile, job, apiKey);
        return res.json({ success: true, prep, usedGroq: true });
      } catch (err) {
        console.warn('Groq interview prep failed, falling back to heuristic prep:', err.message);
      }
    }

    // High-yield fallback interview prep
    const fallbackPrep = {
      roleSummary: `Focus on demonstrating distributed systems reliability, frontend responsiveness, and practical problem-solving for ${job.title} at ${job.company}.`,
      questions: [
        {
          category: 'Technical',
          question: `How would you architect a fault-tolerant system using ${(job.tags || ['modern web technologies'])[0]} to handle traffic spikes?`,
          interviewerGoal: 'Assessing your grasp of caching, database indexing, and horizontal scalability.',
          recommendedStarAnswer: {
            situation: 'At my previous role, our primary API faced 4x traffic surges during marketing launches.',
            task: 'Needed to eliminate 504 gateway timeouts while keeping database query latency under 100ms.',
            action: 'Implemented Redis caching layers, optimized slow SQL queries, and added rate-limiting middleware.',
            result: 'Reduced peak p99 latency by 68% and handled over 2 million daily requests with zero downtime.'
          },
          proTip: 'Always quantify your architectural decisions with p99 latency, RPS, or cost reduction numbers.'
        },
        {
          category: 'Behavioral',
          question: 'Describe a situation where you had to push back on unrealistic deadlines or technical debt.',
          interviewerGoal: 'Checking mature engineering judgment and cross-functional communication.',
          recommendedStarAnswer: {
            situation: 'A product stakeholder requested a 2-week turnaround on a feature with heavy database migrations.',
            task: 'Balance business deadline urgency with data integrity and test coverage.',
            action: 'Broke feature into an MVP slice for week 2, while scheduling the automated migration tests for week 3.',
            result: 'Shipped core customer value on time without causing production outages or tech debt.'
          },
          proTip: 'Frame trade-offs constructively in terms of business risk vs customer velocity.'
        },
        {
          category: 'System Design',
          question: `How do you approach end-to-end observability and debugging when an issue occurs in production?`,
          interviewerGoal: 'Testing operational maturity and monitoring mindset.',
          recommendedStarAnswer: {
            situation: 'Encountered intermittent customer checkout drop-offs that did not appear in standard logs.',
            task: 'Identify root cause across microservices rapidly.',
            action: 'Added distributed tracing with OpenTelemetry and correlated request IDs across API gateways.',
            result: 'Diagnosed a downstream third-party webhook timeout within 45 minutes and implemented exponential backoff.'
          },
          proTip: 'Highlight distributed tracing, error budgets, and structured logging.'
        }
      ],
      smartQuestionsToAskInterviewer: [
        `What does the deployment and on-call rotation look like for the team working on ${job.title}?`,
        `What is the single biggest technical bottleneck ${job.company} is currently working to solve this quarter?`,
        `How does engineering partner with product here when prioritizing tech debt vs new feature velocity?`
      ]
    };

    res.json({
      success: true,
      prep: fallbackPrep,
      usedGroq: false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optimize individual resume bullet point
router.post('/optimize-bullet', async (req, res) => {
  try {
    const { bullet, targetRole = 'Software Engineer' } = req.body;
    const apiKey = getGroqKey(req);

    if (!bullet || bullet.trim().length < 10) {
      return res.status(400).json({ error: 'Please enter a bullet point to optimize' });
    }

    if (apiKey) {
      try {
        const optimized = await groqService.optimizeBullet(bullet, targetRole, apiKey);
        return res.json({ success: true, optimized, usedGroq: true });
      } catch (err) {
        console.warn('Groq bullet optimization failed:', err.message);
      }
    }

    // Heuristic enhancement
    const sampleOptimized = {
      improved: `Spearheaded end-to-end development of ${bullet.toLowerCase().replace(/^(worked on|responsible for|helped|did)\s*/i, '')}, optimizing performance by 35% and improving team release cadence across 50,000+ users.`,
      powerVerbsUsed: ['Spearheaded', 'Optimized', 'Accelerated'],
      metricType: 'Efficiency & Throughput',
      explanation: 'Replaces passive phrasing with action power verbs and quantifiable impact.'
    };

    res.json({ success: true, optimized: sampleOptimized, usedGroq: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
