import api from './api';
import type { 
  CreateMovieDTO, 
  UpdateMovieDTO
} from '../types/adminTypes';
import type { 
  MovieCompleteDTO
} from '../types/mediaTypes';



export interface SortOptions {
  field: 'title' | 'anoLancamento' | 'avaliacao' | 'duracaoMinutos' | 'dataCadastro';
  direction: 'asc' | 'desc';
}

// Constantes para validação (baseadas nas anotações do backend)
export const VALIDATION_RULES = {
  TITLE_REQUIRED: 'Título é obrigatório',
  YEAR_REQUIRED: 'Ano de lançamento é obrigatório',
  DURATION_MIN: 'Duração deve ser maior que 0',
  CATEGORY_REQUIRED: 'Categoria é obrigatória',
  RATING_MIN: 'Avaliação deve ser no mínimo 0',
  RATING_MAX: 'Avaliação deve ser no máximo 10'
} as const;

// ==================== SERVIÇO ADMIN MOVIE ====================

class AdminMovieService {
  
  // ==================== GERENCIAMENTO DE FILMES ====================

  /**
   * Criar um novo filme
   */
  async createMovie(createDTO: CreateMovieDTO): Promise<MovieCompleteDTO> {
    try {
      console.log('AdminMovieService: Criando filme...', createDTO);
      
      const response = await api.post('/admin/movies', createDTO);
      
      console.log('AdminMovieService: Filme criado com sucesso', response.data);
      return response.data;
    } catch (error: any) {
      console.error('AdminMovieService: Erro ao criar filme:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao criar filme'
      );
    }
  }

  /**
   * Atualizar um filme existente
   */
  async updateMovie(id: number, updateDTO: UpdateMovieDTO): Promise<MovieCompleteDTO> {
    try {
      console.log(`AdminMovieService: Atualizando filme ${id}...`, updateDTO);
      
      const response = await api.put(`/admin/movies/${id}`, updateDTO);
      
      console.log('AdminMovieService: Filme atualizado com sucesso', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`AdminMovieService: Erro ao atualizar filme ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao atualizar filme'
      );
    }
  }

  /**
   * Deletar um filme
   */
  async deleteMovie(id: number): Promise<void> {
    try {
      console.log(`AdminMovieService: Deletando filme ${id}...`);
      
      await api.delete(`/admin/movies/${id}`);
      
      console.log('AdminMovieService: Filme deletado com sucesso');
    } catch (error: any) {
      console.error(`AdminMovieService: Erro ao deletar filme ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao deletar filme'
      );
    }
  }

  // ==================== MÉTODOS UTILITÁRIOS ====================

  /**
   * Validar dados de criação de filme
   */
  validateCreateMovie(data: CreateMovieDTO): string[] {
    const errors: string[] = [];
    
    // Validações obrigatórias baseadas no DTO
    if (!data.title?.trim()) {
      errors.push(VALIDATION_RULES.TITLE_REQUIRED);
    }
    
    if (!data.anoLancamento) {
      errors.push(VALIDATION_RULES.YEAR_REQUIRED);
    }
    
    if (!data.duracaoMinutos || data.duracaoMinutos < 1) {
      errors.push(VALIDATION_RULES.DURATION_MIN);
    }
    
    if (!data.categoria || data.categoria.length === 0) {
      errors.push(VALIDATION_RULES.CATEGORY_REQUIRED);
    }
    
    // Validação de avaliação (opcional, mas com limites)
    if (data.avaliacao !== undefined) {
      if (data.avaliacao < 0) {
        errors.push(VALIDATION_RULES.RATING_MIN);
      }
      if (data.avaliacao > 10) {
        errors.push(VALIDATION_RULES.RATING_MAX);
      }
    }

    return errors;
  }

  /**
   * Validar dados de atualização de filme
   */
  validateUpdateMovie(data: UpdateMovieDTO): string[] {
    const errors: string[] = [];
    
    // Validações condicionais para campos opcionais
    if (data.title !== undefined && !data.title.trim()) {
      errors.push('Título não pode estar vazio');
    }
    
    if (data.duracaoMinutos !== undefined && data.duracaoMinutos < 1) {
      errors.push(VALIDATION_RULES.DURATION_MIN);
    }
    
    if (data.categoria !== undefined && data.categoria.length === 0) {
      errors.push('Pelo menos uma categoria deve ser selecionada');
    }
    
    if (data.avaliacao !== undefined) {
      if (data.avaliacao < 0) {
        errors.push(VALIDATION_RULES.RATING_MIN);
      }
      if (data.avaliacao > 10) {
        errors.push(VALIDATION_RULES.RATING_MAX);
      }
    }

    return errors;
  }

