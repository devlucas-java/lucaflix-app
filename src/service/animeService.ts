import axios, { AxiosResponse } from 'axios';
import type { 
  AnimeSimpleDTO, 
  AnimeCompleteDTO, 
  AnimeFilter,
  PaginatedResponseDTO 
} from '../types/mediaTypes';

// Configuração do axios para React Native
const api = axios.create({
  baseURL: 'https://your-api-base-url.com/api', // Substitua pela sua URL base
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação se necessário
api.interceptors.request.use(
  (config) => {
    // Adicione aqui a lógica para pegar o token do AsyncStorage se necessário
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Lógica para lidar com token expirado
      // Pode redirecionar para login ou renovar token
    }
    return Promise.reject(error);
  }
);

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
      const response: AxiosResponse<PaginatedResponseDTO<AnimeSimpleDTO>> = await api.post(
        `${this.baseUrl}/filter`, 
        filter, 
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error filtering animes:', error);
      throw new Error('Failed to filter animes');
    }
  }

  /**
   * Obter todos os animes com paginação
   */
  async getAllAnimes(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response: AxiosResponse<PaginatedResponseDTO<AnimeSimpleDTO>> = await api.get(
        `${this.baseUrl}`, 
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching animes:', error);
      throw new Error('Failed to fetch animes');
    }
  }

  /**
   * Top 10 animes mais curtidos
   */
  async getTop10MostLiked(): Promise<AnimeSimpleDTO[]> {
    try {
      const response: AxiosResponse<AnimeSimpleDTO[]> = await api.get(`${this.baseUrl}/top10`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top 10 animes:', error);
      throw new Error('Failed to fetch top 10 animes');
    }
  }

  /**
   * Obter anime por ID
   */
  async getAnimeById(id: number): Promise<AnimeCompleteDTO> {
    try {
      const response: AxiosResponse<AnimeCompleteDTO> = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching anime with id ${id}:`, error);
      throw new Error(`Failed to fetch anime with id ${id}`);
    }
  }

  /**
   * Toggle like em um anime (requer autenticação)
   */
  async toggleLike(id: number): Promise<boolean> {
    try {
      const response: AxiosResponse<boolean> = await api.post(`${this.baseUrl}/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw new Error('Failed to toggle like');
    }
  }

  /**
   * Toggle anime na lista do usuário (requer autenticação)
   */
  async toggleMyList(id: number): Promise<boolean> {
    try {
      const response: AxiosResponse<boolean> = await api.post(`${this.baseUrl}/${id}/my-list`);
      return response.data;
    } catch (error) {
      console.error('Error toggling my list:', error);
      throw new Error('Failed to toggle my list');
    }
  }

  /**
   * Animes populares (mais curtidos)
   */
  async getPopularAnimes(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response: AxiosResponse<PaginatedResponseDTO<AnimeSimpleDTO>> = await api.get(
        `${this.baseUrl}/popular`, 
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching popular animes:', error);
      throw new Error('Failed to fetch popular animes');
    }
  }

  /**
   * Novos lançamentos
   */
  async getNewReleases(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response: AxiosResponse<PaginatedResponseDTO<AnimeSimpleDTO>> = await api.get(
        `${this.baseUrl}/new-releases`, 
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching new releases:', error);
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
      const response: AxiosResponse<PaginatedResponseDTO<AnimeSimpleDTO>> = await api.get(
        `${this.baseUrl}/category/${encodeURIComponent(categoria)}`, 
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching animes by category ${categoria}:`, error);
      throw new Error(`Failed to fetch animes by category ${categoria}`);
    }
  }

  /**
   * Animes com avaliação alta (≥ 7.0)
   */
  async getHighRatedAnimes(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response: AxiosResponse<PaginatedResponseDTO<AnimeSimpleDTO>> = await api.get(
        `${this.baseUrl}/high-rated`, 
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching high rated animes:', error);
      throw new Error('Failed to fetch high rated animes');
    }
  }

  /**
   * Recomendações personalizadas (requer autenticação)
   */
  async getRecommendations(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response: AxiosResponse<PaginatedResponseDTO<AnimeSimpleDTO>> = await api.get(
        `${this.baseUrl}/recommendations`, 
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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
      const response: AxiosResponse<PaginatedResponseDTO<AnimeSimpleDTO>> = await api.get(
        `${this.baseUrl}/${id}/similar`, 
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching similar animes for id ${id}:`, error);
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
      const response: AxiosResponse<PaginatedResponseDTO<AnimeSimpleDTO>> = await api.get(
        `${this.baseUrl}/year/${year}`, 
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching animes by year ${year}:`, error);
      throw new Error(`Failed to fetch animes by year ${year}`);
    }
  }

  /**
   * Verifica conectividade da rede (útil para React Native)
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Network connection error:', error);
      return false;
    }
  }
}

export const animeService = new AnimeService();