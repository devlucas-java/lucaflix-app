import api from './api';
import type { 
  SerieSimpleDTO, 
  SerieCompleteDTO,
  PaginatedResponseDTO 
} from '../types/mediaTypes';

export class SerieService {
  private baseUrl = '/series';

  /**
   * Obter todas as séries com paginação
   */
  async getAllSeries(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<SerieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch series');
    }
  }

  /**
   * Top 10 séries mais curtidas
   */
  async getTop10MostLiked(): Promise<SerieSimpleDTO[]> {
    try {
      const response = await api.get(`${this.baseUrl}/top10`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch top 10 series');
    }
  }

  /**
   * Obter série por ID
   */
  async getSerieById(id: number): Promise<SerieCompleteDTO> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch serie with id ${id}`);
    }
  }

  /**
   * Toggle like em uma série (requer autenticação)
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
   * Toggle série na lista do usuário (requer autenticação)
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
   * Séries por categoria
   */
  async getSeriesByCategory(
    categoria: string, 
    page: number = 0, 
    size: number = 20
  ): Promise<PaginatedResponseDTO<SerieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/category/${encodeURIComponent(categoria)}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch series by category ${categoria}`);
    }
  }

  /**
   * Séries populares (mais curtidas)
   */
  async getPopularSeries(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<SerieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/popular`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch popular series');
    }
  }

  /**
   * Séries com avaliação alta (≥ 7.0)
   */
  async getHighRatedSeries(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<SerieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/high-rated`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch high rated series');
    }
  }

  /**
   * Séries recentes (ordenadas por ano de lançamento)
   */
  async getRecentSeries(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<SerieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/recent`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch recent series');
    }
  }

  /**
   * Séries por ano de lançamento
   */
  async getSeriesByYear(
    year: number, 
    page: number = 0, 
    size: number = 20
  ): Promise<PaginatedResponseDTO<SerieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/year/${year}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch series by year ${year}`);
    }
  }

  /**
   * Séries similares
   */
  async getSimilarSeries(
    id: number, 
    page: number = 0, 
    size: number = 20
  ): Promise<PaginatedResponseDTO<SerieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/similar`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch similar series for id ${id}`);
    }
  }

  /**
   * Recomendações personalizadas (requer autenticação)
   */
  async getRecommendations(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<SerieSimpleDTO>> {
    try {
      const response = await api.get(`${this.baseUrl}/recommendations`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch recommendations');
    }
  }
}

export const serieService = new SerieService();