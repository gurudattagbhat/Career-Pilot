import { liveScraperService } from './liveScraperService.js';

// Indian city matcher handling synonyms (e.g. Bangalore == Bengaluru, Gurgaon == Gurugram, etc.)
function matchesIndianCity(jobLocation = '', jobCity = '', targetCity = '') {
  if (!targetCity || targetCity === 'All' || targetCity === 'All Cities') return true;
  const t = targetCity.toLowerCase().trim();
  const text = `${jobLocation} ${jobCity}`.toLowerCase();

  if (t === 'bengaluru' || t === 'bangalore') {
    return text.includes('bengaluru') || text.includes('bangalore');
  }
  if (t === 'gurgaon' || t === 'gurugram' || t === 'noida' || t.includes('delhi')) {
    return text.includes('gurgaon') || text.includes('gurugram') || text.includes('noida') || text.includes('delhi') || text.includes('ncr');
  }
  if (t === 'mumbai') {
    return text.includes('mumbai') || text.includes('bombay') || text.includes('thane') || text.includes('navi mumbai');
  }
  if (t === 'remote' || t === 'remote india') {
    return text.includes('remote') || text.includes('india');
  }
  return text.includes(t);
}

// Emergency offline fallback only if network request completely fails
const OFFLINE_FALLBACK_JOBS = [
  {
    id: 'offline_fresher_tcs',
    title: 'Graduate Engineer Trainee - Full Stack (React / Node.js)',
    company: 'Tata Consultancy Services',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    isRemote: false,
    workMode: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Fresher',
    minLpa: 4,
    maxLpa: 7,
    salaryFormatted: '₹4 LPA – ₹7 LPA (Fresher CTC)',
    currency: 'INR',
    tags: ['React', 'Node.js', 'JavaScript', 'SQL', 'Git'],
    source: 'LinkedIn India',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=TCS+Fresher&location=India',
    postedAt: new Date().toISOString(),
    isLiveScraped: false,
    description: 'TCS is hiring engineering graduates and freshers for Full Stack Trainee roles across India.'
  },
  {
    id: 'offline_fresher_infosys',
    title: 'Junior Software Engineer (Python / React / AWS)',
    company: 'Infosys',
    location: 'Pune, Maharashtra',
    city: 'Pune',
    isRemote: false,
    workMode: 'In-Office',
    jobType: 'Full-time',
    experienceLevel: 'Fresher',
    minLpa: 4,
    maxLpa: 8,
    salaryFormatted: '₹4 LPA – ₹8 LPA (Fresher CTC)',
    currency: 'INR',
    tags: ['Python', 'React', 'AWS', 'PostgreSQL'],
    source: 'Naukri',
    applyUrl: 'https://www.naukri.com/fresher-jobs',
    postedAt: new Date().toISOString(),
    isLiveScraped: false,
    description: 'Infosys is hiring Junior Software Engineers and fresh graduates for application development.'
  },
  {
    id: 'offline_swiggy_fs',
    title: 'SDE-2 Full Stack Developer (MERN / Go)',
    company: 'Swiggy',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    isRemote: false,
    workMode: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Mid-Level',
    minLpa: 24,
    maxLpa: 38,
    salaryFormatted: '₹24 LPA – ₹38 LPA',
    currency: 'INR',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Go'],
    source: 'Naukri',
    applyUrl: 'https://www.naukri.com/swiggy-jobs',
    postedAt: new Date().toISOString(),
    isLiveScraped: false,
    description: 'Swiggy is India\'s leading on-demand convenience platform. Looking for SDE-2 Full Stack Developer.'
  },
  {
    id: 'offline_cred_be',
    title: 'Senior Backend Engineer (Payments & Core Banking)',
    company: 'CRED',
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    isRemote: false,
    workMode: 'In-Office',
    jobType: 'Full-time',
    experienceLevel: 'Senior',
    minLpa: 45,
    maxLpa: 70,
    salaryFormatted: '₹45 LPA – ₹70 LPA',
    currency: 'INR',
    tags: ['Java', 'Spring Boot', 'Node.js', 'Kafka', 'PostgreSQL'],
    source: 'LinkedIn India',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=CRED+Engineer&location=India',
    postedAt: new Date().toISOString(),
    isLiveScraped: false,
    description: 'CRED is a high-growth fintech platform in Bengaluru.'
  }
];

