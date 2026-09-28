import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FAST_MODEL = process.env.GROQ_FAST_MODEL || 'openai/gpt-oss-20b';

function getEffectiveKey(customKey) {
  return (customKey && customKey.trim()) || process.env.GROQ_API_KEY || '';
}

async function callGroqChat(messages, apiKey, options = {}) {
  const key = getEffectiveKey(apiKey);
  if (!key) {
    throw new Error('Groq API Key is missing. Please provide your Groq API key in the UI or set GROQ_API_KEY.');
  }

  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature !== undefined ? options.temperature : 0.2;
  const jsonMode = options.jsonMode || false;

  const payload = {
    model,
    messages,
    temperature,
    max_tokens: options.max_tokens || 3500
  };

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await axios.post(GROQ_API_URL, payload, {
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    timeout: 35000
  });

  return response.data.choices[0].message.content;
}

export const groqService = {
  async testKey(apiKey) {
    const key = getEffectiveKey(apiKey);
    if (!key) return { valid: false, error: 'No key provided' };
    try {
      const res = await axios.get('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
        timeout: 8000
      });
      return { valid: true, modelsCount: res.data?.data?.length || 0 };
    } catch (err) {
      return {
        valid: false,
        error: err.response?.data?.error?.message || err.message || 'Invalid API Key'
      };
    }
  },

  async parseResume(resumeText, apiKey) {
    const systemPrompt = `You are an elite Executive Recruiter and Resume Parsing AI.
Extract all details from the provided resume text into clean, structured JSON.
Output ONLY valid JSON in this exact structure:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "Email address or empty string",
    "phone": "Phone number or empty string",
    "location": "City, Country or empty string",
    "portfolio": "Portfolio/Website URL or empty string",
    "linkedin": "LinkedIn URL or empty string",
    "github": "GitHub URL or empty string",
    "headline": "Professional title or headline",
    "summary": "2-3 sentence executive bio"
  },
  "skills": {
    "technical": ["list", "of", "core", "languages", "and", "tools"],
    "frameworks": ["react", "node", "express", "etc"],
    "databases": ["mongodb", "postgresql", "etc"],
    "cloudAndDevops": ["aws", "docker", "ci/cd"],
    "softSkills": ["leadership", "communication"]
  },
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "location": "Location or Remote",
      "duration": "e.g. Jan 2022 - Present",
      "bullets": [
        "Action verb + quantifiable impact accomplishment"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree and Major",
      "institution": "University / College",
      "year": "Year or duration",
      "gpa": "GPA if listed"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Short description of project and achievements",
      "techStack": ["tools", "used"],
      "link": "URL or empty string"
    }
  ],
  "certifications": ["Cert 1", "Cert 2"]
}`;

    const rawResponse = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract this resume into the JSON structure:\n\n${resumeText.slice(0, 14000)}` }
      ],
      apiKey,
      { jsonMode: true, temperature: 0.1 }
    );

    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      console.error('Failed to parse Groq JSON response, cleaning string:', e);
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      throw new Error('Could not parse resume structured JSON');
    }
  },

  async analyzeAts(resumeText, targetRole = 'Software Engineer / Tech Professional', apiKey) {
    const systemPrompt = `You are a Principal Talent Acquisition Director & ATS Algorithm Specialist.
Analyze the provided resume against modern Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo) and current tech hiring standards for target role: "${targetRole}".

