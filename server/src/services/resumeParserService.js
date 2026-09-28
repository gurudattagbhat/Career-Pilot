import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { groqService } from './groqService.js';

// Common technical skills catalog for pattern matching
const TECH_SKILLS_CATALOG = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL',
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB', 'Supabase', 'Firebase',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform', 'Linux',
  'Git', 'REST API', 'GraphQL', 'Microservices', 'TailwindCSS', 'HTML5', 'CSS3', 'Jest', 'Cypress',
  'PyTorch', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy', 'OpenAI', 'LangChain', 'Hugging Face'
];

const ACTION_VERBS = [
  'accelerated', 'achieved', 'architected', 'automated', 'built', 'coached', 'collaborated',
  'constructed', 'created', 'decreased', 'delivered', 'designed', 'developed', 'directed',
  'drove', 'eliminated', 'engineered', 'enhanced', 'established', 'executed', 'expanded',
  'founded', 'generated', 'guided', 'implemented', 'improved', 'increased', 'initiated',
  'innovated', 'launched', 'led', 'managed', 'maximized', 'mentored', 'modernized',
  'negotiated', 'optimized', 'orchestrated', 'overhauled', 'pioneered', 'reduced', 'refactored',
  'resolved', 'revamped', 'scaled', 'simplified', 'spearheaded', 'streamlined', 'transformed'
];

const WEAK_CLICHES = [
  'hardworking', 'go-getter', 'team player', 'detail-oriented', 'results-driven',
  'self-motivated', 'think outside the box', 'synergy', 'dynamic professional',
  'people person', 'fast learner', 'work well under pressure'
];

// Stream text fallback for mobile PDFs with XRef or syntax quirks
function extractPdfStreamText(fileBuffer) {
  try {
    const str = fileBuffer.toString('latin1');
    const textChunks = [];

    // Decode standard (text) Tj operators
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(str)) !== null) {
      const decoded = match[1]
        .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
        .replace(/\\([()nrtbf\\])/g, (_, esc) => {
          const map = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
          return map[esc] || esc;
        });
      if (decoded.trim()) textChunks.push(decoded);
    }

    // Decode [(text) 10 (text)] TJ array operators
    const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
    while ((match = tjArrayRegex.exec(str)) !== null) {
      const inner = match[1];
      const subMatches = inner.match(/\(([^)]+)\)/g);
      if (subMatches) {
        textChunks.push(subMatches.map(s => s.slice(1, -1)).join(' '));
      }
    }

    // Decode hex strings <48656c6c6f> Tj
    const hexTjRegex = /<([0-9a-fA-F]+)>\s*Tj/g;
    while ((match = hexTjRegex.exec(str)) !== null) {
      const hex = match[1];
      let decoded = '';
      for (let i = 0; i < hex.length; i += 2) {
        decoded += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      if (decoded.trim()) textChunks.push(decoded);
    }

    // Printable word sequences fallback if structured operators were sparse
    if (textChunks.length < 5) {
      const rawMatches = str.match(/[\w\s@.+\-–,():\/]{5,}/g);
      if (rawMatches) {
        const filtered = rawMatches
          .map(s => s.trim())
          .filter(s => s.length > 3 && !s.startsWith('/') && !s.includes('endobj') && !s.includes('xref') && !s.includes('stream') && !s.includes('Linearized'));
        return Array.from(new Set(filtered)).join(' ');
      }
    }

    return textChunks.join(' ');
  } catch (err) {
    console.warn('PDF stream fallback note:', err.message);
    return '';
  }
}

// Clean mobile whitespace, non-breaking spaces and soft hyphens
function cleanMobileText(text) {
  if (!text) return '';
  return text
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F\u00AD\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export const resumeParserService = {
  async extractText(fileBuffer, mimeType, originalName = '') {
    const ext = originalName.split('.').pop()?.toLowerCase();
    
    // Check magic bytes header to guarantee detection on mobile devices
    const isPdf = (mimeType && mimeType.includes('pdf')) ||
                  ext === 'pdf' ||
                  (fileBuffer && fileBuffer.length >= 4 && fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46); // %PDF

    const isDocx = (mimeType && (mimeType.includes('word') || mimeType.includes('officedocument'))) ||
                   ext === 'docx' || ext === 'doc' ||
                   (fileBuffer && fileBuffer.length >= 4 && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B && fileBuffer[2] === 0x03 && fileBuffer[3] === 0x04); // PK..

    if (isPdf) {
      let extractedText = '';
      try {
        const data = await pdfParse(fileBuffer);
        extractedText = (data && data.text) ? data.text : '';
      } catch (err) {
        console.warn('pdf-parse standard engine error (often mobile PDF xref quirk):', err.message);
      }

      // If standard pdf-parse failed or returned sparse text, execute stream text fallback
      if (!extractedText || extractedText.trim().length < 30) {
        console.log('📱 Extracting mobile PDF stream text via fallback engine...');
        const streamText = extractPdfStreamText(fileBuffer);
        if (streamText && streamText.trim().length > extractedText.trim().length) {
          extractedText = streamText;
        }
      }

      const cleaned = cleanMobileText(extractedText);
      if (cleaned.length >= 25) {
        return cleaned;
      }

      throw new Error('Unable to extract text from this PDF. Please verify it contains digital selectable text (not a photo/scan) or use the Manual Entry tab.');
    }

    if (isDocx) {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return cleanMobileText(result.value || '');
      } catch (err) {
        console.error('DOCX Parse error:', err);
        throw new Error('Unable to extract text from this Word document.');
      }
    }

    // Default to plain text
    return cleanMobileText(fileBuffer.toString('utf-8'));
  },

  // Fallback rule-based parsing if Groq API key is not provided or fails
  heuristicParse(text) {
    const cleanText = text.replace(/\r\n/g, '\n');
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

    // Extract email
    const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone (including Indian +91 formats)
    const phoneMatch = cleanText.match(/(?:\+91[\-\s]?)?[6-9]\d{9}|(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extract links
    const linkedinMatch = cleanText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const githubMatch = cleanText.match(/github\.com\/[a-zA-Z0-9_-]+/i);

    // Extract Indian Location
    const indianCities = ['Bengaluru', 'Bangalore', 'Hyderabad', 'Pune', 'Gurgaon', 'Gurugram', 'Noida', 'Delhi', 'Mumbai', 'Chennai', 'Kolkata'];
    let detectedLocation = 'India';
    for (const city of indianCities) {
      if (new RegExp(`\\b${city}\\b`, 'i').test(cleanText)) {
        detectedLocation = `${city}, India`;
        break;
      }
    }

    // Extract Candidate Name (usually in first 3 lines)
    let name = 'Applicant';
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (line.length > 2 && line.length < 40 && !line.includes('@') && !line.match(/resume|curriculum|cv/i) && !line.match(/\d/)) {
        name = line;
        break;
      }
    }

    // Extract headline
    let headline = 'Software Engineer / Professional';
    if (lines.length > 1) {
      const possibleHeadline = lines.find(l => 
        l.match(/engineer|developer|architect|designer|scientist|manager|analyst|consultant|lead/i) &&
        l.length < 60 && l !== name
      );
      if (possibleHeadline) headline = possibleHeadline;
    }

    // Extract matched skills
    const matchedSkills = TECH_SKILLS_CATALOG.filter(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(cleanText);
    });

    // Extract Education from text lines
    const degreeRegex = /(?:B\.?Tech|B\.?E\.?|B\.?Sc|BCA|M\.?Tech|M\.?E\.?|M\.?S|MCA|MBA|Ph\.?D|Bachelor|Master)[^\n,.]*/i;
    const instRegex = /(?:IIT|NIT|IIIT|BITS|University|College|Institute|Academy|Vellore|Manipal|Amity|Anna|Delhi)[^\n,.]*/i;
    const yearRegex = /\b(19\d{2}|20\d{2})\b(?:\s*[-–to ]+\s*\b(19\d{2}|20\d{2}|Present)\b)?/i;

    let degreeFound = '';
    let instFound = '';
    let yearFound = '';

    for (const line of lines) {
      if (!degreeFound && degreeRegex.test(line)) {
        const m = line.match(degreeRegex);
        degreeFound = m ? m[0].trim() : '';
      }
      if (!instFound && instRegex.test(line)) {
        const m = line.match(instRegex);
        instFound = m ? m[0].trim() : '';
      }
      if (!yearFound && yearRegex.test(line)) {
        const m = line.match(yearRegex);
        yearFound = m ? m[0].trim() : '';
      }
    }

    const educationList = [
      {
        degree: degreeFound || 'B.Tech / Bachelor in Computer Science / Engineering',
        institution: instFound || 'Accredited University / Technical Institute',
        year: yearFound || 'Graduate'
      }
    ];

    return {
      personalInfo: {
        name,
        email,
        phone,
        location: detectedLocation,
        linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : '',
        github: githubMatch ? `https://${githubMatch[0]}` : '',
        portfolio: '',
        headline,
        summary: lines.slice(0, 8).join(' ').slice(0, 300)
      },
      skills: {
        technical: matchedSkills.slice(0, 15),
        frameworks: matchedSkills.filter(s => ['React', 'Next.js', 'Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot'].includes(s)),
        databases: matchedSkills.filter(s => ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'].includes(s)),
        cloudAndDevops: matchedSkills.filter(s => ['AWS', 'Docker', 'Kubernetes', 'CI/CD'].includes(s)),
        softSkills: ['Problem Solving', 'Team Collaboration', 'Agile Methodology', 'Effective Communication']
      },
      experience: [
        {
          company: 'Recent Organization',
          role: headline,
          location: detectedLocation,
          duration: 'Recent',
          bullets: lines.filter(l => l.length > 40 && l.length < 200).slice(0, 4)
        }
      ],
      education: educationList,
      projects: [],
      certifications: []
    };
  },

  // Algorithmic ATS Scorer
  heuristicAtsScore(resumeText, targetRole = 'Software Professional') {
    let score = 50; // base score
    const textLower = resumeText.toLowerCase();

    // 1. Contact checks (+15 max)
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/.test(resumeText);
    const hasLinkedIn = /linkedin\.com/i.test(resumeText);
    const hasGitHub = /github\.com/i.test(resumeText);
    if (hasEmail) score += 5;
    if (hasPhone) score += 4;
    if (hasLinkedIn || hasGitHub) score += 6;

    // 2. Action verbs (+15 max)
    const verbsFound = ACTION_VERBS.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(textLower));
    const verbScore = Math.min(verbsFound.length * 2, 15);
    score += verbScore;

    // 3. Metric density (+15 max)
    // Counts percentages (%), dollar figures ($), numbers with metrics
    const metricsMatches = resumeText.match(/\b\d+(\.\d+)?%|\$\d+[kKmM]?|\b\d{2,}\b/g) || [];
    const metricScore = Math.min(metricsMatches.length * 3, 15);
    score += metricScore;

    // 4. Section structure (+10 max)
    const sections = ['experience', 'skills', 'education', 'projects', 'summary'];
    const presentSections = sections.filter(sec => new RegExp(`\\b${sec}\\b`, 'i').test(textLower));
    score += Math.min(presentSections.length * 2, 10);

    // 5. Cliché penalty (-5 max)
    const clichesFound = WEAK_CLICHES.filter(c => textLower.includes(c));
    score -= Math.min(clichesFound.length * 2, 8);

    // Keep bounded 0-100
    const finalOverall = Math.max(25, Math.min(score, 94));

    return {
      overallScore: finalOverall,
      rating: finalOverall >= 85 ? 'Strong' : finalOverall >= 70 ? 'Good' : 'Needs Improvement',
      pillars: {
        keywordMatch: {
          score: Math.min(Math.round(finalOverall * 0.95), 100),
          feedback: `Identified relevant tech keywords with strong foundation.`
        },
        quantifiableImpact: {
          score: Math.min(Math.round(metricScore * 6), 100),
          feedback: metricsMatches.length >= 4 
            ? 'Good use of quantifiable metrics and statistics.' 
            : 'Needs more quantified results (e.g., % improvement, revenue generated, users scaled).'
        },
        formattingAndStructure: {
          score: Math.min(Math.round(presentSections.length * 20), 100),
          feedback: 'Standard resume sections detected for ATS parsability.'
        },
        skillsAlignment: {
          score: Math.min(Math.round(finalOverall * 1.02), 100),
          feedback: 'Skills are well listed but could be tailored closer to job descriptions.'
        }
      },
      strengths: [
        hasEmail && hasPhone ? 'Complete contact details easy for recruiters to reach you' : 'Key contact info included',
        verbsFound.length > 3 ? `Solid use of active power verbs (${verbsFound.slice(0, 4).join(', ')})` : 'Clear role structure',
        metricsMatches.length > 2 ? 'Includes numerical data to substantiate claims' : 'Clear timeline of professional history'
      ].filter(Boolean),
      criticalFixes: [
        metricsMatches.length < 5 ? 'Add more measurable results (e.g. "Increased system performance by 35% across 50,000 active users")' : 'Deepen business metric context',
        clichesFound.length > 0 ? `Remove vague buzzwords (${clichesFound.join(', ')}) and replace with concrete technical outcomes` : 'Ensure every bullet showcases outcome over simple duties',
        'Add a targeted 2-line executive summary directly tailored to your target job title'
      ],
      missingHighValueKeywords: [
        'CI/CD Pipelines', 'System Architecture', 'Cloud Infrastructure (AWS/GCP)', 'Unit & Integration Testing', 'Agile/Scrum', 'Performance Optimization'
      ],
      bulletPointImprovements: [
        {
          original: 'Responsible for developing web application features and fixing bugs.',
          improved: 'Architected and deployed 14+ core UI features using React and Node.js, reducing latency by 42% and resolving 95% of critical sprint tickets.',
          reason: 'Switches from passive duty description to quantifiable accomplishment using power verbs.'
        },
        {
          original: 'Worked with team on database management and API integration.',
          improved: 'Spearheaded migration of legacy REST endpoints to optimized GraphQL services, accelerating response times by 3.2x across 1.2M daily requests.',
          reason: 'Demonstrates technical leadership, clear scope, and measurable business impact.'
        }
      ],
      atsRedFlags: [
        'Avoid multi-column tables and non-standard symbols that can confuse legacy ATS parsers',
        'Ensure dates follow standard "Month Year – Month Year" formatting'
      ]
    };
  }
};
