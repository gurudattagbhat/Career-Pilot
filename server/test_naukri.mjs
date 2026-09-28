import axios from 'axios';
import * as cheerio from 'cheerio';

async function inspectNaukri() {
  const res = await axios.get('https://www.naukri.com/react-developer-jobs-in-bengaluru', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  const $ = cheerio.load(res.data);
  console.log('Title:', $('title').text());
  
  // Check for schema / ld+json
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const parsed = JSON.parse($(el).html());
      console.log(`LD+JSON ${i} type:`, parsed['@type'] || typeof parsed);
      if (Array.isArray(parsed)) {
        console.log(`Array length: ${parsed.length}`, parsed[0]?.['@type'], parsed[0]?.title);
      } else if (parsed.itemListElement) {
        console.log('itemListElement length:', parsed.itemListElement.length);
        console.log('Sample item:', parsed.itemListElement[0]);
      }
    } catch (e) {}
  });

  // Check scripts for job data
  $('script').each((i, el) => {
    const text = $(el).html() || '';
    if (text.includes('jobDetails') || text.includes('INITIAL_STATE') || text.includes('searchResult')) {
      console.log(`Script ${i} matches! Length: ${text.length}`);
      const preview = text.slice(0, 300);
      console.log('Preview:', preview);
    }
  });
}

inspectNaukri();
