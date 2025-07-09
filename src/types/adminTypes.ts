import { Categoria, Type } from './mediaTypes';

// ========== Movie Admin DTOs ==========
export interface CreateMovieDTO  {
  title: string;
  type?: Type;
  anoLancamento: number;
  duracaoMinutos: number;
  sinopse?: string;
  categoria: Categoria[];
  tmdbId?: string;
  imdbId?: string;
  paisOrigen?: string;
  minAge?: string;
  avaliacao?: number; // 0-10
  embed1?: string;
  embed2?: string;
  trailer?: string;
  posterURL1?: string;
  posterURL2?: string;
  backdropURL1?: string;
  backdropURL2?: string;
  backdropURL3?: string;
  backdropURL4?: string;
  logoURL1?: string;
  logoURL2?: string;
}

export interface UpdateMovieDTO {
  title?: string;
  anoLancamento?: number;
  duracaoMinutos?: number; // min: 1
  sinopse?: string;
  categoria?: Categoria[];
  tmdbId?: string;
  imdbId?: string;
  paisOrigen?: string;
  minAge?: string;
  avaliacao?: number; // 0-10
  embed1?: string;
  embed2?: string;
  trailer?: string;
  posterURL1?: string;
  posterURL2?: string;
  backdropURL1?: string;
  backdropURL2?: string;
  backdropURL3?: string;
  backdropURL4?: string;
  logoURL1?: string;
  logoURL2?: string;
}

// ========== Serie Admin DTOs ==========
export interface CreateSerieDTO {
  title: string;
  type?: Type;
  anoLancamento: number;
  tmdbId?: string;
  imdbId?: string;
  paisOrigen?: string;
  sinopse?: string; // max: 5000 chars
  categoria: Categoria[];
  minAge?: string;
  avaliacao?: number; // 0.0-10.0
  trailer?: string;
  posterURL1?: string;
  posterURL2?: string;
  backdropURL1?: string;
  backdropURL2?: string;
  backdropURL3?: string;
  backdropURL4?: string;
  logoURL1?: string;
  logoURL2?: string;
}

export interface UpdateSerieDTO {
  title?: string; // max: 255 chars
  anoLancamento?: number;
  tmdbId?: string;
  imdbId?: string;
  paisOrigen?: string;
  sinopse?: string; // max: 5000 chars
  categoria?: Categoria[];
  minAge?: string;
  avaliacao?: number; // 0.0-10.0
  trailer?: string;
  posterURL1?: string;
  posterURL2?: string;
  backdropURL1?: string;
  backdropURL2?: string;
  backdropURL3?: string;
  backdropURL4?: string;
  logoURL1?: string;
  logoURL2?: string;
}

// ========== Anime Admin DTOs ==========
export interface CreateAnimeDTO {
  title: string; // max: 255 chars
  type: Type;
  anoLancamento: number;
  tmdbId?: string;
  imdbId?: string;
  paisOrigen?: string;
  sinopse?: string; // max: 5000 chars
  categoria: Categoria[]; // at least one required
  minAge?: string;
  avaliacao?: number; // 0.0-10.0
  embed1?: string;
  embed2?: string;
  trailer?: string;
  posterURL1?: string;
  posterURL2?: string;
  backdropURL1?: string;
  backdropURL2?: string;
  backdropURL3?: string;
  backdropURL4?: string;
  logoURL1?: string;
  logoURL2?: string;
  totalTemporadas?: number; // min: 0, default: 0
  totalEpisodios?: number; // min: 0, default: 0
}

export interface UpdateAnimeDTO {
  title?: string; // max: 255 chars
  anoLancamento?: number;
  tmdbId?: string;
  imdbId?: string;
  paisOrigen?: string;
  sinopse?: string; // max: 5000 chars
  categoria?: Categoria[];
  minAge?: string;
  avaliacao?: number; // 0.0-10.0
  embed1?: string;
  embed2?: string;
  trailer?: string;
  posterURL1?: string;
  posterURL2?: string;
  backdropURL1?: string;
  backdropURL2?: string;
  backdropURL3?: string;
  backdropURL4?: string;
  logoURL1?: string;
  logoURL2?: string;
  totalTemporadas?: number; // min: 0
  totalEpisodios?: number; // min: 0
}

// ==========                                                              Admin DTOs ==========
export interface CreateTvDTO {
  title: string; // max: 255 chars
  type: Type; // default: TV
  paisOrigen?: string; // max: 100 chars, default: "Brasil"
  categoria: Categoria; // default: DESCONHECIDA
  minAge?: string; // default: "10"
  embed1?: string;
  embed2?: string;
  imageURL1?: string;
  imageURL2?: string;
}

