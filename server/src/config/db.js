import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import mongoose from 'mongoose';

// Ensure Node.js on Windows resolves MongoDB Atlas SRV records correctly (avoid modifying DNS on Linux/Render)
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    // Ignore if custom DNS fails
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial store schema
const initialStore = {
  profile: null,
  savedJobs: [],
  applications: [],
  atsAnalyses: []
};

function readStore() {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
      return { ...initialStore };
    }
    const data = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON store:', err);
    return { ...initialStore };
  }
}

function writeStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON store:', err);
  }
}

let isMongoConnected = false;

export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri === 'none') {
    console.log('ℹ Local JSON storage active.');
    return;
  }
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000
    });
    isMongoConnected = true;
    console.log(' Successfully connected to MongoDB Atlas CareerPilot database!');
  } catch (err) {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB Atlas connection notice:', err.message);
    console.log('ℹ Zero-config local persistent storage active.');
  }
}

// Storage abstraction that works seamlessly whether MongoDB is active or not
export const dbService = {
  isMongo: () => isMongoConnected,

  async getProfile() {
    const store = readStore();
    return store.profile;
  },

  async saveProfile(profileData) {
    const store = readStore();
    store.profile = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    writeStore(store);
    return store.profile;
  },

  async getSavedJobs() {
    const store = readStore();
    return store.savedJobs || [];
  },

  async toggleSaveJob(job) {
    const store = readStore();
    if (!store.savedJobs) store.savedJobs = [];
    const index = store.savedJobs.findIndex(j => j.id === job.id);
    let isSaved = false;
    if (index >= 0) {
      store.savedJobs.splice(index, 1);
      isSaved = false;
    } else {
      store.savedJobs.push({
        ...job,
        savedAt: new Date().toISOString()
      });
      isSaved = true;
    }
    writeStore(store);
    return { isSaved, savedJobs: store.savedJobs };
  },

  async getApplications() {
    const store = readStore();
    return store.applications || [];
  },

  async addApplication(appData) {
    const store = readStore();
    if (!store.applications) store.applications = [];
    const newApp = {
      id: appData.id || `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      jobId: appData.jobId,
      jobTitle: appData.jobTitle,
      company: appData.company,
      location: appData.location,
      salary: appData.salary,
      applyUrl: appData.applyUrl,
      source: appData.source,
      status: appData.status || 'applied', // applied, interviewing, offered, rejected
      appliedDate: appData.appliedDate || new Date().toISOString(),
      notes: appData.notes || '',
      interviewDate: appData.interviewDate || null,
      updatedAt: new Date().toISOString()
    };
    store.applications.unshift(newApp);
    writeStore(store);
    return newApp;
  },

  async updateApplication(id, updates) {
    const store = readStore();
    const app = (store.applications || []).find(a => a.id === id);
    if (!app) return null;
    Object.assign(app, updates, { updatedAt: new Date().toISOString() });
    writeStore(store);
    return app;
  },

  async deleteApplication(id) {
    const store = readStore();
    store.applications = (store.applications || []).filter(a => a.id !== id);
    writeStore(store);
    return true;
  },

  async saveAtsAnalysis(analysis) {
    const store = readStore();
    if (!store.atsAnalyses) store.atsAnalyses = [];
    const record = {
      id: `ats_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...analysis
    };
    store.atsAnalyses.unshift(record);
    // Keep last 10 analyses
    store.atsAnalyses = store.atsAnalyses.slice(0, 10);
    writeStore(store);
    return record;
  },

  async getLatestAtsAnalysis() {
    const store = readStore();
    return (store.atsAnalyses && store.atsAnalyses[0]) || null;
  }
};
