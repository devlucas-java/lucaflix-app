import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions, BackHandler, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons';

// Tipos para navegação
type RootStackParamList = {
  Home: undefined;
  Error404: undefined;
};

interface Error404ScreenProps {
  onNavigateHome?: () => void;
  onNavigateBack?: () => void;
}

const Error404Screen: React.FC<Error404ScreenProps> = ({
  onNavigateHome,
  onNavigateBack
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width, height } = Dimensions.get('window');

  // Handle navigation functions
  const handleGoBack = (): void => {
    if (onNavigateBack) {
      onNavigateBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      handleGoHome();
    }
  };

  const handleGoHome = (): void => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigation.navigate('Home');
    }
  };

  // Handle back button press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <View className="flex-1 bg-black">
      <ImageBackground 
        source={{ uri: './assets/bg-error.jpg' }}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Overlay */}
        <View className="absolute inset-0 bg-black/70" />
        
        {/* Content */}
        <View className="flex-1 items-center justify-center px-4 relative z-10">
          <View className="items-center max-w-md mx-auto">
            
            {/* Error 404 */}
            <Text 
              className="text-white font-black text-center mb-8"
              style={{
                fontSize: Math.min(width * 0.3, 200),
                lineHeight: Math.min(width * 0.25, 160),
                letterSpacing: -2
              }}
            >
              404
            </Text>
            
            {/* Page Not Found */}
            <Text 
              className="text-white font-bold text-center mb-6"
              style={{
                fontSize: Math.min(width * 0.08, 36),
                lineHeight: Math.min(width * 0.09, 40),
                letterSpacing: -1
              }}
            >
              Page Not Found
            </Text>
            
            {/* Subtitle */}
            <Text 
              className="text-white text-center mb-12 opacity-80 max-w-xs"
              style={{
                fontSize: Math.min(width * 0.04, 18),
                lineHeight: Math.min(width * 0.05, 22)
              }}
            >
              The page you are looking for does not exist.
            </Text>
            
            {/* Action Buttons */}
            <View className="flex-col gap-4 w-full items-center">
              <TouchableOpacity 
                onPress={handleGoBack}
                className="bg-gray-800/80 border border-white/20 rounded-lg px-8 py-3 flex-row items-center justify-center min-w-[140px] gap-3"
                activeOpacity={0.8}
              >
                <Icon name="arrow-back" size={16} color="white" />
                <Text className="text-white text-sm font-semibold tracking-wide">
                  Voltar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleGoHome}
                className="bg-red-600 rounded-lg px-8 py-3 flex-row items-center justify-center min-w-[140px] gap-3"
                activeOpacity={0.8}
              >
                <Icon name="home" size={16} color="white" />
                <Text className="text-white text-sm font-semibold tracking-wide">
                  Home
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Error404Screen;