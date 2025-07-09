import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Categoria, Type } from '../../../types/mediaTypes';
import { BasicInfoSection } from './BasicInfoSection';
import { MediaUrlsSection } from './MediaUrlsSection';
import { CategoriesSection } from './CategoriesSection';
import adminMovieService from '../../../service/adminMovieService';
import { movieService } from '../../../service/movieService';
import type { CreateMovieDTO, UpdateMovieDTO } from '../../../types/adminTypes';
import type { MovieCompleteDTO } from '../../../types/mediaTypes';

export const AdminMovieForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Determina se está editando baseado na presença do ID na URL
  const isEditing = Boolean(id);
  const currentType = Type.MOVIE;
  
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
    duracaoMinutos: 0,
    sinopse: '',
    avaliacao: 0,
    paisOrigen: '',
    minAge: 'L',
    
    // Media URLs
    embed1: '',
    embed2: '',
    trailer: '',
    posterURL1: '',
    posterURL2: '',
    backdropURL1: '',
    backdropURL2: '',
    logoURL1: '',
    logoURL2: '',
    tmdbId: '',
    imdbId: ''
  });

  // Carregar dados do filme se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      loadMovieData(parseInt(id));
    }
  }, [id, isEditing]);

  /**
   * Carrega os dados do filme para edição
   */
  const loadMovieData = async (movieId: number) => {
    try {
      setIsLoading(true);
      setErrors([]);
      
      console.log(`Carregando dados do filme ID: ${movieId}`);
      
      // Usa o movieService para buscar o filme completo
      const movieData: MovieCompleteDTO = await movieService.getMovieById(movieId);
      
      console.log('Dados do filme carregados:', movieData);
      
      // Preenche o formulário com os dados do filme
      setFormData({
        id: movieData.id,
        title: movieData.title || '',
        anoLancamento: movieData.anoLancamento || new Date().getFullYear(),
        duracaoMinutos: movieData.duracaoMinutos || 0,
        sinopse: movieData.sinopse || '',
        avaliacao: movieData.avaliacao || 0,
        paisOrigen: movieData.paisOrigen || '',
        minAge: movieData.minAge || 'L',
        embed1: movieData.embed1 || '',
        embed2: movieData.embed2 || '',
        trailer: movieData.trailer || '',
        posterURL1: movieData.posterURL1 || '',
        posterURL2: movieData.posterURL2 || '',
        backdropURL1: movieData.backdropURL1 || '',
        backdropURL2: movieData.backdropURL2 || '',
        logoURL1: movieData.logoURL1 || '',
        logoURL2: movieData.logoURL2 || '',
        tmdbId: movieData.tmdbId || '',
        imdbId: movieData.imdbId || ''
      });
      
      // Preenche categorias selecionadas
      if (movieData.categoria && Array.isArray(movieData.categoria)) {
        setSelectedCategories(movieData.categoria);
        console.log('Categorias carregadas:', movieData.categoria);
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar dados do filme:', error);
      const errorMessage = error.message || 'Erro ao carregar dados do filme';
      setErrors([errorMessage]);
      
      // Se não conseguir carregar o filme, pode ser que o ID seja inválido
      // Opcionalmente, redirecionar para a lista de filmes
      // navigate('/admin/movies');
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
   * Prepara DTO para criação de filme
   */
  const prepareCreateDTO = (): CreateMovieDTO => {
    const baseDTO: CreateMovieDTO = {
      title: formData.title.trim(),
      anoLancamento: formData.anoLancamento,
      duracaoMinutos: formData.duracaoMinutos,
      categoria: selectedCategories
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
    if (formData.logoURL1?.trim()) baseDTO.logoURL1 = formData.logoURL1.trim();
    if (formData.logoURL2?.trim()) baseDTO.logoURL2 = formData.logoURL2.trim();

    return baseDTO;
  };

  /**
   * Prepara DTO para atualização de filme
   */
  const prepareUpdateDTO = (): UpdateMovieDTO => {
    const updateDTO: UpdateMovieDTO = {};

    // Inclui apenas campos que têm valor (mesmo que seja string vazia para alguns campos)
    if (formData.title?.trim()) updateDTO.title = formData.title.trim();
    if (formData.anoLancamento) updateDTO.anoLancamento = formData.anoLancamento;
    if (formData.duracaoMinutos > 0) updateDTO.duracaoMinutos = formData.duracaoMinutos;
    if (selectedCategories.length > 0) updateDTO.categoria = selectedCategories;
    
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
      duracaoMinutos: 0,
      sinopse: '',
      avaliacao: 0,
      paisOrigen: '',
      minAge: 'L',
      embed1: '',
      embed2: '',
      trailer: '',
      posterURL1: '',
      posterURL2: '',
      backdropURL1: '',
      backdropURL2: '',
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
   * Manipula a confirmação de deletar filme
   */
  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  /**
   * Cancela a operação de deletar
   */
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  /**
   * Executa a deleção do filme
   */
  const handleDeleteMovie = async () => {
    if (!id) return;

    setIsDeleting(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      console.log(`Iniciando deleção do filme ID: ${id}`);
      
      await adminMovieService.deleteMovie(parseInt(id));
      
      console.log('Filme deletado com sucesso');
      setSuccessMessage(`Filme "${formData.title}" foi deletado com sucesso!`);
      
      // Redireciona para a lista de filmes após 2 segundos
      setTimeout(() => {
        navigate('/admin/movies');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao deletar filme:', error);
      const errorMessage = error.message || 'Erro ao deletar filme';
      setErrors([errorMessage]);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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
        console.log('Iniciando atualização do filme...');
        
        const updateDTO = prepareUpdateDTO();
        console.log('DTO de atualização preparado:', updateDTO);
        
        // Valida os dados antes de enviar
        const validationErrors = adminMovieService.validateUpdateMovie(updateDTO);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }

        // Limpa os dados antes de enviar
        const cleanData = adminMovieService.cleanUpdateMovieData(updateDTO);
        console.log('Dados limpos para atualização:', cleanData);
        
        // Chama o serviço de atualização
        const result = await adminMovieService.updateMovie(parseInt(id), cleanData);
        
        console.log('Filme atualizado com sucesso:', result);
        setSuccessMessage(`Filme "${result.title}" atualizado com sucesso!`);
        
        // Opcional: navegar de volta para a lista ou detalhes
        // setTimeout(() => {
        //   navigate('/admin/movies');
        // }, 2000);
        
      } else {
        // ========== MODO CRIAÇÃO ==========
        console.log('Iniciando criação do filme...');
        
        const createDTO = prepareCreateDTO();
        console.log('DTO de criação preparado:', createDTO);
        
        // Valida os dados antes de enviar
        const validationErrors = adminMovieService.validateCreateMovie(createDTO);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }

        // Limpa os dados antes de enviar
        const cleanData = adminMovieService.cleanCreateMovieData(createDTO);
        console.log('Dados limpos para criação:', cleanData);
        
        // Chama o serviço de criação
        const result = await adminMovieService.createMovie(cleanData);
        
        console.log('Filme criado com sucesso:', result);
        setSuccessMessage(`Filme "${result.title}" criado com sucesso!`);
        
        // Reset form após criação bem-sucedida
        setTimeout(() => {
          resetForm();
        }, 2000);
      }

    } catch (error: any) {
      console.error('Erro ao processar filme:', error);
      const errorMessage = error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} filme`;
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
            <span className="ml-3 text-gray-600">Carregando dados do filme...</span>
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
                {isEditing ? 'Editar Filme' : 'Criar Novo Filme'}
              </h1>
              <p className="mt-2 text-gray-600">
                {isEditing 
                  ? `Modifique as informações do filme "${formData.title}" abaixo.`
                  : 'Preencha as informações abaixo para adicionar um novo filme ao catálogo.'
                }
              </p>
            </div>
            
            {/* Breadcrumb ou link de volta */}
            <button
              type="button"
              onClick={() => navigate('/admin/movies')}
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

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="mt-5 text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Confirmar Exclusão
                    </h3>
                    <div className="mt-2 px-7 py-3">
                      <p className="text-sm text-gray-500">
                        Tem certeza que deseja deletar o filme <strong>"{formData.title}"</strong>?
                        Esta ação não pode ser desfeita.
                      </p>
                    </div>
                    <div className="flex justify-center space-x-4 px-4 py-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        onClick={handleDeleteCancel}
                        disabled={isDeleting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                        onClick={handleDeleteMovie}
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
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            {/* Botão Deletar (apenas no modo edição) */}
            <div>
              {isEditing && (
                <button
                  type="button"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting || isDeleting}
                >
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Deletar Filme
                  </div>
                </button>
              )}
            </div>

            {/* Botões de Ação Principal */}
            <div className="flex space-x-4">
              {/* Botão Limpar (apenas no modo criação) */}
              {!isEditing && (
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={resetForm}
                  disabled={isSubmitting || isDeleting}
                >
                  Limpar Formulário
                </button>
              )}
              
              {/* Botão Cancelar (apenas no modo edição) */}
              {isEditing && (
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => navigate(`/movie/${formData.id}`)}
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px]"
              >
                {isSubmitting 
                  ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEditing ? 'Atualizando...' : 'Criando...'}
                      </div>
                    )
                  : (isEditing ? 'Atualizar Filme' : 'Criar Filme')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};