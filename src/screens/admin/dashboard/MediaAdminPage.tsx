import React, { useState } from 'react';
import { superAdminService } from '../../../service/superAdminService';
import { toast } from 'react-toastify';

const MediaAdminPage: React.FC = () => {
  const [mediaId, setMediaId] = useState<string>('');
  const [mediaType, setMediaType] = useState<'movie' | 'serie' | 'anime'>('movie');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRemoveLikes = async () => {
    if (!mediaId) {
      toast.error('Por favor, insira o ID da mídia');
      return;
    }

    setIsLoading(true);
    try {
      const id = parseInt(mediaId);
      
      switch (mediaType) {
        case 'movie':
          await superAdminService.removeAllMovieLikes(id);
          break;
        case 'serie':
          await superAdminService.removeAllSerieLikes(id);
          break;
        case 'anime':
          await superAdminService.removeAllAnimeLikes(id);
          break;
      }

      toast.success(`Todos os likes do ${mediaType} foram removidos com sucesso!`);
      setMediaId('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao remover likes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromLists = async () => {
    if (!mediaId) {
      toast.error('Por favor, insira o ID da mídia');
      return;
    }

    setIsLoading(true);
    try {
      const id = parseInt(mediaId);
      
      switch (mediaType) {
        case 'movie':
          await superAdminService.removeMovieFromAllLists(id);
          break;
        case 'serie':
          await superAdminService.removeSerieFromAllLists(id);
          break;
        case 'anime':
          await superAdminService.removeAnimeFromAllLists(id);
          break;
      }

      toast.success(`${mediaType} removido de todas as listas com sucesso!`);
      setMediaId('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao remover das listas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanAllInteractions = async () => {
    if (!mediaId) {
      toast.error('Por favor, insira o ID da mídia');
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja limpar TODAS as interações (likes + listas) do ${mediaType} ID ${mediaId}? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const id = parseInt(mediaId);
      
      switch (mediaType) {
        case 'movie':
          await superAdminService.cleanAllMovieInteractions(id);
          break;
        case 'serie':
          await superAdminService.cleanAllSerieInteractions(id);
          break;
        case 'anime':
          await superAdminService.cleanAllAnimeInteractions(id);
          break;
      }

      toast.success(`Todas as interações do ${mediaType} foram limpas com sucesso!`);
      setMediaId('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao limpar interações');
    } finally {
      setIsLoading(false);
    }
  };

  const getMediaTypeLabel = (type: string) => {
    switch (type) {
      case 'movie':
        return 'Filme';
      case 'serie':
        return 'Série';
      case 'anime':
        return 'Anime';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Gerenciamento de Mídia
          </h1>
          <p className="text-gray-300">
            Gerencie likes, listas e interações de filmes, séries e animes
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Form Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Selecionar Mídia
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Media Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Tipo de Mídia
                </label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as 'movie' | 'serie' | 'anime')}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="movie">Filme</option>
                  <option value="serie">Série</option>
                  <option value="anime">Anime</option>
                </select>
              </div>

              {/* Media ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  ID da Mídia
                </label>
                <input
                  type="number"
                  value={mediaId}
                  onChange={(e) => setMediaId(e.target.value)}
                  placeholder="Digite o ID..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Selected Media Info */}
            {mediaId && (
              <div className="mt-4 p-4 bg-purple-500/20 rounded-lg border border-purple-400/30">
                <p className="text-purple-200">
                  <span className="font-medium">Selecionado:</span> {getMediaTypeLabel(mediaType)} ID {mediaId}
                </p>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Ações Disponíveis
            </h2>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Remove Likes */}
              <button
                onClick={handleRemoveLikes}
                disabled={!mediaId || isLoading}
                className="flex flex-col items-center p-6 bg-red-500/20 border border-red-400/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-1">Remover Likes</h3>
                <p className="text-gray-300 text-sm text-center">
                  Remove todos os likes desta mídia
                </p>
              </button>

              {/* Remove from Lists */}
              <button
                onClick={handleRemoveFromLists}
                disabled={!mediaId || isLoading}
                className="flex flex-col items-center p-6 bg-orange-500/20 border border-orange-400/30 rounded-lg hover:bg-orange-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-1">Remover das Listas</h3>
                <p className="text-gray-300 text-sm text-center">
                  Remove esta mídia de todas as listas
                </p>
              </button>

              {/* Clean All Interactions */}
              <button
                onClick={handleCleanAllInteractions}
                disabled={!mediaId || isLoading}
                className="flex flex-col items-center p-6 bg-red-600/20 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-1">Limpar Tudo</h3>
                <p className="text-gray-300 text-sm text-center">
                  Remove likes + listas (ação irreversível)
                </p>
              </button>
            </div>

            {/* Warning */}
            <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-yellow-200 font-medium">Atenção</p>
                  <p className="text-yellow-100 text-sm mt-1">
                    As ações de remoção são irreversíveis. Certifique-se de que está selecionando a mídia correta antes de prosseguir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="text-white">Processando...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaAdminPage;