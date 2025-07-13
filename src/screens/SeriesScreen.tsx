import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { serieService } from '../service/seriesService';
import { SearchService } from '../service/searchService';
import authService from '../service/authService';
import type {
  SerieSimpleDTO,
  SerieCompleteDTO,
  PaginatedResponseDTO,
  MovieSimpleDTO,
  AnimeSimpleDTO,
  MediaComplete,
  MediaSimple,
} from '../types/mediaTypes';
import { Categoria } from '../types/mediaTypes';
import { HeroSection } from '../components/HeroSection';
import { MovieRow } from '../components/MovieRow';
import { MediaGrid } from '../components/MediaGrid';
import { FacaLogin } from '../components/FacaLogin';
import { HomeHeader } from '~/routes/headers/HomeHeader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { height: screenHeight } = Dimensions.get('window');
const searchService = new SearchService();

type RootStackParamList = {
  Home: undefined;
  MediaScreen: {
    media: MediaComplete;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Hook personalizado para Intersection Observer equivalente
const useScrollObserver = (callback: () => void, threshold = 0.8) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrollProgress = (contentOffset.y + layoutMeasurement.height) / contentSize.height;
    
    if (scrollProgress >= threshold && !isVisible) {
      setIsVisible(true);
      callback();
    }
  }, [callback, threshold, isVisible]);
  
  return { handleScroll, isVisible };
};

