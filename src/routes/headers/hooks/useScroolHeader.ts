import { Animated } from 'react-native';

// Hook para usar o scroll em qualquer componente
export const useScrollHeader = () => {
  const scrollY = new Animated.Value(0);
  
  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );
  
  return { scrollY, scrollHandler };
};