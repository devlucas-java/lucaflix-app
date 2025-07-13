import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeHeaderProps {
  navigation: any;
  scrollY?: Animated.Value;
  currentRoute?: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ 
  navigation, 
  scrollY, 
  currentRoute 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Home');
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const gradientOpacity = useRef(new Animated.Value(0)).current;

  const categories = [
    { id: 'series', name: 'Séries', route: 'Series' },
    { id: 'filmes', name: 'Filmes', route: 'Movies' },
    { id: 'lista', name: 'Minha Lista', route: 'MyList' },
  ];

  // Função para detectar a rota atual
  const getCurrentRoute = () => {
    try {
      const currentState = navigation.getState();
      const activeRoute = currentState.routes[currentState.index];
      
      // Se estamos em MainTabs, pegar a rota ativa da tab
      if (activeRoute.name === 'MainTabs' && activeRoute.state) {
        const tabState = activeRoute.state;
        const activeTabRoute = tabState.routes[tabState.index];
        return activeTabRoute.name;
      }
      
      return activeRoute.name;
    } catch (error) {
      console.warn('Erro ao detectar rota atual:', error);
      return 'Home';
    }
  };

  // Função para atualizar categoria baseada na rota
  const updateCategoryFromRoute = () => {
    const currentRouteName = getCurrentRoute();
    
    switch (currentRouteName) {
      case 'Home':
        setSelectedCategory('Home');
        break;
      case 'Series':
        setSelectedCategory('Séries');
        break;
      case 'Movies':
        setSelectedCategory('Filmes');
        break;
      case 'MyList':
        setSelectedCategory('Minha Lista');
        break;
      default:
        setSelectedCategory('Home');
    }
  };

  // Listener para scroll com gradiente animado
  useEffect(() => {
    if (scrollY) {
      const listener = scrollY.addListener(({ value }) => {
        // Animar opacidade do background baseado no scroll
        const backgroundOpacityValue = Math.min(value / 100, 0.9);
        const gradientOpacityValue = Math.min(value / 80, 1);
        
        Animated.parallel([
          Animated.timing(backgroundOpacity, {
            toValue: backgroundOpacityValue,
            duration: 100,
            useNativeDriver: false,
          }),
          Animated.timing(gradientOpacity, {
            toValue: gradientOpacityValue,
            duration: 100,
            useNativeDriver: false,
          }),
        ]).start();
      });
      
      return () => scrollY.removeListener(listener);
    }
  }, [scrollY, backgroundOpacity, gradientOpacity]);

  // Detectar mudanças na navegação
  useFocusEffect(
    React.useCallback(() => {
      updateCategoryFromRoute();
    }, [])
  );

  // Listener para mudanças de estado da navegação
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      updateCategoryFromRoute();
    });

    return unsubscribe;
  }, [navigation]);

  // Atualizar categoria inicial
  useEffect(() => {
    updateCategoryFromRoute();
  }, []);

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.name);
    
    // Navegar para a rota correta baseada na categoria
    if (category.route === 'Series') {
      navigation.navigate('MainTabs', { screen: 'Series' });
    } else if (category.route === 'Movies') {
      navigation.navigate('MainTabs', { screen: 'Movies' });
    } else if (category.route === 'MyList') {
      navigation.navigate('MainTabs', { screen: 'MyList' });
    }
  };

  const handleLogoPress = () => {
    setSelectedCategory('Home');
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <SafeAreaView className="absolute top-0 left-0 right-0 z-50">
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Gradiente animado para scroll */}
      <Animated.View 
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          opacity: gradientOpacity,
        }}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'transparent']}
          locations={[0, 0.3, 0.7, 1]}
          className="flex-1"
        />
      </Animated.View>
      
      {/* Background sólido para scroll intenso */}
      <Animated.View 
        className="absolute top-0 left-0 right-0 h-24 bg-black"
        style={{
          opacity: backgroundOpacity,
        }}
      />
      
      <View className="flex-1 px-4 pt-12">
        <View className="flex-row items-center justify-start px-2">
          {/* Logo - representa o Home */}
          <TouchableOpacity 
            onPress={handleLogoPress}
            className="mr-6 items-center py-2 relative"
            activeOpacity={0.7}
          >
            <Image 
              source={require('../../../assets/logo.png')}
              className="w-20 h-8"
              resizeMode="contain"
            />
            {/* Indicador de seleção para o Home/Logo */}
            {selectedCategory === 'Home' && (
              <Animated.View 
                className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1"
                style={{
                  transform: [{ scale: 1 }],
                }}
              />
            )}
          </TouchableOpacity>
          
          {/* Categorias */}
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className="items-center mr-8 py-2 relative"
              onPress={() => handleCategorySelect(category)}
              activeOpacity={0.7}
            >
              <Text className={`text-base font-medium transition-colors duration-200 ${
                selectedCategory === category.name
                  ? 'text-white font-semibold'
                  : 'text-gray-300'
              }`}>
                {category.name}
              </Text>
              {selectedCategory === category.name && (
                <Animated.View 
                  className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1"
                  style={{
                    transform: [{ scale: 1 }],
                  }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};