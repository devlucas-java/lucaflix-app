import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Clock } from 'lucide-react';
import adminSerieService from '../../../service/adminSerieService';
import type { CreateEpisodioDTO, UpdateEpisodioDTO } from '../../../types/adminTypes';
import type { EpisodioDTO } from '../../../types/mediaTypes';

interface EpisodiosManagerProps {
  temporadaId: number;
  numeroTemporada: number;
  serieTitulo: string;
  episodiosIniciais?: EpisodioDTO[]; // Episódios já carregados
  onEpisodiosChange?: (episodios: EpisodioDTO[]) => void;
}

export const EpisodiosManager: React.FC<EpisodiosManagerProps> = ({
  temporadaId,
  numeroTemporada,
  serieTitulo,
  episodiosIniciais = [],
  onEpisodiosChange
}) => {
  const [episodios, setEpisodios] = useState<EpisodioDTO[]>(episodiosIniciais);
  const [isLoading, setIsLoading] = useState(!episodiosIniciais.length);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEpisodio, setEditingEpisodio] = useState<EpisodioDTO | null>(null);
  
  const [formData, setFormData] = useState({
    numeroEpisodio: 1,
    title: '',
    sinopse: '',
    duracaoMinutos: 45,
    dataCadastro: '', // Ajustado para corresponder à interface
    embed1: '',
    embed2: '', // Adicionado campo embed2
    thumbURL: ''
  });

  // Sincronizar com episódios iniciais
  useEffect(() => {
    if (episodiosIniciais.length > 0) {
      const sortedEpisodios = [...episodiosIniciais].sort((a, b) => a.numeroEpisodio - b.numeroEpisodio);
      setEpisodios(sortedEpisodios);
      setIsLoading(false);
    }
  }, [episodiosIniciais]);

  // Carregar episódios apenas se não foram fornecidos inicialmente
  useEffect(() => {
    if (!episodiosIniciais.length) {
      loadEpisodios();
    }
  }, [temporadaId, episodiosIniciais.length]);

  /**
   * Carrega todos os episódios da temporada
   */
  const loadEpisodios = async () => {
    try {
      setIsLoading(true);
      setErrors([]);
      
      const data = await adminSerieService.getEpisodiosByTemporada(temporadaId);
      const sortedEpisodios = (data || []).sort((a, b) => a.numeroEpisodio - b.numeroEpisodio);
      setEpisodios(sortedEpisodios);
      
      // Notifica o componente pai sobre os episódios carregados
      if (onEpisodiosChange) {
        onEpisodiosChange(sortedEpisodios);
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar episódios:', error);
      setErrors([error.message || 'Erro ao carregar episódios']);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza o estado local e notifica o componente pai
   */
  const updateEpisodiosState = (newEpisodios: EpisodioDTO[]) => {
    const sortedEpisodios = [...newEpisodios].sort((a, b) => a.numeroEpisodio - b.numeroEpisodio);
    setEpisodios(sortedEpisodios);
    
    if (onEpisodiosChange) {
      onEpisodiosChange(sortedEpisodios);
    }
  };

  /**
   * Manipula mudanças no formulário
   */
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors.length > 0) {
      setErrors([]);
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  /**
   * Prepara DTO para criação/atualização
   */
  const prepareEpisodioDTO = (): CreateEpisodioDTO | UpdateEpisodioDTO => {
    const dto: any = {
      numeroEpisodio: formData.numeroEpisodio,
      title: formData.title.trim(),
      duracaoMinutos: formData.duracaoMinutos
    };

    // Campos opcionais
    if (formData.sinopse.trim()) {
      dto.sinopse = formData.sinopse.trim();
    }
    
    if (formData.dataCadastro) {
      dto.dataCadastro = formData.dataCadastro;
    }
    
    if (formData.embed1.trim()) {
      dto.embed1 = formData.embed1.trim();
    }
    
    if (formData.embed2.trim()) {
      dto.embed2 = formData.embed2.trim();
    }
    
    if (formData.thumbURL.trim()) {
      dto.thumbURL = formData.thumbURL.trim();
    }

    return dto;
  };

  /**
   * Cria um novo episódio
   */
  const handleCreateEpisodio = async () => {
    try {
      setIsSubmitting(true);
      setErrors([]);
      setSuccessMessage('');
      
      const createDTO = prepareEpisodioDTO() as CreateEpisodioDTO;
      
      // Validação
      const validationErrors = adminSerieService.validateCreateEpisodio(createDTO);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Verificar se já existe episódio com esse número
      const existingEpisodio = episodios.find(e => e.numeroEpisodio === createDTO.numeroEpisodio);
      if (existingEpisodio) {
        setErrors([`Já existe um episódio com o número ${createDTO.numeroEpisodio}`]);
        return;
      }
      
      const result = await adminSerieService.createEpisodio(temporadaId, createDTO);
      
      // Adiciona o novo episódio ao estado
      const newEpisodios = [...episodios, result];
      updateEpisodiosState(newEpisodios);
      
      setSuccessMessage(`Episódio ${result.numeroEpisodio} - "${result.title}" criado com sucesso!`);
      
      // Reset form
      resetForm();
      setShowAddForm(false);
      
    } catch (error: any) {
      console.error('Erro ao criar episódio:', error);
      setErrors([error.message || 'Erro ao criar episódio']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Atualiza um episódio existente
   */
  const handleUpdateEpisodio = async () => {
    if (!editingEpisodio || !editingEpisodio.id) return;
    
    try {
      setIsSubmitting(true);
      setErrors([]);
      setSuccessMessage('');
      
      const updateDTO = prepareEpisodioDTO() as UpdateEpisodioDTO;
      
      // Validação
      const validationErrors = adminSerieService.validateCreateEpisodio(updateDTO as CreateEpisodioDTO);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Verificar se já existe outro episódio com esse número
      const existingEpisodio = episodios.find(e => 
        e.numeroEpisodio === updateDTO.numeroEpisodio && e.id !== editingEpisodio.id
      );
      if (existingEpisodio) {
        setErrors([`Já existe outro episódio com o número ${updateDTO.numeroEpisodio}`]);
        return;
      }
      
      const result = await adminSerieService.updateEpisodio(editingEpisodio.id, updateDTO);
      
      // Atualiza o episódio no estado
      const newEpisodios = episodios.map(ep => 
        ep.id === editingEpisodio.id ? result : ep
      );
      updateEpisodiosState(newEpisodios);
      
      setSuccessMessage(`Episódio ${result.numeroEpisodio} - "${result.title}" atualizado com sucesso!`);
      setEditingEpisodio(null);
      
    } catch (error: any) {
      console.error('Erro ao atualizar episódio:', error);
      setErrors([error.message || 'Erro ao atualizar episódio']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Deleta um episódio
   */
  const handleDeleteEpisodio = async (episodio: EpisodioDTO) => {
    if (!episodio.id) return;
    
    const confirmed = window.confirm(
      `Tem certeza que deseja deletar o Episódio ${episodio.numeroEpisodio} - "${episodio.title}"?\n\n` +
      'ATENÇÃO: Esta ação não pode ser desfeita!'
    );
    
    if (!confirmed) return;
    
    try {
      setIsSubmitting(true);
      setErrors([]);
      setSuccessMessage('');
      
      await adminSerieService.deleteEpisodio(episodio.id);
      
      // Remove o episódio do estado
      const newEpisodios = episodios.filter(ep => ep.id !== episodio.id);
      updateEpisodiosState(newEpisodios);
      
      setSuccessMessage(`Episódio ${episodio.numeroEpisodio} - "${episodio.title}" deletado com sucesso!`);
      
    } catch (error: any) {
      console.error('Erro ao deletar episódio:', error);
      setErrors([error.message || 'Erro ao deletar episódio']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Inicia a edição de um episódio
   */
  const startEditEpisodio = (episodio: EpisodioDTO) => {
    setEditingEpisodio(episodio);
    setFormData({
      numeroEpisodio: episodio.numeroEpisodio,
      title: episodio.title,
      sinopse: episodio.sinopse || '',
      duracaoMinutos: episodio.duracaoMinutos || 45,
      dataCadastro: episodio.dataCadastro ? new Date(episodio.dataCadastro).toISOString().split('T')[0] : '',
      embed1: episodio.embed1 || '',
      embed2: episodio.embed2 || '',
      thumbURL: '' // Removido campo thumbURL da interface EpisodioDTO
    });
    setShowAddForm(false);
  };

  /**
   * Cancela a edição
   */
  const cancelEdit = () => {
    setEditingEpisodio(null);
    resetForm();
  };

  /**
   * Reseta o formulário
   */
  const resetForm = () => {
    setFormData({
      numeroEpisodio: Math.max(...episodios.map(e => e.numeroEpisodio), 0) + 1,
      title: '',
      sinopse: '',
      duracaoMinutos: 45,
      dataCadastro: '',
      embed1: '',
      embed2: '',
      thumbURL: ''
    });
  };

  /**
   * Formata duração em minutos para formato legível
   */
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  /**
   * Formata data para exibição
   */
  const formatDate = (dateValue?: string | Date): string => {
    if (!dateValue) return 'N/A';
    
    try {
      const date = new Date(dateValue);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Carregando episódios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            Episódios - Temporada {numeroTemporada}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {serieTitulo} • {episodios.length} episódios
          </p>
        </div>
        
        {!showAddForm && !editingEpisodio && (
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              resetForm();
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Episódio
          </button>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Corrija os seguintes erros:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingEpisodio) && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h5 className="text-lg font-medium text-gray-900 mb-4">
            {editingEpisodio ? 'Editar Episódio' : 'Novo Episódio'}
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Episódio *
              </label>
              <input
                type="number"
                min="1"
                value={formData.numeroEpisodio}
                onChange={(e) => handleInputChange('numeroEpisodio', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração (minutos) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.duracaoMinutos}
                onChange={(e) => handleInputChange('duracaoMinutos', parseInt(e.target.value) || 45)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 45"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título do episódio"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sinopse
            </label>
            <textarea
              value={formData.sinopse}
              onChange={(e) => handleInputChange('sinopse', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sinopse do episódio"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Cadastro
            </label>
            <input
              type="date"
              value={formData.dataCadastro}
              onChange={(e) => handleInputChange('dataCadastro', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Vídeo 1
              </label>
              <input
                type="url"
                value={formData.embed1}
                onChange={(e) => handleInputChange('embed1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Vídeo 2
              </label>
              <input
                type="url"
                value={formData.embed2}
                onChange={(e) => handleInputChange('embed2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                cancelEdit();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={editingEpisodio ? handleUpdateEpisodio : handleCreateEpisodio}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingEpisodio ? 'Atualizando...' : 'Criando...'}
                </div>
              ) : (
                editingEpisodio ? 'Atualizar' : 'Criar'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Episódios */}
      {episodios.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Play className="mx-auto h-12 w-12" />
          </div>
          <h5 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum episódio encontrado
          </h5>
          <p className="text-gray-600">
            Adicione o primeiro episódio desta temporada
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {episodios.map((episodio) => (
            <div key={episodio.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Ep. {episodio.numeroEpisodio}
                    </span>
                    <h6 className="text-lg font-medium text-gray-900">
                      {episodio.title}
                    </h6>
                  </div>
                  
                  {episodio.sinopse && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {episodio.sinopse}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(episodio.duracaoMinutos)}
                    </div>
                    
                    {(episodio.embed1 || episodio.embed2) && (
                      <div className="flex items-center">
                        <Play className="w-4 h-4 mr-1" />
                        {episodio.embed1 && episodio.embed2 ? '2 vídeos' : 'Vídeo disponível'}
                      </div>
                    )}
                    
                    {episodio.dataCadastro && (
                      <div className="text-xs text-gray-400">
                        Cadastrado em: {formatDate(episodio.dataCadastro)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => startEditEpisodio(episodio)}
                    disabled={isSubmitting}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Editar episódio"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteEpisodio(episodio)}
                    disabled={isSubmitting}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Deletar episódio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};