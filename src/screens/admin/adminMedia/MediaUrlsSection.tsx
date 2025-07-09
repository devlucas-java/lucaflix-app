import React from 'react';
import { Type } from '../../../types/mediaTypes';

interface MediaUrlsSectionProps {
  type: Type;
  formData: {
    embed1: string;
    embed2: string;
    trailer: string;
    posterURL1: string;
    posterURL2: string;
    backdropURL1: string;
    backdropURL2: string;
    logoURL1: string;
    logoURL2: string;
    tmdbId: string;
    imdbId: string;
  };
  onInputChange: (field: string, value: any) => void;
}

export const MediaUrlsSection: React.FC<MediaUrlsSectionProps> = ({
  type,
  formData,
  onInputChange
}) => {
  const isMovie = type === Type.MOVIE;
  const isAnime = type === Type.ANIME;
  const showEmbeds = isMovie || isAnime;

  return (
    <>
      {/* External IDs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">IDs Externos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TMDB ID
            </label>
            <input
              type="text"
              value={formData.tmdbId}
              onChange={(e) => onInputChange('tmdbId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="ID do The Movie Database"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IMDB ID
            </label>
            <input
              type="text"
              value={formData.imdbId}
              onChange={(e) => onInputChange('imdbId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="ID do Internet Movie Database"
            />
          </div>
        </div>
      </div>

      {/* Media URLs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">URLs de Mídia</h2>
        
        <div className="space-y-6">
          {/* Embed URLs - Only for movies and anime */}
          {showEmbeds && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Embed 1
                </label>
                <input
                  type="url"
                  value={formData.embed1}
                  onChange={(e) => onInputChange('embed1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Embed 2
                </label>
                <input
                  type="url"
                  value={formData.embed2}
                  onChange={(e) => onInputChange('embed2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {/* Trailer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trailer
            </label>
            <input
              type="url"
              value={formData.trailer}
              onChange={(e) => onInputChange('trailer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="https://youtube.com/..."
            />
          </div>

          {/* Posters and Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poster 1
              </label>
              <input
                type="url"
                value={formData.posterURL1}
                onChange={(e) => onInputChange('posterURL1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poster 2
              </label>
              <input
                type="url"
                value={formData.posterURL2}
                onChange={(e) => onInputChange('posterURL2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backdrop 1
              </label>
              <input
                type="url"
                value={formData.backdropURL1}
                onChange={(e) => onInputChange('backdropURL1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backdrop 2
              </label>
              <input
                type="url"
                value={formData.backdropURL2}
                onChange={(e) => onInputChange('backdropURL2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo 1
              </label>
              <input
                type="url"
                value={formData.logoURL1}
                onChange={(e) => onInputChange('logoURL1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo 2
              </label>
              <input
                type="url"
                value={formData.logoURL2}
                onChange={(e) => onInputChange('logoURL2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};