
import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";
import type { SearchParameters, ArticleResult, GroundingChunkWeb } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

// Ensure API_KEY is handled by the build/environment system
// For local development, you might use a .env file and a bundler like Vite/Webpack
// Or, in some environments, process.env might be directly available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please ensure the API_KEY environment variable is configured.");
  // Potentially throw an error or handle this state in the UI
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Non-null assertion, assuming API_KEY will be present

const parseGeminiResponse = (responseText: string, searchParams: SearchParameters): ArticleResult[] => {
  if (responseText.trim().toLowerCase().startsWith('no articles found')) {
    return [];
  }

  const articles: ArticleResult[] = [];
  const articleBlocks = responseText.split('---ARTICLE---').map(block => block.trim()).filter(block => block.length > 0);

  for (const block of articleBlocks) {
    const lines = block.split('\n').map(line => line.trim());
    const article: Partial<ArticleResult> = {
      trademark: searchParams.trademark,
      // Language and Country are part of the search query, but Gemini is asked to restate them.
      // If not restated, we can default to searchParams.
      language: searchParams.language, 
      country: searchParams.country,
    };

    lines.forEach(line => {
      if (line.startsWith('HEADLINE:')) article.headline = line.substring('HEADLINE:'.length).trim();
      else if (line.startsWith('DATE:')) article.date = line.substring('DATE:'.length).trim();
      else if (line.startsWith('SNIPPET:')) article.snippet = line.substring('SNIPPET:'.length).trim();
      else if (line.startsWith('URL:')) article.url = line.substring('URL:'.length).trim();
      else if (line.startsWith('LANGUAGE:')) article.language = line.substring('LANGUAGE:'.length).trim(); // Override if Gemini specifies
      else if (line.startsWith('COUNTRY:')) article.country = line.substring('COUNTRY:'.length).trim(); // Override if Gemini specifies
    });
    
    // Basic validation: ensure essential fields are present
    if (article.headline && article.date && article.snippet && article.url) {
      articles.push(article as ArticleResult);
    } else {
      console.warn("Skipping partially parsed article block:", block, article);
    }
  }
  return articles;
};

export const fetchTrademarkArticles = async (
  params: SearchParameters
): Promise<{ articles: ArticleResult[]; sources: GroundingChunkWeb[] }> => {
  const { trademark, startDate, endDate, language, country } = params;

  // Find language label for the prompt
  const langLabel = language; // The prompt already accepts codes like 'en', 'es'. If full names are desired, map here.

  const prompt = `
You are an AI assistant specialized in Proof of Use of Trademarks.
Your task is to find articles using Google Search based on the following criteria:
Trademark: "${trademark}" (must appear verbatim)
Date Range: From ${startDate} to ${endDate}
Language: ${langLabel}
Country/Region of Origin: ${country}

For each relevant article found, please provide the information in the following format, with each piece of information on a new line, and each article separated by '---ARTICLE---':
HEADLINE: [Article Headline]
DATE: [Publication Date, e.g., YYYY-MM-DD or Month Day, Year]
SNIPPET: [A short quote from the article where the trademark "${trademark}" appears verbatim.]
URL: [Full URL of the article]
LANGUAGE: [Language of the article, e.g., English, Spanish]
COUNTRY: [Country of origin of the article, e.g., USA, UK]

If no articles are found matching all criteria, respond with 'No articles found matching the criteria.'
Ensure the trademark term "${trademark}" appears verbatim in the snippet.
Prioritize sources that are clearly news articles, official publications, or reputable industry websites.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Do NOT use responseMimeType: "application/json" with googleSearch
      },
    });

    const responseText = response.text;
    const articles = parseGeminiResponse(responseText, params);
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    let sources: GroundingChunkWeb[] = [];
    if (groundingMetadata?.groundingChunks && Array.isArray(groundingMetadata.groundingChunks)) {
      sources = groundingMetadata.groundingChunks
        .filter((chunk: GroundingChunk) => chunk.web && chunk.web.uri && chunk.web.title)
        .map((chunk: GroundingChunk) => chunk.web as GroundingChunkWeb);
    }
    
    return { articles, sources };

  } catch (error) {
    console.error("Error fetching trademark articles from Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch articles: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching articles.");
  }
};
