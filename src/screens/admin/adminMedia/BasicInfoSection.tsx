import React from 'react';
import { Type } from '../../../types/mediaTypes';

interface BasicInfoSectionProps {
  type: Type;
  formData: {
    title: string;
    anoLancamento: number;
    duracaoMinutos?: number;
    totalTemporadas?: number;
    totalEpisodios?: number;
    sinopse: string;
    avaliacao: number;
    paisOrigen: string;
    minAge: string;
  };
  onInputChange: (field: string, value: any) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  type,
  formData,
  onInputChange
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const isMovie = type === Type.MOVIE;
  const isAnime = type === Type.ANIME;
  const isSerie = type === Type.SERIE;
  const mediaName = isMovie ? 'Filme' : isAnime ? 'Anime' : 'Série';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder={`Digite o título do ${mediaName.toLowerCase()}`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano de Lançamento *
          </label>
          <input
            type="number"
            value={formData.anoLancamento}
            onChange={(e) => onInputChange('anoLancamento', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            min="1900"
            max="2030"
            required
          />
        </div>

        {isMovie && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração (minutos) *
              {formData.duracaoMinutos && formData.duracaoMinutos > 0 && (
                <span className="text-gray-500 ml-2">({formatDuration(formData.duracaoMinutos)})</span>
              )}
            </label>
            <input
              type="number"
              value={formData.duracaoMinutos || ''}
              onChange={(e) => onInputChange('duracaoMinutos', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              min="1"
              required
            />
          </div>
        )}

        {(isAnime || isSerie) && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total de Temporadas
              </label>
              <input
                type="number"
                value={formData.totalTemporadas || ''}
                onChange={(e) => onInputChange('totalTemporadas', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total de Episódios
              </label>
              <input
                type="number"
                value={formData.totalEpisodios || ''}
                onChange={(e) => onInputChange('totalEpisodios', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                min="1"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avaliação (0-10)
          </label>
          <input
            type="number"
            value={formData.avaliacao}
            onChange={(e) => onInputChange('avaliacao', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            min="0"
            max="10"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            País de Origem
          </label>
          <input
            type="text"
            value={formData.paisOrigen}
            onChange={(e) => onInputChange('paisOrigen', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Brasil"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Idade Mínima
          </label>
          <select
            value={formData.minAge}
            onChange={(e) => onInputChange('minAge', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="L">Livre</option>
            <option value="10">10 anos</option>
            <option value="12">12 anos</option>
            <option value="14">14 anos</option>
            <option value="16">16 anos</option>
            <option value="18">18 anos</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sinopse
        </label>
        <textarea
          value={formData.sinopse}
          onChange={(e) => onInputChange('sinopse', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder={`Digite a sinopse do ${mediaName.toLowerCase()}...`}
        />
      </div>
    </div>
  );
};