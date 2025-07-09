import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import authService from '~/service/authService';
import userService from '~/service/userService';
import type { UserResponse } from '~/service/authService';

// Netflix-inspired theme
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
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  // Verificar autenticação e carregar dados do usuário
  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      try {
        setLoading(true);
        setError('');

        // Verificar se está autenticado
        if (!authService.isAuthenticated()) {
          console.log('Usuário não autenticado, redirecionando para login...');
          authService.logout();
          navigation.navigate('Login' as never);
          return;
        }

        // Carregar dados do usuário
        const userData = await userService.getCurrentUser();
        setUser(userData);

      } catch (error: any) {
        console.error('Erro ao carregar usuário:', error);
        setError(error.message);
        
        // Se erro de autenticação, redirecionar para login
        if (error.message.includes('Sessão expirada') || error.message.includes('token')) {
          authService.logout();
          navigation.navigate('Login' as never);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadUser();
  }, [navigation]);

  // Função para alterar senha
  const handleChangePassword = async () => {
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setError('A nova senha deve ter pelo menos 6 caracteres');
        return;
      }

      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setSuccess('Senha alterada com sucesso!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  // Função para atualizar email
  const handleUpdateEmail = async () => {
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await authService.updateEmail(emailForm.newEmail, emailForm.currentPassword);
      
      // Recarregar dados do usuário
      const userData = await userService.getCurrentUser();
      setUser(userData);
      
      setSuccess('Email atualizado com sucesso!');
      setEmailForm({ newEmail: '', currentPassword: '' });
      setShowUpdateEmail(false);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  // Função para navegar para minha lista
  const goToMyList = () => {
    navigation.navigate('MyList' as never);
  };

  // Função para fazer logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            authService.logout();
            navigation.navigate('Login' as never);
          }
        }
      ]
    );
  };

  // Limpar mensagens após um tempo
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="text-white text-lg mt-4">Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Erro ao carregar dados do usuário</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <ScrollView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View className="flex-row justify-between items-center p-6 pt-4">
          <View>
            <Text className="text-white text-3xl font-bold">Meu Perfil</Text>
            <Text className="text-gray-400 text-base mt-1">Gerencie sua conta</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="p-3 rounded-full"
            style={{ backgroundColor: theme.colors.error }}
          >
            <Icon name="logout" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Mensagens de erro e sucesso */}
        {error ? (
          <View className="mx-6 mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.colors.error }}>
            <Text className="text-white font-medium">{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View className="mx-6 mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.colors.success }}>
            <Text className="text-white font-medium">{success}</Text>
          </View>
        ) : null}

        {/* Informações do usuário */}
        <View className="mx-6 mb-6 p-6 rounded-lg" style={{ backgroundColor: theme.colors.surface }}>
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

            {user.adminPanel && (
              <View className="flex-row items-center">
                <Icon name="security" size={20} color={theme.colors.textSecondary} />
                <Text className="text-gray-400 ml-3 text-base">Admin Level: {user.adminPanel.adminLevel}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Ações rápidas */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Ações</Text>
          
          <TouchableOpacity
            onPress={goToMyList}
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
        </View>

        {/* Modal para alterar senha */}
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
                  className="text-white p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.accent
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-400 text-sm mb-2">Nova senha</Text>
                <TextInput
                  secureTextEntry
                  value={passwordForm.newPassword}
                  onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
                  className="text-white p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.accent
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">Confirmar nova senha</Text>
                <TextInput
                  secureTextEntry
                  value={passwordForm.confirmPassword}
                  onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
                  className="text-white p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.accent
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
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
                  onPress={() => setShowChangePassword(false)}
                  className="flex-1 p-4 rounded-lg items-center"
                  style={{ backgroundColor: theme.colors.accent }}
                >
                  <Text className="text-white font-medium">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para atualizar email */}
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
                  value={emailForm.newEmail}
                  onChangeText={(text) => setEmailForm(prev => ({ ...prev, newEmail: text }))}
                  className="text-white p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.accent
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">Senha atual</Text>
                <TextInput
                  secureTextEntry
                  value={emailForm.currentPassword}
                  onChangeText={(text) => setEmailForm(prev => ({ ...prev, currentPassword: text }))}
                  className="text-white p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.accent
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
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
                  onPress={() => setShowUpdateEmail(false)}
                  className="flex-1 p-4 rounded-lg items-center"
                  style={{ backgroundColor: theme.colors.accent }}
                >
                  <Text className="text-white font-medium">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;