export interface UpdateTvDTO {
  title?: string; // max: 255 chars
  paisOrigen?: string; // max: 100 chars
  categoria?: Categoria;
  minAge?: string;
  embed1?: string;
  embed2?: string;
  imageURL1?: string;
  imageURL2?: string;
}

// ========== Temporada Admin DTOs ==========
export interface CreateTemporadaDTO {
  numeroTemporada: number; // min: 1
  anoLancamento: number;
}

export interface UpdateTemporadaDTO {
  numeroTemporada?: number; // min: 1
  anoLancamento?: number;
}

// ========== Episodio Admin DTOs ==========
export interface CreateEpisodioDTO {
  numeroEpisodio: number; // min: 1
  title: string; // max: 255 chars
  sinopse?: string; // max: 2000 chars
  duracaoMinutos: number; // min: 1
  embed1?: string;
  embed2?: string;
}

export interface UpdateEpisodioDTO {
  numeroEpisodio?: number; // min: 1
  title?: string; // max: 255 chars
  sinopse?: string; // max: 2000 chars
  duracaoMinutos?: number; // min: 1
  embed1?: string;
  embed2?: string;
}

// ========== Complete Serie Creation DTO ==========
export interface CreateSerieCompleteDTO {
  title: string;
  sinopse?: string;
  categoria: Categoria[]; // at least one required
  anoLancamento?: number | null; // optional, can be null
  tmdbId?: string;
  imdbId?: string;
  paisOrigen?: string;
  avaliacao?: number;
  minAge?: string;
  trailer?: string;
  posterURL1: string; // required
  posterURL2?: string;
  backdropURL1?: string;
  backdropURL2?: string;
  backdropURL3?: string;
  backdropURL4?: string;
  logoURL1?: string;
  logoURL2?: string;
  temporadas: CreateTemporadaCompleteDTO[]; // at least one required
}

export interface CreateTemporadaCompleteDTO {
  numeroTemporada: number;
  anoLancamento?: number;
  episodios: CreateEpisodioCompleteDTO[]; // at least one required
}

export interface CreateEpisodioCompleteDTO {
  numeroEpisodio: number;
  title: string;
  sinopse?: string;
  duracaoMinutos?: number;
  embed1?: string;
  embed2?: string;
}

// ========== Form Data Types (with validation rules) ==========
export interface CreateMovieFormData extends CreateMovieDTO {
  // Validation rules applied in frontend
  title: string; // required, not blank
  anoLancamento: number; // required
  duracaoMinutos: number; // required, min: 1
  categoria: Categoria[]; // required
  avaliacao?: number; // optional, 0-10 range
}

export interface UpdateMovieFormData extends Omit<UpdateMovieDTO, 'duracaoMinutos' | 'avaliacao'> {
  duracaoMinutos?: number; // if provided, min: 1
  avaliacao?: number; // if provided, 0-10 range
}

export interface CreateSerieFormData extends CreateSerieDTO {
  // Validation rules applied in frontend
  title: string; // required, not blank, max: 255
  categoria: Categoria[]; // required
  sinopse?: string; // max: 5000 chars
  avaliacao?: number; // 0.0-10.0 range
}

export interface UpdateSerieFormData extends UpdateSerieDTO {
  title?: string; // max: 255 chars
  sinopse?: string; // max: 5000 chars
  avaliacao?: number; // 0.0-10.0 range
}

export interface CreateAnimeFormData extends CreateAnimeDTO {
  // Validation rules applied in frontend
  title: string; // required, not blank, max: 255
  anoLancamento: number; // required
  categoria: Categoria[]; // required, not empty
  sinopse?: string; // max: 5000 chars
  avaliacao?: number; // 0.0-10.0 range
  totalTemporadas?: number; // min: 0
  totalEpisodios?: number; // min: 0
}

export interface UpdateAnimeFormData extends UpdateAnimeDTO {
  title?: string; // max: 255 chars
  sinopse?: string; // max: 5000 chars
  avaliacao?: number; // 0.0-10.0 range
  totalTemporadas?: number; // min: 0
  totalEpisodios?: number; // min: 0
}

export interface CreateEpisodioFormData extends CreateEpisodioDTO {
  // Validation rules applied in frontend
  numeroEpisodio: number; // required, min: 1
  title: string; // required, not blank, max: 255
  sinopse?: string; // max: 2000 chars
  duracaoMinutos: number; // required, min: 1
}

