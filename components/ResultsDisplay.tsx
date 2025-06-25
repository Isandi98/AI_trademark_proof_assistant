import React from 'react';
import type { ArticleResult, GroundingChunkWeb, ArticlesByYear } from '../types';

interface ResultsDisplayProps {
  articles: ArticleResult[];
  sources: GroundingChunkWeb[];
  searchParams: import('../types').SearchParameters | null;
}

// Group articles by year
const groupArticlesByYear = (articles: ArticleResult[]): ArticlesByYear => {
  const grouped: ArticlesByYear = {};
  
  articles.forEach(article => {
    // All articles should have valid dates at this point
    const dateObj = new Date(article.date);
    const year = dateObj.getFullYear().toString();
    
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(article);
  });
  
  return grouped;
};

// Convert markdown-style bold text to HTML
const formatSnippet = (snippet: string): string => {
  return snippet.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400 bg-amber-400/10 px-1 rounded">$1</strong>');
};

// Render relevance stars
const RelevanceStars: React.FC<{ score: number; details?: ArticleResult['relevanceDetails'] }> = ({ score, details }) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`w-4 h-4 ${i <= score ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.448a1 1 0 00-.364 1.118l1.286 3.958c.3.921-.755 1.688-1.54 1.118l-3.367-2.448a1 1 0 00-1.175 0l-3.367 2.448c-.785.57-1.84-.197-1.54-1.118l1.286-3.958a1 1 0 00-.364-1.118L2.049 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
      </svg>
    );
  }
  
  return (
    <div className="flex items-center space-x-1">
      <div className="flex">{stars}</div>
      <span className="text-xs text-slate-400 ml-2">
        {score}/5 relevancia
      </span>
      {details && (
        <div className="ml-2 text-xs text-slate-500">
          ({details.keywordFrequency} menciones, {details.contextRelevance === 'high' ? 'alta' : details.contextRelevance === 'medium' ? 'media' : 'baja'} importancia)
        </div>
      )}
    </div>
  );
};

// Render date with source information
const DateWithSource: React.FC<{ date: string; dateSource?: string; sourceCodeLink?: string }> = ({ 
  date, 
  dateSource, 
  sourceCodeLink 
}) => {
  const getSourceIcon = () => {
    switch (dateSource) {
      case 'metadata':
        return (
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'content':
        return (
          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
          </svg>
        );
      case 'source-code':
        return (
          <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getSourceLabel = () => {
    switch (dateSource) {
      case 'metadata': return 'metadatos';
      case 'content': return 'contenido';
      case 'source-code': return 'código fuente';
      default: return 'no encontrada';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-xs text-slate-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>{date}</span>
      <div className="flex items-center space-x-1">
        {getSourceIcon()}
        <span className="text-xs">
          {dateSource === 'source-code' && sourceCodeLink ? (
            <a 
              href={sourceCodeLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              {getSourceLabel()}
            </a>
          ) : (
            getSourceLabel()
          )}
        </span>
      </div>
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ articles, sources, searchParams }) => {
  if (!articles.length && !sources.length) {
    return (
      <div className="text-center py-10 bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 mt-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
        <p className="mt-4 text-xl text-slate-300">No se encontraron artículos que coincidan con tus criterios.</p>
        <p className="text-sm text-slate-400">
          Intenta ampliar el rango de fechas o verificar que la marca aparezca exactamente como se escribió.
        </p>
      </div>
    );
  }

  const articlesByYear = groupArticlesByYear(articles);
  const years = Object.keys(articlesByYear).sort((a, b) => {
    return parseInt(b) - parseInt(a); // Sort years in descending order
  });

  // Calculate relevance distribution
  const relevanceStats = articles.reduce((stats, article) => {
    const score = article.relevanceScore || 1;
    stats[score] = (stats[score] || 0) + 1;
    return stats;
  }, {} as Record<number, number>);

  return (
    <div className="mt-8 space-y-8">
      {articles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-sky-400 pb-2 border-b-2 border-sky-700/50">
              Artículos Encontrados
            </h2>
            <div className="flex items-center space-x-4">
              <div className="bg-sky-600/20 text-sky-300 px-4 py-2 rounded-full border border-sky-600/30">
                <span className="font-semibold">{articles.length}</span> resultados
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                                  <div className="flex items-center space-x-2">
                    <span>Relevancia:</span>
                    {[5, 4, 3, 2, 1].map(score => (
                      <div key={score} className="flex items-center space-x-1">
                        <span className="text-yellow-400">{'★'.repeat(score)}</span>
                        <span>({relevanceStats[score] || 0})</span>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {years.map((year) => (
              <div key={year} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                {/* Year Header */}
                <div className="bg-gradient-to-r from-sky-600/20 to-cyan-600/20 border-b border-sky-700/30 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-sky-300">{year}</h3>
                    <div className="flex items-center space-x-4">
                      <span className="bg-sky-600/30 text-sky-200 px-3 py-1 rounded-full text-sm font-medium">
                        {articlesByYear[year].length} artículo{articlesByYear[year].length !== 1 ? 's' : ''}
                      </span>
                      <div className="text-xs text-slate-400">
                        Relevancia promedio: {(articlesByYear[year].reduce((sum, article) => sum + (article.relevanceScore || 1), 0) / articlesByYear[year].length).toFixed(1)} ★
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Articles for this year */}
                <div className="p-6 space-y-4">
                  {articlesByYear[year].map((article, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 hover:shadow-sky-500/20 hover:border-sky-700/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-sky-300 flex-1 mr-4">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-sky-200 hover:underline transition-colors duration-200"
                          >
                            {article.headline}
                          </a>
                        </h4>
                        <div className="flex flex-col items-end space-y-2">
                          <DateWithSource 
                            date={article.date} 
                            dateSource={article.dateSource}
                            sourceCodeLink={article.sourceCodeLink}
                          />
                          <RelevanceStars 
                            score={article.relevanceScore || 1} 
                            details={article.relevanceDetails}
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-400 mb-3 flex flex-wrap gap-4">
                        <span><strong>Idioma:</strong> {article.language || searchParams?.language || 'N/A'}</span>
                        <span><strong>País:</strong> {article.country || searchParams?.country || 'N/A'}</span>
                        <span><strong>Marca:</strong> <span className="font-semibold text-amber-400">"{article.trademark}"</span></span>
                        {article.relevanceDetails && (
                          <span><strong>Contexto:</strong> {article.relevanceDetails.isMainContent ? 'Contenido principal' : 'Mención auxiliar'}</span>
                        )}
                      </div>
                      
                      <div className="bg-slate-700/50 p-4 rounded-md mb-4">
                        <p className="text-slate-300">
                          <strong className="text-sky-300">Extracto:</strong>
                        </p>
                        <p 
                          className="text-slate-300 italic mt-2"
                          dangerouslySetInnerHTML={{ __html: formatSnippet(article.snippet || 'N/A') }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-sky-400 hover:text-sky-300 hover:underline transition-colors duration-200 text-sm font-medium"
                        >
                          <span>Leer artículo completo</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        
                        <div className="text-xs text-slate-500">
                          Resultado #{index + 1} de {year}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-sky-400 mb-4 pb-2 border-b-2 border-sky-700/50">
            Fuentes Referenciadas de Google Search ({sources.length})
          </h2>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <ul className="space-y-3">
              {sources.map((source, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="bg-sky-600/20 text-sky-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 hover:underline transition-colors duration-200 flex-1"
                    title={source.title || source.uri}
                  >
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 mt-4 italic">
              Estas son fuentes identificadas por Google Search durante el proceso. Los artículos anteriores son interpretaciones de la IA basadas en estos y otros hallazgos.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default ResultsDisplay;
