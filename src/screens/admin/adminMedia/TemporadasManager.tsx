import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import adminSerieService from '../../../service/adminSerieService';
import { serieService } from '../../../service/seriesService'; // Import adicionado
import { EpisodiosManager } from './EpisodioManager';
import type { CreateTemporadaDTO, UpdateTemporadaDTO } from '../../../types/adminTypes';
import type { EpisodioDTO, SerieCompleteDTO, TemporadaDTO } from '../../../types/mediaTypes'; // Import adicionado



interface TemporadasManagerProps {
  serieId: number;
  serieTitulo: string;
  temporadasIniciais?: TemporadaDTO[]; // Temporadas com episódios já carregados
  onTemporadasChange?: (temporadas: TemporadaDTO[]) => void;
}

export const TemporadasManager: React.FC<TemporadasManagerProps> = ({
  serieId,
  serieTitulo,
  temporadasIniciais = [],
  onTemporadasChange
}) => {
  const [temporadas, setTemporadas] = useState<TemporadaDTO[]>(temporadasIniciais);
  const [isLoading, setIsLoading] = useState(!temporadasIniciais.length);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTemporada, setEditingTemporada] = useState<TemporadaDTO | null>(null);
  const [expandedTemporadas, setExpandedTemporadas] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState({
    numeroTemporada: 1,
    anoLancamento: new Date().getFullYear()
  });

  // Sincronizar com temporadas iniciais
  useEffect(() => {
    if (temporadasIniciais.length > 0) {
      console.log('Temporadas iniciais recebidas:', temporadasIniciais);
      setTemporadas(temporadasIniciais);
      setIsLoading(false);
    }
  }, [temporadasIniciais]);

  // Carregar temporadas apenas se não foram fornecidas inicialmente
  useEffect(() => {
    if (!temporadasIniciais.length) {
      loadTemporadas();
    }
  }, [serieId, temporadasIniciais.length]);

  /**
   * Carrega todas as temporadas da série com episódios
   * CORREÇÃO: Usar serieService.getSerieById em vez de adminSerieService.getTemporadasBySerie
   */
  const loadTemporadas = async () => {
    try {
      setIsLoading(true);
      setErrors([]);
      
      console.log(`Carregando temporadas da série ID: ${serieId}`);
      
      // CORREÇÃO: Usar o serieService para buscar a série completa
      const serieCompleta: SerieCompleteDTO = await serieService.getSerieById(serieId);
      
      console.log('Série completa carregada:', serieCompleta);
      
      // Extrair temporadas da série completa
      const temporadasData = serieCompleta.temporadas || [];
      
      console.log('Temporadas extraídas:', temporadasData);
      
      // Verificar se temporadasData é um array
      if (!Array.isArray(temporadasData)) {
        console.error('temporadasData não é um array:', temporadasData);
        throw new Error('Formato de dados inválido: temporadas deve ser um array');
      }
      
      // As temporadas já vêm com episódios do backend, não precisa carregar separadamente
      const temporadasCompletas = temporadasData.map(temporada => ({
        ...temporada,
        episodios: temporada.episodios || [],
        totalEpisodios: temporada.episodios?.length || temporada.totalEpisodios || 0
      }));
      
      console.log('Temporadas processadas:', temporadasCompletas);
      
      setTemporadas(temporadasCompletas);
      
      // Notifica o componente pai sobre as temporadas carregadas
      if (onTemporadasChange) {
        onTemporadasChange(temporadasCompletas);
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar temporadas:', error);
      setErrors([error.message || 'Erro ao carregar temporadas']);
      
      // Tentar fallback com o método antigo se o novo falhar
      try {
        console.log('Tentando método fallback...');
        const temporadasFallback = await adminSerieService.getTemporadasBySerie(serieId);
        
        if (Array.isArray(temporadasFallback)) {
          // Carregar episódios para cada temporada
          const temporadasCompletas = await Promise.all(
            temporadasFallback.map(async (temporada) => {
              if (temporada.id) {
                try {
                  const episodios = await adminSerieService.getEpisodiosByTemporada(temporada.id);
                  return {
                    ...temporada,
                    episodios: episodios || [],
                    totalEpisodios: episodios?.length || 0
                  };
                } catch (error) {
                  console.error(`Erro ao carregar episódios da temporada ${temporada.numeroTemporada}:`, error);
                  return {
                    ...temporada,
                    episodios: [],
                    totalEpisodios: 0
                  };
                }
              }
              return temporada;
            })
          );
          
          setTemporadas(temporadasCompletas);
          
          if (onTemporadasChange) {
            onTemporadasChange(temporadasCompletas);
          }
          
          // Limpar erros se o fallback funcionou
          setErrors([]);
        } else {
          throw new Error('Método fallback também retornou dados inválidos');
        }
      } catch (fallbackError: any) {
        console.error('Erro no método fallback:', fallbackError);
        setErrors([fallbackError.message || 'Erro ao carregar temporadas']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza os episódios de uma temporada específica
   */
  const updateTemporadaEpisodios = (temporadaId: number, episodios: EpisodioDTO[]) => {
    console.log(`Atualizando episódios da temporada ${temporadaId}:`, episodios);
    
    setTemporadas(prev => {
      const updatedTemporadas = prev.map(temporada => 
        temporada.id === temporadaId 
          ? { 
              ...temporada, 
              episodios, 
              totalEpisodios: episodios.length 
            }
          : temporada
      );
      
      console.log('Temporadas atualizadas:', updatedTemporadas);
      
      // Notifica o componente pai sobre a mudança
      if (onTemporadasChange) {
        onTemporadasChange(updatedTemporadas);
      }
      
      return updatedTemporadas;
    });
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
  const prepareTemporadaDTO = (): CreateTemporadaDTO | UpdateTemporadaDTO => {
    return {
      numeroTemporada: formData.numeroTemporada,
      anoLancamento: formData.anoLancamento
    };
  };

  /**
   * Cria uma nova temporada
   */
  const handleCreateTemporada = async () => {
    try {
      setIsSubmitting(true);
      setErrors([]);
      setSuccessMessage('');
      
      const createDTO = prepareTemporadaDTO() as CreateTemporadaDTO;
      
      // Validação
      const validationErrors = adminSerieService.validateCreateTemporada(createDTO);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Verificar se já existe temporada com esse número
      const existingTemporada = temporadas.find(t => t.numeroTemporada === createDTO.numeroTemporada);
      if (existingTemporada) {
        setErrors([`Já existe uma temporada com o número ${createDTO.numeroTemporada}`]);
        return;
      }
      
      const result = await adminSerieService.createTemporada(serieId, createDTO);
      
      // Adiciona a nova temporada ao estado com episódios vazios
      const novaTemporada: TemporadaDTO = {
        ...result,
        episodios: [],
        totalEpisodios: 0
      };
      
      const updatedTemporadas = [...temporadas, novaTemporada].sort((a, b) => a.numeroTemporada - b.numeroTemporada);
      setTemporadas(updatedTemporadas);
      
      // Notifica o componente pai
      if (onTemporadasChange) {
        onTemporadasChange(updatedTemporadas);
      }
      
      setSuccessMessage(`Temporada ${result.numeroTemporada} criada com sucesso!`);
      
      // Reset form
      setFormData({
        numeroTemporada: Math.max(...temporadas.map(t => t.numeroTemporada), 0) + 1,
        anoLancamento: new Date().getFullYear()
      });
      
      setShowAddForm(false);
      
    } catch (error: any) {
      console.error('Erro ao criar temporada:', error);
      setErrors([error.message || 'Erro ao criar temporada']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Atualiza uma temporada existente
   */
  const handleUpdateTemporada = async () => {
    if (!editingTemporada || !editingTemporada.id) return;
    
    try {
      setIsSubmitting(true);
      setErrors([]);
      setSuccessMessage('');
      
      const updateDTO = prepareTemporadaDTO() as UpdateTemporadaDTO;
      
      // Validação
      const validationErrors = adminSerieService.validateCreateTemporada(updateDTO as CreateTemporadaDTO);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Verificar se já existe outra temporada com esse número
      const existingTemporada = temporadas.find(t => 
        t.numeroTemporada === updateDTO.numeroTemporada && t.id !== editingTemporada.id
      );
      if (existingTemporada) {
        setErrors([`Já existe outra temporada com o número ${updateDTO.numeroTemporada}`]);
        return;
      }
      
      const result = await adminSerieService.updateTemporada(editingTemporada.id, updateDTO);
      
      // Atualiza a temporada no estado mantendo os episódios
      const updatedTemporadas = temporadas.map(temporada => 
        temporada.id === editingTemporada.id 
          ? { ...temporada, ...result }
          : temporada
      ).sort((a, b) => a.numeroTemporada - b.numeroTemporada);
      
      setTemporadas(updatedTemporadas);
      
      // Notifica o componente pai
      if (onTemporadasChange) {
        onTemporadasChange(updatedTemporadas);
      }
      
      setSuccessMessage(`Temporada ${result.numeroTemporada} atualizada com sucesso!`);
      setEditingTemporada(null);
      
    } catch (error: any) {
      console.error('Erro ao atualizar temporada:', error);
      setErrors([error.message || 'Erro ao atualizar temporada']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Deleta uma temporada
   */
  const handleDeleteTemporada = async (temporada: TemporadaDTO) => {
    if (!temporada.id) return;
    
    const confirmed = window.confirm(
      `Tem certeza que deseja deletar a Temporada ${temporada.numeroTemporada}?\n\n` +
      'ATENÇÃO: Esta ação também deletará todos os episódios desta temporada e não pode ser desfeita!'
    );
    
    if (!confirmed) return;
    
    try {
      setIsSubmitting(true);
      setErrors([]);
      setSuccessMessage('');
      
      await adminSerieService.deleteTemporada(temporada.id);
      
      // Remove a temporada do estado
      const updatedTemporadas = temporadas.filter(t => t.id !== temporada.id);
      setTemporadas(updatedTemporadas);
      
      // Notifica o componente pai
      if (onTemporadasChange) {
        onTemporadasChange(updatedTemporadas);
      }
      
      setSuccessMessage(`Temporada ${temporada.numeroTemporada} deletada com sucesso!`);
      
    } catch (error: any) {
      console.error('Erro ao deletar temporada:', error);
      setErrors([error.message || 'Erro ao deletar temporada']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Inicia a edição de uma temporada
   */
  const startEditTemporada = (temporada: TemporadaDTO) => {
    setEditingTemporada(temporada);
    setFormData({
      numeroTemporada: temporada.numeroTemporada,
      anoLancamento: temporada.anoLancamento || new Date().getFullYear()
    });
    setShowAddForm(false);
  };

  /**
   * Cancela a edição
   */
  const cancelEdit = () => {
    setEditingTemporada(null);
    setFormData({
      numeroTemporada: Math.max(...temporadas.map(t => t.numeroTemporada), 0) + 1,
      anoLancamento: new Date().getFullYear()
    });
  };

  /**
   * Toggle de expansão da temporada
   */
  const toggleTemporadaExpansion = (temporadaId: number) => {
    setExpandedTemporadas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(temporadaId)) {
        newSet.delete(temporadaId);
      } else {
        newSet.add(temporadaId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Carregando temporadas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Temporadas - {serieTitulo}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie as temporadas e episódios desta série
            </p>
          </div>
          
          {!showAddForm && !editingTemporada && (
            <button
              type="button"
              onClick={() => {
                setShowAddForm(true);
                setFormData({
                  numeroTemporada: Math.max(...temporadas.map(t => t.numeroTemporada), 0) + 1,
                  anoLancamento: new Date().getFullYear()
                });
              }}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Temporada
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
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
        {(showAddForm || editingTemporada) && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              {editingTemporada ? 'Editar Temporada' : 'Nova Temporada'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número da Temporada *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numeroTemporada}
                  onChange={(e) => handleInputChange('numeroTemporada', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Ex: 1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano de Lançamento *
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2030"
                  value={formData.anoLancamento}
                  onChange={(e) => handleInputChange('anoLancamento', parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Ex: 2025"
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
                onClick={editingTemporada ? handleUpdateTemporada : handleCreateTemporada}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingTemporada ? 'Atualizando...' : 'Criando...'}
                  </div>
                ) : (
                  editingTemporada ? 'Atualizar' : 'Criar'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Lista de Temporadas */}
        {temporadas.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma temporada encontrada
            </h3>
            <p className="text-gray-600">
              Adicione a primeira temporada para começar a organizar os episódios
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {temporadas.map((temporada) => (
              <div key={temporada.id} className="border border-gray-200 rounded-lg">
                {/* Header da Temporada */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => temporada.id && toggleTemporadaExpansion(temporada.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {temporada.id && expandedTemporadas.has(temporada.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        Temporada {temporada.numeroTemporada}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {temporada.anoLancamento && `Ano: ${temporada.anoLancamento}`}
                        {temporada.totalEpisodios !== undefined && ` • ${temporada.totalEpisodios} episódios`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditTemporada(temporada)}
                      disabled={isSubmitting}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Editar temporada"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTemporada(temporada)}
                      disabled={isSubmitting}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Deletar temporada"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Episódios da Temporada */}
                {temporada.id && expandedTemporadas.has(temporada.id) && (
                  <div className="border-t border-gray-200">
                    <EpisodiosManager
                      temporadaId={temporada.id}
                      numeroTemporada={temporada.numeroTemporada}
                      serieTitulo={serieTitulo}
                      episodiosIniciais={temporada.episodios || []}
                      onEpisodiosChange={(episodios) => updateTemporadaEpisodios(temporada.id!, episodios)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};