import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Categoria, Type } from '../../../types/mediaTypes';
import { BasicInfoSection } from './BasicInfoSection';
import { MediaUrlsSection } from './MediaUrlsSection';
import { CategoriesSection } from './CategoriesSection';
import adminSerieService from '../../../service/adminSerieService';
import { serieService } from '../../../service/seriesService';
import type { CreateSerieDTO, UpdateSerieDTO } from '../../../types/adminTypes';
import type { SerieCompleteDTO } from '../../../types/mediaTypes';
import { TemporadasManager } from './TemporadasManager';

export const AdminSerieForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Determina se está editando baseado na presença do ID na URL
  const isEditing = Boolean(id);
  const currentType = Type.SERIE;
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Categoria[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    // Basic Info
    id: 0,
    title: '',
    anoLancamento: new Date().getFullYear(),
    totalTemporadas: 0,
    totalEpisodios: 0,
    sinopse: '',
    avaliacao: 0,
    paisOrigen: '',
    minAge: 'L',
    
    // Media URLs
    trailer: '',
    posterURL1: '',
    posterURL2: '',
    backdropURL1: '',
    backdropURL2: '',
    logoURL1: '',
    logoURL2: '',
    tmdbId: '',
    imdbId: '',
    
    // Campos adicionais que não são capturados no backend (só para compatibilidade do componente)
    embed1: '',
    embed2: ''
  });

  // Carregar dados da série se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      loadSerieData(parseInt(id));
    }
  }, [id, isEditing]);

  /**
   * Carrega os dados da série para edição
   */
  const loadSerieData = async (serieId: number) => {
    try {
      setIsLoading(true);
      setErrors([]);
      
      console.log(`Carregando dados da série ID: ${serieId}`);
      
      // Usa o serieService para buscar a série completa com temporadas e episódios
      const serieData: SerieCompleteDTO = await serieService.getSerieById(serieId);
      
      console.log('Dados da série carregados:', serieData);
      
      // Preenche o formulário com os dados da série
      setFormData({
        id: serieData.id || 0,
        title: serieData.title || '',
        anoLancamento: serieData.anoLancamento || new Date().getFullYear(),
        totalTemporadas: serieData.totalTemporadas || 0,
        totalEpisodios: serieData.totalEpisodios || 0,
        sinopse: serieData.sinopse || '',
        avaliacao: serieData.avaliacao || 0,
        paisOrigen: serieData.paisOrigen || '',
        minAge: serieData.minAge || 'L',
        trailer: serieData.trailer || '',
        posterURL1: serieData.posterURL1 || '',
        posterURL2: serieData.posterURL2 || '',
        backdropURL1: serieData.backdropURL1 || '',
        backdropURL2: serieData.backdropURL2 || '',
        logoURL1: serieData.logoURL1 || '',
        logoURL2: serieData.logoURL2 || '',
        tmdbId: serieData.tmdbId || '',
        imdbId: serieData.imdbId || '',
        // Campos não capturados no backend
        embed1: '',
        embed2: ''
      });
      
      // Preenche categorias selecionadas
      if (serieData.categoria && Array.isArray(serieData.categoria)) {
        setSelectedCategories(serieData.categoria);
        console.log('Categorias carregadas:', serieData.categoria);
      }
      
      // Log das temporadas carregadas (já vem com episódios completos)
      if (serieData.temporadas && Array.isArray(serieData.temporadas)) {
        console.log('Temporadas carregadas:', serieData.temporadas);
        console.log(`Total de temporadas: ${serieData.temporadas.length}`);
        
        // Log dos episódios de cada temporada
        serieData.temporadas.forEach(temporada => {
          console.log(`Temporada ${temporada.numeroTemporada}:`, {
            id: temporada.id,
            totalEpisodios: temporada.totalEpisodios,
            episodios: temporada.episodios?.length || 0
          });
        });
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar dados da série:', error);
      const errorMessage = error.message || 'Erro ao carregar dados da série';
      setErrors([errorMessage]);
      
      // Se não conseguir carregar a série, pode ser que o ID seja inválido
      // Opcionalmente, redirecionar para a lista de séries
      // navigate('/admin/series');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manipula mudanças nos campos do formulário
   */
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpa erros quando o usuário começa a digitar
    if (errors.length > 0) {
      setErrors([]);
    }
    
    // Limpa mensagem de sucesso
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  /**
   * Manipula a seleção/deseleção de categorias
   */
  const handleCategoryToggle = (categoria: Categoria) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria];
      
      console.log('Categorias atualizadas:', newCategories);
      return newCategories;
    });
    
    // Limpa erros quando categorias mudam
    if (errors.length > 0) {
      setErrors([]);
    }
    
    // Limpa mensagem de sucesso
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  /**
   * Prepara DTO para criação de série
   */
  const prepareCreateDTO = (): CreateSerieDTO => {
    const baseDTO: CreateSerieDTO = {
      title: formData.title.trim(),
      anoLancamento: formData.anoLancamento,
      categoria: selectedCategories
    };

    // Adiciona campos opcionais apenas se tiverem valor
    if (formData.sinopse?.trim()) baseDTO.sinopse = formData.sinopse.trim();
    if (formData.avaliacao > 0) baseDTO.avaliacao = formData.avaliacao;
    if (formData.paisOrigen?.trim()) baseDTO.paisOrigen = formData.paisOrigen.trim();
    if (formData.minAge?.trim()) baseDTO.minAge = formData.minAge.trim();
    if (formData.tmdbId?.trim()) baseDTO.tmdbId = formData.tmdbId.trim();
    if (formData.imdbId?.trim()) baseDTO.imdbId = formData.imdbId.trim();
    if (formData.trailer?.trim()) baseDTO.trailer = formData.trailer.trim();
    if (formData.posterURL1?.trim()) baseDTO.posterURL1 = formData.posterURL1.trim();
    if (formData.posterURL2?.trim()) baseDTO.posterURL2 = formData.posterURL2.trim();
    if (formData.backdropURL1?.trim()) baseDTO.backdropURL1 = formData.backdropURL1.trim();
    if (formData.backdropURL2?.trim()) baseDTO.backdropURL2 = formData.backdropURL2.trim();
    if (formData.logoURL1?.trim()) baseDTO.logoURL1 = formData.logoURL1.trim();
    if (formData.logoURL2?.trim()) baseDTO.logoURL2 = formData.logoURL2.trim();

    return baseDTO;
  };

  /**
   * Prepara DTO para atualização de série
   */
  const prepareUpdateDTO = (): UpdateSerieDTO => {
    const updateDTO: UpdateSerieDTO = {};

    // Inclui apenas campos que têm valor
    if (formData.title?.trim()) updateDTO.title = formData.title.trim();
    if (formData.anoLancamento) updateDTO.anoLancamento = formData.anoLancamento;
    if (selectedCategories.length > 0) updateDTO.categoria = selectedCategories;
    
    // Campos opcionais - inclui mesmo se estiver vazio para permitir "limpar" o campo
    updateDTO.sinopse = formData.sinopse?.trim() || '';
    updateDTO.avaliacao = formData.avaliacao;
    updateDTO.paisOrigen = formData.paisOrigen?.trim() || '';
    updateDTO.minAge = formData.minAge || 'L';
    updateDTO.tmdbId = formData.tmdbId?.trim() || '';
    updateDTO.imdbId = formData.imdbId?.trim() || '';
    updateDTO.trailer = formData.trailer?.trim() || '';
    updateDTO.posterURL1 = formData.posterURL1?.trim() || '';
    updateDTO.posterURL2 = formData.posterURL2?.trim() || '';
    updateDTO.backdropURL1 = formData.backdropURL1?.trim() || '';
    updateDTO.backdropURL2 = formData.backdropURL2?.trim() || '';
    updateDTO.logoURL1 = formData.logoURL1?.trim() || '';
    updateDTO.logoURL2 = formData.logoURL2?.trim() || '';

    return updateDTO;
  };

  /**
   * Reseta o formulário para o estado inicial
   */
  const resetForm = () => {
    setFormData({
      id: 0,
      title: '',
      anoLancamento: new Date().getFullYear(),
      totalTemporadas: 0,
      totalEpisodios: 0,
      sinopse: '',
      avaliacao: 0,
      paisOrigen: '',
      minAge: 'L',
      trailer: '',
      posterURL1: '',
      posterURL2: '',
      backdropURL1: '',
      backdropURL2: '',
      logoURL1: '',
      logoURL2: '',
      tmdbId: '',
      imdbId: '',
      embed1: '',
      embed2: ''
    });
    setSelectedCategories([]);
    setErrors([]);
    setSuccessMessage('');
  };

  /**
   * Manipula a exclusão da série
   */
  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      console.log(`Deletando série ID: ${id}`);
      
      await adminSerieService.deleteSerie(parseInt(id));
      
      console.log('Série deletada com sucesso');
      setSuccessMessage(`Série "${formData.title}" deletada com sucesso! Redirecionando...`);
      
      // Fechar modal e redirecionar após 2 segundos
      setShowDeleteModal(false);
      setTimeout(() => {
        navigate('/admin/series');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao deletar série:', error);
      const errorMessage = error.message || 'Erro ao deletar série';
      setErrors([errorMessage]);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Manipula o envio do formulário
   */
  const handleSubmit = async () => {
    setErrors([]);
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isEditing && id) {
        // ========== MODO EDIÇÃO ==========
        console.log('Iniciando atualização da série...');
        
        const updateDTO = prepareUpdateDTO();
        console.log('DTO de atualização preparado:', updateDTO);
        
        // Valida os dados antes de enviar
        const validationErrors = adminSerieService.validateCreateSerie(updateDTO as CreateSerieDTO);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }
        
        // Chama o serviço de atualização
        const result = await adminSerieService.updateSerie(parseInt(id), updateDTO);
        
        console.log('Série atualizada com sucesso:', result);
        setSuccessMessage(`Série "${result.title}" atualizada com sucesso!`);
        
        // Opcional: navegar de volta para a lista ou detalhes
        // setTimeout(() => {
        //   navigate('/admin/series');
        // }, 2000);
        
      } else {
        // ========== MODO CRIAÇÃO ==========
        console.log('Iniciando criação da série...');
        
        const createDTO = prepareCreateDTO();
        console.log('DTO de criação preparado:', createDTO);
        
        // Valida os dados antes de enviar
        const validationErrors = adminSerieService.validateCreateSerie(createDTO);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }
        
        // Chama o serviço de criação
        const result = await adminSerieService.createSerie(createDTO);
        
        console.log('Série criada com sucesso:', result);
        setSuccessMessage(`Série "${result.title}" criada com sucesso! Redirecionando para edição...`);
        
        // ========== AJUSTE: Redirecionar para modo de edição após criar ==========
        setTimeout(() => {
          console.log(`Redirecionando para /admin/serie/update/${result.id}`);
          navigate(`/admin/serie/update/${result.id}`);
        }, 2000);
      }

    } catch (error: any) {
      console.error('Erro ao processar série:', error);
      const errorMessage = error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} série`;
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Loading state para quando está carregando dados de edição
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Carregando dados da série...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Editar Série' : 'Criar Nova Série'}
              </h1>
              <p className="mt-2 text-gray-600">
                {isEditing 
                  ? `Modifique as informações da série "${formData.title}" abaixo.`
                  : 'Preencha as informações abaixo para adicionar uma nova série ao catálogo.'
                }
              </p>
            </div>
            
            {/* Breadcrumb ou link de volta */}
            <button
              type="button"
              onClick={() => navigate('/admin/series')}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              ← Voltar para lista
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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

          {/* Basic Info Section */}
          <BasicInfoSection
            type={currentType}
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Categories Section */}
          <CategoriesSection
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />

          {/* Media URLs Section */}
          <MediaUrlsSection
            type={currentType}
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Temporadas Manager - Só exibe no modo edição quando há um ID válido */}
          {isEditing && formData.id > 0 && (
            <TemporadasManager 
              serieId={formData.id}
              serieTitulo={formData.title}
              onTemporadasChange={(temporadas) => {
                // Atualizar contadores no formData com base nas temporadas carregadas
                const totalTemporadas = temporadas.length;
                const totalEpisodios = temporadas.reduce((sum, temp) => sum + (temp.totalEpisodios || 0), 0);
                
                console.log('Atualizando contadores:', {
                  totalTemporadas,
                  totalEpisodios,
                  temporadas: temporadas.map(t => ({
                    id: t.id,
                    numero: t.numeroTemporada,
                    episodios: t.totalEpisodios
                  }))
                });
                
                handleInputChange('totalTemporadas', totalTemporadas);
                handleInputChange('totalEpisodios', totalEpisodios);
              }}
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            {/* Botão Deletar (apenas no modo edição) */}
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isSubmitting || isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Deletar Série
                </div>
              </button>
            )}

            {/* Spacer para empurrar os outros botões para a direita quando não está editando */}
            {!isEditing && <div></div>}

            <div className="flex space-x-4">
              {/* Botão Limpar (apenas no modo criação) */}
              {!isEditing && (
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Limpar Formulário
                </button>
              )}
              
              {/* Botão Cancelar (apenas no modo edição) */}
              {isEditing && (
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => navigate(`/serie/${formData.id}`)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
              )}
              
              {/* Botão Submit */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px]"
              >
                {isSubmitting 
                  ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEditing ? 'Atualizando...' : 'Criando...'}
                      </div>
                    )
                  : (isEditing ? 'Atualizar Série' : 'Criar Série')
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Confirmar Exclusão</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Tem certeza que deseja deletar a série "{formData.title}"?
                </p>
                <p className="text-sm text-red-600 mt-2 font-medium">
                  Esta ação não pode ser desfeita. Todas as temporadas e episódios também serão removidos.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deletando...
                    </div>
                  ) : (
                    'Deletar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};