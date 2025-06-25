import type { SearchParameters, ArticleResult } from '../types';

// Google Custom Search API credentials
const API_KEY = (import.meta as any).env?.VITE_GOOGLE_SEARCH_API_KEY;
const CX = (import.meta as any).env?.VITE_GOOGLE_SEARCH_CX;

if (!API_KEY || !CX) {
  console.error("Google Search API credentials not configured. Please set VITE_GOOGLE_SEARCH_API_KEY and VITE_GOOGLE_SEARCH_CX environment variables.");
}

interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  pagemap?: {
    metatags?: Array<{
      'article:published_time'?: string;
      'datePublished'?: string;
      'date'?: string;
      'dc.date'?: string;
      'og:updated_time'?: string;
      'publisheddate'?: string;
      'pubdate'?: string;
      'datemodified'?: string;
      'created'?: string;
      'lastmodified'?: string;
    }>;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  searchInformation?: {
    totalResults: string;
  };
}

// Calculate relevance score based on keyword frequency and context
const calculateRelevanceScore = (title: string, snippet: string, trademark: string): {
  score: number;
  details: {
    keywordFrequency: number;
    contextRelevance: 'high' | 'medium' | 'low';
    isMainContent: boolean;
  };
} => {
  const fullText = `${title} ${snippet}`.toLowerCase();
  const trademarkLower = trademark.toLowerCase();
  
  // Count exact matches (case insensitive)
  const exactMatches = (fullText.match(new RegExp(`\\b${trademarkLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')) || []).length;
  
  // Context analysis
  const titleContainsTrademark = title.toLowerCase().includes(trademarkLower);
  const isInFirstSentence = snippet.split('.')[0]?.toLowerCase().includes(trademarkLower);
  
  // Determine context relevance
  let contextRelevance: 'high' | 'medium' | 'low' = 'low';
  let isMainContent = false;
  
  if (titleContainsTrademark) {
    contextRelevance = 'high';
    isMainContent = true;
  } else if (isInFirstSentence) {
    contextRelevance = 'medium';
    isMainContent = true;
  } else if (exactMatches >= 2) {
    contextRelevance = 'medium';
  }
  
  // Calculate score (1-5 stars)
  let score = 1;
  
  // Base score from frequency
  if (exactMatches >= 3) score = 3;
  else if (exactMatches >= 2) score = 2;
  
  // Bonus for context
  if (contextRelevance === 'high') score += 2;
  else if (contextRelevance === 'medium') score += 1;
  
  // Cap at 5
  score = Math.min(5, score);
  
  return {
    score,
    details: {
      keywordFrequency: exactMatches,
      contextRelevance,
      isMainContent
    }
  };
};

// Enhanced date extraction with better source tracking
const extractDateWithSource = async (item: GoogleSearchItem): Promise<{
  date: string;
  source: 'metadata' | 'content' | 'source-code' | 'not-found';
  sourceCodeLink?: string;
}> => {
  // Try to get date from metadata first
  if (item.pagemap?.metatags) {
    for (const meta of item.pagemap.metatags) {
      const dateFields = [
        meta['article:published_time'],
        meta['datePublished'],
        meta['date'],
        meta['dc.date'],
        meta['og:updated_time'],
        meta['publisheddate'],
        meta['pubdate'],
        meta['datemodified'],
        meta['created'],
        meta['lastmodified']
      ];
      
      for (const dateField of dateFields) {
        if (dateField) {
          const parsedDate = new Date(dateField);
          if (!isNaN(parsedDate.getTime())) {
            return {
              date: parsedDate.toISOString().split('T')[0],
              source: 'metadata'
            };
          }
        }
      }
    }
  }
  
  // Try to extract date from snippet or title using regex
  const text = `${item.title} ${item.snippet}`;
  const datePatterns = [
    // Spanish dates
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i,
    /(\d{1,2})\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})/i,
    // English dates
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
    // ISO and other formats
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{1,2})-(\d{1,2})-(\d{4})/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let dateStr = '';
        if (pattern.source.includes('enero|febrero')) {
          // Spanish months
          const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          const monthIndex = months.indexOf(match[2].toLowerCase()) + 1;
          dateStr = `${match[3]}-${monthIndex.toString().padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        } else if (pattern.source.includes('january|february')) {
          // English months
          const months = ['january', 'february', 'march', 'april', 'may', 'june',
                         'july', 'august', 'september', 'october', 'november', 'december'];
          const monthIndex = months.indexOf(match[1].toLowerCase()) + 1;
          dateStr = `${match[3]}-${monthIndex.toString().padStart(2, '0')}-${match[2].padStart(2, '0')}`;
        } else {
          dateStr = match[0];
        }
        
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          return {
            date: parsedDate.toISOString().split('T')[0],
            source: 'content'
          };
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  // Try to fetch source code and look for dates there
  try {
    console.log(`Buscando fecha en código fuente de: ${item.link}`);
    const sourceCodeResult = await fetchSourceCodeDate(item.link);
    if (sourceCodeResult.found) {
      return {
        date: sourceCodeResult.date,
        source: 'source-code',
        sourceCodeLink: `view-source:${item.link}`
      };
    }
  } catch (error) {
    console.warn(`No se pudo acceder al código fuente de ${item.link}:`, error);
  }
  
  return {
    date: 'Fecha no disponible',
    source: 'not-found'
  };
};

// Fetch and analyze source code for date information
const fetchSourceCodeDate = async (url: string): Promise<{ found: boolean; date: string }> => {
  try {
    // Note: Due to CORS restrictions, this might not work for all sites
    // In a real implementation, you might need a proxy server
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrademarkBot/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Look for common date patterns in HTML
    const htmlDatePatterns = [
      /<time[^>]*datetime="([^"]*)"[^>]*>/i,
      /<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i,
      /<meta[^>]*name="date"[^>]*content="([^"]*)"[^>]*>/i,
      /<meta[^>]*name="publishdate"[^>]*content="([^"]*)"[^>]*>/i,
      /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/is
    ];
    
    for (const pattern of htmlDatePatterns) {
      const match = html.match(pattern);
      if (match) {
        let dateValue = match[1];
        
        // Special handling for JSON-LD
        if (pattern.source.includes('ld+json')) {
          try {
            const jsonLd = JSON.parse(match[1]);
            dateValue = jsonLd.datePublished || jsonLd.dateCreated || jsonLd.dateModified;
          } catch (e) {
            continue;
          }
        }
        
        if (dateValue) {
          const parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            return {
              found: true,
              date: parsedDate.toISOString().split('T')[0]
            };
          }
        }
      }
    }
    
    return { found: false, date: '' };
  } catch (error) {
    console.warn('Error fetching source code:', error);
    return { found: false, date: '' };
  }
};

