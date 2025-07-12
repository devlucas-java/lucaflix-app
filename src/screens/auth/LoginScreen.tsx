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
  ImageBackground,
  Switch,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthContext } from '../../routes/AuthProvider';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const { 
    login, 
    isAuthenticated, 
    isLoading: authLoading, 
    authError,
    clearAuthError 
  } = useAuthContext();
  
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Verificar se já está autenticado ao carregar a tela
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Usuário já está autenticado, redirecionando...');
      navigation.navigate('MainTabs');
    }
  }, [isAuthenticated, navigation]);

  // Limpar erros quando o componente monta ou quando authError muda
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  // Validação do formulário
  const validateForm = () => {
    if (!formData.usernameOrEmail.trim()) {
      setLocalError('Email ou nome de usuário é obrigatório.');
      return false;
    }
    if (!formData.password) {
      setLocalError('Senha é obrigatória.');
      return false;
    }
    if (formData.password.length < 4) {
      setLocalError('Senha deve ter pelo menos 4 caracteres.');
      return false;
    }
    return true;
  };

  // Lidar com o envio do formulário
  const handleSubmit = async () => {
    setLocalError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Iniciando login com dados:', {
        usernameOrEmail: formData.usernameOrEmail,
        rememberMe: formData.rememberMe,
      });

      // Usar o hook useAuth para fazer login
      await login(
        {
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password,
        },
        formData.rememberMe
      );

      console.log('Login bem-sucedido via hook');

      // O redirecionamento será feito automaticamente pelo useEffect
      // quando isAuthenticated mudar para true
      
    } catch (error) {
      console.error('Erro no login:', error);
      setLocalError(error.message || 'Erro ao fazer login. Tente novamente.');
    }
  };

  // Atualizar dados do formulário
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (localError) setLocalError('');
  };

  // Função para continuar sem login
  const handleContinueWithoutLogin = () => {
    navigation.navigate('MainTabs');
  };

  // Função para ir para registro
  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  // Mostrar erro local ou erro de autenticação
  const displayError = localError || authError;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

            <ImageBackground
                source={require('../../../assets/bg-lucaflix.png')}
                className="flex-1"
                resizeMode="cover">

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
            {displayError ? (
              <View className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex-row items-center">
                <Icon name="error" size={20} color="#EF4444" />
                <Text className="text-red-400 text-sm ml-3 flex-1">{displayError}</Text>
              </View>
            ) : null}

            {/* Login Form */}
            <View className="space-y-6 ">
              {/* Email/Username */}
              <View className="relative m-2">
                <TextInput
                  className="w-full px-4 py-4 bg-gray-900/80 border border-gray-700 rounded-lg text-white text-base"
                  placeholder="Email ou nome de usuário"
                  placeholderTextColor="#9CA3AF"
                  value={formData.usernameOrEmail}
                  onChangeText={(text) => updateFormData('usernameOrEmail', text)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!authLoading}
                />
              </View>

              {/* Password */}
              <View className="relative m-2">
                <TextInput
                  className="w-full px-4 py-4 pr-12 bg-gray-900/80 border border-gray-700 rounded-lg text-white text-base"
                  placeholder="Senha"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!authLoading}
                />
                <TouchableOpacity
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={authLoading}
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
                className="w-full bg-red-600 m-2 hover:bg-red-700 py-4 rounded-lg items-center justify-center"
                onPress={handleSubmit}
                disabled={authLoading}
                style={{ opacity: authLoading ? 0.5 : 1 }}
              >
                {authLoading ? (
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
                  disabled={authLoading}
                >
                  <Switch
                    value={formData.rememberMe}
                    onValueChange={(value) => updateFormData('rememberMe', value)}
                    trackColor={{ false: '#374151', true: '#DC2626' }}
                    thumbColor={formData.rememberMe ? '#FFFFFF' : '#9CA3AF'}
                    disabled={authLoading}
                  />
                  <Text className="text-gray-400 ml-2">Lembrar de mim</Text>
                </TouchableOpacity>

                <TouchableOpacity disabled={authLoading}>
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
                  onPress={handleNavigateToRegister}
                >
                  Criar conta agora
                </Text>
              </Text>
            </View>

            {/* Continue without login */}
            <TouchableOpacity
              className="mt-4 m-2 bg-gray-600 rounded-lg p-3 items-center"
              onPress={handleContinueWithoutLogin}
              disabled={authLoading}
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
      </ImageBackground>
                
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;