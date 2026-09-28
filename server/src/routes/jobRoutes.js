import express from 'express';
import { jobAggregatorService } from '../services/jobAggregatorService.js';
import { dbService } from '../config/db.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(optionalAuth);

// Helper to resolve active profile for personalization
async function resolveUserProfile(req) {
  if (req.user) {
    if (req.user.resumeProfile) {
      return req.user.resumeProfile;
    }
    return {
      name: req.user.fullName,
      headline: req.user.targetRole || req.user.headline,
      targetRole: req.user.targetRole,
      skills: {
        technical: req.user.skills || []
      },
      location: req.user.location,
      experienceLevel: req.user.experienceLevel
    };
  }
  return await dbService.getProfile();
}

// Get jobs with real-time scraping, filtering, search, sorting & pagination
router.get('/', async (req, res) => {
  try {
    const {
      search,
      skills,
      searchMode,
      location,
      city,
      jobType,
      experienceLevel,
      minSalary,
      minLpa,
      source,
      platforms,
      remoteOnly,
      sortBy,
      tag,
      page,
      limit,
      forceRefresh
    } = req.query;

    // Load active user profile for match score calculation and personalized queries
    const userProfile = await resolveUserProfile(req);

    const result = await jobAggregatorService.searchAndFilterJobs(
      {
        search: search || '',
        skills: skills || '',
        searchMode: searchMode || '',
        location: location || '',
        city: city || '',
        jobType: jobType || '',
        experienceLevel: experienceLevel || '',
        minLpa: minLpa ? Number(minLpa) : (minSalary ? Number(minSalary) : 0),
        source: source || '',
        platforms: platforms || '',
        remoteOnly: remoteOnly === 'true',
        sortBy: sortBy || 'date_newest',
        tag: tag || '',
        page: page || 1,
        limit: limit || 30,
        forceRefresh: forceRefresh === 'true'
      },
      userProfile
    );

    res.json(result);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Failed to retrieve real-time jobs: ' + err.message });
  }
});

// Force refresh jobs by clearing cache and scraping fresh web data
router.post('/refresh', async (req, res) => {
  try {
    const { search = '', location = 'India', skills = '', searchMode = '', experienceLevel = '', platforms = '' } = req.body || {};
    const userProfile = await resolveUserProfile(req);
    const result = await jobAggregatorService.searchAndFilterJobs(
      { search, location, skills, searchMode, experienceLevel, platforms, forceRefresh: true },
      userProfile
    );
    res.json({
      success: true,
      count: result.liveScrapedCount || result.total,
      message: `Scraped fresh live listings across selected platforms!`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh job listings: ' + err.message });
  }
});

// Get all bookmarked / saved jobs (per-user if logged in)
router.get('/saved', async (req, res) => {
  try {
    if (req.user) {
      return res.json(req.user.savedJobs || []);
    }
    const saved = await dbService.getSavedJobs();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle bookmark on a job (saved to user document in MongoDB Atlas if logged in)
router.post('/toggle-save', async (req, res) => {
  try {
    const { job } = req.body;
    if (!job || !job.id) {
      return res.status(400).json({ error: 'Job object with id required' });
    }

    if (req.user) {
      if (!Array.isArray(req.user.savedJobs)) {
        req.user.savedJobs = [];
      }
      const existingIdx = req.user.savedJobs.findIndex(j => j.id === job.id);
      let isSaved = false;

      if (existingIdx >= 0) {
        req.user.savedJobs.splice(existingIdx, 1);
        isSaved = false;
      } else {
        req.user.savedJobs.unshift({
          ...job,
          savedAt: new Date().toISOString()
        });
        isSaved = true;
      }

      req.user.markModified('savedJobs');
      await req.user.save();
      return res.json({ isSaved, savedJobs: req.user.savedJobs });
    }

    const result = await dbService.toggleSaveJob(job);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