  /**
   * Formatar duração em formato legível
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}min`;
    }
    
    return `${hours}h ${mins}min`;
  }

  /**
   * Formatar rating em estrelas
   */
  formatRating(rating: number): string {
    return `${rating.toFixed(1)}/10`;
  }

  /**
   * Verificar se URL é válida
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Limpar dados de criação removendo campos vazios
   */
  cleanCreateMovieData(data: CreateMovieDTO): CreateMovieDTO {
    const cleanData: CreateMovieDTO = {
      title: data.title.trim(),
      anoLancamento: data.anoLancamento,
      duracaoMinutos: data.duracaoMinutos,
      categoria: data.categoria
    };

    // Adicionar campos opcionais apenas se tiverem valor
    if (data.sinopse?.trim()) cleanData.sinopse = data.sinopse.trim();
    if (data.tmdbId?.trim()) cleanData.tmdbId = data.tmdbId.trim();
    if (data.imdbId?.trim()) cleanData.imdbId = data.imdbId.trim();
    if (data.paisOrigen?.trim()) cleanData.paisOrigen = data.paisOrigen.trim();
    if (data.minAge?.trim()) cleanData.minAge = data.minAge.trim();
    if (data.avaliacao !== undefined) cleanData.avaliacao = data.avaliacao;
    if (data.embed1?.trim()) cleanData.embed1 = data.embed1.trim();
    if (data.embed2?.trim()) cleanData.embed2 = data.embed2.trim();
    if (data.trailer?.trim()) cleanData.trailer = data.trailer.trim();
    if (data.posterURL1?.trim()) cleanData.posterURL1 = data.posterURL1.trim();
    if (data.posterURL2?.trim()) cleanData.posterURL2 = data.posterURL2.trim();
    if (data.backdropURL1?.trim()) cleanData.backdropURL1 = data.backdropURL1.trim();
    if (data.backdropURL2?.trim()) cleanData.backdropURL2 = data.backdropURL2.trim();
    if (data.backdropURL3?.trim()) cleanData.backdropURL3 = data.backdropURL3.trim();
    if (data.backdropURL4?.trim()) cleanData.backdropURL4 = data.backdropURL4.trim();
    if (data.logoURL1?.trim()) cleanData.logoURL1 = data.logoURL1.trim();
    if (data.logoURL2?.trim()) cleanData.logoURL2 = data.logoURL2.trim();

    return cleanData;
  }

  /**
   * Limpar dados de atualização removendo campos vazios
   */
  cleanUpdateMovieData(data: UpdateMovieDTO): UpdateMovieDTO {
    const cleanData: UpdateMovieDTO = {};

    // Apenas adicionar campos que têm valores válidos
    if (data.title?.trim()) cleanData.title = data.title.trim();
    if (data.anoLancamento !== undefined) cleanData.anoLancamento = data.anoLancamento;
    if (data.duracaoMinutos !== undefined) cleanData.duracaoMinutos = data.duracaoMinutos;
    if (data.sinopse?.trim()) cleanData.sinopse = data.sinopse.trim();
    if (data.categoria && data.categoria.length > 0) cleanData.categoria = data.categoria;
    if (data.tmdbId?.trim()) cleanData.tmdbId = data.tmdbId.trim();
    if (data.imdbId?.trim()) cleanData.imdbId = data.imdbId.trim();
    if (data.paisOrigen?.trim()) cleanData.paisOrigen = data.paisOrigen.trim();
    if (data.minAge?.trim()) cleanData.minAge = data.minAge.trim();
    if (data.avaliacao !== undefined) cleanData.avaliacao = data.avaliacao;
    if (data.embed1?.trim()) cleanData.embed1 = data.embed1.trim();
    if (data.embed2?.trim()) cleanData.embed2 = data.embed2.trim();
    if (data.trailer?.trim()) cleanData.trailer = data.trailer.trim();
    if (data.posterURL1?.trim()) cleanData.posterURL1 = data.posterURL1.trim();
    if (data.posterURL2?.trim()) cleanData.posterURL2 = data.posterURL2.trim();
    if (data.backdropURL1?.trim()) cleanData.backdropURL1 = data.backdropURL1.trim();
    if (data.backdropURL2?.trim()) cleanData.backdropURL2 = data.backdropURL2.trim();
    if (data.backdropURL3?.trim()) cleanData.backdropURL3 = data.backdropURL3.trim();
    if (data.backdropURL4?.trim()) cleanData.backdropURL4 = data.backdropURL4.trim();
    if (data.logoURL1?.trim()) cleanData.logoURL1 = data.logoURL1.trim();
    if (data.logoURL2?.trim()) cleanData.logoURL2 = data.logoURL2.trim();

    return cleanData;
  }
}

// Exportar instância única do serviço
export const adminMovieService = new AdminMovieService();
export default adminMovieService;