// Check if text contains the trademark verbatim
const containsTrademarkVerbatim = (text: string, trademark: string): boolean => {
  // Create regex with word boundaries to match exact trademark
  const regex = new RegExp(`\\b${trademark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  return regex.test(text);
};

// Highlight trademark in text
const highlightTrademark = (text: string, trademark: string): string => {
  const regex = new RegExp(`\\b(${trademark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
  return text.replace(regex, `**$1**`);
};

export const fetchGoogleSearchArticles = async (
  params: SearchParameters
): Promise<ArticleResult[]> => {
  const { trademark, startDate, endDate, language, country } = params;
  
  if (!API_KEY || !CX) {
    throw new Error("Google Search API credentials not configured");
  }

  const articles: ArticleResult[] = [];
  const maxPages = 10; // Fetch up to 100 results (10 pages × 10 results)
  
  try {
    // Build search query with date restrictions for efficiency
    let query = `"${trademark}"`;
    
    // Add date range to focus search
    if (startDate && endDate) {
      query += ` after:${startDate} before:${endDate}`;
    }
    
    // Add language filter
    if (language && language !== 'en') {
      query += ` site:${getLanguageSites(language)}`;
    }
    
    // Add country filter (skip if 'ALL' is selected)
    if (country && country !== 'ALL') {
      query += ` ${getCountryFilter(country)}`;
    }

    // Fetch multiple pages
    for (let page = 0; page < maxPages; page++) {
      const start = page * 10 + 1;
      
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', API_KEY);
      url.searchParams.set('cx', CX);
      url.searchParams.set('q', query);
      url.searchParams.set('start', start.toString());
      url.searchParams.set('num', '10');
      
      // Add dateRestrict for more focused results
      if (startDate && endDate) {
        const daysDiff = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        url.searchParams.set('dateRestrict', `d${daysDiff}`);
      }
      
      console.log(`Fetching page ${page + 1} with query: ${query}`);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limit reached, stopping search');
          break;
        }
        throw new Error(`Google Search API error: ${response.status} ${response.statusText}`);
      }
      
      const data: GoogleSearchResponse = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.log(`No more results found on page ${page + 1}`);
        break;
      }
      
      // Process results with enhanced analysis
      for (const item of data.items) {
        const fullText = `${item.title} ${item.snippet}`;
        
        // Check if trademark appears verbatim
        if (containsTrademarkVerbatim(fullText, trademark)) {
          console.log(`Analizando relevancia y fecha para: ${item.title}`);
          
          // Calculate relevance score
          const relevanceAnalysis = calculateRelevanceScore(item.title, item.snippet, trademark);
          
          // Extract date with source tracking
          const dateAnalysis = await extractDateWithSource(item);
          
          // Only include articles with valid dates within range
          if (dateAnalysis.date === 'Fecha no disponible') {
            console.log(`Artículo descartado - sin fecha válida: ${item.title}`);
            continue;
          }
          
          // Validate date is within range
          const itemDate = new Date(dateAnalysis.date);
          const startDateObj = new Date(startDate);
          const endDateObj = new Date(endDate);
          
          if (itemDate < startDateObj || itemDate > endDateObj) {
            console.log(`Artículo descartado - fuera del rango de fechas: ${dateAnalysis.date}`);
            continue;
          }
          
          const article: ArticleResult = {
            headline: item.title,
            date: dateAnalysis.date,
            snippet: highlightTrademark(item.snippet, trademark),
            url: item.link,
            language: language,
            country: country,
            trademark: trademark,
            relevanceScore: relevanceAnalysis.score,
            relevanceDetails: relevanceAnalysis.details,
            dateSource: dateAnalysis.source,
            sourceCodeLink: dateAnalysis.sourceCodeLink
          };
          
          articles.push(article);
        }
      }
      
      // Add delay to avoid rate limiting
      if (page < maxPages - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay for source code fetching
      }
    }
    
    // Sort by relevance score first, then by date
    return articles.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      }
      // If same relevance, sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
  } catch (error) {
    console.error("Error fetching from Google Search API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching articles");
  }
};

