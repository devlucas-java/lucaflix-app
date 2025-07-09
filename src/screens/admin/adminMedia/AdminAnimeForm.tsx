import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Categoria, Type } from '../../../types/mediaTypes';
import { BasicInfoSection } from './BasicInfoSection';
import { MediaUrlsSection } from './MediaUrlsSection';
import { CategoriesSection } from './CategoriesSection';
import adminAnimeService from '../../../service/adminAnimeService';
import { animeService } from '../../../service/animeService';
import type { CreateAnimeDTO, UpdateAnimeDTO } from '../../../types/adminTypes';
import type { AnimeCompleteDTO } from '../../../types/mediaTypes';

export const AdminAnimeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Determina se está editando baseado na presença do ID na URL
  const isEditing = Boolean(id);
  const currentType = Type.ANIME;
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Categoria[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    // Basic Info
    id: 0,
    title: '',
    anoLancamento: new Date().getFullYear(),
    sinopse: '',
    avaliacao: 0,
    paisOrigen: '',
    minAge: 'L',
    totalTemporadas: 0,
    totalEpisodios: 0,
    
    // Media URLs
    embed1: '',
    embed2: '',
    trailer: '',
    posterURL1: '',
    posterURL2: '',
    backdropURL1: '',
    backdropURL2: '',
    backdropURL3: '',
    backdropURL4: '',
    logoURL1: '',
    logoURL2: '',
    tmdbId: '',
    imdbId: ''
  });

  // Carregar dados do anime se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      loadAnimeData(parseInt(id));
    }
  }, [id, isEditing]);

  /**
   * Carrega os dados do anime para edição
   */
  const loadAnimeData = async (animeId: number) => {
    try {
      setIsLoading(true);
      setErrors([]);
      
      console.log(`Carregando dados do anime ID: ${animeId}`);
      
      // Usa o animeService para buscar o anime completo
      const animeData: AnimeCompleteDTO = await animeService.getAnimeById(animeId);
      
      console.log('Dados do anime carregados:', animeData);
      
      // Preenche o formulário com os dados do anime
      setFormData({
        id: animeData.id,
        title: animeData.title || '',
        anoLancamento: animeData.anoLancamento || new Date().getFullYear(),
        sinopse: animeData.sinopse || '',
        avaliacao: animeData.avaliacao || 0,
        paisOrigen: animeData.paisOrigen || '',
        minAge: animeData.minAge || 'L',
        totalTemporadas: animeData.totalTemporadas || 0,
        totalEpisodios: animeData.totalEpisodios || 0,
        embed1: animeData.embed1 || '',
        embed2: animeData.embed2 || '',
        trailer: animeData.trailer || '',
        posterURL1: animeData.posterURL1 || '',
        posterURL2: animeData.posterURL2 || '',
        backdropURL1: animeData.backdropURL1 || '',
        backdropURL2: animeData.backdropURL2 || '',
        backdropURL3: animeData.backdropURL3 || '',
        backdropURL4: animeData.backdropURL4 || '',
        logoURL1: animeData.logoURL1 || '',
        logoURL2: animeData.logoURL2 || '',
        tmdbId: animeData.tmdbId || '',
        imdbId: animeData.imdbId || ''
      });
      
      // Preenche categorias selecionadas
      if (animeData.categoria && Array.isArray(animeData.categoria)) {
        setSelectedCategories(animeData.categoria);
        console.log('Categorias carregadas:', animeData.categoria);
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar dados do anime:', error);
      const errorMessage = error.message || 'Erro ao carregar dados do anime';
      setErrors([errorMessage]);
      
      // Se não conseguir carregar o anime, pode ser que o ID seja inválido
      // Opcionalmente, redirecionar para a lista de animes
      // navigate('/admin/animes');
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
   * Prepara DTO para criação de anime
   */
  const prepareCreateDTO = (): CreateAnimeDTO => {
    const baseDTO: CreateAnimeDTO = {
      title: formData.title.trim(),
      type: currentType,
      anoLancamento: formData.anoLancamento,
      categoria: selectedCategories,
      totalTemporadas: formData.totalTemporadas,
      totalEpisodios: formData.totalEpisodios
    };

    // Adiciona campos opcionais apenas se tiverem valor
    if (formData.sinopse?.trim()) baseDTO.sinopse = formData.sinopse.trim();
    if (formData.avaliacao > 0) baseDTO.avaliacao = formData.avaliacao;
    if (formData.paisOrigen?.trim()) baseDTO.paisOrigen = formData.paisOrigen.trim();
    if (formData.minAge?.trim()) baseDTO.minAge = formData.minAge.trim();
    if (formData.tmdbId?.trim()) baseDTO.tmdbId = formData.tmdbId.trim();
    if (formData.imdbId?.trim()) baseDTO.imdbId = formData.imdbId.trim();
    if (formData.embed1?.trim()) baseDTO.embed1 = formData.embed1.trim();
    if (formData.embed2?.trim()) baseDTO.embed2 = formData.embed2.trim();
    if (formData.trailer?.trim()) baseDTO.trailer = formData.trailer.trim();
    if (formData.posterURL1?.trim()) baseDTO.posterURL1 = formData.posterURL1.trim();
    if (formData.posterURL2?.trim()) baseDTO.posterURL2 = formData.posterURL2.trim();
    if (formData.backdropURL1?.trim()) baseDTO.backdropURL1 = formData.backdropURL1.trim();
    if (formData.backdropURL2?.trim()) baseDTO.backdropURL2 = formData.backdropURL2.trim();
    if (formData.backdropURL3?.trim()) baseDTO.backdropURL3 = formData.backdropURL3.trim();
    if (formData.backdropURL4?.trim()) baseDTO.backdropURL4 = formData.backdropURL4.trim();
    if (formData.logoURL1?.trim()) baseDTO.logoURL1 = formData.logoURL1.trim();
    if (formData.logoURL2?.trim()) baseDTO.logoURL2 = formData.logoURL2.trim();

    return baseDTO;
  };

  /**
   * Prepara DTO para atualização de anime
   */
  const prepareUpdateDTO = (): UpdateAnimeDTO => {
    const updateDTO: UpdateAnimeDTO = {};

    // Inclui apenas campos que têm valor (mesmo que seja string vazia para alguns campos)
    if (formData.title?.trim()) updateDTO.title = formData.title.trim();
    if (formData.anoLancamento) updateDTO.anoLancamento = formData.anoLancamento;
    if (selectedCategories.length > 0) updateDTO.categoria = selectedCategories;
    if (formData.totalTemporadas >= 0) updateDTO.totalTemporadas = formData.totalTemporadas;
    if (formData.totalEpisodios >= 0) updateDTO.totalEpisodios = formData.totalEpisodios;
    
    // Campos opcionais - inclui mesmo se estiver vazio para permitir "limpar" o campo
    updateDTO.sinopse = formData.sinopse?.trim() || '';
    updateDTO.avaliacao = formData.avaliacao;
    updateDTO.paisOrigen = formData.paisOrigen?.trim() || '';
    updateDTO.minAge = formData.minAge || 'L';
    updateDTO.tmdbId = formData.tmdbId?.trim() || '';
    updateDTO.imdbId = formData.imdbId?.trim() || '';
    updateDTO.embed1 = formData.embed1?.trim() || '';
    updateDTO.embed2 = formData.embed2?.trim() || '';
    updateDTO.trailer = formData.trailer?.trim() || '';
    updateDTO.posterURL1 = formData.posterURL1?.trim() || '';
    updateDTO.posterURL2 = formData.posterURL2?.trim() || '';
    updateDTO.backdropURL1 = formData.backdropURL1?.trim() || '';
    updateDTO.backdropURL2 = formData.backdropURL2?.trim() || '';
    updateDTO.backdropURL3 = formData.backdropURL3?.trim() || '';
    updateDTO.backdropURL4 = formData.backdropURL4?.trim() || '';
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
      sinopse: '',
      avaliacao: 0,
      paisOrigen: '',
      minAge: 'L',
      totalTemporadas: 0,
      totalEpisodios: 0,
      embed1: '',
      embed2: '',
      trailer: '',
      posterURL1: '',
      posterURL2: '',
      backdropURL1: '',
      backdropURL2: '',
      backdropURL3: '',
      backdropURL4: '',
      logoURL1: '',
      logoURL2: '',
      tmdbId: '',
      imdbId: ''
    });
    setSelectedCategories([]);
    setErrors([]);
    setSuccessMessage('');
  };

  /**
   * Manipula a deleção do anime
   */
  const handleDeleteAnime = async () => {
    if (!id) return;
    
    setErrors([]);
    setSuccessMessage('');
    setIsDeleting(true);

    try {
      console.log('Iniciando deleção do anime...');
      
      // Chama o serviço de deleção
      await adminAnimeService.deleteAnime(parseInt(id));
      
      console.log('Anime deletado com sucesso');
      setSuccessMessage(`Anime "${formData.title}" deletado com sucesso!`);
      
      // Fecha o modal de confirmação
      setShowDeleteConfirm(false);
      
      // Navega de volta para a lista após um pequeno delay
      setTimeout(() => {
        navigate('/admin/animes');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao deletar anime:', error);
      const errorMessage = error.message || 'Erro ao deletar anime';
      setErrors([errorMessage]);
      setShowDeleteConfirm(false);
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
        console.log('Iniciando atualização do anime...');
        
        const updateDTO = prepareUpdateDTO();
        console.log('DTO de atualização preparado:', updateDTO);
        
        // Valida os dados antes de enviar
        const validation = adminAnimeService.validateAnimeData(updateDTO);
        if (!validation.valid) {
          setErrors(validation.errors);
          return;
        }

        // Sanitiza os dados antes de enviar
        const cleanData = adminAnimeService.sanitizeAnimeData(updateDTO);
        console.log('Dados limpos para atualização:', cleanData);
        
        // Chama o serviço de atualização
        const result = await adminAnimeService.updateAnime(parseInt(id), cleanData);
        
        console.log('Anime atualizado com sucesso:', result);
        setSuccessMessage(`Anime "${result.title}" atualizado com sucesso!`);
        
        // Opcional: navegar de volta para a lista ou detalhes
        // setTimeout(() => {
        //   navigate('/admin/animes');
        // }, 2000);
        
      } else {
        // ========== MODO CRIAÇÃO ==========
        console.log('Iniciando criação do anime...');
        
        const createDTO = prepareCreateDTO();
        console.log('DTO de criação preparado:', createDTO);
        
        // Valida os dados antes de enviar
        const validation = adminAnimeService.validateAnimeData(createDTO);
        if (!validation.valid) {
          setErrors(validation.errors);
          return;
        }

        // Sanitiza os dados antes de enviar
        const cleanData = adminAnimeService.sanitizeAnimeData(createDTO);
        console.log('Dados limpos para criação:', cleanData);
        
        // Chama o serviço de criação
        const result = await adminAnimeService.createAnime(cleanData);
        
        console.log('Anime criado com sucesso:', result);
        setSuccessMessage(`Anime "${result.title}" criado com sucesso!`);
        
        // Reset form após criação bem-sucedida
        setTimeout(() => {
          resetForm();
        }, 2000);
      }

    } catch (error: any) {
      console.error('Erro ao processar anime:', error);
      const errorMessage = error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} anime`;
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
            <span className="ml-3 text-gray-600">Carregando dados do anime...</span>
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
                {isEditing ? 'Editar Anime' : 'Criar Novo Anime'}
              </h1>
              <p className="mt-2 text-gray-600">
                {isEditing 
                  ? `Modifique as informações do anime "${formData.title}" abaixo.`
                  : 'Preencha as informações abaixo para adicionar um novo anime ao catálogo.'
                }
              </p>
            </div>
            
            {/* Breadcrumb ou link de volta */}
            <button
              type="button"
              onClick={() => navigate('/admin/animes')}
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

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            {/* Botão Deletar (apenas no modo edição) */}
            {isEditing && (
              <button
                type="button"
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting || isDeleting}
              >
                Deletar Anime
              </button>
            )}
            
            {/* Espaço vazio quando não está editando */}
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
                  onClick={() => navigate(`/animes/${formData.id}`)}
                  disabled={isSubmitting || isDeleting}
                >
                  Cancelar
                </button>
              )}
              
              {/* Botão Submit */}
              <button
                type="button"
                disabled={isSubmitting || isDeleting}
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
                  : (isEditing ? 'Atualizar Anime' : 'Criar Anime')
                }
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Confirmação de Deleção */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Confirmar Deleção
              </h3>
              
              <p className="text-sm text-gray-500 text-center mb-6">
                Tem certeza que deseja deletar o anime "{formData.title}"? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeleteAnime}
                  disabled={isDeleting}
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
        )}
      </div>
    </div>
  );
};