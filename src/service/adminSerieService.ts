import api from './api';
import type { 
  CreateSerieDTO, 
  UpdateSerieDTO, 
  CreateTemporadaDTO, 
  UpdateTemporadaDTO, 
  CreateEpisodioDTO, 
  UpdateEpisodioDTO,
  CreateSerieCompleteDTO,
} from '../types/adminTypes';
import type { SerieCompleteDTO } from '../types/mediaTypes';

// ==================== SERVIÇO ADMIN SÉRIE ====================

class AdminSerieService {
  
  // ==================== GERENCIAMENTO DE SÉRIES ====================

  /**
   * Criar uma nova série
   */
  async createSerie(createDTO: CreateSerieDTO): Promise<SerieCompleteDTO> {
    try {
      console.log('AdminSerieService: Criando série...', createDTO);
      
      const response = await api.post('/admin/series', createDTO);
      
      console.log('AdminSerieService: Série criada com sucesso', response.data);
      return response.data;
    } catch (error: any) {
      console.error('AdminSerieService: Erro ao criar série:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao criar série'
      );
    }
  }

  /**
   * Atualizar uma série existente
   */
  async updateSerie(id: number, updateDTO: UpdateSerieDTO): Promise<SerieCompleteDTO> {
    try {
      console.log(`AdminSerieService: Atualizando série ${id}...`, updateDTO);
      
      const response = await api.put(`/admin/series/${id}`, updateDTO);
      
      console.log('AdminSerieService: Série atualizada com sucesso', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao atualizar série ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao atualizar série'
      );
    }
  }

  /**
   * Deletar uma série
   */
  async deleteSerie(id: number): Promise<void> {
    try {
      console.log(`AdminSerieService: Deletando série ${id}...`);
      
      await api.delete(`/admin/series/${id}`);
      
      console.log('AdminSerieService: Série deletada com sucesso');
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao deletar série ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao deletar série'
      );
    }
  }

  /**
   * Criar uma série completa com temporadas e episódios
   */
  async createSerieComplete(createDTO: CreateSerieCompleteDTO): Promise<SerieCompleteDTO> {
    try {
      console.log('AdminSerieService: Criando série completa...', createDTO);
      
      const response = await api.post('/admin/series/complete', createDTO);
      
      console.log('AdminSerieService: Série completa criada com sucesso', response.data);
      return response.data;
    } catch (error: any) {
      console.error('AdminSerieService: Erro ao criar série completa:', error);
      
      // Tratamento específico para resposta de erro do backend
      let errorMessage = 'Erro ao criar série completa';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  // ==================== GERENCIAMENTO DE TEMPORADAS ====================

  /**
   * Criar uma nova temporada
   */
  async createTemporada(serieId: number, createDTO: CreateTemporadaDTO): Promise<any> {
    try {
      console.log(`AdminSerieService: Criando temporada para série ${serieId}...`, createDTO);
      
      const response = await api.post(`/admin/series/${serieId}/temporadas`, createDTO);
      
      console.log('AdminSerieService: Temporada criada com sucesso', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao criar temporada para série ${serieId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao criar temporada'
      );
    }
  }

  /**
   * Atualizar uma temporada existente
   */
  async updateTemporada(temporadaId: number, updateDTO: UpdateTemporadaDTO): Promise<any> {
    try {
      console.log(`AdminSerieService: Atualizando temporada ${temporadaId}...`, updateDTO);
      
      const response = await api.put(`/admin/series/temporadas/${temporadaId}`, updateDTO);
      
      console.log('AdminSerieService: Temporada atualizada com sucesso', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao atualizar temporada ${temporadaId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao atualizar temporada'
      );
    }
  }

  /**
   * Deletar uma temporada
   */
  async deleteTemporada(temporadaId: number): Promise<void> {
    try {
      console.log(`AdminSerieService: Deletando temporada ${temporadaId}...`);
      
      await api.delete(`/admin/series/temporadas/${temporadaId}`);
      
      console.log('AdminSerieService: Temporada deletada com sucesso');
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao deletar temporada ${temporadaId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao deletar temporada'
      );
    }
  }

  /**
   * Buscar temporadas de uma série
   */
  async getTemporadasBySerie(serieId: number): Promise<any[]> {
    try {
      console.log(`AdminSerieService: Buscando temporadas da série ${serieId}...`);
      
      const response = await api.get(`/admin/series/${serieId}/temporadas`);
      
      console.log('AdminSerieService: Temporadas encontradas', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao buscar temporadas da série ${serieId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao buscar temporadas'
      );
    }
  }

  // ==================== GERENCIAMENTO DE EPISÓDIOS ====================

  /**
   * Criar um novo episódio
   */
  async createEpisodio(temporadaId: number, createDTO: CreateEpisodioDTO): Promise<any> {
    try {
      console.log(`AdminSerieService: Criando episódio para temporada ${temporadaId}...`, createDTO);
      
      const response = await api.post(`/admin/series/temporadas/${temporadaId}/episodios`, createDTO);
      
      console.log('AdminSerieService: Episódio criado com sucesso', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao criar episódio para temporada ${temporadaId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao criar episódio'
      );
    }
  }

  /**
   * Atualizar um episódio existente
   */
  async updateEpisodio(episodioId: number, updateDTO: UpdateEpisodioDTO): Promise<any> {
    try {
      console.log(`AdminSerieService: Atualizando episódio ${episodioId}...`, updateDTO);
      
      const response = await api.put(`/admin/series/episodios/${episodioId}`, updateDTO);
      
      console.log('AdminSerieService: Episódio atualizado com sucesso', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao atualizar episódio ${episodioId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao atualizar episódio'
      );
    }
  }

  /**
   * Deletar um episódio
   */
  async deleteEpisodio(episodioId: number): Promise<void> {
    try {
      console.log(`AdminSerieService: Deletando episódio ${episodioId}...`);
      
      await api.delete(`/admin/series/episodios/${episodioId}`);
      
      console.log('AdminSerieService: Episódio deletado com sucesso');
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao deletar episódio ${episodioId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao deletar episódio'
      );
    }
  }

  /**
   * Buscar episódios de uma temporada
   */
  async getEpisodiosByTemporada(temporadaId: number): Promise<any[]> {
    try {
      console.log(`AdminSerieService: Buscando episódios da temporada ${temporadaId}...`);
      
      const response = await api.get(`/admin/series/temporadas/${temporadaId}/episodios`);
      
      console.log('AdminSerieService: Episódios encontrados', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao buscar episódios da temporada ${temporadaId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao buscar episódios'
      );
    }
  }

  /**
   * Buscar todos os episódios de uma série
   */
  async getEpisodiosBySerie(serieId: number): Promise<any[]> {
    try {
      console.log(`AdminSerieService: Buscando todos os episódios da série ${serieId}...`);
      
      const response = await api.get(`/admin/series/${serieId}/episodios`);
      
      console.log('AdminSerieService: Episódios encontrados', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`AdminSerieService: Erro ao buscar episódios da série ${serieId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao buscar episódios'
      );
    }
  }

  // ==================== MÉTODOS UTILITÁRIOS ====================

  /**
   * Validar dados de criação de série
   */
  validateCreateSerie(data: CreateSerieDTO | CreateSerieCompleteDTO): string[] {
    const errors: string[] = [];
    
    if (!data.title?.trim()) {
      errors.push('Título é obrigatório');
    }
    
    if (data.title && data.title.length > 255) {
      errors.push('Título deve ter no máximo 255 caracteres');
    }
    
    if (!data.anoLancamento) {
      errors.push('Ano de lançamento é obrigatório');
    }
    
    if (!data.categoria || data.categoria.length === 0) {
      errors.push('Pelo menos uma categoria é obrigatória');
    }
    
    if (data.sinopse && data.sinopse.length > 5000) {
      errors.push('Sinopse deve ter no máximo 5000 caracteres');
    }
    
    if (data.avaliacao !== undefined && (data.avaliacao < 0 || data.avaliacao > 10)) {
      errors.push('Avaliação deve estar entre 0 e 10');
    }
    
    return errors;
  }

  /**
   * Validar dados de criação de temporada
   */
  validateCreateTemporada(data: CreateTemporadaDTO): string[] {
    const errors: string[] = [];
    
    if (!data.numeroTemporada || data.numeroTemporada < 1) {
      errors.push('Número da temporada deve ser maior que 0');
    }
    
    if (!data.anoLancamento) {
      errors.push('Ano de lançamento é obrigatório');
    }

    return errors;
  }

  /**
   * Validar dados de criação de episódio
   */
  validateCreateEpisodio(data: CreateEpisodioDTO): string[] {
    const errors: string[] = [];
    
    if (!data.numeroEpisodio || data.numeroEpisodio < 1) {
      errors.push('Número do episódio deve ser maior que 0');
    }
    
    if (!data.title?.trim()) {
      errors.push('Título do episódio é obrigatório');
    }
    
    if (data.title && data.title.length > 255) {
      errors.push('Título deve ter no máximo 255 caracteres');
    }
    
    if (!data.duracaoMinutos || data.duracaoMinutos < 1) {
      errors.push('Duração deve ser maior que 0 minutos');
    }
    
    if (data.sinopse && data.sinopse.length > 2000) {
      errors.push('Sinopse deve ter no máximo 2000 caracteres');
    }
    
    return errors;
  }

  /**
   * Validar dados de criação de série completa
   */
  validateCreateSerieComplete(data: CreateSerieCompleteDTO): string[] {
    const errors: string[] = [];
    
    // Validar dados básicos da série
    const serieErrors = this.validateCreateSerie(data);
    errors.push(...serieErrors);
    
    // Validar posterURL1 obrigatório
    if (!data.posterURL1?.trim()) {
      errors.push('URL do poster principal é obrigatório');
    }
    
    // Validar temporadas
    if (!data.temporadas || data.temporadas.length === 0) {
      errors.push('Pelo menos uma temporada é obrigatória');
    } else {
      data.temporadas.forEach((temporada, tempIndex) => {
        if (!temporada.numeroTemporada || temporada.numeroTemporada < 1) {
          errors.push(`Temporada ${tempIndex + 1}: Número da temporada deve ser maior que 0`);
        }
        
        // Validar episódios
        if (!temporada.episodios || temporada.episodios.length === 0) {
          errors.push(`Temporada ${temporada.numeroTemporada}: Pelo menos um episódio é obrigatório`);
        } else {
          temporada.episodios.forEach((episodio, epIndex) => {
            if (!episodio.numeroEpisodio || episodio.numeroEpisodio < 1) {
              errors.push(`Temporada ${temporada.numeroTemporada}, Episódio ${epIndex + 1}: Número do episódio deve ser maior que 0`);
            }
            
            if (!episodio.title?.trim()) {
              errors.push(`Temporada ${temporada.numeroTemporada}, Episódio ${episodio.numeroEpisodio}: Título é obrigatório`);
            }
            
            if (episodio.title && episodio.title.length > 255) {
              errors.push(`Temporada ${temporada.numeroTemporada}, Episódio ${episodio.numeroEpisodio}: Título deve ter no máximo 255 caracteres`);
            }
            
            if (episodio.sinopse && episodio.sinopse.length > 2000) {
              errors.push(`Temporada ${temporada.numeroTemporada}, Episódio ${episodio.numeroEpisodio}: Sinopse deve ter no máximo 2000 caracteres`);
            }
            
            if (episodio.duracaoMinutos !== undefined && episodio.duracaoMinutos < 1) {
              errors.push(`Temporada ${temporada.numeroTemporada}, Episódio ${episodio.numeroEpisodio}: Duração deve ser maior que 0 minutos`);
            }
          });
        }
      });
    }
    
    return errors;
  }
}

// Exportar instância única do serviço
export const adminSerieService = new AdminSerieService();
export default adminSerieService;