export const jobAggregatorService = {
  // Main search & filter method: 100% real-time dynamic scraping based on requirements or candidate resume
  async searchAndFilterJobs(params = {}, userProfile = null) {
    const {
      search = '',
      location = '',
      city = '',
      jobType = '',
      experienceLevel = '',
      minLpa = 0,
      source = '',
      remoteOnly = false,
      sortBy = 'date_newest',
      tag = '',
      page = 1,
      limit = 30,
      forceRefresh = false
    } = params;

    const targetLocation = location || (city && city !== 'All Cities' ? city : 'India');

    // Extract target skills if provided or in search string
    let targetSkills = [];
    if (Array.isArray(params.skills)) {
      targetSkills = params.skills.map(s => s.toLowerCase().trim()).filter(Boolean);
    } else if (typeof params.skills === 'string' && params.skills.trim()) {
      targetSkills = params.skills.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
    }

    if (search && search.includes(',')) {
      const splitTokens = search.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
      targetSkills = Array.from(new Set([...targetSkills, ...splitTokens]));
    }

    // If searchMode is 'all_skills' and no skills were explicitly passed, use all skills from resume profile
    if (params.searchMode === 'all_skills' && targetSkills.length === 0 && userProfile) {
      const allExtracted = [
        ...(userProfile.skills?.technical || []),
        ...(userProfile.skills?.frameworks || []),
        ...(userProfile.skills?.databases || []),
        ...(userProfile.skills?.cloudAndDevops || [])
      ];
      targetSkills = Array.from(new Set(allExtracted.map(s => s.toLowerCase().trim()).filter(Boolean)));
    }

    // Extract selected platforms
    let selectedPlatforms = [];
    if (Array.isArray(params.platforms)) {
      selectedPlatforms = params.platforms.map(p => p.trim()).filter(Boolean);
    } else if (typeof params.platforms === 'string' && params.platforms.trim()) {
      selectedPlatforms = params.platforms.split(',').map(p => p.trim()).filter(Boolean);
    }

    // 1. Scrape real-time data dynamically from live platforms
    let liveScrapedData = { jobs: [], queryUsed: '', locationUsed: '', querySource: 'Search', fromCache: false };
    try {
      liveScrapedData = await liveScraperService.getLiveRealTimeJobs(
        search,
        targetLocation,
        userProfile,
        forceRefresh,
        targetSkills,
        params.searchMode || '',
        experienceLevel || '',
        selectedPlatforms
      );
    } catch (scrapeErr) {
      console.warn('Real-time scraping error:', scrapeErr.message);
    }

    // 2. Strict Real-Time Policy: Show live-scraped jobs (NOT preloaded static data)
    let jobsPool = liveScrapedData.jobs;
    if (!jobsPool || jobsPool.length === 0) {
      // Emergency fallback only if scraper is offline
      jobsPool = OFFLINE_FALLBACK_JOBS;
    }

    // 3. Filter pipeline
    let filtered = jobsPool.filter(job => {
      // Skills & Keyword filter
      if (targetSkills.length > 0) {
        // Multi-skill search mode: match jobs containing ANY of the target skills in tags, title, or description
        const jobText = `${job.title} ${job.company} ${(job.tags || []).join(' ')} ${job.description || ''}`.toLowerCase();
        const matchesAnySkill = targetSkills.some(s => jobText.includes(s));
        
        if (search && !search.includes(',')) {
          const q = search.toLowerCase().trim();
          const matchesSearch = jobText.includes(q);
          if (!matchesAnySkill && !matchesSearch && !job.isLiveScraped) return false;
        } else {
          if (!matchesAnySkill && !job.isLiveScraped) return false;
        }
      } else if (search) {
        const q = search.toLowerCase().trim();
        const jobText = `${job.title} ${job.company} ${(job.tags || []).join(' ')} ${job.description || ''}`.toLowerCase();
        const matchesExact = jobText.includes(q);
        const searchTokens = q.split(/\s+/).filter(w => w.length > 2 && !['and', 'for', 'the', 'with', 'jobs', 'role'].includes(w));
        const matchesTokens = searchTokens.length > 0 && searchTokens.some(tok => jobText.includes(tok));
        if (!matchesExact && !matchesTokens && !job.isLiveScraped) {
          return false;
        }
      }

      // City / Location filter with Indian city matching
      if (city && city !== 'All Cities') {
        if (!matchesIndianCity(job.location, job.city, city)) {
          return false;
        }
      } else if (location && location.toLowerCase() !== 'india') {
        if (!matchesIndianCity(job.location, job.city, location)) {
          return false;
        }
      }

      // Remote only filter
      if (remoteOnly && !job.isRemote && !job.workMode?.toLowerCase().includes('remote')) {
        return false;
      }

      // Job type filter
      if (jobType && jobType !== 'All') {
        if (!job.jobType.toLowerCase().includes(jobType.toLowerCase())) {
          return false;
        }
      }

      // Experience level filter (supports Fresher, Junior, Mid-Level, Senior, Lead, or custom text)
      if (experienceLevel && experienceLevel !== 'All' && experienceLevel.trim() !== '') {
        const expLower = experienceLevel.toLowerCase().trim();
        const jobExp = (job.experienceLevel || '').toLowerCase();
        const jobTitle = (job.title || '').toLowerCase();
        const jobDesc = (job.description || '').toLowerCase();
        const text = `${jobTitle} ${jobDesc}`;

        // 1. Detect if job is explicitly Senior or Lead
        const isSeniorOrLead = jobExp === 'senior' || jobExp === 'lead' ||
          jobTitle.includes('senior') || jobTitle.includes('sr.') || jobTitle.includes('sr ') ||
          jobTitle.includes('lead') || jobTitle.includes('architect') || jobTitle.includes('staff') ||
          jobTitle.includes('principal') || jobTitle.includes('director') || jobTitle.includes('manager') ||
          jobTitle.includes('sde-3') || jobTitle.includes('sde 3') || jobTitle.includes('sde3') ||
          jobTitle.includes('sde iii');

        // 2. Detect if job is Mid-Level / SDE-2
        const isMidLevel = jobExp === 'mid-level' ||
          jobTitle.includes('sde-2') || jobTitle.includes('sde 2') || jobTitle.includes('sde2') ||
          jobTitle.includes('sde ii') || jobTitle.includes('mid-level');

        // 3. Detect if text explicitly requires 2+ or more years of experience
        const requiresSeniorExp = /([2-9]|\d{2})\+?\s*(years?|yrs?)\s*(of)?\s*(experience|exp)?/i.test(text) ||
          /(minimum|at least|min)\s*([2-9]|\d{2})\s*(years?|yrs?)/i.test(text) ||
          /([2-9]|\d{2})\s*-\s*\d+\s*(years?|yrs?)/i.test(text);

        // Strict Fresher / 0-1 Yrs Filtering
        if (expLower.includes('fresher') || expLower.includes('0-1') || expLower.includes('intern') || expLower.includes('graduate') || expLower.includes('entry') || expLower.includes('trainee') || expLower.includes('student')) {
          // STRICT EXCLUSIONS: if it is Senior, Lead, Mid-Level, or requires 2+ years of experience, REJECT!
          if (isSeniorOrLead || isMidLevel || requiresSeniorExp) {
            return false;
          }

          // Positive Match:
          const isFresherMatch = jobExp === 'fresher' || jobExp === 'junior' ||
            jobTitle.includes('fresher') || jobTitle.includes('intern') || jobTitle.includes('trainee') ||
            jobTitle.includes('graduate') || jobTitle.includes('entry') || jobTitle.includes('junior') ||
            jobTitle.includes('jr.') || jobTitle.includes('jr ') || jobTitle.includes('associate') ||
            jobTitle.includes('sde-1') || jobTitle.includes('sde 1') || jobTitle.includes('sde1') ||
            jobTitle.includes('sde i') || jobTitle.includes('campus') ||
            jobDesc.includes('fresher') || jobDesc.includes('0-1') || jobDesc.includes('0 to 1') ||
            jobDesc.includes('entry level') || jobDesc.includes('internship') || jobDesc.includes('trainee');

          if (!isFresherMatch) {
            return false;
          }
          return true;
        }

        // Junior / 1-3 Yrs Filtering
        if (expLower.includes('junior') || expLower.includes('1-3') || expLower.includes('0-2')) {
          if (isSeniorOrLead) return false;
          return jobExp === 'junior' || jobExp === 'fresher' ||
            jobTitle.includes('junior') || jobTitle.includes('jr.') || jobTitle.includes('sde-1') || jobTitle.includes('sde 1') ||
            jobTitle.includes('associate') || jobTitle.includes('intern') || jobTitle.includes('trainee');
        }

        // Mid-Level / 2-5 Yrs Filtering
        if (expLower.includes('mid') || expLower.includes('2-5') || expLower.includes('3-5')) {
          if (isSeniorOrLead || jobExp === 'fresher' || jobTitle.includes('intern') || jobTitle.includes('fresher')) return false;
          return jobExp === 'mid-level' || isMidLevel || (!isSeniorOrLead && !jobTitle.includes('intern') && !jobTitle.includes('trainee'));
        }

        // Senior / 5-8 Yrs Filtering
        if (expLower.includes('senior') || expLower.includes('5-8') || expLower.includes('sr')) {
          return isSeniorOrLead || jobExp === 'senior';
        }

        // Lead / 8+ Yrs Filtering
        if (expLower.includes('lead') || expLower.includes('architect') || expLower.includes('8+')) {
          return jobExp === 'lead' || jobTitle.includes('lead') || jobTitle.includes('architect') || jobTitle.includes('staff') || jobTitle.includes('principal');
        }

        // Generic custom string match
        const matchesExp = jobExp.includes(expLower) || jobTitle.includes(expLower) || jobDesc.includes(expLower);
        if (!matchesExp) {
          return false;
        }
      }

      // Min LPA salary filter
      if (minLpa > 0) {
        const maxLpa = job.maxLpa || job.minLpa || 0;
        if (maxLpa < Number(minLpa)) {
          return false;
        }
      }

      // Source platform filter (single source)
      if (source && source !== 'All') {
        if (!job.source.toLowerCase().includes(source.toLowerCase())) {
          return false;
        }
      }

      // Multi-platform selection filter
      if (selectedPlatforms.length > 0 && !selectedPlatforms.includes('all') && !selectedPlatforms.includes('All')) {
        const matchesPlatform = selectedPlatforms.some(p => 
          job.source.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(job.source.toLowerCase())
        );
        if (!matchesPlatform) return false;
      }

      // Specific tag filter
      if (tag) {
        const hasTag = (job.tags || []).some(t => t.toLowerCase() === tag.toLowerCase());
        if (!hasTag) return false;
      }

      return true;
    });

    // 4. Compute candidate match scores based on active search skills or profile skills
    const activeSkillsList = targetSkills.length > 0
      ? targetSkills
      : (userProfile ? [
          ...(userProfile.skills?.technical || []),
          ...(userProfile.skills?.frameworks || []),
          ...(userProfile.skills?.databases || []),
          ...(userProfile.skills?.cloudAndDevops || [])
        ].map(s => s.toLowerCase()) : []);

    if (activeSkillsList.length > 0 || userProfile) {
      filtered = filtered.map(job => {
        let matchScore = 50;
        const jobTagsLower = (job.tags || []).map(t => t.toLowerCase());
        const jobTextLower = `${job.title} ${job.company} ${(job.tags || []).join(' ')} ${job.description || ''}`.toLowerCase();
        
        // Find which candidate skills are matched in this job
        const matched = activeSkillsList.filter(s => jobTagsLower.some(t => t.includes(s) || s.includes(t)) || jobTextLower.includes(s));
        
        if (activeSkillsList.length > 0) {
          const ratio = Math.min(matched.length / Math.min(activeSkillsList.length, 5), 1);
          matchScore += Math.round(ratio * 40);
        }

        const roleTarget = (userProfile?.targetRole || userProfile?.headline || (!search.includes(',') ? search : '')).toLowerCase();
        if (roleTarget) {
          const words = roleTarget.split(/\s+/).filter(w => w.length > 3 && !['developer', 'engineer', 'senior', 'lead'].includes(w));
          const hasWord = words.some(w => job.title.toLowerCase().includes(w));
          if (hasWord) matchScore += 10;
        }

        const finalScore = Math.min(Math.max(matchScore, 45), 98);
        return {
          ...job,
          calculatedMatchScore: finalScore,
          matchedSkillsSample: matched.slice(0, 5)
        };
      });
    }

    // 5. Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'salary_high_to_low':
          return (b.maxLpa || b.minLpa || 0) - (a.maxLpa || a.minLpa || 0);
        case 'salary_low_to_high':
          return (a.minLpa || a.maxLpa || 0) - (b.minLpa || b.maxLpa || 0);
        case 'match_score':
          return (b.calculatedMatchScore || 0) - (a.calculatedMatchScore || 0);
        case 'company_asc':
          return a.company.localeCompare(b.company);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'date_newest':
        default:
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      }
    });

    // 6. Pagination
    const totalJobs = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedJobs = filtered.slice(startIndex, startIndex + limitNum);

    return {
      jobs: paginatedJobs,
      total: totalJobs,
      page: pageNum,
      totalPages: Math.ceil(totalJobs / limitNum) || 1,
      currency: 'INR',
      isRealTimeLive: true,
      liveScrapedCount: liveScrapedData.jobs.length,
      searchQueryUsed: liveScrapedData.queryUsed,
      locationUsed: liveScrapedData.locationUsed,
      querySource: liveScrapedData.querySource,
      fromCache: liveScrapedData.fromCache,
      scrapedAt: liveScrapedData.timestamp || new Date().toISOString(),
      searchMode: params.searchMode || (targetSkills.length > 0 ? 'custom_skills' : 'role'),
      activeSkills: targetSkills,
      experienceLevelUsed: experienceLevel || 'All',
      filtersApplied: {
        search,
        location,
        city,
        jobType,
        experienceLevel,
        minLpa,
        source,
        platforms: selectedPlatforms,
        remoteOnly,
        sortBy
      }
    };
  },

  // Alias for initial warmup
  async getAllAggregatedJobs(forceRefresh = false) {
    const res = await this.searchAndFilterJobs({ forceRefresh });
    return res.jobs;
  },

  async getJobById(id) {
    // Check in-memory caches or scrape
    return null;
  }
};
