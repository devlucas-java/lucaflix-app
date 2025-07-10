import api from './api';
import type { 
  AnimeSimpleDTO, 
  AnimeCompleteDTO, 
  AnimeFilter,
  PaginatedResponseDTO 
} from '../types/mediaTypes';

export class AnimeService {
  private baseUrl = '/animes';

  /**
   * Filtrar animes com critérios específicos
   */
  async filterAnimes(
    filter: AnimeFilter, 
    page: number = 0, 
    size: number = 20
  ): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await api.post(`${this.baseUrl}/filter`, filter, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to filter animes');
    }
  }

  /**
   * Obter todos os animes com paginação
   */
  async getAllAnimes(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch animes');
    }
  }

  /**
   * Top 10 animes mais curtidos
   */
  async getTop10MostLiked(): Promise<AnimeSimpleDTO[]> {
    try {
      const response = await api.get(`${this.baseUrl}/top10`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch top 10 animes');
    }
  }

  /**
   * Obter anime por ID
   */
  async getAnimeById(id: number): Promise<AnimeCompleteDTO> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch anime with id ${id}`);
    }
  }

  /**
   * Toggle like em um anime (requer autenticação)
   */
  async toggleLike(id: number): Promise<boolean> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/like`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to toggle like');
    }
  }

  /**
   * Toggle anime na lista do usuário (requer autenticação)
   */
  async toggleMyList(id: number): Promise<boolean> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/my-list`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to toggle my list');
    }
  }

  /**
   * Animes populares (mais curtidos)
   */
  async getPopularAnimes(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/popular`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch popular animes');
    }
  }

  /**
   * Novos lançamentos
   */
  async getNewReleases(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/new-releases`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch new releases');
    }
  }

  /**
   * Animes por categoria
   */
  async getAnimesByCategory(
    categoria: string, 
    page: number = 0, 
    size: number = 20
  ): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/category/${encodeURIComponent(categoria)}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch animes by category ${categoria}`);
    }
  }

  /**
   * Animes com avaliação alta (≥ 7.0)
   */
  async getHighRatedAnimes(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/high-rated`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch high rated animes');
    }
  }

  /**
   * Recomendações personalizadas (requer autenticação)
   */
  async getRecommendations(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/recommendations`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch recommendations');
    }
  }

  /**
   * Animes similares
   */
  async getSimilarAnimes(
    id: number, 
    page: number = 0, 
    size: number = 20
  ): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/similar`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch similar animes for id ${id}`);
    }
  }

  /**
   * Animes por ano
   */
  async getAnimesByYear(
    year: number, 
    page: number = 0, 
    size: number = 20
  ): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/year/${year}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch animes by year ${year}`);
    }
  }
}

export const animeService = new AnimeService();