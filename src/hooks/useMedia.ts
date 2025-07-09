import { useState, useEffect } from 'react';
import { movieService } from '../service/movieService';
import { serieService } from '../service/seriesService';
import { animeService } from '../service/animeService';
import type { 
  MovieCompleteDTO, 
  SerieCompleteDTO, 
  AnimeCompleteDTO 
} from '../types/mediaTypes';

type MediaCategory = 'movie' | 'serie' | 'anime';
type MediaComplete = MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO;

interface UseMediaReturn {
  media: MediaComplete | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch media data based on ID and category
 */
export const useMedia = (id: string | undefined, category: MediaCategory): UseMediaReturn => {
  const [media, setMedia] = useState<MediaComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!id) {
        setError('ID da mídia não fornecido');
        setLoading(false);
        return;
      }

      const mediaId = parseInt(id, 10);
      if (isNaN(mediaId)) {
        setError('ID da mídia inválido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let fetchedMedia: MediaComplete;

        switch (category) {
          case 'movie':
            fetchedMedia = await movieService.getMovieById(mediaId);
            break;
          case 'serie':
            fetchedMedia = await serieService.getSerieById(mediaId);
            break;
          case 'anime':
            fetchedMedia = await animeService.getAnimeById(mediaId);
            break;
          default:
            throw new Error(`Categoria de mídia não suportada: ${category}`);
        }

        setMedia(fetchedMedia);
      } catch (err) {
        console.error(`Error fetching ${category} with id ${mediaId}:`, err);
        
        // More specific error messages based on category
        let errorMessage = `Erro ao carregar ${
          category === 'movie' ? 'filme' : 
          category === 'serie' ? 'série' : 
          'anime'
        }`;
        
        if (err instanceof Error) {
          if (err.message.includes('404') || err.message.includes('not found')) {
            errorMessage = `${
              category === 'movie' ? 'Filme' : 
              category === 'serie' ? 'Série' : 
              'Anime'
            } não encontrado`;
          } else if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = 'Erro de conexão. Verifique sua internet.';
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [id, category]);

  return { media, loading, error };
};

/**
 * Helper function to determine media category from URL path
 */
export const getMediaCategoryFromPath = (pathname: string): MediaCategory => {
  if (pathname.includes('/movies/')) {
    return 'movie';
  } else if (pathname.includes('/series/')) {
    return 'serie';
  } else if (pathname.includes('/animes/')) {
    return 'anime';
  }
  
  // Fallback - try to determine from path segments
  const segments = pathname.split('/').filter(Boolean);
  const categorySegment = segments[0];
  
  switch (categorySegment) {
    case 'movies':
    case 'movie':
    case 'filme':
    case 'filmes':
      return 'movie';
    case 'series':
    case 'serie':
    case 'series':
      return 'serie';
    case 'animes':
    case 'anime':
      return 'anime';
    default:
      // Default fallback
      return 'movie';
  }
};

/**
 * Helper function to get media type display name
 */
export const getMediaTypeDisplayName = (category: MediaCategory): string => {
  switch (category) {
    case 'movie':
      return 'Filme';
    case 'serie':
      return 'Série';
    case 'anime':
      return 'Anime';
    default:
      return 'Mídia';
  }
};

/**
 * Helper function to get media route prefix
 */
export const getMediaRoutePrefix = (category: MediaCategory): string => {
  switch (category) {
    case 'movie':
      return '/movies';
    case 'serie':
      return '/series';
    case 'anime':
      return '/animes';
    default:
      return '/movies';
  }
};