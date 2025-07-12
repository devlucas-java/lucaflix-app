// routes/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import authService from '~/service/authService';
import type { UserResponse, LoginRequest, RegisterRequest } from '~/service/authService';
import theme from '~/theme/theme';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: UserResponse | null;
  login: (credentials: LoginRequest, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: UserResponse) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [user, setUser] = useState<UserResponse | null>(null);

  // Debug helper
  const logAuthState = useCallback((action: string) => {
    if (theme.development) {
      console.log(`📊 Estado Auth atualizado: ${JSON.stringify({
        isAuthenticated,
        isInitialized,
        isLoading,
        user: user ? user.username : 'Nenhum'
      })}`);
    }
  }, [isAuthenticated, isInitialized, isLoading, user]);

  // Inicializar o contexto verificando se o usuário está autenticado
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        if (theme.development) {
          console.log('🚀 Inicializando autenticação...');
        }
        
        const authenticated = await authService.isAuthenticated();
        
        if (theme.development) {
          console.log('🔍 Verificação de autenticação:', authenticated);
        }
        
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          try {
            const userData = await authService.getCurrentUser();
            if (userData) {
              setUser(userData);
              if (theme.development) {
                console.log('👤 Usuário carregado:', userData.username);
              }
            } else {
              if (theme.development) {
                console.log('❌ Usuário não encontrado, fazendo logout...');
              }
              await performLogout();
            }
          } catch (error) {
            console.error('❌ Erro ao carregar dados do usuário:', error);
            await performLogout();
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        await performLogout();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Log state changes
  useEffect(() => {
    logAuthState('state_change');
  }, [logAuthState]);

  // Função interna para logout (não exposta)
  const performLogout = async () => {
    try {
      if (theme.development) {
        console.log('🔐 Realizando logout completo...');
      }
      
      // Limpar estado local primeiro
      setIsAuthenticated(false);
      setUser(null);
      
      // Depois limpar dados do AsyncStorage
      await authService.logout();
      
      if (theme.development) {
        console.log('✅ Logout completo realizado');
      }
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
      // Mesmo com erro, limpar estado local
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (credentials: LoginRequest, rememberMe: boolean = false): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (theme.development) {
        console.log('🔐 Fazendo login...');
      }
      
      const response = await authService.loginWithRemember(credentials, rememberMe);
      
      if (theme.development) {
        console.log('✅ Login realizado com sucesso:', response.user.username);
      }
      
      // Atualizar estado
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (theme.development) {
        console.log('🚪 Iniciando logout...');
      }
      
      setIsLoading(true);
      await performLogout();
      
      if (theme.development) {
        console.log('✅ Logout concluído');
      }
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (theme.development) {
        console.log('📝 Registrando usuário...');
      }
      
      const response = await authService.register(userData);
      
      if (theme.development) {
        console.log('✅ Registro realizado com sucesso:', response.username);
      }
      
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      if (theme.development) {
        console.log('🔍 Verificando autenticação...');
      }
      
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          await performLogout();
        }
      } else {
        await performLogout();
      }
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      await performLogout();
    }
  };

  const updateUser = async (userData: UserResponse): Promise<void> => {
    try {
      if (theme.development) {
        console.log('📝 Atualizando dados do usuário...');
      }
      
      // Atualizar cache
      await authService.updateUserCache(userData);
      
      // Atualizar estado
      setUser(userData);
      
      if (theme.development) {
        console.log('✅ Dados do usuário atualizados');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      if (theme.development) {
        console.log('🔐 Alterando senha...');
      }
      
      await authService.changePassword(currentPassword, newPassword);
      
      if (theme.development) {
        console.log('✅ Senha alterada com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    login,
    logout,
    register,
    checkAuth,
    updateUser,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  return context;
};