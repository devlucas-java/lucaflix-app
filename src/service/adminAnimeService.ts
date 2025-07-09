import api from './api';
import type { 
  CreateAnimeDTO, 
  UpdateAnimeDTO, 
  AdminAnimeFilters,
  BulkOperationResponse
} from '../types/adminTypes';
import type { AnimeCompleteDTO } from '../types/mediaTypes';

export interface AnimeSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

class AdminAnimeService {
  private readonly basePath = '/admin/animes';

  /**
   * Cria um novo anime
   */
  async createAnime(createDTO: CreateAnimeDTO): Promise<AnimeCompleteDTO> {
    try {
      const response = await api.post<AnimeCompleteDTO>(this.basePath, createDTO);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar anime:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao criar anime'
      );
    }
  }

  /**
   * Atualiza um anime existente
   */
  async updateAnime(id: number, updateDTO: UpdateAnimeDTO): Promise<AnimeCompleteDTO> {
    try {
      const response = await api.put<AnimeCompleteDTO>(`${this.basePath}/${id}`, updateDTO);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar anime:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao atualizar anime'
      );
    }
  }

  /**
   * Deleta um anime
   */
  async deleteAnime(id: number): Promise<void> {
    try {
      await api.delete(`${this.basePath}/${id}`);
    } catch (error: any) {
      console.error('Erro ao deletar anime:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao deletar anime'
      );
    }
  }

  /**
   * Busca um anime por ID
   */
  async getAnimeById(id: number): Promise<AnimeCompleteDTO> {
    try {
      const response = await api.get<AnimeCompleteDTO>(`${this.basePath}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar anime:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Anime não encontrado'
      );
    }
  }

  /**
   * Lista todos os animes com paginação
   */
  async getAllAnimes(params: AnimeSearchParams = {}): Promise<PaginatedResponse<AnimeCompleteDTO>> {
    try {
      const {
        page = 0,
        size = 10,
        sortBy = 'dataCadastro',
        sortDir = 'desc'
      } = params;

      const response = await api.get<PaginatedResponse<AnimeCompleteDTO>>(this.basePath, {
        params: {
          page,
          size,
          sortBy,
          sortDir
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar animes:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao carregar animes'
      );
    }
  }

  /**
   * Busca animes por termo de pesquisa
   */
  async searchAnimes(searchTerm: string, params: AnimeSearchParams = {}): Promise<PaginatedResponse<AnimeCompleteDTO>> {
    try {
      const {
        page = 0,
        size = 10
      } = params;

      const response = await api.get<PaginatedResponse<AnimeCompleteDTO>>(`${this.basePath}/search`, {
        params: {
          q: searchTerm,
          page,
          size
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao pesquisar animes:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao pesquisar animes'
      );
    }
  }

  /**
   * Busca animes com filtros avançados (se implementado no backend)
   */
  async getAnimesWithFilters(filters: AdminAnimeFilters, params: AnimeSearchParams = {}): Promise<PaginatedResponse<AnimeCompleteDTO>> {
    try {
      const {
        page = 0,
        size = 10,
        sortBy = 'dataCadastro',
        sortDir = 'desc'
      } = params;

      const response = await api.get<PaginatedResponse<AnimeCompleteDTO>>(`${this.basePath}/filter`, {
        params: {
          ...filters,
          page,
          size,
          sortBy,
          sortDir
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao filtrar animes:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao filtrar animes'
      );
    }
  }

  /**
   * Operações em lote (se implementado no backend)
   */
  async bulkDeleteAnimes(ids: number[]): Promise<BulkOperationResponse> {
    try {
      const response = await api.delete<BulkOperationResponse>(`${this.basePath}/bulk`, {
        data: { ids }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao deletar animes em lote:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao deletar animes'
      );
    }
  }

  /**
   * Atualização em lote (se implementado no backend)
   */
  async bulkUpdateAnimes(ids: number[], updateData: Partial<UpdateAnimeDTO>): Promise<BulkOperationResponse> {
    try {
      const response = await api.put<BulkOperationResponse>(`${this.basePath}/bulk`, {
        ids,
        updateData
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar animes em lote:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao atualizar animes'
      );
    }
  }

  /**
   * Duplicar anime (se implementado no backend)
   */
  async duplicateAnime(id: number, newTitle?: string): Promise<AnimeCompleteDTO> {
    try {
      const response = await api.post<AnimeCompleteDTO>(`${this.basePath}/${id}/duplicate`, {
        newTitle
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao duplicar anime:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao duplicar anime'
      );
    }
  }

  /**
   * Alterar status do anime (ativo/inativo)
   */
  async toggleAnimeStatus(id: number): Promise<AnimeCompleteDTO> {
    try {
      const response = await api.patch<AnimeCompleteDTO>(`${this.basePath}/${id}/toggle-status`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao alterar status do anime:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao alterar status'
      );
    }
  }

  /**
   * Validar dados do anime antes de enviar
   */
  validateAnimeData(data: CreateAnimeDTO | UpdateAnimeDTO): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validações para CreateAnimeDTO
    if ('title' in data && data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push('Título é obrigatório');
      } else if (data.title.length > 255) {
        errors.push('Título deve ter no máximo 255 caracteres');
      }
    }

    if ('anoLancamento' in data && data.anoLancamento !== undefined) {
      const currentYear = new Date().getFullYear();
      if (data.anoLancamento < 1900 || data.anoLancamento > currentYear + 5) {
        errors.push('Ano de lançamento inválido');
      }
    }

    if ('categoria' in data && data.categoria !== undefined) {
      if (!Array.isArray(data.categoria) || data.categoria.length === 0) {
        errors.push('Pelo menos uma categoria é obrigatória');
      }
    }

    if (data.sinopse && data.sinopse.length > 5000) {
      errors.push('Sinopse deve ter no máximo 5000 caracteres');
    }

    if (data.avaliacao !== undefined && data.avaliacao !== null) {
      if (data.avaliacao < 0 || data.avaliacao > 10) {
        errors.push('Avaliação deve estar entre 0 e 10');
      }
    }

    if (data.totalTemporadas !== undefined && data.totalTemporadas < 0) {
      errors.push('Total de temporadas deve ser maior ou igual a 0');
    }

    if (data.totalEpisodios !== undefined && data.totalEpisodios < 0) {
      errors.push('Total de episódios deve ser maior ou igual a 0');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitizar dados antes de enviar para API
   */
  sanitizeAnimeData<T extends CreateAnimeDTO | UpdateAnimeDTO>(data: T): T {
    const sanitized = { ...data };

    // Remover espaços extras do título
    if (sanitized.title) {
      sanitized.title = sanitized.title.trim();
    }

    // Remover espaços extras da sinopse
    if (sanitized.sinopse) {
      sanitized.sinopse = sanitized.sinopse.trim();
    }

    // Garantir que URLs não estejam vazias
    const urlFields = [
      'embed1', 'embed2', 'trailer', 'posterURL1', 'posterURL2',
      'backdropURL1', 'backdropURL2', 'backdropURL3', 'backdropURL4',
      'logoURL1', 'logoURL2'
    ] as const;

    urlFields.forEach(field => {
      if (sanitized[field] === '') {
        delete sanitized[field];
      }
    });

    return sanitized;
  }
}

// Exportar instância única do serviço
export const adminAnimeService = new AdminAnimeService();
export default adminAnimeService;