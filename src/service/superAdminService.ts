import api from './api';
import type {
  UserListResponse,
  UserResponse,
  ApiResponse
} from '../types/userType';
import type { PaginatedResponseDTO } from '../types/mediaTypes';

export const superAdminService = {
  // Buscar usuários
  searchUsers: async (
    searchTerm?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponseDTO<UserListResponse>> => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await api.get(`/super-admin/search?${params.toString()}`);
    return response.data;
  },

  // ==================== GERENCIAMENTO DE USUÁRIOS ====================

  // Promover usuário
  promoteUser: async (userId: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put(`/super-admin/users/${userId}/promote`);
    return response.data;
  },

  // Rebaixar usuário
  demoteUser: async (userId: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put(`/super-admin/users/${userId}/demote`);
    return response.data;
  },

  // Deletar usuário
  deleteUser: async (userId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/users/${userId}`);
    return response.data;
  },

  // Atualizar plano do usuário para PREMIUM
  upgradeUserPlan: async (userId: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put(`/super-admin/users/${userId}/plan/upgrade`);
    return response.data;
  },

  // Cortar plano do usuário para FREE
  cutUserPlan: async (userId: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put(`/super-admin/users/${userId}/plan/cut`);
    return response.data;
  },

  // Bloquear usuário
  blockUser: async (userId: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put(`/super-admin/users/${userId}/block`);
    return response.data;
  },

  // Desbloquear usuário
  unblockUser: async (userId: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put(`/super-admin/users/${userId}/unblock`);
    return response.data;
  },

  // Obter informações do usuário
  getUserInfo: async (userId: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get(`/super-admin/users/${userId}`);
    return response.data;
  },

  // ==================== GERENCIAMENTO DE LIKES ====================

  // Remover todos os likes de um filme
  removeAllMovieLikes: async (movieId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/content/movies/${movieId}/likes`);
    return response.data;
  },

  // Remover todos os likes de uma série
  removeAllSerieLikes: async (serieId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/content/series/${serieId}/likes`);
    return response.data;
  },

  // Remover todos os likes de um anime
  removeAllAnimeLikes: async (animeId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/content/animes/${animeId}/likes`);
    return response.data;
  },

  // ==================== GERENCIAMENTO DE LISTAS ====================

  // Remover filme de todas as listas
  removeMovieFromAllLists: async (movieId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/content/movies/${movieId}/lists`);
    return response.data;
  },

  // Remover série de todas as listas
  removeSerieFromAllLists: async (serieId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/content/series/${serieId}/lists`);
    return response.data;
  },

  // Remover anime de todas as listas
  removeAnimeFromAllLists: async (animeId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/content/animes/${animeId}/lists`);
    return response.data;
  },

  // ==================== LIMPEZA COMPLETA DE INTERAÇÕES ====================

  // Limpar todas as interações de um filme (likes + listas)
  cleanAllMovieInteractions: async (movieId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/content/movies/${movieId}/interactions`);
    return response.data;
  },

  // Limpar todas as interações de uma série (likes + listas)
  cleanAllSerieInteractions: async (serieId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/content/series/${serieId}/interactions`);
    return response.data;
  },

  // Limpar todas as interações de um anime (likes + listas)
  cleanAllAnimeInteractions: async (animeId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/super-admin/content/animes/${animeId}/interactions`);
    return response.data;
  }
};