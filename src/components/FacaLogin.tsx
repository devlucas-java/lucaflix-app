import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

// Cores do tema Netflix (seguindo o padrão do seu App.js)
const theme = {
  colors: {
    primary: '#E50914',
    secondary: '#B20710',
    background: '#000000',
    surface: '#141414',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    accent: '#564D4D',
  }
};

export const FacaLogin = () => {
  const navigation = useNavigation();

  const handleLoginPress = () => {
    // Navegar para a tela de login
    navigation.navigate('Login');
  };

  return (
    <View className="px-4 py-8">
      <View 
        className="rounded-lg p-6 mx-4"
        style={{ backgroundColor: theme.colors.surface }}
      >
        {/* Ícone de usuário */}
        <View className="items-center mb-4">
          <View 
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.colors.accent }}
          >
            <Icon 
              name="person" 
              size={32} 
              color={theme.colors.textSecondary} 
            />
          </View>
        </View>

        {/* Título */}
        <Text 
          className="text-lg font-semibold text-center mb-2"
          style={{ color: theme.colors.text }}
        >
          Faça login para mais recursos
        </Text>

        {/* Descrição */}
        <Text 
          className="text-sm text-center mb-6 leading-5"
          style={{ color: theme.colors.textSecondary }}
        >
          Entre na sua conta para acessar sua lista pessoal de filmes e
          recomendações personalizadas baseadas no seu gosto
        </Text>

        {/* Botão de Login */}
        <TouchableOpacity
          onPress={handleLoginPress}
          className="px-6 py-3 rounded-md flex-row items-center justify-center"
          style={{ backgroundColor: theme.colors.primary }}
          activeOpacity={0.8}
        >
          <Icon 
            name="login" 
            size={20} 
            color={theme.colors.text} 
            style={{ marginRight: 8 }}
          />
          <Text 
            className="text-base font-semibold"
            style={{ color: theme.colors.text }}
          >
            Fazer Login
          </Text>
        </TouchableOpacity>

        {/* Link para registro */}
        <View className="flex-row justify-center items-center mt-4">
          <Text 
            className="text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            Não tem conta? 
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            className="ml-1"
            activeOpacity={0.7}
          >
            <Text 
              className="text-sm font-medium"
              style={{ color: theme.colors.primary }}
            >
              Registre-se
            </Text>
          </TouchableOpacity>
        </View>

        {/* Benefícios do login */}
        <View className="mt-6 pt-4 border-t" style={{ borderTopColor: theme.colors.accent }}>
          <Text 
            className="text-xs font-medium mb-3"
            style={{ color: theme.colors.textSecondary }}
          >
            COM SUA CONTA VOCÊ PODE:
          </Text>
          
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Icon 
                name="favorite" 
                size={16} 
                color={theme.colors.primary} 
                style={{ marginRight: 8 }}
              />
              <Text 
                className="text-xs flex-1"
                style={{ color: theme.colors.textSecondary }}
              >
                Criar sua lista pessoal de favoritos
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Icon 
                name="recommend" 
                size={16} 
                color={theme.colors.primary} 
                style={{ marginRight: 8 }}
              />
              <Text 
                className="text-xs flex-1"
                style={{ color: theme.colors.textSecondary }}
              >
                Receber recomendações personalizadas
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Icon 
                name="history" 
                size={16} 
                color={theme.colors.primary} 
                style={{ marginRight: 8 }}
              />
              <Text 
                className="text-xs flex-1"
                style={{ color: theme.colors.textSecondary }}
              >
                Continuar assistindo de onde parou
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};