export interface UpdateEpisodioFormData extends UpdateEpisodioDTO {
  numeroEpisodio?: number; // min: 1
  title?: string; // max: 255 chars
  sinopse?: string; // max: 2000 chars
  duracaoMinutos?: number; // min: 1
}

// ========== Admin Filters ==========
export interface AdminMovieFilters {
  title?: string;
  categoria?: Categoria[];
  anoInicio?: number;
  anoFim?: number;
  avaliacaoMinima?: number;
  avaliacaoMaxima?: number;
  duracaoMinima?: number;
  duracaoMaxima?: number;
  minAge?: string[];
  hasTrailer?: boolean;
  hasEmbed?: boolean;
  paisOrigen?: string;
  tmdbId?: string;
  imdbId?: string;
}

export interface AdminSerieFilters {
  title?: string;
  categoria?: Categoria[];
  anoInicio?: number;
  anoFim?: number;
  avaliacaoMinima?: number;
  avaliacaoMaxima?: number;
  minAge?: string[];
  hasTrailer?: boolean;
  paisOrigen?: string;
  tmdbId?: string;
  imdbId?: string;
  minTemporadas?: number;
  maxTemporadas?: number;
  minEpisodios?: number;
  maxEpisodios?: number;
}

export interface AdminAnimeFilters {
  title?: string;
  categoria?: Categoria[];
  anoInicio?: number;
  anoFim?: number;
  avaliacaoMinima?: number;
  avaliacaoMaxima?: number;
  minAge?: string[];
  hasTrailer?: boolean;
  hasEmbed?: boolean;
  paisOrigen?: string;
  tmdbId?: string;
  imdbId?: string;
  minTemporadas?: number;
  maxTemporadas?: number;
  minEpisodios?: number;
  maxEpisodios?: number;
}

// ========== Admin Response Types ==========
export interface AdminApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
  successIds?: number[];
  failedIds?: number[];
}

// ========== Media Management Types ==========
export interface MediaUploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface BulkUploadRequest {
  files: File[];
  defaultCategoria?: Categoria[];
  defaultMinAge?: string;
  overwriteExisting?: boolean;
}

// ========== Type Guards for Admin Types ==========
export const isCreateMovieDTO = (obj: any): obj is CreateMovieDTO => {
  return obj && typeof obj.title === 'string' && typeof obj.anoLancamento === 'number' && 
         typeof obj.duracaoMinutos === 'number' && Array.isArray(obj.categoria);
};

export const isCreateSerieDTO = (obj: any): obj is CreateSerieDTO => {
  return obj && typeof obj.title === 'string' && typeof obj.anoLancamento === 'number' && 
         Array.isArray(obj.categoria);
};

export const isCreateAnimeDTO = (obj: any): obj is CreateAnimeDTO => {
  return obj && typeof obj.title === 'string' && typeof obj.anoLancamento === 'number' && 
         Array.isArray(obj.categoria);
};

// ========== Utility Types ==========
export type AdminMediaType = 'movie' | 'serie' | 'anime' | 'tv';

export interface AdminMediaItem {
  id: number;
  title: string;
  type: AdminMediaType;
  categoria: Categoria[];
  anoLancamento: number;
  avaliacao?: number;
  posterURL1?: string;
  dataCadastro: Date;
  dataAtualizacao?: Date;
  status: 'active' | 'inactive' | 'draft';
}

// ========== Validation Error Types ==========
export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: any;
}

export interface ValidationResponse {
  valid: boolean;
  errors: ValidationError[];
}

// ========== Admin Constants ==========
export const ADMIN_VALIDATION_RULES = {
  TITLE_MAX_LENGTH: 255,
  SINOPSE_MAX_LENGTH: 5000,
  EPISODIO_SINOPSE_MAX_LENGTH: 2000,
  PAIS_ORIGEM_MAX_LENGTH: 100,
  MIN_DURACAO: 1,
  MIN_TEMPORADA: 1,
  MIN_EPISODIO: 1,
  MIN_AVALIACAO: 0,
  MAX_AVALIACAO: 10,
  MIN_TOTAL_TEMPORADAS: 0,
  MIN_TOTAL_EPISODIOS: 0
} as const;

export const ADMIN_DEFAULT_VALUES = {
  PAIS_ORIGEM: 'Brasil',
  MIN_AGE: '10',
  CATEGORIA_DEFAULT: Categoria.DESCONHECIDA,
  TOTAL_TEMPORADAS: 0,
  TOTAL_EPISODIOS: 0
} as const;