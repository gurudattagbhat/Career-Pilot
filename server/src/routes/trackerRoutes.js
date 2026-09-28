import express from 'express';
import { dbService } from '../config/db.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(optionalAuth);

// List all tracked applications (per-user if logged in)
router.get('/', async (req, res) => {
  try {
    if (req.user) {
      return res.json(req.user.applications || []);
    }
    return res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a tracked application (stored in user profile if logged in)
router.post('/', async (req, res) => {
  try {
    const { jobId, jobTitle, company, location, salary, applyUrl, source, status, notes, interviewDate } = req.body;
    if (!jobTitle || !company) {
      return res.status(400).json({ error: 'Job title and company are required' });
    }

    const newApp = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      jobId,
      jobTitle,
      company,
      location: location || 'India',
      salary: salary || '',
      applyUrl: applyUrl || '',
      source: source || 'Direct',
      status: status || 'applied',
      notes: notes || '',
      interviewDate: interviewDate || null,
      appliedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (req.user) {
      if (!Array.isArray(req.user.applications)) {
        req.user.applications = [];
      }
      req.user.applications.unshift(newApp);
      req.user.markModified('applications');
      await req.user.save();
      return res.json(newApp);
    }

    const application = await dbService.addApplication(newApp);
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application status or details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.user) {
      if (!Array.isArray(req.user.applications)) {
        return res.status(404).json({ error: 'Application not found' });
      }
      const appIndex = req.user.applications.findIndex(a => a.id === id);
      if (appIndex === -1) {
        return res.status(404).json({ error: 'Application not found' });
      }

      req.user.applications[appIndex] = {
        ...req.user.applications[appIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      req.user.markModified('applications');
      await req.user.save();
      return res.json(req.user.applications[appIndex]);
    }

    const updated = await dbService.updateApplication(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user) {
      if (Array.isArray(req.user.applications)) {
        req.user.applications = req.user.applications.filter(a => a.id !== id);
        req.user.markModified('applications');
        await req.user.save();
      }
      return res.json({ success: true });
    }

    await dbService.deleteApplication(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

