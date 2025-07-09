import api from './api';
import type { 
  AnimeSimpleDTO, 
  MovieSimpleDTO, 
  SerieSimpleDTO,
  PaginatedResponseDTO,
  MediaSimple
} from '../types/mediaTypes';
import { Type } from '../types/mediaTypes';

export class MyListService {
  
  /**
   * Busca todos os itens da lista do usuário
   */
  async getMyList(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<MediaSimple>> {
    try {
      const response = await api.get(`/my-list?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lista do usuário:', error);
      throw error;
    }
  }

  /**
   * Busca itens da lista por tipo específico
   */
  async getMyListByType(
    type: Type, 
    page: number = 0, 
    size: number = 20
  ): Promise<PaginatedResponseDTO<MediaSimple>> {
    try {
      const response = await api.get(`/my-list/filter?type=${type}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar lista por tipo ${type}:`, error);
      throw error;
    }
  }

  /**
   * Busca apenas filmes da lista
   */
  async getMyListMovies(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<MovieSimpleDTO>> {
    try {
      const response = await this.getMyListByType(Type.MOVIE, page, size);
      return response as PaginatedResponseDTO<MovieSimpleDTO>;
    } catch (error) {
      console.error('Erro ao buscar filmes da lista:', error);
      throw error;
    }
  }

  /**
   * Busca apenas séries da lista
   */
  async getMyListSeries(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<SerieSimpleDTO>> {
    try {
      const response = await this.getMyListByType(Type.SERIE, page, size);
      return response as PaginatedResponseDTO<SerieSimpleDTO>;
    } catch (error) {
      console.error('Erro ao buscar séries da lista:', error);
      throw error;
    }
  }

  /**
   * Busca apenas animes da lista
   */
  async getMyListAnimes(page: number = 0, size: number = 20): Promise<PaginatedResponseDTO<AnimeSimpleDTO>> {
    try {
      const response = await this.getMyListByType(Type.ANIME, page, size);
      return response as PaginatedResponseDTO<AnimeSimpleDTO>;
    } catch (error) {
      console.error('Erro ao buscar animes da lista:', error);
      throw error;
    }
  }

  /**
   * Adiciona um item à lista do usuário
   */
  async addToMyList(mediaId: number, mediaType: Type): Promise<void> {
    try {
      await api.post('/my-list', {
        mediaId,
        mediaType
      });
    } catch (error) {
      console.error('Erro ao adicionar item à lista:', error);
      throw error;
    }
  }

  /**
   * Remove um item da lista do usuário
   */
  async removeFromMyList(mediaId: number, mediaType: Type): Promise<void> {
    try {
      await api.delete(`/my-list/${mediaId}`, {
        params: { type: mediaType }
      });
    } catch (error) {
      console.error('Erro ao remover item da lista:', error);
      throw error;
    }
  }

  /**
   * Verifica se um item está na lista do usuário
   */
  async isInMyList(mediaId: number, mediaType: Type): Promise<boolean> {
    try {
      const response = await api.get(`/my-list/check/${mediaId}`, {
        params: { type: mediaType }
      });
      return response.data.inList || false;
    } catch (error) {
      console.error('Erro ao verificar se item está na lista:', error);
      return false;
    }
  }

  /**
   * Busca estatísticas da lista do usuário
   */
  async getMyListStats(): Promise<{
    totalItems: number;
    movies: number;
    series: number;
    animes: number;
  }> {
    try {
      const response = await api.get('/my-list/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas da lista:', error);
      throw error;
    }
  }
}

// Instância singleton do serviço
export const myListService = new MyListService();