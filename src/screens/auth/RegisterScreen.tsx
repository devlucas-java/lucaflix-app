import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import authService from '../../service/authService';

// Tipos/Interfaces
interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

interface RegisterScreenProps {
  onRegister?: (user: UserResponse) => void;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
};

// Hook useAuth tipado
const useAuth = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const register = async (userData: RegisterData): Promise<UserResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    register,
    logout,
  };
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister }) => {
  const { register, isLoading } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width, height } = Dimensions.get('window');

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
    acceptMarketing: false,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório.';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório.';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Insira um email válido.';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'A senha deve conter ao menos uma letra maiúscula, minúscula e um número.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os Termos de Uso.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Lidar com o envio do formulário
  const handleSubmit = async (): Promise<void> => {
    setGeneralError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    try {
      const registerData: RegisterData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      };

      const response = await register(registerData);

      setSuccessMessage('Conta criada com sucesso! Redirecionando para o login...');

      // Aguardar 2 segundos e redirecionar para o login limpando o histórico
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }, 2000);
    } catch (error) {
      console.error('Erro no registro:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.';
      setGeneralError(errorMessage);
    }
  };

  // Atualizar dados do formulário
  const updateFormData = (field: keyof FormData, value: string | boolean): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) setGeneralError('');
  };

  // Indicador de força da senha
  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Fraca', color: 'bg-error' };
    if (score <= 3) return { score, label: 'Média', color: 'bg-warning' };
    return { score, label: 'Forte', color: 'bg-success' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Navegação para login limpando o histórico
  const handleGoToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="min-h-screen flex-1 bg-background">
        <ImageBackground
          source={require('../../../assets/bg-lucaflix.png')}
          className="flex-1"
          resizeMode="cover">

          <View className="h-16" />

          {/* Content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            showsVerticalScrollIndicator={false}>
            <View className="mx-auto w-full max-w-lg">
              {/* LUCAFLIX Logo */}
              <View className="mb-8 items-center">
                <Text className="mb-2 text-5xl font-bold tracking-wide text-primary">LUCAFLIX</Text>
                <View className="h-1 w-24 rounded-full bg-primary" />
              </View>

              {/* Register Card */}
              <View className="rounded-xl border border-border bg-overlay/90 p-8">
                <Text className="mb-2 text-3xl font-bold text-text-primary">Criar conta</Text>
                <Text className="mb-8 text-text-secondary">Junte-se à LUCAFLIX hoje mesmo</Text>

                {/* Success Message */}
                {successMessage && (
                  <View className="mb-6 flex-row items-center rounded-lg border border-success/50 bg-success/20 p-4">
                    <Icon name="check-circle" size={20} color="#46D369" />
                    <Text className="ml-3 text-sm text-success">{successMessage}</Text>
                  </View>
                )}

                {/* Error Message */}
                {generalError && (
                  <View className="mb-6 flex-row items-center rounded-lg border border-error/50 bg-error/20 p-4">
                    <Icon name="error" size={20} color="#F40612" />
                    <Text className="ml-3 text-sm text-error">{generalError}</Text>
                  </View>
                )}

                {/* Form Fields */}
                <View className="space-y-5">
                  {/* Name Fields */}
                  <View className="flex-row m-2 gap-4">
                    <View className="flex-1">
                      <TextInput
                        placeholder="Nome"
                        placeholderTextColor="#7c869a"
                        value={formData.firstName}
                        onChangeText={(text) => updateFormData('firstName', text)}
                        className={`rounded-lg border bg-backgroundLight px-4 py-4 text-text-primary ${
                          errors.firstName ? 'border-error' : 'border-border'
                        }`}
                        editable={!isLoading}
                      />
                      {errors.firstName && (
                        <Text className="mt-1 text-sm text-error">{errors.firstName}</Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <TextInput
                        placeholder="Sobrenome"
                        placeholderTextColor="#7c869a"
                        value={formData.lastName}
                        onChangeText={(text) => updateFormData('lastName', text)}
                        className={`rounded-lg border bg-backgroundLight px-4 py-4 text-text-primary ${
                          errors.lastName ? 'border-error' : 'border-border'
                        }`}
                        editable={!isLoading}
                      />
                      {errors.lastName && (
                        <Text className="mt-1 text-sm text-error">{errors.lastName}</Text>
                      )}
                    </View>
                  </View>

                  {/* Email */}
                  <View className='m-2'>
                    <TextInput
                      placeholder="Endereço de email"
                      placeholderTextColor="#7c869a"
                      value={formData.email}
                      onChangeText={(text) => updateFormData('email', text)}
                      className={`rounded-lg border bg-backgroundLight px-4 py-4 text-text-primary ${
                        errors.email ? 'border-error' : 'border-border'
                      }`}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    {errors.email && (
                      <Text className="mt-1 text-sm text-error">{errors.email}</Text>
                    )}
                  </View>

                  {/* Password */}
                  <View className='m-2'>
                    <View className="relative">
                      <TextInput
                        placeholder="Senha"
                        placeholderTextColor="#7c869a"
                        value={formData.password}
                        onChangeText={(text) => updateFormData('password', text)}
                        className={`rounded-lg border bg-backgroundLight px-4 py-4 pr-12 text-text-primary ${
                          errors.password ? 'border-error' : 'border-border'
                        }`}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4"
                        disabled={isLoading}>
                        <Icon
                          name={showPassword ? 'visibility-off' : 'visibility'}
                          size={20}
                          color="#7c869a"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <View className="mt-2">
                        <View className="flex-row items-center">
                          <View className="mr-2 h-2 flex-1 rounded-full bg-accent">
                            <View
                              className={`h-2 rounded-full ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </View>
                          <Text className="text-sm text-text-muted">{passwordStrength.label}</Text>
                        </View>
                      </View>
                    )}

                    {errors.password && (
                      <Text className="mt-1 text-sm text-error">{errors.password}</Text>
                    )}
                  </View>

                  {/* Confirm Password */}
                  <View className='m-2'>
                    <View className="relative">
                      <TextInput
                        placeholder="Confirmar senha"
                        placeholderTextColor="#7c869a"
                        value={formData.confirmPassword}
                        onChangeText={(text) => updateFormData('confirmPassword', text)}
                        className={`rounded-lg border bg-backgroundLight px-4 py-4 pr-12 text-text-primary ${
                          errors.confirmPassword ? 'border-error' : 'border-border'
                        }`}
                        secureTextEntry={!showConfirmPassword}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-4"
                        disabled={isLoading}>
                        <Icon
                          name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                          size={20}
                          color="#7c869a"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text className="mt-1 text-sm text-error">{errors.confirmPassword}</Text>
                    )}
                  </View>

                  {/* Terms and Conditions */}
                  <View className="space-y-3">
                    <TouchableOpacity
                      onPress={() => updateFormData('acceptTerms', !formData.acceptTerms)}
                      className="flex-row items-start"
                      disabled={isLoading}>
                      <View
                        className={`mr-3 mt-1 h-4 w-4 rounded border ${
                          formData.acceptTerms ? 'border-primary bg-primary' : 'border-borderLight'
                        }`}>
                        {formData.acceptTerms && <Icon name="check" size={12} color="white" />}
                      </View>
                      <Text className="flex-1 text-sm text-text-secondary">
                        Eu aceito os <Text className="text-primary">Termos de Uso</Text> e a{' '}
                        <Text className="text-primary">Política de Privacidade</Text>.
                      </Text>
                    </TouchableOpacity>
                    {errors.acceptTerms && (
                      <Text className="text-sm text-error">{errors.acceptTerms}</Text>
                    )}

                    <TouchableOpacity
                      onPress={() => updateFormData('acceptMarketing', !formData.acceptMarketing)}
                      className="flex-row items-start"
                      disabled={isLoading}>
                      <View
                        className={`mr-3 mt-1 h-4 w-4 rounded border ${
                          formData.acceptMarketing ? 'border-primary bg-primary' : 'border-borderLight'
                        }`}>
                        {formData.acceptMarketing && <Icon name="check" size={12} color="white" />}
                      </View>
                      <Text className="flex-1 text-sm text-text-secondary">
                        Gostaria de receber ofertas especiais e novidades da LUCAFLIX por email.
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading}
                    className="w-full m-2 flex-row items-center justify-center rounded-lg bg-primary py-4"
                    activeOpacity={0.8}>
                    {isLoading ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text className="ml-2 font-semibold text-white">Criando conta...</Text>
                      </>
                    ) : (
                      <Text className="font-semibold text-white">Criar conta</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Login Link */}
                <View className="mt-8 items-center">
                  <Text className="text-text-secondary">
                    Já tem uma conta?{' '}
                    <Text className="font-medium text-text-primary" onPress={handleGoToLogin}>
                      Entrar
                    </Text>
                  </Text>
                </View>

                {/* Benefits */}
                <View className="mt-8 border-t border-border pt-6">
                  <Text className="mb-4 text-center text-lg font-semibold text-text-primary">
                    Por que escolher a LUCAFLIX?
                  </Text>
                  <View className="space-y-3">
                    {[
                      'Assista em qualquer lugar',
                      'Milhares de filmes e séries',
                      'Totalmente grátis',
                    ].map((benefit, index) => (
                      <View key={index} className="flex-row items-center">
                        <Icon name="check" size={16} color="#46D369" />
                        <Text className="ml-3 text-sm text-text-secondary">{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Additional Info */}
                <View className="mt-8 border-t border-border pt-6">
                  <Text className="text-center text-xs leading-relaxed text-text-muted">
                    Este app é protegido e se aplicam a{' '}
                    <Text className="text-primary">Política de Privacidade</Text> e os{' '}
                    <Text className="text-primary">Termos de Uso</Text> da LUCAFLIX. Ao criar uma
                    conta você já aceita os termos de uso e a política de privacidade.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
          <View className="h-2" />
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;