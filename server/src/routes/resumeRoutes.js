import express from 'express';
import multer from 'multer';
import { resumeParserService } from '../services/resumeParserService.js';
import { groqService } from '../services/groqService.js';
import { dbService } from '../config/db.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(optionalAuth);

// Configure multer for in-memory file handling (max 10MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Helper to extract Groq key from request header or query
function getGroqKey(req) {
  return req.headers['x-groq-api-key'] || req.body?.groqApiKey || process.env.GROQ_API_KEY || '';
}

// Helper to synchronize extracted resume & ATS diagnostics to MongoDB Atlas user document
async function syncToUser(req, structuredProfile, atsAnalysis, targetRole) {
  if (!req.user) return;
  try {
    if (structuredProfile) {
      req.user.resumeProfile = structuredProfile;
      const extractedSkills = [
        ...(structuredProfile.skills?.technical || []),
        ...(structuredProfile.skills?.frameworks || []),
        ...(structuredProfile.skills?.databases || []),
        ...(structuredProfile.skills?.cloudAndDevops || [])
      ];
      if (extractedSkills.length > 0) {
        req.user.skills = Array.from(new Set([...(req.user.skills || []), ...extractedSkills]));
      }
      if (targetRole || structuredProfile.headline) {
        req.user.targetRole = targetRole || structuredProfile.headline;
      }
      if (structuredProfile.location) {
        req.user.location = structuredProfile.location;
      }
      req.user.markModified('resumeProfile');
      req.user.markModified('skills');
    }

    if (atsAnalysis) {
      if (!Array.isArray(req.user.atsAnalyses)) {
        req.user.atsAnalyses = [];
      }
      const enrichedAts = {
        ...atsAnalysis,
        timestamp: new Date().toISOString(),
        targetRole: targetRole || req.user.targetRole || 'Software Professional'
      };
      req.user.atsAnalyses = [enrichedAts, ...req.user.atsAnalyses].slice(0, 10);
      req.user.markModified('atsAnalyses');
    }

    await req.user.save();
    console.log(` Persisted candidate profile & ATS analysis to MongoDB Atlas for ${req.user.email}`);
  } catch (syncErr) {
    console.warn('⚠️ User resume sync note:', syncErr.message);
  }
}

