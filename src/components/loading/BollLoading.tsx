import { colorScheme } from 'nativewind';
import { StatusBar, Text, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';

export const BollLoading = () => {
  const ball1 = useRef(new Animated.Value(0)).current;
  const ball2 = useRef(new Animated.Value(0)).current;
  const ball3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação das bolinhas em sequência
    const createBallAnimation = (ball: any, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(ball, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(ball, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Iniciar animações
    createBallAnimation(ball1, 0).start();
    createBallAnimation(ball2, 200).start();
    createBallAnimation(ball3, 400).start();

    return () => {
      ball1.stopAnimation();
      ball2.stopAnimation();
      ball3.stopAnimation();
    };
  }, []);

  const createBallStyle = (animValue: any) => {
    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.3],
    });

    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.7, 1, 0.7],
    });

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View className="flex-1 items-center justify-center">
        {/* Texto */}
        <Text className="mb-8 text-xl font-medium text-white">Carregando</Text>

        {/* Animação das bolinhas */}
        <View className="flex-row items-center justify-center">
          <Animated.View
            style={createBallStyle(ball1)}
            className="mx-2 h-4 w-4 rounded-full bg-red-600"
          />
          <Animated.View
            style={createBallStyle(ball2)}
            className="mx-2 h-4 w-4 rounded-full bg-red-600"
          />
          <Animated.View
            style={createBallStyle(ball3)}
            className="mx-2 h-4 w-4 rounded-full bg-red-600"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
