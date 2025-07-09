// ========== Types compatíveis com o Backend Spring Boot ==========

/**
 * DTO principal que contém todas as estatísticas
 * Baseado no AllStatsDTO.java do backend
 */
export interface AllStatsDTO {
  general: GeneralStatsDTO;
  movies: MovieStatsDTO;
  series: SerieStatsDTO;
  animes: AnimeStatsDTO;
  tvs: TvStatsDTO;
  users: UserStatsDTO;
}

/**
 * Estatísticas gerais do sistema
 * Baseado no AllStatsDTO.GeneralStatsDTO do backend
 */
export interface GeneralStatsDTO {
  totalMovies: number;
  totalSeries: number;
  totalAnimes: number;
  totalTvs: number;
  totalUsers: number;
  totalLikes: number;
  totalListItems: number;
  lastUpdate: string; // Date serializada como string
}

/**
 * Estatísticas de filmes
 * Baseado no AllStatsDTO.MovieStatsDTO do backend
 */
export interface MovieStatsDTO {
  totalMovies: number;
  averageRating: number;
  
  // Por qualidade
  highRatedMovies: number;    // >= 8.0
  mediumRatedMovies: number;  // 6.0 - 7.9
  lowRatedMovies: number;     // < 6.0
  
  // Engagement
  totalLikes: number;
  averageLikesPerMovie: number;
  totalListItems: number;
  averageListItemsPerMovie: number;
}

/**
 * Estatísticas de séries
 * Baseado no AllStatsDTO.SerieStatsDTO do backend
 */
export interface SerieStatsDTO {
  totalSeries: number;
  averageRating: number;
  
  // Por qualidade
  highRatedSeries: number;    // >= 8.0
  mediumRatedSeries: number;  // 6.0 - 7.9
  lowRatedSeries: number;     // < 6.0
  
  // Engagement
  totalLikes: number;
  averageLikesPerSerie: number;
  totalListItems: number;
  averageListItemsPerSerie: number;
}

/**
 * Estatísticas de animes
 * Baseado no AllStatsDTO.AnimeStatsDTO do backend
 */
export interface AnimeStatsDTO {
  totalAnimes: number;
  averageRating: number;
  
  // Por qualidade
  highRatedAnimes: number;    // >= 8.0
  mediumRatedAnimes: number;  // 6.0 - 7.9
  lowRatedAnimes: number;     // < 6.0
  
  // Engagement
  totalLikes: number;
  averageLikesPerAnime: number;
  totalListItems: number;
  averageListItemsPerAnime: number;
}

/**
 * Estatísticas de TV
 * Baseado no AllStatsDTO.TvStatsDTO do backend
 */
export interface TvStatsDTO {
  totalTvs: number;
  totalLikes: number;
  averageLikesPerTv: number;
}

/**
 * Estatísticas de usuários
 * Baseado no AllStatsDTO.UserStatsDTO do backend
 */
export interface UserStatsDTO {
  totalUsers: number;
  activeUsers: number;
  usersWithLists: number;
  userEngagementRate: number; // % de usuários com listas
  
  // Atividade média
  averageLikesPerUser: number;
  averageListItemsPerUser: number;
}

// ========== Types para filtros e parâmetros ==========

/**
 * Tipos de estatísticas disponíveis
 */
export type StatsType = 'movie' | 'anime' | 'serie' | 'tv';

/**
 * Filtros para busca de estatísticas
 */