// Upload & extract resume (PDF, DOCX, TXT)
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const apiKey = getGroqKey(req);
    const targetRole = req.body?.targetRole || req.user?.targetRole || 'Software Professional';

    console.log(` Parsing resume: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

    // 1. Extract raw text from file
    const rawText = await resumeParserService.extractText(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    if (!rawText || rawText.trim().length < 40) {
      return res.status(400).json({
        error: 'The uploaded file appears to be empty or unscannable. Please check if it contains readable text or use the manual builder.'
      });
    }

    let structuredProfile = null;
    let atsAnalysis = null;
    let usedGroq = false;

    // 2. Try Groq AI first if key is provided
    if (apiKey) {
      try {
        console.log('🤖 Parsing resume with Groq AI...');
        structuredProfile = await groqService.parseResume(rawText, apiKey);
        atsAnalysis = await groqService.analyzeAts(rawText, targetRole, apiKey);
        usedGroq = true;
      } catch (aiErr) {
        console.warn('Groq parsing failed or hit rate limit, falling back to algorithmic parser:', aiErr.message);
      }
    }

    // 3. Fallback to algorithmic parser if Groq was not used or failed
    if (!structuredProfile) {
      console.log(' Using algorithmic heuristic resume parser and ATS scorer...');
      structuredProfile = resumeParserService.heuristicParse(rawText);
      atsAnalysis = resumeParserService.heuristicAtsScore(rawText, targetRole);
    }

    // Attach raw text snippet
    structuredProfile.rawTextPreview = rawText.slice(0, 1000);
    structuredProfile.fileName = req.file.originalname;

    // Save profile to logged-in user and fallback store
    await syncToUser(req, structuredProfile, atsAnalysis, targetRole);
    await dbService.saveProfile(structuredProfile);
    await dbService.saveAtsAnalysis(atsAnalysis);

    res.json({
      success: true,
      profile: structuredProfile,
      atsAnalysis,
      usedGroq,
      user: req.user ? req.user.toSafeObject() : null,
      message: usedGroq
        ? 'Resume extracted and scored successfully with Groq AI!'
        : 'Resume extracted with local intelligent parser. Provide Groq API key for neural deep extraction.'
    });
  } catch (err) {
    console.error('Error in /resume/upload:', err);
    res.status(500).json({ error: err.message || 'Failed to process resume' });
  }
});

// Parse pasted raw text
router.post('/parse-text', async (req, res) => {
  try {
    const { text, targetRole = req.user?.targetRole || 'Software Professional' } = req.body;
    if (!text || text.trim().length < 30) {
      return res.status(400).json({ error: 'Please provide at least 30 characters of resume text' });
    }

    const apiKey = getGroqKey(req);
    let structuredProfile = null;
    let atsAnalysis = null;
    let usedGroq = false;

    if (apiKey) {
      try {
        structuredProfile = await groqService.parseResume(text, apiKey);
        atsAnalysis = await groqService.analyzeAts(text, targetRole, apiKey);
        usedGroq = true;
      } catch (e) {
        console.warn('Groq parse error, falling back:', e.message);
      }
    }

    if (!structuredProfile) {
      structuredProfile = resumeParserService.heuristicParse(text);
      atsAnalysis = resumeParserService.heuristicAtsScore(text, targetRole);
    }

    await syncToUser(req, structuredProfile, atsAnalysis, targetRole);
    await dbService.saveProfile(structuredProfile);
    await dbService.saveAtsAnalysis(atsAnalysis);

    res.json({
      success: true,
      profile: structuredProfile,
      atsAnalysis,
      usedGroq,
      user: req.user ? req.user.toSafeObject() : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to parse text' });
  }
});

// Save manual profile if user prefers entering details manually
router.post('/manual-profile', async (req, res) => {
  try {
    const profileData = req.body;
    if (!profileData || (!profileData.name && !profileData.headline)) {
      return res.status(400).json({ error: 'Please provide at least a name and job title/headline' });
    }

    const apiKey = getGroqKey(req);
    const targetRole = profileData.targetRole || profileData.headline || req.user?.targetRole || 'Software Professional';

    // Construct text representation to compute ATS diagnostic
    const textRepr = `
Name: ${profileData.name}
Title: ${profileData.headline}
Email: ${profileData.email}
Phone: ${profileData.phone}
Location: ${profileData.location}
Bio: ${profileData.summary}
Skills: ${(profileData.skills?.technical || []).join(', ')}, ${(profileData.skills?.frameworks || []).join(', ')}
Experience: ${(profileData.experience || []).map(e => `${e.role} at ${e.company}: ${(e.bullets || []).join('. ')}`).join('\n')}
Education: ${(profileData.education || []).map(ed => `${ed.degree} from ${ed.institution}`).join('\n')}
    `;

    let atsAnalysis = null;
    let usedGroq = false;

    if (apiKey) {
      try {
        atsAnalysis = await groqService.analyzeAts(textRepr, targetRole, apiKey);
        usedGroq = true;
      } catch (err) {
        console.warn('Groq ATS score error in manual-profile:', err.message);
      }
    }

    if (!atsAnalysis) {
      atsAnalysis = resumeParserService.heuristicAtsScore(textRepr, targetRole);
    }

    await syncToUser(req, profileData, atsAnalysis, targetRole);
    const saved = await dbService.saveProfile(profileData);
    await dbService.saveAtsAnalysis(atsAnalysis);

    res.json({
      success: true,
      profile: saved,
      atsAnalysis,
      usedGroq,
      user: req.user ? req.user.toSafeObject() : null,
      message: 'Profile saved and ATS analysis calculated!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save manual profile' });
  }
});

// Get currently saved profile (strictly per-user if logged in)
router.get('/profile', async (req, res) => {
  try {
    if (req.user) {
      const userProfile = req.user.resumeProfile || null;
      const latestAts = (Array.isArray(req.user.atsAnalyses) && req.user.atsAnalyses[0]) || null;
      return res.json({ 
        profile: userProfile, 
        latestAts, 
        user: req.user.toSafeObject() 
      });
    }

    // Do NOT return someone else's stored profile when no user is logged in
    return res.json({ profile: null, latestAts: null, user: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Re-run ATS analysis with specific target role
router.post('/analyze-ats', async (req, res) => {
  try {
    const { targetRole, resumeText } = req.body || {};
    const apiKey = getGroqKey(req);
    const profile = req.user?.resumeProfile || null;

    const textToAnalyze = resumeText || (profile ? JSON.stringify(profile) : '');
    if (!textToAnalyze || textToAnalyze.length < 20) {
      return res.status(400).json({ error: 'No resume or profile data available to analyze' });
    }

    let atsAnalysis = null;
    let usedGroq = false;

    if (apiKey) {
      try {
        atsAnalysis = await groqService.analyzeAts(textToAnalyze, targetRole || 'Software Professional', apiKey);
        usedGroq = true;
      } catch (e) {
        console.warn('Groq ATS failed, falling back:', e.message);
      }
    }

    if (!atsAnalysis) {
      atsAnalysis = resumeParserService.heuristicAtsScore(textToAnalyze, targetRole || 'Software Professional');
    }

    await syncToUser(req, null, atsAnalysis, targetRole);
    await dbService.saveAtsAnalysis(atsAnalysis);

    res.json({
      success: true,
      atsAnalysis,
      usedGroq
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

