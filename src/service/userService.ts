import api from './api';
import authService from './authService';

// Types
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string; // Necessário para mudanças sensíveis
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  success: boolean;
}

export interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isAccountEnabled: boolean;
  isAccountLocked: boolean;
  isCredentialsExpired: boolean;
  isAccountExpired: boolean;
  adminPanel?: {
    id: string;
    adminLevel: number;
  };
}

class UserService {
  // Obter perfil do usuário atual
  async getCurrentUser(): Promise<UserResponse> {
    try {
      // Primeiro tenta pegar do localStorage (cache)
      const cachedUser = authService.getCurrentUser();
      if (cachedUser && authService.isAuthenticated()) {
        return cachedUser;
      }

      // Se não tem cache ou não está autenticado, busca da API
      const response = await api.get<UserResponse>('/users/me');
      
      // Atualiza o cache no localStorage
      authService.updateUserCache(response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter usuário atual:', error);
      
      if (error.response?.status === 401) {
        authService.logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      throw new Error(error.response?.data?.message || 'Erro ao carregar dados do usuário');
    }
  }

  // Atualizar perfil do usuário
  async updateCurrentUser(data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await api.put<ApiResponse<UserResponse>>('/users/me', data);
      
      // Atualiza o cache se a resposta contém os dados do usuário
      if (response.data.data) {
        authService.updateUserCache(response.data.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (error.response?.status === 401) {
        authService.logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 409) {
        throw new Error('Email já está em uso por outro usuário');
      } else {
        throw new Error('Erro ao atualizar perfil. Tente novamente.');
      }
    }
  }

  // Deletar conta do usuário
  async deleteCurrentUser(): Promise<ApiResponse> {
    try {
      // Verifica se está autenticado antes de tentar deletar
      if (!authService.isAuthenticated()) {
        throw new Error('Você precisa estar logado para deletar a conta');
      }

      // Verifica se o token existe no localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Faz a requisição DELETE simples - o token será enviado automaticamente pelo interceptor do axios
      const response = await api.delete<ApiResponse>('/users/me');

      console.log('Conta deletada com sucesso:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Não foi possível deletar a conta');
      } else if (error.response?.status === 401) {
        throw new Error('Sessão expirada ou token inválido. Faça login novamente.');
      } else if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para deletar esta conta');
      } else if (error.response?.status === 404) {
        throw new Error('Conta não encontrada');
      } else {
        throw new Error('Erro ao deletar conta. Tente novamente.');
      }
    }
  }

  // Verificar se o usuário está logado e os dados são válidos
  isUserValid(): boolean {
    return authService.isAuthenticated() && authService.getCurrentUser() !== null;
  }

  // Limpar cache do usuário
  clearUserCache(): void {
    authService.logout();
  }
}

// Instância singleton
const userService = new UserService();
export default userService;