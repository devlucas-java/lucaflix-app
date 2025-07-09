import api from './api';
import type { 
  MovieSimpleDTO, 
  MovieCompleteDTO, 
  MovieFilter,
  PaginatedResponseDTO 
} from '../types/mediaTypes';

export class MovieService {
  private baseUrl = '/movies';

  /**
   * Filtrar filmes com critérios específicos
   */
  async filterMovies(
    filter: MovieFilter, 
    page: number = 0, 
    size: number = 10
  ): Promise<PaginatedResponseDTO<MovieSimpleDTO>> {
    try {
      const response = await api.post(`${this.baseUrl}/filter`, filter, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error filtering movies:', error);
      throw new Error('Failed to filter movies');
    }
  }

  /**
   * Obter todos os filmes com paginação
   * CORREÇÃO: Backend retorna newReleases, mas deveria ser getAllMovies
   */
  async getAllMovies(page: number = 0, size: number = 10): Promise<PaginatedResponseDTO<MovieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all movies:', error);
      throw new Error('Failed to fetch movies');
    }
  }

  /**
   * Top 10 filmes mais curtidos
   */
  async getTop10MostLiked(): Promise<MovieSimpleDTO[]> {
    try {
      const response = await api.get(`${this.baseUrl}/top10`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top 10 movies:', error);
      throw new Error('Failed to fetch top 10 movies');
    }
  }

  /**
   * Obter filme por ID
   */
  async getMovieById(id: number): Promise<MovieCompleteDTO> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie with id ${id}:`, error);
      throw new Error(`Failed to fetch movie with id ${id}`);
    }
  }

  /**
   * Toggle like em um filme (requer autenticação)
   */
  async toggleLike(id: number): Promise<boolean> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling movie like:', error);
      throw new Error('Failed to toggle like');
    }
  }

  /**
   * Toggle filme na lista do usuário (requer autenticação)
   */
  async toggleMyList(id: number): Promise<boolean> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/my-list`);
      return response.data;
    } catch (error) {
      console.error('Error toggling my list:', error);
      throw new Error('Failed to toggle my list');
    }
  }

  /**
   * Filmes populares (mais curtidos)
   */
  async getPopularMovies(page: number = 0, size: number = 10): Promise<PaginatedResponseDTO<MovieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/popular`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw new Error('Failed to fetch popular movies');
    }
  }

  /**
   * Novos lançamentos
   */
  async getNewReleases(page: number = 0, size: number = 10): Promise<PaginatedResponseDTO<MovieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/new-releases`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching new releases:', error);
      throw new Error('Failed to fetch new releases');
    }
  }

  /**
   * Filmes por categoria
   */
  async getMoviesByCategory(
    categoria: string, 
    page: number = 0, 
    size: number = 10
  ): Promise<PaginatedResponseDTO<MovieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/category/${encodeURIComponent(categoria)}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching movies by category ${categoria}:`, error);
      throw new Error(`Failed to fetch movies by category ${categoria}`);
    }
  }

  /**
   * Filmes com avaliação alta (≥ 7.0)
   */
  async getHighRatedMovies(page: number = 0, size: number = 10): Promise<PaginatedResponseDTO<MovieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/high-rated`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching high rated movies:', error);
      throw new Error('Failed to fetch high rated movies');
    }
  }

  /**
   * Recomendações personalizadas (requer autenticação)
   */
  async getRecommendations(page: number = 0, size: number = 10): Promise<PaginatedResponseDTO<MovieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/recommendations`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie recommendations:', error);
      throw new Error('Failed to fetch recommendations');
    }
  }

  /**
   * Filmes similares
   */
  async getSimilarMovies(
    id: number, 
    page: number = 0, 
    size: number = 10
  ): Promise<PaginatedResponseDTO<MovieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/similar`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching similar movies for id ${id}:`, error);
      throw new Error(`Failed to fetch similar movies for id ${id}`);
    }
  }
}

export const movieService = new MovieService();