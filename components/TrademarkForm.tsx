import React, { useState, useCallback } from 'react';
import type { SearchParameters } from '../types';
import { LANGUAGE_OPTIONS, COUNTRY_OPTIONS } from '../constants';

interface TrademarkFormProps {
  onSubmit: (params: SearchParameters) => void;
  isLoading: boolean;
}

const TrademarkForm: React.FC<TrademarkFormProps> = ({ onSubmit, isLoading }) => {
  const [trademark, setTrademark] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [language, setLanguage] = useState<string>(LANGUAGE_OPTIONS[0]?.value || 'en');
  const [selectedCountryOption, setSelectedCountryOption] = useState<string>(COUNTRY_OPTIONS[0]?.value || 'USA');
  const [customCountry, setCustomCountry] = useState<string>('');

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trademark.trim()) {
      alert("Por favor ingresa el nombre de la marca.");
      return;
    }
    if (!startDate || !endDate) {
      alert("Por favor selecciona ambas fechas de inicio y fin.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    let finalCountry = selectedCountryOption;
    if (selectedCountryOption === 'ELSEWHERE') {
      if (!customCountry.trim()) {
        alert("Por favor especifica el país para 'Otro'.");
        return;
      }
      finalCountry = customCountry.trim();
    }

    onSubmit({ trademark: trademark.trim(), startDate, endDate, language, country: finalCountry });
              }, [trademark, startDate, endDate, language, selectedCountryOption, customCountry, onSubmit]);

  const inputClass = "w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-slate-400 text-slate-100 transition-colors";
  const labelClass = "block text-sm font-medium text-sky-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700">
      <div>
        <label htmlFor="trademark" className={labelClass}>Nombre de la Marca / Nombre Comercial <span className="text-red-400">*</span></label>
        <input
          type="text"
          id="trademark"
          value={trademark}
          onChange={(e) => setTrademark(e.target.value)}
          className={inputClass}
          placeholder="ej. Coca-Cola, Google"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startDate" className={labelClass}>Buscar Artículos Desde <span className="text-red-400">*</span></label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass + " appearance-none"}
            required
          />
        </div>
        <div>
          <label htmlFor="endDate" className={labelClass}>Buscar Artículos Hasta <span className="text-red-400">*</span></label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass + " appearance-none"}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="language" className={labelClass}>Idioma del Artículo</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={inputClass}
        >
          {LANGUAGE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-slate-700 text-slate-100">{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="country" className={labelClass}>País/Región del Artículo</label>
        <select
          id="country"
          value={selectedCountryOption}
          onChange={(e) => setSelectedCountryOption(e.target.value)}
          className={inputClass}
        >
          {COUNTRY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-slate-700 text-slate-100">{opt.label}</option>
          ))}
        </select>
      </div>

      {selectedCountryOption === 'ELSEWHERE' && (
        <div>
          <label htmlFor="customCountry" className={labelClass}>Especificar País para 'Otro' <span className="text-red-400">*</span></label>
          <input
            type="text"
            id="customCountry"
            value={customCountry}
            onChange={(e) => setCustomCountry(e.target.value)}
            className={inputClass}
            placeholder="ej. Japón, Brasil"
            required={selectedCountryOption === 'ELSEWHERE'}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Buscando...
          </>
        ) : (
          'Buscar Pruebas de Uso'
        )}
      </button>
    </form>
  );
};

export default TrademarkForm;
