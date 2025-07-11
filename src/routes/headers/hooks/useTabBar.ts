// hooks/useTabBar.ts
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMemo } from 'react';

// Definir as rotas fora do componente para evitar re-criação
const TAB_ROUTES = [
  { key: 'Home', name: 'Home' },
  { key: 'Search', name: 'Search' },
  { key: 'MyList', name: 'MyList' },
  { key: 'Profile', name: 'Profile' },
];

// Descriptors estáticos para evitar re-criação
const DESCRIPTORS = TAB_ROUTES.reduce((acc, route) => {
  acc[route.key] = {
    options: {
      tabBarAccessibilityLabel: route.name,
      tabBarTestID: `${route.name}-tab`,
    }
  };
  return acc;
}, {} as any);

export const useTabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Apenas calcular o índice atual quando necessário
  const currentIndex = useMemo(() => {
    return TAB_ROUTES.findIndex(tabRoute => tabRoute.name === route.name);
  }, [route.name]);

  // State mínimo e otimizado
  const state = useMemo(() => ({
    routes: TAB_ROUTES,
    index: currentIndex >= 0 ? currentIndex : 0,
    routeNames: ['Home', 'Search', 'MyList', 'Profile'], // Array estático
  }), [currentIndex]);

  return {
    state,
    descriptors: DESCRIPTORS,
    navigation,
  };
};