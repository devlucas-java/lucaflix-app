// hooks/useAuth.js
import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../routes/AuthProvider';
import authService from '../service/authService';
import theme from '../theme/theme';

export const useAuth = () => {
  const context = useAuthContext();
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// Hook para verificação de admin
export const useAdminCheck = () => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLevel, setAdminLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isAuthenticated && user) {
        try {
          const adminStatus = await authService.isAdmin();
          const level = await authService.getAdminLevel();
          
          setIsAdmin(adminStatus);
          setAdminLevel(level);
          
          if (theme.development) {
            console.log('Admin check:', { isAdmin: adminStatus, level });
          }
        } catch (error) {
          console.error('Erro ao verificar admin:', error);
          setIsAdmin(false);
          setAdminLevel(0);
        }
      } else {
        setIsAdmin(false);
        setAdminLevel(0);
      }
      setIsLoading(false);
    };

    checkAdmin();
  }, [isAuthenticated, user]);

  return { isAdmin, adminLevel, isLoading };
};

// Hook para logout com confirmação
export const useLogout = () => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      console.log('🚪 useLogout - Iniciando logout...');
      await logout();
      console.log('✅ useLogout - Logout concluído');
    } catch (error) {
      console.error('❌ useLogout - Erro no logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, isLoggingOut]);

  return { performLogout, isLoggingOut };
};

// Hook para login com estado
export const useLogin = () => {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState(null);

  const performLogin = useCallback(async (credentials, rememberMe = false) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setError(null);
    
    try {
      const response = await login(credentials, rememberMe);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  }, [login, isLoggingIn]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    performLogin, 
    isLoggingIn, 
    error, 
    clearError 
  };
};

// Hook para registro com estado
export const useRegister = () => {
  const { register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  const performRegister = useCallback(async (userData) => {
    if (isRegistering) return;
    
    setIsRegistering(true);
    setError(null);
    
    try {
      const response = await register(userData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsRegistering(false);
    }
  }, [register, isRegistering]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    performRegister, 
    isRegistering, 
    error, 
    clearError 
  };
};

// Hook para verificação de autenticação com refresh
export const useAuthCheck = () => {
  const { checkAuth, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const recheckAuth = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      await checkAuth();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setIsChecking(false);
    }
  }, [checkAuth, isChecking]);

  return { 
    recheckAuth, 
    isChecking, 
    isAuthenticated 
  };
};

// Hook para atualização de perfil
export const useProfileUpdate = () => {
  const { updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(async (updatedData) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      await updateUser(updatedData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [updateUser, isUpdating]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    updateProfile, 
    isUpdating, 
    error, 
    clearError 
  };
};

// Hook para mudança de senha
export const usePasswordChange = () => {
  const { changePassword } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState(null);

  const changeUserPassword = useCallback(async (currentPassword, newPassword) => {
    if (isChanging) return;
    
    setIsChanging(true);
    setError(null);
    
    try {
      await changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsChanging(false);
    }
  }, [changePassword, isChanging]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    changeUserPassword, 
    isChanging, 
    error, 
    clearError 
  };
};

export default useAuth;