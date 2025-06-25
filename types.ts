export interface SearchParameters {
  trademark: string;
  startDate: string;
  endDate: string;
  language: string;
  country: string; // This will hold the final country value (e.g., "USA" or custom input)
}

export interface ArticleResult {
  headline: string;
  date: string;
  snippet: string;
  url: string;
  language: string;
  country: string;
  trademark: string;
  relevanceScore?: number; // 1-5 stars
  relevanceDetails?: {
    keywordFrequency: number;
    contextRelevance: 'high' | 'medium' | 'low';
    isMainContent: boolean;
  };
  dateSource?: 'metadata' | 'content' | 'source-code' | 'not-found';
  sourceCodeLink?: string; // Link to view source if date found in source code
}

// New type for articles grouped by year
export interface ArticlesByYear {
  [year: string]: ArticleResult[];
}

// Based on expected structure: response.candidates?.[0]?.groundingMetadata?.groundingChunks
// Each chunk often has a "web" property if it's a web source.
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
 web?: GroundingChunkWeb;
 // Gemini API might return other types of chunks, extend as needed
 // For example: retrievedContext?: { uri: string; title: string; }
 // We will focus on `web` for this app.
}
