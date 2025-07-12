import { movieService } from '../service/movieService';
import { serieService } from '../service/seriesService';
import { animeService } from '../service/animeService';
import type { 
  MovieSimpleDTO, 
  SerieSimpleDTO, 
  AnimeSimpleDTO,
  PaginatedResponseDTO, 
  SerieCompleteDTO, 
  MovieCompleteDTO,
  AnimeCompleteDTO
} from '../types/mediaTypes';
import { Type } from '../types/mediaTypes';


// ===== FUNÇÕES DE FORMATAÇÃO DE DATA E TEMPO =====

export const formatYear = (date: Date | string): string => {
  return new Date(date).getFullYear().toString();
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

// ===== FUNÇÕES PARA DETECTAR TIPO DE MÍDIA =====

export const isMovie = (media: any): media is MovieSimpleDTO | MovieCompleteDTO => {
  return media.type === Type.MOVIE || 'duracaoMinutos' in media;
};

export const isSerie = (media: any): media is SerieSimpleDTO | SerieCompleteDTO => {
  return media.type === Type.SERIE || ('totalTemporadas' in media && !('embed1' in media && 'embed2' in media));
};

export const isAnime = (media: any): media is AnimeSimpleDTO | AnimeCompleteDTO => {
  return media.type === Type.ANIME || 
         (('totalTemporadas' in media || 'totalEpisodios' in media) && ('embed1' in media || 'embed2' in media));
};

// ===== FUNÇÕES DE MINHA LISTA/ LIKE =====

export const toggleLike = async (media: any): Promise<boolean> => {
  try {
    const mediaId = media.id;
    
    if (isMovie(media)) {
      return await movieService.toggleLike(mediaId);
    } else if (isSerie(media)) {
      return await serieService.toggleLike(mediaId);
    } else if (isAnime(media)) {
      return await animeService.toggleLike(mediaId);
    }
    
    throw new Error('Tipo de mídia não reconhecido para toggle like');
  } catch (error) {
    console.error('Erro ao dar like na mídia:', error);
    throw error;
  }
};

export const toggleMyList = async (media: any): Promise<boolean> => {
  try {
    const mediaId = media.id;
    
    if (isMovie(media)) {
      return await movieService.toggleMyList(mediaId);
    } else if (isSerie(media)) {
      return await serieService.toggleMyList(mediaId);
    } else if (isAnime(media)) {
      return await animeService.toggleMyList(mediaId);
    }
    
    throw new Error('Tipo de mídia não reconhecido para toggle my list');
  } catch (error) {
    console.error('Erro ao adicionar a minha lista:', error);
    throw error;
  }
};

/**
 * Buscar mídias similares (filmes, séries ou animes)
 */
export const getSimilar = async (
  media: any,
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponseDTO<MovieSimpleDTO> | PaginatedResponseDTO<SerieSimpleDTO> | PaginatedResponseDTO<AnimeSimpleDTO>> => {
  try {
    const mediaId = media.id;

    if (isMovie(media)) {
      return await movieService.getSimilarMovies(mediaId, page, size);
    } else if (isSerie(media)) {
      return await serieService.getSimilarSeries(mediaId, page, size);
    } else if (isAnime(media)) {
      return await animeService.getSimilarAnimes(mediaId, page, size);
    }

    throw new Error('Tipo de mídia não reconhecido para buscar similares');
  } catch (error) {
    console.error('Erro ao buscar mídias similares:', error);
    throw error;
  }
};

/**
 * Função para buscar media completa baseada no objeto simples
 */
export const getCompleteMediaData = async (
  media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO
): Promise<MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO> => {
  try {
    const mediaId = media.id;
    
    if (isMovie(media)) {
      return await movieService.getMovieById(mediaId);
    } else if (isSerie(media)) {
      return await serieService.getSerieById(mediaId);
    } else if (isAnime(media)) {
      return await animeService.getAnimeById(mediaId);
    }
    
    throw new Error('Tipo de mídia não reconhecido para getCompleteMediaData');
  } catch (error) {
    console.error('Erro ao buscar dados completos da media:', error);
    throw error;
  }
};

// ===== FUNÇÕES AUXILIARES =====

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const getMediaType = (media: any): 'movie' | 'serie' | 'anime' => {
  if (isMovie(media)) return 'movie';
  if (isSerie(media)) return 'serie';
  if (isAnime(media)) return 'anime';
  return 'movie'; // fallback
};

export const getMediaDuration = (media: any): string => {
  if (isMovie(media)) {
    return formatDuration(media.duracaoMinutos);
  } else if (isSerie(media)) {
    const temporadas = media.totalTemporadas;
    return `${temporadas} temporada${temporadas > 1 ? 's' : ''}`;
  } else if (isAnime(media)) {
    const temporadas = media.totalTemporadas;
    const episodios = media.totalEpisodios;
    
    if (temporadas && temporadas > 0) {
      return `${temporadas} temporada${temporadas > 1 ? 's' : ''}`;
    } else if (episodios && episodios > 0) {
      return `${episodios} episódio${episodios > 1 ? 's' : ''}`;
    }
    return 'Anime';
  }
  return '';
};


// ===== FUNÇÃO PARA CARREGAR MÍDIA POR ID =====

/**
 * Função universal para carregar qualquer tipo de mídia por ID
 * Tenta carregar como filme, série e anime até encontrar
 */
export const loadMediaById = async (id: number): Promise<{
  media: MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO;
  type: 'movie' | 'serie';
} | null> => {
  try {
    // Tenta carregar como filme
    try {
      const movieData = await movieService.getMovieById(id);
      return { media: movieData, type: 'movie' };
    } catch (movieError) {
      console.log('Não encontrado como filme, tentando série...');
    }

    // Tenta carregar como série
    try {
      const serieData = await serieService.getSerieById(id);
      return { media: serieData, type: 'serie' };
    } catch (serieError) {
      console.log('Não encontrado como série, tentando anime...');
    }

    return null;
  } catch (error) {
    console.error('Erro ao carregar mídia por ID:', error);
    return null;
  }
};