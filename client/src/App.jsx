import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ResumeUploader from './components/ResumeUploader';
import ManualProfileBuilder from './components/ManualProfileBuilder';
import AtsScoreCard from './components/AtsScoreCard';
import JobFilterSidebar from './components/JobFilterSidebar';
import JobCard from './components/JobCard';
import JobDetailModal from './components/JobDetailModal';
import AICoverLetterModal from './components/AICoverLetterModal';
import AIInterviewPrepModal from './components/AIInterviewPrepModal';
import ApplicationTracker from './components/ApplicationTracker';
import ResumeCustomizationModal from './components/ResumeCustomizationModal';
import AuthModal from './components/AuthModal';
import CareerProfileModal from './components/CareerProfileModal';
import { api } from './services/api';
import { 
  Sparkles, 
  FileText, 
  UserPen, 
  Briefcase, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  BookmarkCheck,
  Sliders,
  Check,
  CheckCircle2,
  ArrowUp
} from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Navigation tab state: 'jobs', 'ats', 'profile', 'tracker', 'saved'
  const [activeTab, setActiveTab] = useState('jobs');

  // User Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('jobfinder_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('jobfinder_auth_token') || '');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // AI Key state (handled via backend environment)
  const [groqKey] = useState(() => localStorage.getItem('groq_api_key') || '');

  // Candidate Profile & ATS state
  const [profile, setProfile] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [reanalyzingAts, setReanalyzingAts] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [refreshingFeeds, setRefreshingFeeds] = useState(false);
  const [liveScrapeMeta, setLiveScrapeMeta] = useState(null);
  const observerTargetRef = useRef(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [searchMode, setSearchMode] = useState('all_skills'); // 'all_skills' | 'custom_skills' | 'role'
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    jobType: '',
    experienceLevel: '',
    minLpa: 0,
    source: '',
    remoteOnly: false,
    sortBy: 'date_newest'
  });

  // Saved / Bookmarked Jobs
  const [savedJobs, setSavedJobs] = useState([]);

  // Applications Tracker state
  const [applications, setApplications] = useState([]);

  // Modal active selections
  const [detailJob, setDetailJob] = useState(null);
  const [coverLetterJob, setCoverLetterJob] = useState(null);
  const [interviewPrepJob, setInterviewPrepJob] = useState(null);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sync theme attribute to HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Scroll listener for floating back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Load user customized data from backend / MongoDB Atlas
  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem('jobfinder_auth_token');
    if (!token) {
      setProfile(null);
      setAtsData(null);
      setCurrentUser(null);
      setSavedJobs([]);
      setApplications([]);
      return;
    }

    try {
      // 1. Fetch Profile & latest ATS
      const profileData = await api.getCandidateProfile();
      if (profileData && profileData.profile) {
        setProfile(profileData.profile);
        if (profileData.profile.targetRole || profileData.profile.headline) {
          setTargetRole(profileData.profile.targetRole || profileData.profile.headline);
        }
      } else {
        setProfile(null);
      }
      if (profileData && profileData.latestAts) {
        setAtsData(profileData.latestAts);
      } else {
        setAtsData(null);
      }
      if (profileData && profileData.user) {
        setCurrentUser(profileData.user);
        localStorage.setItem('jobfinder_auth_user', JSON.stringify(profileData.user));
        if (profileData.user.targetRole) {
          setTargetRole(profileData.user.targetRole);
        }
      }

      // 2. Fetch Saved Bookmarks
      const saved = await api.getSavedJobs();
      if (Array.isArray(saved)) setSavedJobs(saved);
      else setSavedJobs([]);

      // 3. Fetch Tracked Applications
      const apps = await api.getApplications();
      if (Array.isArray(apps)) setApplications(apps);
      else setApplications([]);
    } catch (err) {
      console.warn('Initial data load note:', err.message);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Authentication Handlers
  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = async (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('jobfinder_auth_token', token);
    localStorage.setItem('jobfinder_auth_user', JSON.stringify(user));
    showToast(`Welcome back, ${user.fullName}!`);
    if (user.targetRole) {
      setTargetRole(user.targetRole);
    }
    await loadUserData();
    fetchJobs(1, true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jobfinder_auth_token');
    localStorage.removeItem('jobfinder_auth_user');
    setCurrentUser(null);
    setAuthToken('');
    setProfile(null);
    setAtsData(null);
    setSavedJobs([]);
    setApplications([]);
    showToast('Signed out successfully');
    fetchJobs(1, true);
  };

  // Query jobs from API with real-time web scraper (supports infinite scrolling & parameter overrides)
  const fetchJobs = useCallback(async (page = 1, forceRefresh = false, append = false, overrideParams = {}) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingJobs(true);
    }

    try {
      const currentExp = overrideParams.experienceLevel !== undefined ? overrideParams.experienceLevel : (filters.experienceLevel || '');
      const currentSearch = overrideParams.search !== undefined ? overrideParams.search : searchQuery;
      const currentSkills = overrideParams.skills !== undefined ? overrideParams.skills : (selectedSkills || []).join(',');
      const currentPlatforms = overrideParams.platforms !== undefined ? overrideParams.platforms : (selectedPlatforms || []).join(',');
      const currentMode = overrideParams.searchMode !== undefined ? overrideParams.searchMode : searchMode;
      const currentCity = overrideParams.city !== undefined ? overrideParams.city : (filters.city || '');
      const currentLocation = overrideParams.location !== undefined ? overrideParams.location : locationQuery;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '30',
        search: currentSearch,
        searchMode: currentMode,
        skills: currentSkills,
        platforms: currentPlatforms,
        location: currentLocation,
        city: currentCity,
        tag: activeTag,
        jobType: filters.jobType,
        experienceLevel: currentExp,
        minLpa: filters.minLpa ? filters.minLpa.toString() : '',
        source: filters.source,
        remoteOnly: filters.remoteOnly ? 'true' : 'false',
        sortBy: filters.sortBy,
        forceRefresh: forceRefresh ? 'true' : 'false'
      });

      const data = await api.getJobs(params.toString());

      if (append) {
        setJobs(prev => {
          const existingIds = new Set(prev.map(j => j.id));
          const incoming = (data.jobs || []).filter(j => !existingIds.has(j.id));
          return [...prev, ...incoming];
        });
      } else {
        setJobs(data.jobs || []);
      }

      setTotalJobs(data.total || 0);
      setCurrentPage(data.page || 1);
      setTotalPages(data.totalPages || 1);

      if (data.liveScrapedCount !== undefined) {
        setLiveScrapeMeta({
          count: data.liveScrapedCount,
          query: data.searchQueryUsed || searchQuery || 'Tech Roles',
          location: data.locationUsed || locationQuery || 'India',
          source: data.querySource || 'Requirement Search',
          searchMode: data.searchMode || searchMode,
          activeSkills: data.activeSkills || selectedSkills,
          experienceLevel: data.experienceLevelUsed || filters.experienceLevel,
          timestamp: data.scrapedAt,
          fromCache: data.fromCache
        });
      }
    } catch (err) {
      console.error('Fetch jobs error:', err);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoadingJobs(false);
      }
    }
  }, [searchQuery, locationQuery, searchMode, selectedSkills, activeTag, filters]);

  // Initial fetch and refetch on filter/search change
  useEffect(() => {
    fetchJobs(1, false, false);
  }, [fetchJobs]);

  // Load next page of jobs for infinite scrolling
  const loadMoreJobs = useCallback(() => {
    if (loadingMore || loadingJobs || currentPage >= totalPages) return;
    fetchJobs(currentPage + 1, false, true);
  }, [loadingMore, loadingJobs, currentPage, totalPages, fetchJobs]);

  // IntersectionObserver for auto infinite scroll as user scrolls down
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingJobs && !loadingMore && currentPage < totalPages) {
          loadMoreJobs();
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMoreJobs, loadingJobs, loadingMore, currentPage, totalPages]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      city: '',
      jobType: '',
      experienceLevel: '',
      minLpa: 0,
      source: '',
      remoteOnly: false,
      sortBy: 'date_newest'
    });
    setSearchQuery('');
    setLocationQuery('');
    setActiveTag('');
    setCurrentPage(1);
  };

  const handleQuickTag = (tag) => {
    if (activeTag.toLowerCase() === tag.toLowerCase()) {
      setActiveTag('');
    } else {
      setActiveTag(tag);
    }
    setCurrentPage(1);
  };

  const handleRefreshLiveFeeds = async () => {
    setRefreshingFeeds(true);
    try {
      const res = await fetch('/api/jobs/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          search: searchQuery, 
          location: locationQuery || filters.city || 'India',
          skills: selectedSkills.join(','),
          searchMode,
          experienceLevel: filters.experienceLevel
        })
      });
      const data = await res.json();
      showToast(data.message || 'Scraped fresh real-time jobs from live web!');
      fetchJobs(1, true);
    } catch (err) {
      alert('Failed to refresh feeds: ' + err.message);
    } finally {
      setRefreshingFeeds(false);
    }
  };

  // Immediate resume-to-job live scraping bridge with strategy modes, experience level & platforms
  const handleScrapeForResume = (customRole = null, mode = 'all_skills', customSkills = null, customExperience = null, customPlatforms = null) => {
    const role = customRole || profile?.targetRole || profile?.headline || targetRole || 'Full Stack Engineer';
    const city = profile?.location?.split(',')?.[0]?.trim() || '';
    
    let skillsToUse = [];
    if (Array.isArray(customSkills) && customSkills.length > 0) {
      skillsToUse = customSkills;
    } else if (profile) {
      skillsToUse = [
        ...(profile.skills?.technical || []),
        ...(profile.skills?.frameworks || []),
        ...(profile.skills?.databases || []),
        ...(profile.skills?.cloudAndDevops || [])
      ];
    }
    const uniqueSkills = Array.from(new Set(skillsToUse));

    const effectiveExp = (customExperience !== null && customExperience !== undefined)
      ? (customExperience === 'All' ? '' : customExperience)
      : (filters.experienceLevel || '');

    if (customPlatforms && customPlatforms.length > 0) {
      setSelectedPlatforms(customPlatforms);
    }
    const effectivePlatforms = (customPlatforms && customPlatforms.length > 0) ? customPlatforms : (selectedPlatforms || []);
    const platformsStr = effectivePlatforms.join(',');

    setSearchMode(mode);
    setSelectedSkills(uniqueSkills);

    const allSkillsStr = uniqueSkills.join(', ');

    if (mode === 'role') {
      setSearchQuery(role);
    } else {
      setSearchQuery(allSkillsStr || role);
    }

    setFilters(prev => ({ 
      ...prev, 
      ...(city && city.toLowerCase() !== 'india' ? { city } : {}),
      experienceLevel: effectiveExp
    }));
    setActiveTab('jobs');
    setCurrentPage(1);

    const desc = mode === 'all_skills' 
      ? `all ${uniqueSkills.length} resume skills` 
      : mode === 'custom_skills' 
      ? `${uniqueSkills.length} selected skills` 
      : `target role "${role}"`;

    const expDesc = effectiveExp ? ` [${effectiveExp}]` : '';
    const platDesc = effectivePlatforms.length > 0 ? ` on ${effectivePlatforms.length} platform${effectivePlatforms.length === 1 ? '' : 's'}` : '';
    showToast(`Scraping real-time openings based on ${desc}${platDesc}${expDesc}!`);

    // Trigger background scrape and immediate query with effectiveExp across all selected skills & platforms
    const overrideParams = {
      experienceLevel: effectiveExp,
      search: mode === 'role' ? role : (allSkillsStr || role),
      skills: uniqueSkills.join(','),
      platforms: platformsStr,
      searchMode: mode,
      city: city && city.toLowerCase() !== 'india' ? city : ''
    };

    fetch('/api/jobs/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        search: mode === 'role' ? role : (allSkillsStr || role), 
        location: city || 'India', 
        skills: uniqueSkills.join(','), 
        platforms: platformsStr,
        searchMode: mode,
        experienceLevel: effectiveExp
      })
    }).then(() => fetchJobs(1, true, false, overrideParams)).catch(() => fetchJobs(1, true, false, overrideParams));
  };

  // Callback from ResumeCustomizationModal to apply custom location, role, and filter preferences
  const handleApplyCustomizationAndScrape = async ({
    searchMode: customMode = 'all_skills',
    targetRole: customRole,
    location: customLoc,
    workMode,
    remoteOnly,
    experienceLevel,
    minLpa,
    skills: customSkills = [],
    platforms: customPlatforms = []
  }) => {
    const role = customRole || profile?.targetRole || profile?.headline || targetRole || 'Full Stack Engineer';
    const city = customLoc || profile?.location?.split(',')?.[0]?.trim() || 'India';
    const effectiveSkills = customSkills.length > 0 ? customSkills : (profile?.skills?.technical || []);
    const effectiveExp = experienceLevel === 'All' ? '' : (experienceLevel || '');
    if (customPlatforms && customPlatforms.length > 0) {
      setSelectedPlatforms(customPlatforms);
    }
    const platformsStr = (customPlatforms && customPlatforms.length > 0) ? customPlatforms.join(',') : (selectedPlatforms || []).join(',');

    setSearchMode(customMode);
    setSelectedSkills(effectiveSkills);
    const customSkillsStr = effectiveSkills.join(', ');
    setSearchQuery(customMode === 'role' ? role : (customSkillsStr || role));
    setLocationQuery(city);
    setFilters(prev => ({
      ...prev,
      city: city.toLowerCase() === 'india' ? '' : city,
      experienceLevel: effectiveExp,
      minLpa: minLpa || 0,
      remoteOnly: Boolean(remoteOnly),
      sortBy: 'match_score' // Automatically sort by candidate skill match score
    }));

    setActiveTab('jobs');
    setCurrentPage(1);

    const desc = customMode === 'all_skills' 
      ? `all ${effectiveSkills.length} resume skills` 
      : customMode === 'custom_skills' 
      ? `${effectiveSkills.length} selected skills` 
      : `role "${role}"`;

    const expDesc = effectiveExp ? ` [${effectiveExp}]` : '';
    const platDesc = customPlatforms.length > 0 ? ` on ${customPlatforms.length} platforms` : '';
    showToast(`Scraping real-time verified jobs for ${desc}${platDesc}${expDesc} in ${city}...`);

    try {
      await fetch('/api/jobs/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          search: customMode === 'role' ? role : (customSkillsStr || role), 
          location: city, 
          skills: effectiveSkills.join(','), 
          platforms: platformsStr,
          searchMode: customMode,
          experienceLevel: effectiveExp
        })
      });
    } catch (e) {
      console.warn('Live refresh note:', e.message);
    }

    fetchJobs(1, true, false, {
      experienceLevel: effectiveExp,
      search: customMode === 'role' ? role : (customSkillsStr || role),
      skills: effectiveSkills.join(','),
      platforms: platformsStr,
      searchMode: customMode,
      city: city.toLowerCase() === 'india' ? '' : city,
      location: city
    });
  };

  // Toggle Bookmark
  const handleToggleSave = async (job) => {
    try {
      const data = await api.toggleSaveJob(job);
      setSavedJobs(data.savedJobs || []);
      showToast(data.isSaved ? `Saved "${job.title}" to bookmarks` : `Removed from bookmarks`);
    } catch (err) {
      console.warn('Bookmark error:', err);
    }
  };

  // Application Tracker Actions
  const handleAddApplication = async (jobData) => {
    try {
      const newApp = await api.addApplication({
        jobId: jobData.id,
        jobTitle: jobData.title || jobData.jobTitle,
        company: jobData.company,
        location: jobData.location,
        salary: jobData.salaryFormatted || jobData.salary,
        applyUrl: jobData.applyUrl,
        source: jobData.source || 'Direct',
        status: 'applied'
      });
      setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
      showToast(`Added "${newApp.jobTitle}" to your application tracker!`);
    } catch (err) {
      console.warn('Tracker add error:', err);
    }
  };

  const handleUpdateAppStatus = async (id, updates) => {
    try {
      const updated = await api.updateApplication(id, updates);
      setApplications(prev => prev.map(a => a.id === id ? updated : a));
      showToast(`Status updated to "${updates.status}"`);
    } catch (err) {
      console.warn('Tracker update error:', err);
    }
  };

  const handleDeleteApp = async (id) => {
    try {
      await api.deleteApplication(id);
      setApplications(prev => prev.filter(a => a.id !== id));
      showToast('Application removed from tracker');
    } catch (err) {
      console.warn('Tracker delete error:', err);
    }
  };

  // Re-run ATS diagnostic with chosen target role
  const handleReanalyzeAts = async () => {
    setReanalyzingAts(true);
    try {
      const data = await api.analyzeAts(targetRole, profile ? JSON.stringify(profile) : '', groqKey);
      if (data.atsAnalysis) {
        setAtsData(data.atsAnalysis);
        showToast('ATS diagnostic re-calculated for ' + targetRole + ' (' + (data.atsAnalysis.score || '') + '/100)');
      }
    } catch (err) {
      alert('Error re-scoring ATS: ' + err.message);
    } finally {
      setReanalyzingAts(false);
    }
  };

  const handleResumeParsed = (result) => {
    if (result.profile) setProfile(result.profile);
    if (result.atsAnalysis) setAtsData(result.atsAnalysis);
    if (result.user) {
      setCurrentUser(result.user);
      localStorage.setItem('jobfinder_auth_user', JSON.stringify(result.user));
    }
    showToast(result.message || 'Resume successfully extracted & saved to Atlas!');
    setActiveTab('ats');
    fetchJobs(1, true);
  };

  const handleManualProfileSaved = (result) => {
    if (result.profile) setProfile(result.profile);
    if (result.atsAnalysis) setAtsData(result.atsAnalysis);
    if (result.user) {
      setCurrentUser(result.user);
      localStorage.setItem('jobfinder_auth_user', JSON.stringify(result.user));
    }
    showToast('Profile saved and synced to your Atlas account!');
    setActiveTab('ats');
    fetchJobs(1, true);
  };

  const handleHeroResumeParsed = (result) => {
    if (result.profile) setProfile(result.profile);
    if (result.atsAnalysis) setAtsData(result.atsAnalysis);
    if (result.user) {
      setCurrentUser(result.user);
      localStorage.setItem('jobfinder_auth_user', JSON.stringify(result.user));
    }
    if (result.profile?.targetRole || result.profile?.headline) {
      setTargetRole(result.profile.targetRole || result.profile.headline);
    }
    showToast(result.message || 'Resume extracted and saved to your Atlas account!');
    setIsCustomizationModalOpen(true);
    fetchJobs(1, true);
  };

  const handleHeroManualSaved = (result) => {
    if (result.profile) setProfile(result.profile);
    if (result.atsAnalysis) setAtsData(result.atsAnalysis);
    if (result.user) {
      setCurrentUser(result.user);
      localStorage.setItem('jobfinder_auth_user', JSON.stringify(result.user));
    }
    if (result.profile?.targetRole || result.profile?.headline) {
      setTargetRole(result.profile.targetRole || result.profile.headline);
    }
    showToast('Profile saved and synced to your Atlas account!');
    setIsCustomizationModalOpen(true);
    fetchJobs(1, true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        savedCount={savedJobs.length}
        atsScore={atsData?.overallScore || atsData?.score || null}
        applicationCount={applications.length}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-container main-content-wrapper" style={{ flex: 1 }}>
        {/* TAB 1: FIND JOBS */}
        {activeTab === 'jobs' && (
          <div>
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              locationQuery={locationQuery}
              setLocationQuery={setLocationQuery}
              onSearch={() => { setCurrentPage(1); fetchJobs(1); }}
              onQuickTag={handleQuickTag}
              activeTag={activeTag}
              totalJobs={totalJobs}
              onRefreshJobs={handleRefreshLiveFeeds}
              refreshing={refreshingFeeds}
              profile={profile}
              atsScore={atsData?.overallScore || null}
              groqKey={groqKey}
              onParsed={handleHeroResumeParsed}
              onManualSaved={handleHeroManualSaved}
              onOpenCustomization={() => setIsCustomizationModalOpen(true)}
              onScrapeForResume={handleScrapeForResume}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
            />

            {/* Layout: Filter Sidebar + Job Cards Grid */}
            <div className="jobs-layout-grid">
              {/* Sidebar */}
              <JobFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                totalResults={totalJobs}
              />

              {/* Jobs List */}
              <div style={{ width: '100%' }}>
                {loadingJobs ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '340px',
                    gap: '14px',
                    color: 'var(--text-muted)'
                  }}>
                    <RefreshCw size={28} className="spin-animation" color="var(--accent-emerald)" />
                    <span>Scraping and aggregating jobs from multi-platform network...</span>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Briefcase size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>No Jobs Match Your Filters</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px' }}>
                      Try adjusting your keywords, salary filter, or platform source.
                    </p>
                    <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Real-Time Live Scraping Status Banner */}
                    {liveScrapeMeta && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 20px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '20px',
                        fontSize: '0.86rem',
                        flexWrap: 'wrap',
                        gap: '12px',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="pulse-dot"></span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                Real-Time Web Scraping Active
                              </span>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'var(--accent-emerald-soft)',
                                color: 'var(--accent-emerald)',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                              }}>
                                ZERO PRELOADED DATA
                              </span>
                              {liveScrapeMeta.searchMode && (
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: 'var(--accent-emerald-soft)',
                                  color: 'var(--accent-emerald)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}>
                                  {liveScrapeMeta.searchMode === 'all_skills' 
                                    ? `🛠️ Mode: All Resume Skills (${liveScrapeMeta.activeSkills?.length || 'Stack'})` 
                                    : liveScrapeMeta.searchMode === 'custom_skills' 
                                    ? `✏️ Mode: Custom Skills (${liveScrapeMeta.activeSkills?.length || 'Selected'})` 
                                    : `🎯 Mode: Target Role`}
                                </span>
                              )}
                              {liveScrapeMeta.experienceLevel && liveScrapeMeta.experienceLevel !== 'All' && (
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                  color: '#3b82f6',
                                  border: '1px solid rgba(59, 130, 246, 0.3)'
                                }}>
                                  🎓 Exp: {liveScrapeMeta.experienceLevel}
                                </span>
                              )}
                              {liveScrapeMeta.source && (
                                <span style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: 'var(--bg-input)',
                                  color: 'var(--text-secondary)'
                                }}>
                                  Trigger: {liveScrapeMeta.source}
                                </span>
                              )}
                            </div>
                            <p style={{ margin: '3px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                              Dynamically scraped <strong>{liveScrapeMeta.count} live openings</strong> with verified direct application links from LinkedIn India & Instahyre for "<strong>{liveScrapeMeta.query}</strong>" in <strong>{liveScrapeMeta.location}</strong>.
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setIsCustomizationModalOpen(true)}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '6px', fontSize: '0.78rem' }}
                            title="Customize search strategy, selected skills, location and filters"
                          >
                            <Sliders size={13} color="var(--accent-emerald)" />
                            <span>Customize Search & Skills</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setCurrentPage(1); fetchJobs(1, true); }}
                            disabled={loadingJobs}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '6px', fontSize: '0.78rem' }}
                            title="Force fresh live re-scrape from web"
                          >
                            <RefreshCw size={13} className={loadingJobs ? 'spin-animation' : ''} />
                            <span>Live Re-Scrape</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="jobs-cards-grid">
                      {jobs.map(job => (
                        <JobCard
                          key={job.id}
                          job={job}
                          isSaved={savedJobs.some(s => s.id === job.id)}
                          onToggleSave={handleToggleSave}
                          onSelectJob={(j) => setDetailJob(j)}
                          onGenerateCoverLetter={(j) => {
                            if (!profile) {
                              setActiveTab('ats');
                              showToast('Please upload a resume first to generate tailored cover letter');
                            } else {
                              setCoverLetterJob(j);
                            }
                          }}
                          onOpenInterviewPrep={(j) => {
                            if (!profile) {
                              setActiveTab('ats');
                              showToast('Please upload a resume first to unlock interview prep');
                            } else {
                              setInterviewPrepJob(j);
                            }
                          }}
                          onTrackApplied={(j) => handleAddApplication(j)}
                        />
                      ))}
                    </div>

                    {/* Infinite Scrolling Sentinel Element */}
                    <div ref={observerTargetRef} style={{ height: '30px', margin: '10px 0' }} />

                    {/* Loading More Indicator */}
                    {loadingMore && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '24px 0',
                        color: 'var(--accent-emerald)',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>
                        <RefreshCw size={20} className="spin-animation" />
                        <span>Streaming next verified openings ({jobs.length} loaded)...</span>
                      </div>
                    )}

                    {/* Interactive Load More fallback button */}
                    {!loadingMore && !loadingJobs && currentPage < totalPages && (
                      <div style={{ textAlign: 'center', margin: '20px 0 32px 0' }}>
                        <button
                          type="button"
                          onClick={loadMoreJobs}
                          className="btn btn-secondary"
                          style={{
                            padding: '10px 26px',
                            borderRadius: 'var(--radius-full)',
                            gap: '8px',
                            fontSize: '0.88rem',
                            borderColor: 'var(--border-medium)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <Sparkles size={16} color="var(--accent-emerald)" />
                          <span>Load More Openings ({totalJobs - jobs.length} remaining)</span>
                        </button>
                      </div>
                    )}

                    {/* End of results indicator */}
                    {!loadingJobs && !loadingMore && currentPage >= totalPages && jobs.length > 0 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '32px 16px',
                        marginTop: '20px',
                        borderTop: '1px dashed var(--border-subtle)'
                      }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 22px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)'
                        }}>
                          <CheckCircle2 size={16} color="var(--accent-emerald)" />
                          <span>You've explored all {totalJobs} live openings matching your criteria</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATS RESUME DOCTOR */}
        {activeTab === 'ats' && (
          <div style={{ paddingTop: '32px' }}>
            <div style={{ marginBottom: '28px' }}>
              <ResumeUploader
                onParsed={handleResumeParsed}
                targetRole={targetRole}
                setTargetRole={setTargetRole}
                groqKey={groqKey}
                onScrapeForResume={handleScrapeForResume}
              />
            </div>

            {atsData && (
              <AtsScoreCard
                atsData={atsData}
                profile={profile}
                onReanalyze={handleReanalyzeAts}
                reanalyzing={reanalyzingAts}
                groqKey={groqKey}
                onScrapeForResume={handleScrapeForResume}
              />
            )}
          </div>
        )}

        {/* TAB 3: MANUAL PROFILE BUILDER */}
        {activeTab === 'profile' && (
          <div style={{ paddingTop: '32px' }}>
            <ManualProfileBuilder
              existingProfile={profile}
              onProfileSaved={handleManualProfileSaved}
              groqKey={groqKey}
              onScrapeForResume={handleScrapeForResume}
            />
          </div>
        )}

        {/* TAB 4: APPLICATION TRACKER */}
        {activeTab === 'tracker' && (
          <div style={{ paddingTop: '32px' }}>
            <ApplicationTracker
              applications={applications}
              onUpdateStatus={handleUpdateAppStatus}
              onDeleteApplication={handleDeleteApp}
              onAddApplication={handleAddApplication}
            />
          </div>
        )}

        {/* TAB 5: SAVED BOOKMARKS */}
        {activeTab === 'saved' && (
          <div style={{ paddingTop: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookmarkCheck size={26} color="var(--accent-amber)" />
                <span>Bookmarked Positions ({savedJobs.length})</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Saved roles with direct apply links ready for submission.
              </p>
            </div>

            {savedJobs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
                <BookmarkCheck size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Saved Jobs Yet</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Click the bookmark icon on any job card to save it here for later.
                </p>
                <button onClick={() => setActiveTab('jobs')} className="btn btn-primary btn-sm">
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="jobs-cards-grid">
                {savedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={true}
                    onToggleSave={handleToggleSave}
                    onSelectJob={(j) => setDetailJob(j)}
                    onGenerateCoverLetter={(j) => setCoverLetterJob(j)}
                    onOpenInterviewPrep={(j) => setInterviewPrepJob(j)}
                    onTrackApplied={(j) => handleAddApplication(j)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* Job Detail Modal */}
      <JobDetailModal
        job={detailJob}
        onClose={() => setDetailJob(null)}
        isSaved={detailJob ? savedJobs.some(s => s.id === detailJob.id) : false}
        onToggleSave={handleToggleSave}
        onGenerateCoverLetter={(j) => { setDetailJob(null); setCoverLetterJob(j); }}
        onOpenInterviewPrep={(j) => { setDetailJob(null); setInterviewPrepJob(j); }}
        onTrackJob={(j) => handleAddApplication(j)}
        profile={profile}
        groqKey={groqKey}
      />

      {/* AI Cover Letter Modal */}
      <AICoverLetterModal
        isOpen={Boolean(coverLetterJob)}
        onClose={() => setCoverLetterJob(null)}
        job={coverLetterJob}
        profile={profile}
        groqKey={groqKey}
      />

      {/* AI Interview Prep Copilot Modal */}
      <AIInterviewPrepModal
        isOpen={Boolean(interviewPrepJob)}
        onClose={() => setInterviewPrepJob(null)}
        job={interviewPrepJob}
        profile={profile}
        groqKey={groqKey}
      />

      {/* Resume Scan & Filter Customization Modal */}
      <ResumeCustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={() => setIsCustomizationModalOpen(false)}
        profile={profile}
        atsScore={atsData?.overallScore || null}
        onApplyAndScrape={handleApplyCustomizationAndScrape}
        initialFilters={filters}
      />

      {/* Authentication Modal (Login, Signup, OTP Verification, Forgot & Reset Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Career Profile Customization Modal */}
      <CareerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        savedCount={savedJobs.length}
        applicationCount={applications.length}
        atsScore={atsData?.overallScore || atsData?.score || null}
        onProfileUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem('jobfinder_auth_user', JSON.stringify(updatedUser));
          if (updatedUser.targetRole) {
            setTargetRole(updatedUser.targetRole);
          }
          showToast('Career profile synchronized to MongoDB Atlas!');
          fetchJobs(1, true);
        }}
      />
      {/* Floating Interactive Toast Feedback */}
      {toastMessage && (
        <div className="floating-toast animate-slide-up" role="status" aria-live="polite">
          <Sparkles size={16} color="var(--accent-emerald)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="floating-scroll-top"
          title="Back to Top"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
