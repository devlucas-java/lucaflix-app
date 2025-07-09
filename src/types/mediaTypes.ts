// Enums
export enum Categoria {
  ACAO = 'ACAO',
  COMEDIA = 'COMEDIA',
  DRAMA = 'DRAMA',
  SUSPENSE = 'SUSPENSE',
  TERROR = 'TERROR',
  ROMANCE = 'ROMANCE',
  FICCAO_CIENTIFICA = 'FICCAO_CIENTIFICA',
  AVENTURA = 'AVENTURA',
  FANTASIA = 'FANTASIA',
  DOCUMENTARIO = 'DOCUMENTARIO',
  ANIMACAO = 'ANIMACAO',
  INFANTIL = 'INFANTIL',
  DESCONHECIDA = 'DESCONHECIDA',
}

// Enum consistente com backend
export enum Type {
  MOVIE = 'MOVIE',
  SERIE = 'SERIE', 
  ANIME = 'ANIME',
}

// Tipos para frontend (minúsculas para URLs/filtros)
export type MediaTypeUI = 'movie' | 'serie' | 'anime' | 'all';

export interface SearchFilters {
  texto: string;
  categoria: Categoria | "";
  tipo: MediaTypeUI;
}

// Base interfaces
export interface MediaBase {
  id: number;
  title: string;
  anoLancamento: number;
  tmdbId: string;
  imdbId: string;
  categoria: Categoria[];
  minAge: string;
  avaliacao: number;
  posterURL1: string;
  posterURL2: string;
  totalLikes: number;
}

// Movie interfaces
export interface MovieSimpleDTO extends MediaBase {
  type: Type.MOVIE;
  duracaoMinutos: number;
  paisOrigen: string;
}

export interface MovieCompleteDTO extends MovieSimpleDTO {
  sinopse: string;
  dataCadastro: Date;
  embed1: string;
  embed2: string;
  trailer: string;
  backdropURL1: string;
  backdropURL2: string;
  backdropURL3: string;
  backdropURL4: string;
  logoURL1: string;
  logoURL2: string;
  userLiked: boolean | null;
  inUserList: boolean | null;
}

// Serie interfaces
export interface SerieSimpleDTO extends MediaBase {
  type: Type.SERIE;
  totalTemporadas: number;
  totalEpisodios: number;
  paisOrigen: string;
}

export interface SerieCompleteDTO extends SerieSimpleDTO {
  sinopse: string;
  dataCadastro: Date;
  trailer: string;
  backdropURL1: string;
  backdropURL2: string;
  backdropURL3: string;
  backdropURL4: string;
  logoURL1: string;
  logoURL2: string;
  userLiked: boolean | null;
  inUserList: boolean | null;
  temporadas: TemporadaDTO[];
}

// Anime interfaces
export interface AnimeSimpleDTO extends MediaBase {
  type: Type.ANIME;
  embed1: string;
  embed2: string;
  trailer: string;
  totalTemporadas: number;
  totalEpisodios: number;
  paisOrigen: string;
}

export interface AnimeCompleteDTO extends AnimeSimpleDTO {
  sinopse: string;
  dataCadastro: Date;
  backdropURL1: string;
  backdropURL2: string;
  backdropURL3: string;
  backdropURL4: string;
  logoURL1: string;
  logoURL2: string;
  userLiked: boolean | null;
  inUserList: boolean | null;
  temporadas: TemporadaDTO[];
}

// Episode and Season interfaces
export interface EpisodioDTO {
  id: number;
  numeroEpisodio: number;
  title: string;
  sinopse: string;
  duracaoMinutos: number;
  dataCadastro: Date;
  embed1: string;
  embed2: string;
}

export interface TemporadaDTO {
  id: number;
  numeroTemporada: number;
  anoLancamento: number;
  dataCadastro: Date;
  totalEpisodios: number;
  episodios?: EpisodioDTO[];
}

// Search Result interface - agora consistente com backend
export interface SearchResultDTO {
  id: number;
  title: string;
  type: Type; // Usando o enum Type do backend
  anoLancamento: number;
  categoria: Categoria[];
  sinopse?: string;
  avaliacao: number;
  posterURL1: string;
  posterURL2: string;
  minAge: string;
  
  // Campos específicos para filmes
  duracaoMinutos?: number;
  
  // Campos específicos para séries e animes
  totalTemporadas?: number;
  totalEpisodios?: number;
}

// Filter interfaces
export interface MovieFilter {
  title?: string;
  avaliacao?: number;
  categoria?: Categoria;
}

export interface AnimeFilter {
  title?: string;
  avaliacao?: number;
  categoria?: Categoria;
  year?: number;
  minTemporadas?: number;
  maxTemporadas?: number;
  minEpisodios?: number;
  maxEpisodios?: number;
  paisOrigen?: string;
}

// Pagination interface
export interface PaginatedResponseDTO<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Union types for convenience
export type MediaSimple = MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO;
export type MediaComplete = MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO;

// Type guards - agora corretos
export const isMovieSimple = (media: MediaSimple): media is MovieSimpleDTO => {
  return media.type === Type.MOVIE;
};

export const isSerieSimple = (media: MediaSimple): media is SerieSimpleDTO => {
  return media.type === Type.SERIE;
};

export const isAnimeSimple = (media: MediaSimple): media is AnimeSimpleDTO => {
  return media.type === Type.ANIME;
};

export const isMovieComplete = (media: MediaComplete): media is MovieCompleteDTO => {
  return media.type === Type.MOVIE;
};

export const isSerieComplete = (media: MediaComplete): media is SerieCompleteDTO => {
  return media.type === Type.SERIE;
};

export const isAnimeComplete = (media: MediaComplete): media is AnimeCompleteDTO => {
  return media.type === Type.ANIME;
};

// Type guards para SearchResultDTO
export const isMovie = (media: SearchResultDTO): boolean => {
  return media.type === Type.MOVIE;
};

export const isSerie = (media: SearchResultDTO): boolean => {
  return media.type === Type.SERIE;
};

export const isAnime = (media: SearchResultDTO): boolean => {
  return media.type === Type.ANIME;
};

// Constants for UI labels
export const CATEGORIA_LABELS: Record<Categoria, string> = {
  [Categoria.ACAO]: 'Ação',
  [Categoria.COMEDIA]: 'Comédia',
  [Categoria.DRAMA]: 'Drama',
  [Categoria.SUSPENSE]: 'Suspense',
  [Categoria.TERROR]: 'Terror',
  [Categoria.ROMANCE]: 'Romance',
  [Categoria.FICCAO_CIENTIFICA]: 'Ficção Científica',
  [Categoria.AVENTURA]: 'Aventura',
  [Categoria.FANTASIA]: 'Fantasia',
  [Categoria.DOCUMENTARIO]: 'Documentário',
  [Categoria.ANIMACAO]: 'Animação',
  [Categoria.INFANTIL]: 'Infantil',
  [Categoria.DESCONHECIDA]: 'Outros'
};

export const TIPO_LABELS: Record<MediaTypeUI, string> = {
  all: 'Todos',
  movie: 'Filmes',
  serie: 'Séries',
  anime: 'Animes'
};