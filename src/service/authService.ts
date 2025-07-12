import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../theme/theme';
import api from './api';

// Types baseados no seu backend
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface RegisterResponse {
  message: string;
  user: UserResponse;
}

export interface ApiError {
  error: string;
  message?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'authUser';
  private readonly REMEMBER_KEY = 'rememberMe';

  // Login do usuário (método original - sem rememberMe)
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      // Salvar token e dados do usuário sem persistência por padrão
      await this.setAuthData(response.data, false);
      
      return response.data;
    } catch (error: any) {
      if (theme.development) {
        console.error('Erro no login:', error);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Credenciais inválidas');
      } else if (error.response?.status === 403) {
        throw new Error('Conta bloqueada ou inativa');
      } else {
        throw new Error('Erro interno do servidor. Tente novamente.');
      }
    }
  }

  // Método para login com rememberMe - CORRIGIDO
  async loginWithRemember(credentials: LoginRequest, rememberMe: boolean): Promise<LoginResponse> {
    try {
      if (theme.development) {
        console.log('Fazendo login com rememberMe:', rememberMe);
      }
      
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      if (theme.development) {
        console.log('Resposta do servidor:', response.data);
      }
      
      // Salvar token e dados do usuário com preferência de storage
      await this.setAuthData(response.data, rememberMe);
      
      if (theme.development) {
        console.log('Dados salvos. Token:', await this.getToken());
        console.log('Usuário salvo:', await this.getCurrentUser());
      }
      
      return response.data;
    } catch (error: any) {
      if (theme.development) {
        console.error('Erro no login:', error);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Credenciais inválidas');
      } else if (error.response?.status === 403) {
        throw new Error('Conta bloqueada ou inativa');
      } else {
        throw new Error('Erro interno do servidor. Tente novamente.');
      }
    }
  }

  // Registro de novo usuário
  async register(userData: RegisterRequest): Promise<UserResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', userData);
      return response.data.user;
    } catch (error: any) {
      if (theme.development) {
        console.error('Erro no registro:', error);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 400) {
        throw new Error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (error.response?.status === 409) {
        throw new Error('Email já cadastrado no sistema');
      } else {
        throw new Error('Erro interno do servidor. Tente novamente.');
      }
    }
  }

  // Alterar senha
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      if (theme.development) {
        console.error('Erro ao alterar senha:', error);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 400) {
        throw new Error('Senha atual incorreta');
      } else {
        throw new Error('Erro ao alterar senha. Tente novamente.');
      }
    }
  }

  // Atualizar email
  async updateEmail(newEmail: string, currentPassword: string): Promise<void> {
    try {
      await api.post('/auth/update-email', {
        newEmail,
        currentPassword
      });
    } catch (error: any) {
      if (theme.development) {
        console.error('Erro ao atualizar email:', error);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 400) {
        throw new Error('Senha incorreta ou email inválido');
      } else if (error.response?.status === 409) {
        throw new Error('Email já está em uso');
      } else {
        throw new Error('Erro ao atualizar email. Tente novamente.');
      }
    }
  }

  // Verificar senha
  async verifyPassword(password: string): Promise<boolean> {
    try {
      const response = await api.post<{ valid: boolean }>('/auth/verify-password', {
        password
      });
      return response.data.valid;
    } catch (error: any) {
      if (theme.development) {
        console.error('Erro ao verificar senha:', error);
      }
      return false;
    }
  }

  // Logout - CORRIGIDO COMPLETAMENTE
  async logout(): Promise<void> {
    if (theme.development) {
      console.log('Iniciando logout...');
    }
    
    try {
      // 1. Tentar fazer logout no servidor (opcional - não bloqueia se falhar)
      try {
        await api.post('/auth/logout');
        if (theme.development) {
          console.log('Logout no servidor realizado com sucesso');
        }
      } catch (error) {
        if (theme.development) {
          console.warn('Erro ao fazer logout no servidor (continuando):', error);
        }
        // Não bloqueamos o logout local se o servidor falhar
      }
      
      // 2. Limpar todos os dados locais
      await this.clearAllAuthData();
      
      if (theme.development) {
        console.log('Logout local realizado com sucesso');
      }
      
    } catch (error) {
      console.error('Erro crítico no logout:', error);
      // Mesmo com erro, tentar limpar os dados
      try {
        await this.clearAllAuthData();
      } catch (clearError) {
        console.error('Erro ao limpar dados após falha no logout:', clearError);
      }
    }
  }

  // Método auxiliar para limpar todos os dados de autenticação
  private async clearAllAuthData(): Promise<void> {
    try {
      // Limpar AsyncStorage
      await AsyncStorage.multiRemove([
        this.TOKEN_KEY,
        this.USER_KEY,
        this.REMEMBER_KEY
      ]);
      
      // Limpar headers da API (se existir)
      if (api.defaults && api.defaults.headers) {
        delete api.defaults.headers.common['Authorization'];
        delete api.defaults.headers['Authorization'];
      }
      
      if (theme.development) {
        console.log('Todos os dados de autenticação foram limpos');
      }
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
      throw error;
    }
  }

  // Verificar se está autenticado - CORRIGIDO
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getCurrentUser();
      
      if (theme.development) {
        console.log('Verificando autenticação - Token:', !!token, 'User:', !!user);
      }
      
      if (!token || !user) {
        return false;
      }

      // Verificar se o token não expirou
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (theme.development) {
          console.log('Token expira em:', new Date(payload.exp * 1000));
          console.log('Hora atual:', new Date(currentTime * 1000));
        }
        
        if (payload.exp < currentTime) {
          if (theme.development) {
            console.log('Token expirado, fazendo logout...');
          }
          await this.logout();
          return false;
        }
        
        return true;
      } catch (error) {
        if (theme.development) {
          console.error('Token inválido:', error);
        }
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  // Versão síncrona para verificação rápida (baseada em cache)
  isAuthenticatedSync(): boolean {
    try {
      // Esta é uma verificação básica e rápida
      // Para verificação completa, use isAuthenticated()
      return false; // Sempre retorna false para forçar verificação async
    } catch (error) {
      return false;
    }
  }

  // Obter token - CORRIGIDO para React Native
  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      
      if (theme.development) {
        console.log('Buscando token:', !!token);
      }
      
      return token;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Obter usuário atual - CORRIGIDO para React Native
  async getCurrentUser(): Promise<UserResponse | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      
      if (theme.development) {
        console.log('Buscando usuário:', !!userData);
      }
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (theme.development) {
            console.log('Usuário encontrado:', parsedUser.username);
          }
          return parsedUser;
        } catch (error) {
          if (theme.development) {
            console.error('Erro ao parsear dados do usuário:', error);
          }
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }

  // Salvar dados de autenticação - CORRIGIDO para React Native
  private async setAuthData(authData: LoginResponse, rememberMe: boolean = false): Promise<void> {
    try {
      if (theme.development) {
        console.log('Salvando dados de auth - RememberMe:', rememberMe);
        console.log('Token a ser salvo:', authData.accessToken);
        console.log('Usuário a ser salvo:', authData.user.username);
      }
      
      // Primeiro limpar dados existentes
      await this.clearAllAuthData();
      
      // Salvar dados no AsyncStorage
      await AsyncStorage.multiSet([
        [this.TOKEN_KEY, authData.accessToken],
        [this.USER_KEY, JSON.stringify(authData.user)],
        [this.REMEMBER_KEY, rememberMe.toString()]
      ]);
      
      // Configurar header de autorização na API
      if (api.defaults && api.defaults.headers) {
        api.defaults.headers.common['Authorization'] = `Bearer ${authData.accessToken}`;
      }
      
      // Verificar se foi salvo corretamente
      if (theme.development) {
        console.log('Verificação pós-salvamento:');
        console.log('Token salvo:', await this.getToken());
        console.log('Usuário salvo:', (await this.getCurrentUser())?.username);
      }
    } catch (error) {
      console.error('Erro ao salvar dados de auth:', error);
    }
  }

  // Método auxiliar para limpar dados de autenticação (antigo)
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.TOKEN_KEY,
        this.USER_KEY,
        this.REMEMBER_KEY
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados de auth:', error);
    }
  }

  // Atualizar cache do usuário (após edição de perfil) - MELHORADO
  async updateUserCache(user: UserResponse): Promise<void> {
    try {
      if (theme.development) {
        console.log('Atualizando cache do usuário...');
      }
      
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao atualizar cache do usuário:', error);
    }
  }

  // Verificar se é admin
  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.adminPanel != null;
      if (theme.development) {
        console.log('Verificando admin status:', isAdmin, 'Role:', user?.role);
      }
      return isAdmin;
    } catch (error) {
      console.error('Erro ao verificar admin status:', error);
      return false;
    }
  }

  // Obter nível de admin
  async getAdminLevel(): Promise<number> {
    try {
      const user = await this.getCurrentUser();
      const adminLevel = user?.adminPanel?.adminLevel || 0;
      if (theme.development) {
        console.log('Nível de admin:', adminLevel);
      }
      return adminLevel;
    } catch (error) {
      console.error('Erro ao obter nível de admin:', error);
      return 0;
    }
  }

  // Verificar se o usuário escolheu "lembrar-me"
  async isRememberMeEnabled(): Promise<boolean> {
    try {
      const rememberMe = await AsyncStorage.getItem(this.REMEMBER_KEY);
      return rememberMe === 'true';
    } catch (error) {
      console.error('Erro ao verificar remember me:', error);
      return false;
    }
  }

  // Método para debug - verificar estado atual
  async debugAuthState(): Promise<void> {
    try {
      console.log('=== DEBUG AUTH STATE ===');
      console.log('Token:', await AsyncStorage.getItem(this.TOKEN_KEY));
      console.log('User:', await AsyncStorage.getItem(this.USER_KEY));
      console.log('Remember Me:', await AsyncStorage.getItem(this.REMEMBER_KEY));
      console.log('Current Token:', await this.getToken());
      console.log('Current User:', await this.getCurrentUser());
      console.log('Is Authenticated:', await this.isAuthenticated());
      console.log('Is Admin:', await this.isAdmin());
      console.log('========================');
    } catch (error) {
      console.error('Erro ao debugar estado de auth:', error);
    }
  }
}

// Instância singleton
const authService = new AuthService();
export default authService;