// Helper function to get language-specific sites
const getLanguageSites = (language: string): string => {
  const languageSites = {
    'es': '.es OR .mx OR .ar OR .co OR .pe OR .cl OR .ve OR .ec OR .bo OR .py OR .uy',
    'fr': '.fr OR .ca OR .be OR .ch',
    'de': '.de OR .at OR .ch',
    'it': '.it OR .ch',
    'pt': '.br OR .pt'
  };
  
  return languageSites[language as keyof typeof languageSites] || '';
};

// Helper function to get country-specific filters
const getCountryFilter = (country: string): string => {
  const countryFilters = {
    'USA': 'site:.com OR site:.us OR site:.gov OR site:.edu',
    'EU': 'site:.eu OR site:.de OR site:.fr OR site:.it OR site:.es OR site:.nl OR site:.be',
    'UK': 'site:.uk OR site:.co.uk',
    'CA': 'site:.ca',
    'AU': 'site:.au',
    'MX': 'site:.mx',
    'ES': 'site:.es',
    'FR': 'site:.fr',
    'DE': 'site:.de',
    'IT': 'site:.it',
    'AR': 'site:.ar',
    'CO': 'site:.co',
    'PE': 'site:.pe',
    'CL': 'site:.cl',
    'BR': 'site:.br'
  };
  
  return countryFilters[country as keyof typeof countryFilters] || '';
}; 