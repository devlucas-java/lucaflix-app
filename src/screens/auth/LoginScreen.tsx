import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Switch,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthContext } from '../../routes/AuthProvider';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const { 
    login, 
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

  // Limpar erros quando o componente monta
  useEffect(() => {
    return () => {
      // Limpar erros quando o componente desmonta
      clearAuthError();
      setLocalError('');
    };
  }, [clearAuthError]);

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
    clearAuthError();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Iniciando login com dados:', {
        usernameOrEmail: formData.usernameOrEmail,
        rememberMe: formData.rememberMe,
      });

      await login(
        {
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password,
        },
        formData.rememberMe
      );

      console.log('Login bem-sucedido via AuthProvider');
      
      // Após login bem-sucedido, resetar navegação e ir para Home
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { 
              name: 'MainTabs',
              state: {
                routes: [{ name: 'Home' }],
                index: 0,
              },
            },
          ],
        })
      );
      
    } catch (error) {
      console.error('Erro no login:', error);
      // O AuthProvider já definiu o authError, não precisamos fazer nada aqui
    }
  };

  // Atualizar dados do formulário
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erros quando o usuário começar a digitar
    if (localError) setLocalError('');
    if (authError) clearAuthError();
  };

  // Função para continuar sem login - navegar para Home e limpar histórico
  const handleContinueWithoutLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { 
            name: 'MainTabs',
            state: {
              routes: [{ name: 'Home' }],
              index: 0,
            },
          },
        ],
      })
    );
  };

  // Função para ir para registro
  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  // Função para voltar
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Mostrar erro local ou erro de autenticação (prioridade para authError)
  const displayError = authError || localError;

  return (
    <View className="flex-1" style={{ height: '100%', width: '100%' }}>
      {/* Configurar StatusBar para tela cheia */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ 
          paddingTop: Platform.OS === 'ios' ? 0 : 0,
          paddingBottom: 0,
        }}
      >
        <ImageBackground
          source={require('../../../assets/bg-lucaflix.png')}
          className="flex-1 w-full h-full"
          resizeMode="cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ 
              flexGrow: 1, 
              paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 20,
              paddingBottom: Platform.OS === 'ios' ? 34 : 20,
              minHeight: height,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center px-6 py-12">

              {/* LUCAFLIX Logo */}
              <View className="items-center mb-8">
                <Text className="text-primary text-5xl font-bold tracking-wide mb-2">
                  LUCAFLIX
                </Text>
                <View className="w-24 h-1 bg-primary rounded-full" />
              </View>

              {/* Login Card */}
              <View className="bg-overlay rounded-xl p-8 border border-border">
                <Text className="text-text-primary text-3xl font-bold mb-2">Entrar</Text>
                <Text className="text-text-secondary mb-8">Acesse sua conta LUCAFLIX</Text>

                {/* Error Message */}
                {displayError ? (
                  <View className="mb-6 p-4 bg-error/20 border border-error/50 rounded-lg flex-row items-center">
                    <Icon name="error" size={20} color="#F40612" />
                    <Text className="text-error text-sm ml-3 flex-1">{displayError}</Text>
                  </View>
                ) : null}

                {/* Login Form */}
                <View className="space-y-6">
                  {/* Email/Username */}
                  <View className="relative mb-4">
                    <TextInput
                      className="w-full px-4 py-4 bg-backgroundLight/80 border border-border rounded-lg text-text-primary text-base"
                      placeholder="Email ou nome de usuário"
                      placeholderTextColor="#b3b3b3"
                      value={formData.usernameOrEmail}
                      onChangeText={(text) => updateFormData('usernameOrEmail', text)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!authLoading}
                    />
                  </View>

                  {/* Password */}
                  <View className="relative mb-4">
                    <TextInput
                      className="w-full px-4 py-4 pr-12 bg-backgroundLight/80 border border-border rounded-lg text-text-primary text-base"
                      placeholder="Senha"
                      placeholderTextColor="#b3b3b3"
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
                        color="#b3b3b3"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    className="w-full bg-primary hover:bg-primaryHover py-4 rounded-lg items-center justify-center mb-4"
                    onPress={handleSubmit}
                    disabled={authLoading}
                    style={{ opacity: authLoading ? 0.5 : 1 }}
                  >
                    {authLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-button-primaryText font-semibold ml-2">
                          Entrando...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-button-primaryText font-bold text-base">
                        Entrar
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Remember Me & Forgot Password */}
                  <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => updateFormData('rememberMe', !formData.rememberMe)}
                      disabled={authLoading}
                    >
                      <Switch
                        value={formData.rememberMe}
                        onValueChange={(value) => updateFormData('rememberMe', value)}
                        trackColor={{ false: '#404040', true: '#e50914' }}
                        thumbColor={formData.rememberMe ? '#FFFFFF' : '#b3b3b3'}
                        disabled={authLoading}
                      />
                      <Text className="text-text-secondary ml-2">Lembrar de mim</Text>
                    </TouchableOpacity>

                    <TouchableOpacity disabled={authLoading}>
                      <Text className="text-primary text-sm">
                        Esqueceu a senha?
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Register Link */}
                <View className="mt-8 items-center">
                  <Text className="text-text-secondary">
                    Novo na LUCAFLIX?{' '}
                    <Text
                      className="text-text-primary font-medium"
                      onPress={handleNavigateToRegister}
                    >
                      Criar conta agora
                    </Text>
                  </Text>
                </View>

                {/* Continue without login */}
                <TouchableOpacity
                  className="mt-4 bg-button-secondary rounded-lg p-3 items-center"
                  onPress={handleContinueWithoutLogin}
                  disabled={authLoading}
                  style={{ opacity: authLoading ? 0.5 : 1 }}
                >
                  <Text className="text-button-secondaryText font-medium">
                    Continuar sem login
                  </Text>
                </TouchableOpacity>

                {/* Additional Info */}
                <View className="mt-8 pt-6 border-t border-border">
                  <Text className="text-xs text-text-muted text-center leading-relaxed">
                    Este app é protegido pelo reCAPTCHA e se aplicam a{' '}
                    <Text className="text-primary">Política de Privacidade</Text>
                    {' '}e os{' '}
                    <Text className="text-primary">Termos de Uso</Text>
                    {' '}da LUCAFLIX. Ao entrar no app você já aceita os termos de uso e a política de privacidade.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;