export interface StatsFilter {
  type: StatsType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ========== Constantes do sistema ==========

/**
 * Endpoints da API de estatísticas
 */
export const STATS_ENDPOINTS = {
  GENERAL: '/api/admin/stats/general',
  MOVIES: '/api/admin/stats/movies',
  SERIES: '/api/admin/stats/series',
  ANIMES: '/api/admin/stats/animes',
  TVS: '/api/admin/stats/tvs',
  USERS: '/api/admin/stats/users',
  ALL: '/api/admin/stats/all'
} as const;

/**
 * Thresholds de qualidade baseados no backend
 */
export const QUALITY_THRESHOLDS = {
  HIGH: 8.0,
  MEDIUM_MIN: 6.0,
  MEDIUM_MAX: 7.9,
  LOW_MAX: 6.0
} as const;

// ========== Type Guards ==========

/**
 * Verifica se o objeto é um GeneralStatsDTO válido
 */
export const isGeneralStatsDTO = (obj: any): obj is GeneralStatsDTO => {
  return obj && 
    typeof obj.totalMovies === 'number' &&
    typeof obj.totalSeries === 'number' &&
    typeof obj.totalAnimes === 'number' &&
    typeof obj.totalTvs === 'number' &&
    typeof obj.totalUsers === 'number' &&
    typeof obj.totalLikes === 'number' &&
    typeof obj.totalListItems === 'number';
};

/**
 * Verifica se o objeto é um MovieStatsDTO válido
 */
export const isMovieStatsDTO = (obj: any): obj is MovieStatsDTO => {
  return obj && 
    typeof obj.totalMovies === 'number' &&
    typeof obj.averageRating === 'number' &&
    typeof obj.highRatedMovies === 'number' &&
    typeof obj.mediumRatedMovies === 'number' &&
    typeof obj.lowRatedMovies === 'number' &&
    typeof obj.totalLikes === 'number' &&
    typeof obj.averageLikesPerMovie === 'number' &&
    typeof obj.totalListItems === 'number' &&
    typeof obj.averageListItemsPerMovie === 'number';
};

/**
 * Verifica se o objeto é um SerieStatsDTO válido
 */
export const isSerieStatsDTO = (obj: any): obj is SerieStatsDTO => {
  return obj && 
    typeof obj.totalSeries === 'number' &&
    typeof obj.averageRating === 'number' &&
    typeof obj.highRatedSeries === 'number' &&
    typeof obj.mediumRatedSeries === 'number' &&
    typeof obj.lowRatedSeries === 'number' &&
    typeof obj.totalLikes === 'number' &&
    typeof obj.averageLikesPerSerie === 'number' &&
    typeof obj.totalListItems === 'number' &&
    typeof obj.averageListItemsPerSerie === 'number';
};

/**
 * Verifica se o objeto é um AnimeStatsDTO válido
 */
export const isAnimeStatsDTO = (obj: any): obj is AnimeStatsDTO => {
  return obj && 
    typeof obj.totalAnimes === 'number' &&
    typeof obj.averageRating === 'number' &&
    typeof obj.highRatedAnimes === 'number' &&
    typeof obj.mediumRatedAnimes === 'number' &&
    typeof obj.lowRatedAnimes === 'number' &&
    typeof obj.totalLikes === 'number' &&
    typeof obj.averageLikesPerAnime === 'number' &&
    typeof obj.totalListItems === 'number' &&
    typeof obj.averageListItemsPerAnime === 'number';
};

/**
 * Verifica se o objeto é um TvStatsDTO válido
 */
export const isTvStatsDTO = (obj: any): obj is TvStatsDTO => {
  return obj && 
    typeof obj.totalTvs === 'number' &&
    typeof obj.totalLikes === 'number' &&
    typeof obj.averageLikesPerTv === 'number';
};

/**
 * Verifica se o objeto é um UserStatsDTO válido
 */
export const isUserStatsDTO = (obj: any): obj is UserStatsDTO => {
  return obj && 
    typeof obj.totalUsers === 'number' &&
    typeof obj.activeUsers === 'number' &&
    typeof obj.usersWithLists === 'number' &&
    typeof obj.userEngagementRate === 'number' &&
    typeof obj.averageLikesPerUser === 'number' &&
    typeof obj.averageListItemsPerUser === 'number';
};

/**
 * Verifica se o objeto é um AllStatsDTO válido
 */
export const isAllStatsDTO = (obj: any): obj is AllStatsDTO => {
  return obj && 
    isGeneralStatsDTO(obj.general) &&
    isMovieStatsDTO(obj.movies) &&
    isSerieStatsDTO(obj.series) &&
    isAnimeStatsDTO(obj.animes) &&
    isTvStatsDTO(obj.tvs) &&
    isUserStatsDTO(obj.users);
};

// ========== Utility Functions ==========

/**
 * Determina o nível de qualidade baseado na avaliação
 */
export const getQualityLevel = (rating: number): 'high' | 'medium' | 'low' => {
  if (rating >= QUALITY_THRESHOLDS.HIGH) return 'high';
  if (rating >= QUALITY_THRESHOLDS.MEDIUM_MIN) return 'medium';
  return 'low';
};

/**
 * Formata data para string compatível com API
 */
export const formatStatsDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Calcula percentual de crescimento
 */
export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
};

/**
 * Calcula percentual com base em total
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
};

/**
 * Formata números para exibição
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Formata avaliação para exibição
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

/**
 * Obtém cor baseada no nível de qualidade
 */
export const getQualityColor = (rating: number): string => {
  const level = getQualityLevel(rating);
  switch (level) {
    case 'high': return '#10B981'; // verde
    case 'medium': return '#F59E0B'; // amarelo
    case 'low': return '#EF4444'; // vermelho
    default: return '#6B7280'; // cinza
  }
};

/**
 * Calcula estatísticas de distribuição de qualidade
 */
export const calculateQualityDistribution = (
  high: number, 
  medium: number, 
  low: number
): { high: number; medium: number; low: number } => {
  const total = high + medium + low;
  if (total === 0) return { high: 0, medium: 0, low: 0 };
  
  return {
    high: calculatePercentage(high, total),
    medium: calculatePercentage(medium, total),
    low: calculatePercentage(low, total)
  };
};

// ========== Response Wrapper Types ==========

/**
 * Wrapper padrão para respostas da API
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  timestamp: string;
}

/**
 * Response específica para estatísticas
 */
export interface StatsResponse<T> extends ApiResponse<T> {
  lastUpdate?: string;
}

// ========== Error Types ==========

/**
 * Tipos de erro específicos para estatísticas
 */
export enum StatsErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_DATA = 'INVALID_DATA',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_ERROR = 'SERVER_ERROR',
  ENDPOINT_NOT_FOUND = 'ENDPOINT_NOT_FOUND'
}