export const SeriesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Estados do hero
  const [heroContent, setHeroContent] = useState<SerieCompleteDTO | null>(null);

  // Estados para as rows de séries
  const [popularSeries, setPopularSeries] = useState<SerieSimpleDTO[]>([]);
  const [highRatedSeries, setHighRatedSeries] = useState<SerieSimpleDTO[]>([]);
  const [recentSeries, setRecentSeries] = useState<SerieSimpleDTO[]>([]);
  const [actionSeries, setActionSeries] = useState<SerieSimpleDTO[]>([]);

  // Estados para o MediaGrid
  const [gridData, setGridData] = useState<PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO> | null>(null);

  // Estados de loading
  const [heroLoading, setHeroLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados de autenticação e total
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalSeries, setTotalSeries] = useState<number>(0);

  // Estados para controle de carregamento por seção
  const [loadedSections, setLoadedSections] = useState({
    hero: false,
    popularSeries: false,
    highRatedSeries: false,
    recentSeries: false,
    actionSeries: false,
    grid: false,
    totalCount: false
  });

  const [loadingSections, setLoadingSections] = useState({
    popularSeries: false,
    highRatedSeries: false,
    recentSeries: false,
    actionSeries: false,
    grid: false,
    totalCount: false
  });

  // Refs para controle de scroll
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollYValue, setScrollYValue] = useState(0);

  // Scroll observers
  const popularObserver = useScrollObserver(() => loadPopularSeries(), 0.6);
  const highRatedObserver = useScrollObserver(() => loadHighRatedSeries(), 0.65);
  const recentObserver = useScrollObserver(() => loadRecentSeries(), 0.7);
  const actionObserver = useScrollObserver(() => loadActionSeries(), 0.75);
  const gridObserver = useScrollObserver(() => loadGridContent(0), 0.8);
  const totalObserver = useScrollObserver(() => loadTotalSeries(), 0.85);

  useEffect(() => {
    const initialize = async () => {
      const auth = await authService.isAuthenticated();
      setIsAuthenticated(auth);
      await loadHeroContent();
    };

    initialize();
  }, []);

  const loadHeroContent = async () => {
    try {
      const randomId = Math.floor(Math.random() * 100) + 1;

      try {
        const serieData = await serieService.getSerieById(randomId);
        setHeroContent(serieData);
        setLoadedSections(prev => ({ ...prev, hero: true }));
      } catch (error) {
        try {
          const popularData = await serieService.getPopularSeries(0, 1);
          if (popularData.content.length > 0) {
            const firstSerie = popularData.content[0];
            const completeSerie = await serieService.getSerieById(firstSerie.id);
            setHeroContent(completeSerie);
            setLoadedSections(prev => ({ ...prev, hero: true }));
          }
        } catch (fallbackError) {
          console.error('Error loading hero content:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
    } finally {
      setHeroLoading(false);
    }
  };

  const loadPopularSeries = async () => {
    if (loadedSections.popularSeries || loadingSections.popularSeries) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, popularSeries: true }));
      const popularSeriesData = await serieService.getPopularSeries(0, 12);
      setPopularSeries(popularSeriesData.content);
      setLoadedSections(prev => ({ ...prev, popularSeries: true }));
    } catch (error) {
      console.error('Error loading popular series:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, popularSeries: false }));
    }
  };

  const loadHighRatedSeries = async () => {
    if (loadedSections.highRatedSeries || loadingSections.highRatedSeries) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, highRatedSeries: true }));
      const highRatedSeriesData = await serieService.getHighRatedSeries(0, 12);
      setHighRatedSeries(highRatedSeriesData.content);
      setLoadedSections(prev => ({ ...prev, highRatedSeries: true }));
    } catch (error) {
      console.error('Error loading high rated series:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, highRatedSeries: false }));
    }
  };

  const loadRecentSeries = async () => {
    if (loadedSections.recentSeries || loadingSections.recentSeries) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, recentSeries: true }));
      const recentSeriesData = await serieService.getRecentSeries(0, 12);
      setRecentSeries(recentSeriesData.content);
      setLoadedSections(prev => ({ ...prev, recentSeries: true }));
    } catch (error) {
      console.error('Error loading recent series:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, recentSeries: false }));
    }
  };

  const loadActionSeries = async () => {
    if (loadedSections.actionSeries || loadingSections.actionSeries) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, actionSeries: true }));
      const actionSeriesData = await serieService
        .getSeriesByCategory(Categoria.ACAO, 0, 12)
        .catch(() => ({ content: [] }));
      
      setActionSeries(actionSeriesData.content);
      setLoadedSections(prev => ({ ...prev, actionSeries: true }));
    } catch (error) {
      console.error('Error loading action series:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, actionSeries: false }));
    }
  };

  const loadGridContent = async (page: number = 0) => {
    if (page === 0 && (loadedSections.grid || loadingSections.grid)) return;
    
    try {
      setGridLoading(true);
      if (page === 0) {
        setLoadingSections(prev => ({ ...prev, grid: true }));
      }

      const searchData = await searchService.searchSeries(
        undefined,
        undefined,
        page,
        12
      );

      setGridData(searchData);
      if (page === 0) {
        setLoadedSections(prev => ({ ...prev, grid: true }));
      }
    } catch (error) {
      console.error('Error loading grid content:', error);
    } finally {
      setGridLoading(false);
      if (page === 0) {
        setLoadingSections(prev => ({ ...prev, grid: false }));
      }
    }
  };

  const loadTotalSeries = async () => {
    if (loadedSections.totalCount || loadingSections.totalCount) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, totalCount: true }));
      
      const totalData = await searchService.searchSeries(
        undefined,
        undefined,
        0,
        1
      );
      
      setTotalSeries(totalData.totalElements || 0);
      setLoadedSections(prev => ({ ...prev, totalCount: true }));
    } catch (error) {
      console.error('Error loading total series count:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, totalCount: false }));
    }
  };

  // Função para navegar para MediaScreen (igual ao HomeScreen)
  const handleInfo = useCallback(async (media: MediaSimple) => {
    try {
      const completeSerie = await serieService.getSerieById(media.id);
      navigation.navigate('MediaScreen', {
        media: completeSerie,
      });
    } catch (error) {
      console.error('Error loading serie details:', error);
    }
  }, [navigation]);

  const handleHeroInfo = useCallback(() => {
    if (heroContent) {
      navigation.navigate('MediaScreen', { media: heroContent });
    }
  }, [heroContent, navigation]);

  const handleGridPageChange = useCallback((page: number) => {
    loadGridContent(page);
  }, []);

  const handleGridMediaInfo = useCallback((
    media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO
  ) => {
    handleInfo(media);
  }, [handleInfo]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Reset loaded sections
    setLoadedSections({
      hero: false,
      popularSeries: false,
      highRatedSeries: false,
      recentSeries: false,
      actionSeries: false,
      grid: false,
      totalCount: false
    });

    // Clear data
    setPopularSeries([]);
    setHighRatedSeries([]);
    setRecentSeries([]);
    setActionSeries([]);
    setGridData(null);
    setTotalSeries(0);

    // Reload hero content
    await loadHeroContent();
    
    setRefreshing(false);
  }, []);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    setScrollYValue(contentOffset.y);
    
    // Trigger scroll observers
    popularObserver.handleScroll(event);
    highRatedObserver.handleScroll(event);
    recentObserver.handleScroll(event);
    actionObserver.handleScroll(event);
    gridObserver.handleScroll(event);
    totalObserver.handleScroll(event);
  }, []);

  // Skeleton components
  const RowSkeleton = () => (
    <View className="mb-6">
      <View className="h-6 bg-gray-700/50 rounded w-48 mb-4 mx-4" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {Array(6).fill(0).map((_, i) => (
          <View key={i} className="w-44 h-64 bg-gray-700/30 rounded mr-3" />
        ))}
      </ScrollView>
    </View>
  );

  const GridSkeleton = () => (
    <View className="grid grid-cols-3 gap-4">
      {Array(12).fill(0).map((_, i) => (
        <View key={i} className="aspect-[2/3] bg-gray-700/30 rounded" />
      ))}
    </View>
  );

  // Loading apenas para o hero
  if (heroLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e50914" />
          <Text className="text-white mt-4">Carregando séries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <HomeHeader navigation={navigation} scrollY={scrollY} />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { 
            useNativeDriver: false,
            listener: handleScroll
          }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#e50914']}
            tintColor="#e50914"
          />
        }
      >
        {/* Hero Section */}
        {heroContent && loadedSections.hero && (
          <HeroSection
            media={heroContent}
            useH1={true}
            onInfo={handleHeroInfo}
          />
        )}

        {/* Content Rows */}
        <View className="relative z-10 -mt-32 pb-8">
          {/* Row 1: Séries Populares - Lazy Loading */}
          {loadedSections.popularSeries && popularSeries.length > 0 ? (
            <MovieRow
              title=""
              movies={popularSeries}
              onInfo={handleInfo}
              isBigCard={false}
            />
          ) : loadingSections.popularSeries ? (
            <RowSkeleton />
          ) : (
            <View className="h-4" />
          )}

          {/* Row 2: Séries Bem Avaliadas - Lazy Loading */}
          {loadedSections.highRatedSeries && highRatedSeries.length > 0 ? (
            <MovieRow
              title="Séries Bem Avaliadas"
              movies={highRatedSeries}
              onInfo={handleInfo}
              isBigCard={false}
            />
          ) : loadingSections.highRatedSeries ? (
            <RowSkeleton />
          ) : (
            <View className="h-4" />
          )}

          {/* Row 3: Séries Recentes - Lazy Loading */}
          {loadedSections.recentSeries && recentSeries.length > 0 ? (
            <MovieRow
              title="Séries Recentes"
              movies={recentSeries}
              onInfo={handleInfo}
              isBigCard={false}
            />
          ) : loadingSections.recentSeries ? (
            <RowSkeleton />
          ) : (
            <View className="h-4" />
          )}

          {/* Row 4: Séries de Ação - Lazy Loading */}
          {loadedSections.actionSeries && actionSeries.length > 0 ? (
            <MovieRow
              title="Séries de Ação"
              movies={actionSeries}
              onInfo={handleInfo}
              isBigCard={false}
            />
          ) : loadingSections.actionSeries ? (
            <RowSkeleton />
          ) : (
            <View className="h-4" />
          )}

          {/* Estatísticas de Séries - Lazy Loading */}
          {loadedSections.totalCount ? (
            <View className="px-4 mb-6">
              <View className="items-center">
                <Text className="text-gray-400 text-sm">
                  Total de {totalSeries.toLocaleString()} séries disponíveis
                </Text>
              </View>
            </View>
          ) : loadingSections.totalCount ? (
            <View className="px-4 mb-6">
              <View className="items-center">
                <View className="h-4 bg-gray-700/50 rounded w-48" />
              </View>
            </View>
          ) : (
            <View className="h-4" />
          )}

          {/* MediaGrid Section - Lazy Loading */}
          <View className="px-4 mt-8">
            <View className="mb-6">
              <Text className="text-2xl font-bold text-white mb-2">
                Explorar Todas as Séries
              </Text>
              <Text className="text-gray-400">
                Navegue por nossa coleção completa de séries
              </Text>
            </View>

            {loadedSections.grid ? (
              <MediaGrid
                data={gridData}
                loading={gridLoading}
                onPageChange={handleGridPageChange}
                onMediaInfo={handleGridMediaInfo}
                gridSize="medium"
              />
            ) : loadingSections.grid ? (
              <GridSkeleton />
            ) : (
              <View className="h-64 items-center justify-center">
                <Text className="text-gray-400">
                  Role para baixo para carregar mais conteúdo
                </Text>
              </View>
            )}
          </View>

          {/* Aviso para usuários não logados */}
          {!isAuthenticated && <FacaLogin />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};