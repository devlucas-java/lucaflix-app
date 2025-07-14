import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { serieService } from '../service/seriesService';
import { SearchService } from '../service/searchService';
import authService from '../service/authService';
import type {
  SerieSimpleDTO,
  SerieCompleteDTO,
  PaginatedResponseDTO,
  AnimeSimpleDTO,
  MediaComplete,
  MediaSimple,
  MovieSimpleDTO,
} from '../types/mediaTypes';
import { Categoria } from '../types/mediaTypes';
import { HeroSection } from '../components/HeroSection';
import { MovieRow } from '../components/MovieRow';
import { MediaGrid } from '../components/MediaGrid';
import { FacaLogin } from '../components/FacaLogin';
import { HomeHeader } from '~/routes/headers/HomeHeader';
import { BemVindoLoading } from '../components/loading/BemVindoLoading';
import { LazyMovieRow } from '~/components/loading/LazyMovieRow';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BollLoading } from '~/components/loading/BollLoading';
import { MediaInfinity } from '~/components/MediaInfinity';

const searchService = new SearchService();

type RootStackParamList = {
  Home: undefined;
  MediaScreen: {
    media: MediaComplete;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SeriesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Estados principais
  const [heroContent, setHeroContent] = useState<SerieCompleteDTO | null>(null);
  const [recommendations, setRecommendations] = useState<SerieSimpleDTO[]>([]);
  const [top10Series, setTop10Series] = useState<SerieSimpleDTO[]>([]);
  const [totalSeries, setTotalSeries] = useState<number>(0);

  // Estados para o MediaGrid com infinite scroll
  const [gridData, setGridData] = useState<PaginatedResponseDTO<SerieSimpleDTO | AnimeSimpleDTO> | null>(null);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridLoadingMore, setGridLoadingMore] = useState(false);
  const [allGridItems, setAllGridItems] = useState<(SerieSimpleDTO | AnimeSimpleDTO)[]>([]);
  const [currentGridPage, setCurrentGridPage] = useState(0);
  const [hasMoreGridPages, setHasMoreGridPages] = useState(true);

  // Estados de loading
  const [initialLoading, setInitialLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      const auth = await authService.isAuthenticated();
      setIsAuthenticated(auth);
      await loadInitialContent();
    };

    initialize();
  }, []);

  const loadInitialContent = async () => {
    try {
      setInitialLoading(true);
      setHeroLoading(true);
      setContentLoading(true);

      await loadHeroContent();
      setHeroLoading(false);

      await Promise.all([loadTop10Content(), loadAuthenticatedContent(), loadTotalSeries()]);

      setContentLoading(false);
    } catch (error) {
      console.error('Error loading content:', error);
      setHeroLoading(false);
      setContentLoading(false);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadHeroContent = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const randomId = Math.floor(Math.random() * 90) + 50;

      try {
        const serieData = await serieService.getSerieById(randomId);
        setHeroContent(serieData);
      } catch (error) {
        try {
          const popularData = await serieService.getPopularSeries(0, 1);
          if (popularData.content.length > 0) {
            const firstSerie = popularData.content[0];
            const completeSerie = await serieService.getSerieById(firstSerie.id);
            setHeroContent(completeSerie);
          }
        } catch (fallbackError) {
          console.error('Error loading hero content:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
    }
  };

  const loadTop10Content = async () => {
    try {
      const seriesData = await serieService.getTop10MostLiked();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTop10Series(seriesData);
    } catch (error) {
      console.error('Error loading top 10 series:', error);
    }
  };

  const loadAuthenticatedContent = async () => {
    if (isAuthenticated) {
      try {
        const serieRecs = await serieService.getRecommendations(0, 10);
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const serieRecommendations = serieRecs?.content || [];
        console.log('Recomendações de séries carregadas:', serieRecommendations.length);
        setRecommendations(serieRecommendations);
      } catch (error) {
        console.error('Error loading series recommendations:', error);
        setRecommendations([]);
      }
    }
  };

  const loadTotalSeries = async () => {
    try {
      const totalData = await searchService.searchSeries(
        undefined,
        undefined,
        0,
        1
      );
      setTotalSeries(totalData.totalElements || 0);
    } catch (error) {
      console.error('Error loading total series count:', error);
    }
  };

  // Carrega primeira página do grid
  const loadInitialGridData = async () => {
    try {
      setGridLoading(true);
      setAllGridItems([]);
      setCurrentGridPage(0);
      
      console.log('Loading initial grid data...');
      const response = await searchService.searchSeries(
        undefined,
        undefined,
        0,
        20 // Carrega 20 itens por página
      );
      
      setGridData(response);
      setAllGridItems(response.content);
      setCurrentGridPage(response.currentPage);
      setHasMoreGridPages(response.currentPage < response.totalPages - 1);
      
      console.log('Initial grid data loaded successfully');
    } catch (error) {
      console.error('Error loading initial grid data:', error);
    } finally {
      setGridLoading(false);
    }
  };

  // Carrega mais itens para o grid (infinite scroll)
  const loadMoreGridData = async () => {
    if (gridLoadingMore || !hasMoreGridPages) return;
    
    try {
      setGridLoadingMore(true);
      
      const nextPage = currentGridPage + 1;
      console.log('Loading more grid data for page:', nextPage);
      
      const response = await searchService.searchSeries(
        undefined,
        undefined,
        nextPage,
        20
      );
      
      // Adiciona novos itens ao array existente
      setAllGridItems(prevItems => [...prevItems, ...response.content]);
      setGridData(response);
      setCurrentGridPage(response.currentPage);
      setHasMoreGridPages(response.currentPage < response.totalPages - 1);
      
      console.log('More grid data loaded successfully');
    } catch (error) {
      console.error('Error loading more grid data:', error);
    } finally {
      setGridLoadingMore(false);
    }
  };

  // Funções de carregamento lazy para séries
  const loadDataFunctions = {
    popularSeries: () => serieService.getPopularSeries(0, 12).then((data) => data.content),
    highRatedSeries: () => serieService.getHighRatedSeries(0, 12).then((data) => data.content),
    recentSeries: () => serieService.getRecentSeries(0, 12).then((data) => data.content),
    actionSeries: () =>
      serieService
        .getSeriesByCategory(Categoria.ACAO, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    comedySeries: () =>
      serieService
        .getSeriesByCategory(Categoria.COMEDIA, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    dramaSeries: () =>
      serieService
        .getSeriesByCategory(Categoria.DRAMA, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    horrorSeries: () =>
      serieService
        .getSeriesByCategory(Categoria.SUSPENSE, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    fantasySeries: () =>
      serieService
        .getSeriesByCategory(Categoria.FANTASIA, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    sciFiSeries: () =>
      serieService
        .getSeriesByCategory(Categoria.FICCAO_CIENTIFICA, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
  };

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

  const handleGridMediaInfo = useCallback((
    media: SerieSimpleDTO | AnimeSimpleDTO | MovieSimpleDTO
  ) => {
    handleInfo(media);
  }, [handleInfo]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Clear data
      setHeroContent(null);
      setRecommendations([]);
      setTop10Series([]);
      setGridData(null);
      setAllGridItems([]);
      setCurrentGridPage(0);
      setHasMoreGridPages(true);
      setTotalSeries(0);

      await loadInitialContent();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Carregar grid inicial quando o componente montar
  useEffect(() => {
    if (!initialLoading) {
      console.log('Initial loading complete, loading grid content...');
      loadInitialGridData();
    }
  }, [initialLoading]);

  if (initialLoading) {
    return <BollLoading />;
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <HomeHeader navigation={navigation} scrollY={scrollY} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E50914"
            colors={['#E50914']}
            title="Atualizando..."
            titleColor="#fff"
          />
        }
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}>
        
        {/* Hero Section */}
        {heroLoading ? (
          <View className="h-96 items-center justify-center bg-gray-900">
            <ActivityIndicator size="large" color="#E50914" />
            <Text className="mt-4 text-base text-white">Carregando destaque...</Text>
          </View>
        ) : (
          heroContent && (
            <HeroSection 
              media={heroContent} 
              onInfo={handleHeroInfo} 
              loading={heroLoading}
              useH1={true}
            />
          )
        )}

        <View className="relative z-10 -mt-32 pb-8">
          {/* Top 10 Séries */}
          <MovieRow
            title=""
            movies={top10Series}
            onInfo={handleInfo}
            isTop10={true}
            isBigCard={false}
            loading={contentLoading}
            hasMore={false}
          />

          {/* Recomendações - só renderiza se o usuário estiver autenticado E houver recomendações */}
          {isAuthenticated && recommendations.length > 0 && (
            <MovieRow
              title="Recomendadas para Você"
              movies={recommendations}
              onInfo={handleInfo}
              isTop10={false}
              isBigCard={false}
              loading={contentLoading}
              hasMore={false}
            />
          )}

          {/* Conteúdo lazy para séries */}
          <LazyMovieRow
            title="Séries Populares"
            loadData={loadDataFunctions.popularSeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={500}
          />
          <LazyMovieRow
            title="Séries Bem Avaliadas"
            loadData={loadDataFunctions.highRatedSeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={700}
          />
          <LazyMovieRow
            title="Séries Recentes"
            loadData={loadDataFunctions.recentSeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={900}
          />
          <LazyMovieRow
            title="Séries de Ação"
            loadData={loadDataFunctions.actionSeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1100}
          />
          <LazyMovieRow
            title="Séries de Comédia"
            loadData={loadDataFunctions.comedySeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1300}
          />
          <LazyMovieRow
            title="Séries de Drama"
            loadData={loadDataFunctions.dramaSeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1500}
          />
          <LazyMovieRow
            title="Séries de Terror"
            loadData={loadDataFunctions.horrorSeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1700}
          />
          <LazyMovieRow
            title="Séries de Fantasia"
            loadData={loadDataFunctions.fantasySeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1900}
          />
          <LazyMovieRow
            title="Séries de Ficção Científica"
            loadData={loadDataFunctions.sciFiSeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2100}
          />

          {/* Estatísticas de Séries */}
          {totalSeries > 0 && (
            <View className="px-4 mb-6">
              <View className="items-center">
                <Text className="text-gray-400 text-sm">
                  Total de {totalSeries.toLocaleString()} séries disponíveis
                </Text>
              </View>
            </View>
          )}

          {/* MediaGrid Section com Infinite Scroll */}
          <View className="mt-8">
            <View className="px-4 mb-6">
              <Text className="text-2xl font-bold text-white mb-2">
                Explorar Todas as Séries
              </Text>
              <Text className="text-gray-400 text-base">
                {totalSeries > 0 ? `${totalSeries} séries disponíveis` : 'Navegue por nossa coleção completa'}
              </Text>
            </View>

            {/* MediaGrid com infinite scroll */}
            <MediaInfinity
              data={gridData}
              loading={gridLoading}
              loadingMore={gridLoadingMore}
              allItems={allGridItems}
              onLoadMore={loadMoreGridData}
              onMediaInfo={handleGridMediaInfo}
              gridSize="medium"
            />
          </View>

          {/* Componente de login para usuários não autenticados */}
          {!isAuthenticated && <FacaLogin />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};