Be brutally honest, precise, and constructive.
Output ONLY valid JSON matching this schema:
{
  "overallScore": 82, // integer 0-100
  "rating": "Strong" | "Good" | "Needs Improvement" | "Critical Issues",
  "pillars": {
    "keywordMatch": { "score": 85, "feedback": "Brief feedback" },
    "quantifiableImpact": { "score": 75, "feedback": "Brief feedback" },
    "formattingAndStructure": { "score": 90, "feedback": "Brief feedback" },
    "skillsAlignment": { "score": 80, "feedback": "Brief feedback" }
  },
  "strengths": [
    "Highlight 3-4 genuine strengths in the resume"
  ],
  "criticalFixes": [
    "List 3-5 specific, high-priority fixes needed to pass ATS screens and impress hiring managers"
  ],
  "missingHighValueKeywords": [
    "List 5-8 modern in-demand keywords/technologies for this target role missing or underrepresented"
  ],
  "bulletPointImprovements": [
    {
      "original": "A weak bullet from resume lacking metrics or passive",
      "improved": "Rewritten bullet using Google X-Y-Z formula (Accomplished [X], as measured by [Y], by doing [Z])",
      "reason": "Why this rewrite wins interviews"
    }
  ],
  "atsRedFlags": [
    "List any formatting, layout, or phrasing red flags detected (e.g. tables, vague adjectives, missing dates)"
  ]
}`;

    const rawResponse = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this resume for target role "${targetRole}":\n\n${resumeText.slice(0, 14000)}` }
      ],
      apiKey,
      { jsonMode: true, temperature: 0.2 }
    );

    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      throw new Error('Could not parse ATS evaluation JSON');
    }
  },

  async matchJobWithProfile(profile, job, apiKey) {
    const systemPrompt = `You are a Career Matching AI. Compare the candidate's profile against the job details.
Output ONLY valid JSON:
{
  "matchScore": 88, // integer 0-100
  "verdict": "Exceptional Fit" | "Strong Match" | "Moderate Match" | "Stretch Role",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missingSkill1", "missingSkill2"],
  "standoutReasons": ["2-3 reasons why candidate stands out for this exact role"],
  "preparationAdvice": "1 actionable advice to ace this application"
}`;

    const userContent = `Candidate Profile:
Headline: ${profile.headline || profile.personalInfo?.headline || ''}
Skills: ${JSON.stringify(profile.skills || {})}
Recent Experience: ${JSON.stringify((profile.experience || []).slice(0, 3))}

Job Details:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Tags/Keywords: ${(job.tags || []).join(', ')}
Description: ${(job.description || '').slice(0, 2500)}`;

    const rawResponse = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      apiKey,
      { jsonMode: true, temperature: 0.1 }
    );

    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      throw new Error('Could not parse Match score JSON');
    }
  },

  async generateCoverLetter(profile, job, tone = 'enthusiastic and professional', apiKey) {
    const systemPrompt = `You are a world-class Executive Career Coach.
Write an authentic, highly persuasive, tailored cover letter.
Guidelines:
- Avoid generic cliches ("I am writing to express my interest in...").
- Hook the reader immediately with candidate's relevant impact and enthusiasm for ${job.company}.
- Directly tie 2-3 specific achievements from the candidate's experience to the requirements of the ${job.title} position.
- Tone: ${tone}.
- Keep it concise, punchy (250-350 words).
- Format in standard professional markdown letter format.`;

    const userContent = `Candidate Profile:
Name: ${profile.name || profile.personalInfo?.name || 'Applicant'}
Email: ${profile.email || profile.personalInfo?.email || ''}
Headline: ${profile.headline || profile.personalInfo?.headline || ''}
Summary: ${profile.summary || profile.personalInfo?.summary || ''}
Skills: ${JSON.stringify(profile.skills || {})}
Experience: ${JSON.stringify(profile.experience || [])}

Target Company: ${job.company}
Target Role: ${job.title}
Job Description: ${(job.description || '').slice(0, 2500)}`;

    const response = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      apiKey,
      { temperature: 0.4 }
    );

    return response;
  },

  async generateInterviewPrep(profile, job, apiKey) {
    const systemPrompt = `You are a Principal Tech Interviewer and Hiring Manager at top tech companies.
Generate a high-yield interview preparation guide tailored specifically to this candidate and this job.
Output ONLY valid JSON:
{
  "roleSummary": "1-2 sentence core interview focus for this role",
  "questions": [
    {
      "category": "Technical" | "System Design" | "Behavioral" | "Leadership",
      "question": "Realistic challenging question likely to be asked",
      "interviewerGoal": "What the interviewer is secretly testing for",
      "recommendedStarAnswer": {
        "situation": "Context from candidate's background",
        "task": "The challenge or objective",
        "action": "Specific engineering or leadership action taken",
        "result": "Quantified business or technical outcome"
      },
      "proTip": "Key tip or pitfall to avoid"
    }
  ],
  "smartQuestionsToAskInterviewer": [
    "3 insightful questions that make the candidate look like an exceptional senior hire"
  ]
}`;

    const userContent = `Candidate Background:
Title: ${profile.headline || profile.personalInfo?.headline || ''}
Skills: ${JSON.stringify(profile.skills || {})}
Past Roles: ${(profile.experience || []).map(e => `${e.role} at ${e.company}`).join('; ')}

Target Position:
Title: ${job.title}
Company: ${job.company}
Job Snippet: ${(job.description || '').slice(0, 2500)}`;

    const rawResponse = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      apiKey,
      { jsonMode: true, temperature: 0.3 }
    );

    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      throw new Error('Could not parse Interview Prep JSON');
    }
  },

  async optimizeBullet(bullet, targetRole, apiKey) {
    const systemPrompt = `You are an elite Executive Resume Editor. Rewrite this resume bullet point using Google's X-Y-Z formula: "Accomplished [X] as measured by [Y] by doing [Z]".
Make it dynamic, starting with a strong power verb, incorporating realistic metrics or estimated impact.
Output ONLY JSON:
{
  "improved": "Optimized bullet point",
  "powerVerbsUsed": ["Engineered", "Accelerated"],
  "metricType": "Latency / Revenue / Accuracy / Throughput",
  "explanation": "Why this will impress hiring managers"
}`;

    const rawResponse = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Role: ${targetRole}\nOriginal bullet: "${bullet}"` }
      ],
      apiKey,
      { jsonMode: true, temperature: 0.3, model: FAST_MODEL }
    );

    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return { improved: bullet, explanation: 'Could not optimize' };
    }
  }
};
