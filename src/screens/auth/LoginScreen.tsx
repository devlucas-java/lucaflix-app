import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Switch,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons';
import authService from '../../service/authService';

const { width, height } = Dimensions.get('window');

// Hook useAuth para React Native
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        const authenticated = await authService.isAuthenticated();
        setUser(currentUser);
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials, rememberMe = false) => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithRemember(credentials, rememberMe);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Validação do formulário
  const validateForm = () => {
    if (!formData.usernameOrEmail.trim()) {
      setError('Email ou nome de usuário é obrigatório.');
      return false;
    }
    if (!formData.password) {
      setError('Senha é obrigatória.');
      return false;
    }
    if (formData.password.length < 4) {
      setError('Senha deve ter pelo menos 4 caracteres.');
      return false;
    }
    return true;
  };

  // Lidar com o envio do formulário
  const handleSubmit = async () => {
    setError('');

    if (!validateForm()) return;

    try {
      console.log('Iniciando login com dados:', {
        usernameOrEmail: formData.usernameOrEmail,
        rememberMe: formData.rememberMe,
      });

      const response = await login(
        {
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password,
        },
        formData.rememberMe
      );

      console.log('Login bem-sucedido:', response.user);

      // Pequeno delay para mostrar feedback visual e redirecionar para MainTabs
      setTimeout(() => {
        navigation.navigate('MainTabs');
      }, 1000);
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error.message || 'Erro ao fazer login. Tente novamente.');
    }
  };

  // Atualizar dados do formulário
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background with Netflix-style gradient */}
      <LinearGradient
        colors={['#000000', '#141414', '#000000']}
        style={{
          position: 'absolute',
          width: width,
          height: height,
        }}
      />

      {/* Animated background elements */}
      <View className="absolute inset-0">
        <View className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl top-1/4 left-1/4" />
        <View className="absolute w-96 h-96 bg-red-800/10 rounded-full blur-3xl bottom-1/4 right-1/4" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* LUCAFLIX Logo */}
          <View className="items-center mb-8">
            <Text className="text-red-600 text-5xl font-bold tracking-wide mb-2">
              LUCAFLIX
            </Text>
            <View className="w-24 h-1 bg-red-600 rounded-full" />
          </View>

          {/* Login Card */}
          <View className="bg-black/80 rounded-xl p-8 border border-gray-800">
            <Text className="text-white text-3xl font-bold mb-2">Entrar</Text>
            <Text className="text-gray-400 mb-8">Acesse sua conta LUCAFLIX</Text>

            {/* Error Message */}
            {error ? (
              <View className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex-row items-center">
                <Icon name="error" size={20} color="#EF4444" />
                <Text className="text-red-400 text-sm ml-3 flex-1">{error}</Text>
              </View>
            ) : null}

            {/* Login Form */}
            <View className="space-y-6">
              {/* Email/Username */}
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-4 bg-gray-900/80 border border-gray-700 rounded-lg text-white text-base"
                  placeholder="Email ou nome de usuário"
                  placeholderTextColor="#9CA3AF"
                  value={formData.usernameOrEmail}
                  onChangeText={(text) => updateFormData('usernameOrEmail', text)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {/* Password */}
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-4 pr-12 bg-gray-900/80 border border-gray-700 rounded-lg text-white text-base"
                  placeholder="Senha"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg items-center justify-center"
                onPress={handleSubmit}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.5 : 1 }}
              >
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-white font-semibold ml-2">
                      Entrando...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Entrar
                  </Text>
                )}
              </TouchableOpacity>

              {/* Remember Me & Forgot Password */}
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => updateFormData('rememberMe', !formData.rememberMe)}
                  disabled={isLoading}
                >
                  <Switch
                    value={formData.rememberMe}
                    onValueChange={(value) => updateFormData('rememberMe', value)}
                    trackColor={{ false: '#374151', true: '#DC2626' }}
                    thumbColor={formData.rememberMe ? '#FFFFFF' : '#9CA3AF'}
                    disabled={isLoading}
                  />
                  <Text className="text-gray-400 ml-2">Lembrar de mim</Text>
                </TouchableOpacity>

                <TouchableOpacity disabled={isLoading}>
                  <Text className="text-red-500 text-sm">
                    Esqueceu a senha?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Link */}
            <View className="mt-8 items-center">
              <Text className="text-gray-400">
                Novo na LUCAFLIX?{' '}
                <Text
                  className="text-white font-medium"
                  onPress={() => navigation.navigate('Register')}
                >
                  Criar conta agora
                </Text>
              </Text>
            </View>

            {/* Continue without login */}
            <TouchableOpacity
              className="mt-4 bg-gray-600 rounded-lg p-3 items-center"
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text className="text-white font-medium">
                Continuar sem login
              </Text>
            </TouchableOpacity>

            {/* Additional Info */}
            <View className="mt-8 pt-6 border-t border-gray-800">
              <Text className="text-xs text-gray-500 text-center leading-relaxed">
                Este app é protegido pelo reCAPTCHA e se aplicam a{' '}
                <Text className="text-red-500">Política de Privacidade</Text>
                {' '}e os{' '}
                <Text className="text-red-500">Termos de Uso</Text>
                {' '}da LUCAFLIX. Ao entrar no app você já aceita os termos de uso e a política de privacidade.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;