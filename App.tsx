import React, { useState, useCallback } from 'react';
import TrademarkForm from './components/TrademarkForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { fetchTrademarkArticles } from './services/geminiService';
import { fetchGoogleSearchArticles } from './services/googleSearchService';
import type { SearchParameters, ArticleResult, GroundingChunkWeb } from './types';

const App: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParameters | null>(null);
  const [articles, setArticles] = useState<ArticleResult[]>([]);
  const [groundingSources, setGroundingSources] = useState<GroundingChunkWeb[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchSubmit = useCallback(async (params: SearchParameters) => {
    setIsLoading(true);
    setError(null);
    setArticles([]);
    setGroundingSources([]);
    setSearchParams(params); // Store current search params for display

    try {
      // First, try to get articles directly from Google Search
      console.log('Buscando artículos directamente con Google Search API...');
      const googleArticles = await fetchGoogleSearchArticles(params);
      
      if (googleArticles.length > 0) {
        console.log(`Encontrados ${googleArticles.length} artículos con Google Search`);
        setArticles(googleArticles);
      } else {
        console.log('No se encontraron artículos con Google Search, intentando con Gemini...');
        // Fallback to Gemini if Google Search returns no results
        const result = await fetchTrademarkArticles(params);
        setArticles(result.articles);
        setGroundingSources(result.sources);
      }
      
    } catch (err) {
      console.error("Error en la búsqueda:", err);
      
      // If Google Search fails, try Gemini as fallback
      try {
        console.log('Google Search falló, intentando con Gemini como respaldo...');
        const result = await fetchTrademarkArticles(params);
        setArticles(result.articles);
        setGroundingSources(result.sources);
        
        if (result.articles.length === 0 && result.sources.length === 0) {
          setError('No se encontraron artículos con ningún método de búsqueda.');
        }
      } catch (geminiErr) {
        console.error("Error con Gemini también:", geminiErr);
        if (geminiErr instanceof Error) {
          setError(`Error en la búsqueda: ${geminiErr.message}`);
        } else {
          setError('Ocurrió un error inesperado durante la búsqueda.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
            Asistente AI para Pruebas de Marcas
          </span>
        </h1>
        <p className="mt-3 text-lg text-slate-300 max-w-2xl mx-auto">
          Encuentra artículos y evidencias para la prueba de uso de marcas. Ingresa los detalles de tu marca para buscar menciones usando búsqueda directa de Google y IA.
        </p>
      </header>

      <main>
        <TrademarkForm onSubmit={handleSearchSubmit} isLoading={isLoading} />
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {!isLoading && !error && searchParams && (articles.length > 0 || groundingSources.length > 0) && (
          <ResultsDisplay articles={articles} sources={groundingSources} searchParams={searchParams}/>
        )}
         {!isLoading && !error && searchParams && articles.length === 0 && groundingSources.length === 0 && (
           <div className="text-center py-10 bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 mt-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <p className="mt-4 text-xl text-slate-300">No se encontraron artículos que coincidan con tus criterios.</p>
            <p className="text-sm text-slate-400">Intenta ampliar el rango de fechas o verificar que la marca aparezca exactamente como se escribió.</p>
          </div>
        )}
      </main>
      <footer className="text-center mt-12 py-6 border-t border-slate-700">
        <p className="text-sm text-slate-500">
          Impulsado por Google Search API y Google Gemini API. Los resultados son para fines informativos.
        </p>
      </footer>
    </div>
  );
};

export default App;
