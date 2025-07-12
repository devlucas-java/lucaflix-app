import AsyncStorage from '@react-native-async-storage/async-storage';
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

// ===== CONSTANTES PARA ASYNCSTORAGE =====
const LIKED_MOVIES_KEY = 'likedMovies';
const LIKED_SERIES_KEY = 'likedSeries';
const LIKED_ANIMES_KEY = 'likedAnimes';
const MY_LIST_MOVIES_KEY = 'myListMovies';
const MY_LIST_SERIES_KEY = 'myListSeries';
const MY_LIST_ANIMES_KEY = 'myListAnimes';

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

// ===== FUNÇÕES AUXILIARES PARA ASYNCSTORAGE =====

const getStorageKey = (media: any, type: 'like' | 'myList'): string => {
  if (isMovie(media)) {
    return type === 'like' ? LIKED_MOVIES_KEY : MY_LIST_MOVIES_KEY;
  } else if (isSerie(media)) {
    return type === 'like' ? LIKED_SERIES_KEY : MY_LIST_SERIES_KEY;
  } else if (isAnime(media)) {
    return type === 'like' ? LIKED_ANIMES_KEY : MY_LIST_ANIMES_KEY;
  }
  throw new Error('Tipo de mídia não reconhecido');
};

const getStoredIds = async (storageKey: string): Promise<string[]> => {
  try {
    const storedData = await AsyncStorage.getItem(storageKey);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Erro ao recuperar dados do AsyncStorage:', error);
    return [];
  }
};

const saveStoredIds = async (storageKey: string, ids: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(ids));
  } catch (error) {
    console.error('Erro ao salvar dados no AsyncStorage:', error);
    throw error;
  }
};

const toggleIdInStorage = async (storageKey: string, mediaId: string): Promise<boolean> => {
  try {
    const currentIds = await getStoredIds(storageKey);
    const index = currentIds.indexOf(mediaId);
    
    if (index > -1) {
      // Remove se já existir
      currentIds.splice(index, 1);
      await saveStoredIds(storageKey, currentIds);
      return false; // Removido
    } else {
      // Adiciona se não existir
      currentIds.push(mediaId);
      await saveStoredIds(storageKey, currentIds);
      return true; // Adicionado
    }
  } catch (error) {
    console.error('Erro ao alterar dados no AsyncStorage:', error);
    throw error;
  }
};

// ===== FUNÇÕES DE MINHA LISTA/ LIKE =====

export const toggleLike = async (media: any): Promise<boolean> => {
  try {
    const mediaId = media.id.toString();
    const storageKey = getStorageKey(media, 'like');
    
    // Primeiro tenta com o serviço (se estiver online)
    let result: boolean;
    try {
      if (isMovie(media)) {
        result = await movieService.toggleLike(mediaId);
      } else if (isSerie(media)) {
        result = await serieService.toggleLike(mediaId);
      } else if (isAnime(media)) {
        result = await animeService.toggleLike(mediaId);
      } else {
        throw new Error('Tipo de mídia não reconhecido para toggle like');
      }
    } catch (serviceError) {
      console.warn('Serviço indisponível, usando AsyncStorage:', serviceError);
      // Fallback para AsyncStorage se o serviço falhar
      result = await toggleIdInStorage(storageKey, mediaId);
    }
    
    // Sempre sincroniza com AsyncStorage
    await toggleIdInStorage(storageKey, mediaId);
    
    return result;
  } catch (error) {
    console.error('Erro ao dar like na mídia:', error);
    throw error;
  }
};

export const toggleMyList = async (media: any): Promise<boolean> => {
  try {
    const mediaId = media.id.toString();
    const storageKey = getStorageKey(media, 'myList');
    
    // Primeiro tenta com o serviço (se estiver online)
    let result: boolean;
    try {
      if (isMovie(media)) {
        result = await movieService.toggleMyList(mediaId);
      } else if (isSerie(media)) {
        result = await serieService.toggleMyList(mediaId);
      } else if (isAnime(media)) {
        result = await animeService.toggleMyList(mediaId);
      } else {
        throw new Error('Tipo de mídia não reconhecido para toggle my list');
      }
    } catch (serviceError) {
      console.warn('Serviço indisponível, usando AsyncStorage:', serviceError);
      // Fallback para AsyncStorage se o serviço falhar
      result = await toggleIdInStorage(storageKey, mediaId);
    }
    
    // Sempre sincroniza com AsyncStorage
    await toggleIdInStorage(storageKey, mediaId);
    
    return result;
  } catch (error) {
    console.error('Erro ao adicionar a minha lista:', error);
    throw error;
  }
};

// ===== FUNÇÕES PARA VERIFICAR STATUS =====

export const isLiked = async (media: any): Promise<boolean> => {
  try {
    const mediaId = media.id.toString();
    const storageKey = getStorageKey(media, 'like');
    const likedIds = await getStoredIds(storageKey);
    return likedIds.includes(mediaId);
  } catch (error) {
    console.error('Erro ao verificar se mídia está curtida:', error);
    return false;
  }
};

export const isInMyList = async (media: any): Promise<boolean> => {
  try {
    const mediaId = media.id.toString();
    const storageKey = getStorageKey(media, 'myList');
    const myListIds = await getStoredIds(storageKey);
    return myListIds.includes(mediaId);
  } catch (error) {
    console.error('Erro ao verificar se mídia está na lista:', error);
    return false;
  }
};

// ===== FUNÇÕES PARA RECUPERAR LISTAS =====

export const getLikedMovies = async (): Promise<string[]> => {
  return await getStoredIds(LIKED_MOVIES_KEY);
};

export const getLikedSeries = async (): Promise<string[]> => {
  return await getStoredIds(LIKED_SERIES_KEY);
};

export const getLikedAnimes = async (): Promise<string[]> => {
  return await getStoredIds(LIKED_ANIMES_KEY);
};

export const getMyListMovies = async (): Promise<string[]> => {
  return await getStoredIds(MY_LIST_MOVIES_KEY);
};

export const getMyListSeries = async (): Promise<string[]> => {
  return await getStoredIds(MY_LIST_SERIES_KEY);
};

export const getMyListAnimes = async (): Promise<string[]> => {
  return await getStoredIds(MY_LIST_ANIMES_KEY);
};

// ===== FUNÇÕES PARA LIMPAR DADOS =====

export const clearAllLikes = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      LIKED_MOVIES_KEY,
      LIKED_SERIES_KEY,
      LIKED_ANIMES_KEY
    ]);
  } catch (error) {
    console.error('Erro ao limpar likes:', error);
    throw error;
  }
};

export const clearMyLists = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      MY_LIST_MOVIES_KEY,
      MY_LIST_SERIES_KEY,
      MY_LIST_ANIMES_KEY
    ]);
  } catch (error) {
    console.error('Erro ao limpar listas:', error);
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