import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground,
  Dimensions,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons';
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
    acceptMarketing: false
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
      newErrors.password = 'A senha deve conter ao menos uma letra maiúscula, minúscula e um número.';
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
        password: formData.password
      };

      const response = await register(registerData);
      
      setSuccessMessage('Conta criada com sucesso! Redirecionando...');

      if (onRegister) {
        onRegister(response);
      } else {
        // Todos os usuários vão para MainTabs após registro
        setTimeout(() => {
          navigation.navigate('MainTabs');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.';
      setGeneralError(errorMessage);
    }
  };

  // Atualizar dados do formulário
  const updateFormData = (field: keyof FormData, value: string | boolean): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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

    if (score <= 2) return { score, label: 'Fraca', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Média', color: 'bg-yellow-500' };
    return { score, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Navegação para login
  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 bg-black">
        <ImageBackground 
          source={{ uri: '/bg-lucaflix.png' }}
          className="flex-1"
          resizeMode="cover"
        >
          {/* Background Effects */}
          <View className="absolute inset-0">
            <View className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
            <View className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/10 rounded-full blur-3xl" />
          </View>
          
          {/* Overlay */}
          <View className="absolute inset-0 bg-black/60" />
          
          {/* Content */}
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="w-full max-w-lg mx-auto">
              {/* LUCAFLIX Logo */}
              <View className="items-center mb-8">
                <Text className="text-red-600 text-5xl font-bold tracking-wide mb-2">
                  LUCAFLIX
                </Text>
                <View className="w-24 h-1 bg-red-600 rounded-full" />
              </View>

              {/* Register Card */}
              <View className="bg-black/80 rounded-xl p-8 border border-gray-800">
                <Text className="text-3xl font-bold text-white mb-2">Criar conta</Text>
                <Text className="text-gray-400 mb-8">Junte-se à LUCAFLIX hoje mesmo</Text>

                {/* Success Message */}
                {successMessage && (
                  <View className="mb-6 p-4 bg-green-900/30 border border-green-600/50 rounded-lg flex-row items-center">
                    <Icon name="check-circle" size={20} color="#10b981" />
                    <Text className="text-green-400 text-sm ml-3">{successMessage}</Text>
                  </View>
                )}

                {/* Error Message */}
                {generalError && (
                  <View className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex-row items-center">
                    <Icon name="error" size={20} color="#ef4444" />
                    <Text className="text-red-400 text-sm ml-3">{generalError}</Text>
                  </View>
                )}

                {/* Form Fields */}
                <View className="space-y-5">
                  {/* Name Fields */}
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <TextInput
                        placeholder="Nome"
                        placeholderTextColor="#9ca3af"
                        value={formData.firstName}
                        onChangeText={(text) => updateFormData('firstName', text)}
                        className={`px-4 py-4 bg-gray-900/80 border rounded-lg text-white ${
                          errors.firstName ? 'border-red-500' : 'border-gray-700'
                        }`}
                        editable={!isLoading}
                      />
                      {errors.firstName && (
                        <Text className="text-red-400 text-sm mt-1">{errors.firstName}</Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <TextInput
                        placeholder="Sobrenome"
                        placeholderTextColor="#9ca3af"
                        value={formData.lastName}
                        onChangeText={(text) => updateFormData('lastName', text)}
                        className={`px-4 py-4 bg-gray-900/80 border rounded-lg text-white ${
                          errors.lastName ? 'border-red-500' : 'border-gray-700'
                        }`}
                        editable={!isLoading}
                      />
                      {errors.lastName && (
                        <Text className="text-red-400 text-sm mt-1">{errors.lastName}</Text>
                      )}
                    </View>
                  </View>

                  {/* Email */}
                  <View>
                    <TextInput
                      placeholder="Endereço de email"
                      placeholderTextColor="#9ca3af"
                      value={formData.email}
                      onChangeText={(text) => updateFormData('email', text)}
                      className={`px-4 py-4 bg-gray-900/80 border rounded-lg text-white ${
                        errors.email ? 'border-red-500' : 'border-gray-700'
                      }`}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    {errors.email && (
                      <Text className="text-red-400 text-sm mt-1">{errors.email}</Text>
                    )}
                  </View>

                  {/* Password */}
                  <View>
                    <View className="relative">
                      <TextInput
                        placeholder="Senha"
                        placeholderTextColor="#9ca3af"
                        value={formData.password}
                        onChangeText={(text) => updateFormData('password', text)}
                        className={`px-4 py-4 pr-12 bg-gray-900/80 border rounded-lg text-white ${
                          errors.password ? 'border-red-500' : 'border-gray-700'
                        }`}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4"
                        disabled={isLoading}
                      >
                        <Icon 
                          name={showPassword ? 'visibility-off' : 'visibility'} 
                          size={20} 
                          color="#9ca3af" 
                        />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <View className="mt-2">
                        <View className="flex-row items-center">
                          <View className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                            <View 
                              className={`h-2 rounded-full ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </View>
                          <Text className="text-sm text-gray-400">{passwordStrength.label}</Text>
                        </View>
                      </View>
                    )}
                    
                    {errors.password && (
                      <Text className="text-red-400 text-sm mt-1">{errors.password}</Text>
                    )}
                  </View>

                  {/* Confirm Password */}
                  <View>
                    <View className="relative">
                      <TextInput
                        placeholder="Confirmar senha"
                        placeholderTextColor="#9ca3af"
                        value={formData.confirmPassword}
                        onChangeText={(text) => updateFormData('confirmPassword', text)}
                        className={`px-4 py-4 pr-12 bg-gray-900/80 border rounded-lg text-white ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                        }`}
                        secureTextEntry={!showConfirmPassword}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-4"
                        disabled={isLoading}
                      >
                        <Icon 
                          name={showConfirmPassword ? 'visibility-off' : 'visibility'} 
                          size={20} 
                          color="#9ca3af" 
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text className="text-red-400 text-sm mt-1">{errors.confirmPassword}</Text>
                    )}
                  </View>

                  {/* Terms and Conditions */}
                  <View className="space-y-3">
                    <TouchableOpacity
                      onPress={() => updateFormData('acceptTerms', !formData.acceptTerms)}
                      className="flex-row items-start"
                      disabled={isLoading}
                    >
                      <View className={`w-4 h-4 mt-1 mr-3 border rounded ${
                        formData.acceptTerms ? 'bg-red-600 border-red-600' : 'border-gray-600'
                      }`}>
                        {formData.acceptTerms && (
                          <Icon name="check" size={12} color="white" />
                        )}
                      </View>
                      <Text className="text-gray-300 text-sm flex-1">
                        Eu aceito os{' '}
                        <Text className="text-red-500">Termos de Uso</Text>
                        {' '}e a{' '}
                        <Text className="text-red-500">Política de Privacidade</Text>
                        .
                      </Text>
                    </TouchableOpacity>
                    {errors.acceptTerms && (
                      <Text className="text-red-400 text-sm">{errors.acceptTerms}</Text>
                    )}

                    <TouchableOpacity
                      onPress={() => updateFormData('acceptMarketing', !formData.acceptMarketing)}
                      className="flex-row items-start"
                      disabled={isLoading}
                    >
                      <View className={`w-4 h-4 mt-1 mr-3 border rounded ${
                        formData.acceptMarketing ? 'bg-red-600 border-red-600' : 'border-gray-600'
                      }`}>
                        {formData.acceptMarketing && (
                          <Icon name="check" size={12} color="white" />
                        )}
                      </View>
                      <Text className="text-gray-300 text-sm flex-1">
                        Gostaria de receber ofertas especiais e novidades da LUCAFLIX por email.
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-red-600 py-4 rounded-lg flex-row items-center justify-center"
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white font-semibold ml-2">Criando conta...</Text>
                      </>
                    ) : (
                      <Text className="text-white font-semibold">Criar conta</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Login Link */}
                <View className="mt-8 items-center">
                  <Text className="text-gray-400">
                    Já tem uma conta?{' '}
                    <Text
                      className="text-white font-medium"
                      onPress={handleGoToLogin}
                    >
                      Entrar
                    </Text>
                  </Text>
                </View>

                {/* Benefits */}
                <View className="mt-8 pt-6 border-t border-gray-800">
                  <Text className="text-lg font-semibold text-white text-center mb-4">
                    Por que escolher a LUCAFLIX?
                  </Text>
                  <View className="space-y-3">
                    {[
                      'Assista em qualquer lugar',
                      'Milhares de filmes e séries',
                      'Totalmente grátis',
                    ].map((benefit, index) => (
                      <View key={index} className="flex-row items-center">
                        <Icon name="check" size={16} color="#10b981" />
                        <Text className="text-sm text-gray-300 ml-3">{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Additional Info */}
                <View className="mt-8 pt-6 border-t border-gray-800">
                  <Text className="text-xs text-gray-500 text-center leading-relaxed">
                    Este app é protegido e se aplicam a{' '}
                    <Text className="text-red-500">Política de Privacidade</Text>
                    {' '}e os{' '}
                    <Text className="text-red-500">Termos de Uso</Text>
                    {' '}da LUCAFLIX. Ao criar uma conta você já aceita os termos de uso e a política de privacidade.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;