import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import authService from '~/service/authService';
import userService from '~/service/userService';
import { ProfileHeader } from '../routes/headers/ProfileHeader';
import { useAuth } from '../routes/Router'; // Importar o hook useAuth
import type { UserResponse } from '~/service/authService';

const theme = {
  colors: {
    primary: '#E50914',
    secondary: '#B20710',
    background: '#000000',
    surface: '#141414',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    error: '#F40612',
    success: '#46D369',
    accent: '#564D4D',
    inputBackground: '#333333',
    modalBackground: '#1a1a1a',
  }
};

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useAuth(); // Usar o logout do contexto
  const scrollY = useRef(new Animated.Value(0)).current;
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUpdateEmail, setShowUpdateEmail] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: ''
  });

  // Função de logout corrigida - usa o contexto de autenticação
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: async () => {
            setLoggingOut(true);
            try {
              console.log('Iniciando processo de logout...');
              
              // Fazer logout usando o authService
              await authService.logout();
              
              console.log('Logout realizado com sucesso');
              
              // Usar o logout do contexto que vai alterar o estado de autenticação
              // Isso fará com que o AppStackNavigator mude para as telas não autenticadas
              logout();
              
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              setError('Erro ao fazer logout');
              
              // Mesmo com erro, tentar fazer logout do contexto
              setTimeout(() => {
                logout();
              }, 1500);
            } finally {
              setLoggingOut(false);
            }
          }
        }
      ]
    );
  }, [logout]);

  // Carregar usuário
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Verificar se está autenticado
      const isAuthenticated = await authService.isAuthenticated();
      
      if (!isAuthenticated) {
        console.log('Usuário não autenticado, fazendo logout...');
        logout();
        return;
      }

      // Tentar carregar os dados do usuário
      const userData = await userService.getCurrentUser();
      
      if (!userData) {
        console.log('Dados do usuário não encontrados, fazendo logout...');
        logout();
        return;
      }

      console.log('Usuário carregado com sucesso:', userData.username);
      setUser(userData);
      
    } catch (error: any) {
      console.error('Erro ao carregar usuário:', error);
      setError('Erro ao carregar dados do usuário');
      
      // Em caso de erro, fazer logout após delay
      setTimeout(() => {
        logout();
      }, 2000);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Alterar senha
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword.trim()) {
      setError('Senha atual é obrigatória');
      return;
    }
    if (!passwordForm.newPassword.trim()) {
      setError('Nova senha é obrigatória');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Senha alterada com sucesso!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      setError('Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setUpdating(false);
    }
  };

  // Atualizar email
  const handleUpdateEmail = async () => {
    if (!emailForm.newEmail.trim()) {
      setError('Novo email é obrigatório');
      return;
    }
    if (!emailForm.currentPassword.trim()) {
      setError('Senha atual é obrigatória');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
      setError('Email inválido');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      await authService.updateEmail(emailForm.newEmail, emailForm.currentPassword);
      const userData = await userService.getCurrentUser();
      if (userData) setUser(userData);
      
      setSuccess('Email atualizado com sucesso!');
      setEmailForm({ newEmail: '', currentPassword: '' });
      setShowUpdateEmail(false);
    } catch (error: any) {
      console.error('Erro ao atualizar email:', error);
      setError('Erro ao atualizar email. Verifique sua senha atual.');
    } finally {
      setUpdating(false);
    }
  };

  // Limpar mensagens
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Navegar para configurações
  const handleSettings = useCallback(() => {
    console.log('Navegando para configurações...');
  }, []);

  // Navegar para notificações
  const handleNotifications = useCallback(() => {
    console.log('Navegando para notificações...');
  }, []);

  // Tela de loading
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="text-white text-lg mt-4">Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Se não tem usuário, mostrar loading (logout já foi chamado)
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="text-white text-lg mt-4">Redirecionando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header com ProfileHeader */}
      <ProfileHeader
        navigation={navigation}
        scrollY={scrollY}
        title={user.username}
        onSettings={handleSettings}
        onNotifications={handleNotifications}
      />

      <Animated.ScrollView
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Espaço para o header */}
        <View className="h-20" />

        {/* Conteúdo principal */}
        <View className="px-6 pt-4">

          {/* Mensagens */}
          {error ? (
            <View className="mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.colors.error }}>
              <Text className="text-white font-medium">{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View className="mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.colors.success }}>
              <Text className="text-white font-medium">{success}</Text>
            </View>
          ) : null}

          {/* Informações do usuário */}
          <View className="mb-6 p-6 rounded-lg" style={{ backgroundColor: theme.colors.surface }}>
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 rounded-full justify-center items-center mr-4" style={{ backgroundColor: theme.colors.primary }}>
                <Icon name="person" size={32} color={theme.colors.text} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">{user.firstName} {user.lastName}</Text>
                <Text className="text-gray-400 text-base">@{user.username}</Text>
              </View>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center">
                <Icon name="email" size={20} color={theme.colors.textSecondary} />
                <Text className="text-gray-400 ml-3 text-base">{user.email}</Text>
              </View>
              
              <View className="flex-row items-center">
                <Icon name="admin-panel-settings" size={20} color={theme.colors.textSecondary} />
                <Text className="text-gray-400 ml-3 text-base">Função: {user.role}</Text>
              </View>

              <View className="flex-row items-center">
                <Icon name="verified" size={20} color={user.isAccountEnabled ? theme.colors.success : theme.colors.error} />
                <Text className={`ml-3 text-base ${user.isAccountEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {user.isAccountEnabled ? 'Conta Ativa' : 'Conta Inativa'}
                </Text>
              </View>
            </View>
          </View>

          {/* Ações */}
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-4">Ações</Text>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('MyList' as never)}
              className="flex-row items-center p-4 rounded-lg mb-3"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Icon name="bookmark" size={24} color={theme.colors.text} />
              <Text className="text-white text-base font-medium ml-3">Minha Lista</Text>
              <Icon name="arrow-forward-ios" size={16} color={theme.colors.text} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowChangePassword(true)}
              className="flex-row items-center p-4 rounded-lg mb-3"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <Icon name="lock" size={24} color={theme.colors.text} />
              <Text className="text-white text-base font-medium ml-3">Alterar Senha</Text>
              <Icon name="arrow-forward-ios" size={16} color={theme.colors.text} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowUpdateEmail(true)}
              className="flex-row items-center p-4 rounded-lg mb-3"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <Icon name="email" size={24} color={theme.colors.text} />
              <Text className="text-white text-base font-medium ml-3">Atualizar Email</Text>
              <Icon name="arrow-forward-ios" size={16} color={theme.colors.text} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            {/* Botão de Logout */}
            <TouchableOpacity
              onPress={handleLogout}
              disabled={loggingOut}
              className="flex-row items-center p-4 rounded-lg mb-3"
              style={{ backgroundColor: loggingOut ? theme.colors.accent : theme.colors.error }}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color={theme.colors.text} />
              ) : (
                <Icon name="logout" size={24} color={theme.colors.text} />
              )}
              <Text className="text-white text-base font-medium ml-3">
                {loggingOut ? 'Saindo...' : 'Sair da Conta'}
              </Text>
              {!loggingOut && (
                <Icon name="arrow-forward-ios" size={16} color={theme.colors.text} style={{ marginLeft: 'auto' }} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Espaço extra no final */}
        <View className="h-20" />
      </Animated.ScrollView>

      {/* Modal Alterar Senha */}
      <Modal
        visible={showChangePassword}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <View className="w-11/12 max-w-md p-6 rounded-lg" style={{ backgroundColor: theme.colors.modalBackground }}>
            <Text className="text-white text-xl font-bold mb-6">Alterar Senha</Text>
            
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Senha atual</Text>
              <TextInput
                secureTextEntry
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
                className="text-white p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.inputBackground }}
                placeholderTextColor={theme.colors.textSecondary}
                placeholder="Digite sua senha atual"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Nova senha</Text>
              <TextInput
                secureTextEntry
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
                className="text-white p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.inputBackground }}
                placeholderTextColor={theme.colors.textSecondary}
                placeholder="Digite a nova senha"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-2">Confirmar nova senha</Text>
              <TextInput
                secureTextEntry
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
                className="text-white p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.inputBackground }}
                placeholderTextColor={theme.colors.textSecondary}
                placeholder="Confirme a nova senha"
              />
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={updating}
                className="flex-1 p-4 rounded-lg items-center"
                style={{ backgroundColor: updating ? theme.colors.accent : theme.colors.primary }}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={theme.colors.text} />
                ) : (
                  <Text className="text-white font-medium">Alterar</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setShowChangePassword(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 p-4 rounded-lg items-center"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <Text className="text-white font-medium">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Atualizar Email */}
      <Modal
        visible={showUpdateEmail}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpdateEmail(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <View className="w-11/12 max-w-md p-6 rounded-lg" style={{ backgroundColor: theme.colors.modalBackground }}>
            <Text className="text-white text-xl font-bold mb-6">Atualizar Email</Text>
            
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Novo email</Text>
              <TextInput
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailForm.newEmail}
                onChangeText={(text) => setEmailForm(prev => ({ ...prev, newEmail: text }))}
                className="text-white p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.inputBackground }}
                placeholderTextColor={theme.colors.textSecondary}
                placeholder="Digite o novo email"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-2">Senha atual</Text>
              <TextInput
                secureTextEntry
                value={emailForm.currentPassword}
                onChangeText={(text) => setEmailForm(prev => ({ ...prev, currentPassword: text }))}
                className="text-white p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.inputBackground }}
                placeholderTextColor={theme.colors.textSecondary}
                placeholder="Digite sua senha atual"
              />
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleUpdateEmail}
                disabled={updating}
                className="flex-1 p-4 rounded-lg items-center"
                style={{ backgroundColor: updating ? theme.colors.accent : theme.colors.success }}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={theme.colors.text} />
                ) : (
                  <Text className="text-white font-medium">Atualizar</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setShowUpdateEmail(false);
                  setEmailForm({ newEmail: '', currentPassword: '' });
                }}
                className="flex-1 p-4 rounded-lg items-center"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <Text className="text-white font-medium">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserProfileScreen;