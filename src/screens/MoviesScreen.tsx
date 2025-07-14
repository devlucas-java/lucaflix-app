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
import { movieService } from '../service/movieService';
import { SearchService } from '../service/searchService';
import {
  MovieSimpleDTO,
  MediaComplete,
  MediaSimple,
  Categoria,
  PaginatedResponseDTO,
  SerieSimpleDTO,
  AnimeSimpleDTO,
  MovieCompleteDTO,
} from '../types/mediaTypes';
import { HeroSection } from '../components/HeroSection';
import { MovieRow } from '../components/MovieRow';
import { MediaGrid } from '../components/MediaGrid';
import { loadMediaById } from '../utils/mediaService';
import { FacaLogin } from '../components/FacaLogin';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeHeader } from '~/routes/headers/HomeHeader';
import { BemVindoLoading } from '../components/loading/BemVindoLoading';
import authService from '~/service/authService';
import { LazyMovieRow } from '~/components/loading/LazyMovieRow';
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

export const MoviesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Estados principais
  const [heroContent, setHeroContent] = useState<MediaComplete | null>(null);
  const [recommendations, setRecommendations] = useState<MediaSimple[]>([]);
  const [top10Movies, setTop10Movies] = useState<MovieSimpleDTO[]>([]);

  // Estados do MediaGrid
  const [gridData, setGridData] = useState<PaginatedResponseDTO<
    MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO
  > | null>(null);
  const [gridLoaded, setGridLoaded] = useState(false);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridLoadingMore, setGridLoadingMore] = useState(false);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const [allGridItems, setAllGridItems] = useState<(SerieSimpleDTO | AnimeSimpleDTO | MovieCompleteDTO)[]>([]);
  const [hasMoreGridPages, setHasMoreGridPages] = useState(true);
  const [currentGridPage, setCurrentGridPage] = useState(0);

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

      await Promise.all([loadTop10Movies(), loadAuthenticatedContent()]);

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
      const randomId = Math.floor(Math.random() * (120 - 40 + 1)) + 40;
      const result = await loadMediaById(randomId);
      if (result && result.type === 'movie') {
        setHeroContent(result.media);
      } else {
        // Fallback para buscar um filme específico
        const popularMovies = await movieService.getPopularMovies(0, 1);
        if (popularMovies.content.length > 0) {
          const movieComplete = await movieService.getMovieById(popularMovies.content[0].id);
          setHeroContent(movieComplete);
        }
      }
    } catch (error) {
      console.error('Error loading hero:', error);
    }
  };

  const loadTop10Movies = async () => {
    try {
      const moviesData = await movieService.getTop10MostLiked();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTop10Movies(moviesData);
    } catch (error) {
      console.error('Error loading top 10 movies:', error);
    }
  };

  const loadAuthenticatedContent = async () => {
    if (isAuthenticated) {
      try {
        const movieRecs = await movieService.getRecommendations(0, 10);
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const movieRecommendations = movieRecs?.content || [];
        console.log('Recomendações de filmes carregadas:', movieRecommendations.length);
        setRecommendations(movieRecommendations);
      } catch (error) {
        console.error('Error loading movie recommendations:', error);
        setRecommendations([]);
      }
    }
  };

  // Carrega mais itens para o grid (infinite scroll)
  const loadMoreGridData = async () => {
    if (gridLoadingMore || !hasMoreGridPages) return;

    try {
      setGridLoadingMore(true);

      const nextPage = currentGridPage + 1;
      console.log('Loading more grid data for page:', nextPage);

      const response = await searchService.searchSeries(undefined, undefined, nextPage, 20);

      // Adiciona novos itens ao array existente
      setAllGridItems((prevItems) => [...prevItems, ...response.content]);
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

  // Função para carregar o MediaGrid
  const loadGridContent = async (page: number = 0) => {
    if (page === 0 && gridLoaded) return;

    try {
      setGridLoading(true);

      const searchData = await searchService.searchMovies(
        undefined,
        undefined,
        page,
        18 // Aumentando para 18 itens por página
      );

      setGridData(searchData);
      setTotalMovies(searchData.totalElements || 0);

      if (page === 0) {
        setGridLoaded(true);
      }
    } catch (error) {
      console.error('Error loading grid content:', error);
    } finally {
      setGridLoading(false);
    }
  };

  // Carregar o grid quando o conteúdo principal terminar de carregar
  useEffect(() => {
    if (!contentLoading && !initialLoading) {
      // Delay para carregar o grid após todos os componentes
      const timer = setTimeout(() => {
        loadGridContent(0);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [contentLoading, initialLoading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setGridLoaded(false);
    setGridData(null);
    try {
      await loadInitialContent();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Funções de carregamento lazy - apenas para filmes
  const loadDataFunctions = {
    popularMovies: () => movieService.getPopularMovies(0, 12).then((data) => data.content),
    newReleases: () => movieService.getNewReleases(0, 12).then((data) => data.content),
    topRatedMovies: () => movieService.getHighRatedMovies(0, 12).then((data) => data.content),
    actionMovies: () =>
      movieService
        .getMoviesByCategory(Categoria.ACAO, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    comedyMovies: () =>
      movieService
        .getMoviesByCategory(Categoria.COMEDIA, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    dramaMovies: () =>
      movieService
        .getMoviesByCategory(Categoria.DRAMA, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    horrorMovies: () =>
      movieService
        .getMoviesByCategory(Categoria.SUSPENSE, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    fantasyMovies: () =>
      movieService
        .getMoviesByCategory(Categoria.FANTASIA, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    sciFiMovies: () =>
      movieService
        .getMoviesByCategory(Categoria.FICCAO_CIENTIFICA, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    animationMovies: () =>
      movieService
        .getMoviesByCategory(Categoria.ANIMACAO, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    romanceMovies: () =>
      movieService
        .getMoviesByCategory(Categoria.ROMANCE, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
    thrillerMovies: () =>
      movieService
        .getMoviesByCategory(Categoria.ACAO, 0, 12)
        .then((data) => data.content)
        .catch(() => []),
  };

  // Função otimizada para lidar com o clique na mídia
  const handleInfo = useCallback(
    async (media: MediaSimple) => {
      try {
        const completeMedia = await movieService.getMovieById(media.id);
        navigation.navigate('MediaScreen', {
          media: completeMedia,
        });
      } catch (error) {
        console.error('Error loading movie details:', error);
      }
    },
    [navigation]
  );

  const handleHeroInfo = useCallback(() => {
    if (heroContent) {
      navigation.navigate('MediaScreen', { media: heroContent });
    }
  }, [heroContent, navigation]);

  const handleGridMediaInfo = useCallback(
    (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => {
      handleInfo(media);
    },
    [handleInfo]
  );

  if (initialLoading) {
    return <BollLoading />;
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <HomeHeader navigation={navigation} scrollY={scrollY} />

      {/* Indicador de Seção - FILMES
      <View className="top-30 absolute right-4 z-50">
        <View className="rounded-full bg-red-600 px-3 py-1">
          <Text className="text-sm font-bold text-white">FILMES</Text>
        </View>
      </View> */}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E50914"
            colors={['#E50914']}
            title="Atualizando filmes..."
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
            <Text className="mt-4 text-base text-white">Carregando filme em destaque...</Text>
          </View>
        ) : (
          heroContent && (
            <HeroSection media={heroContent} onInfo={handleHeroInfo} loading={heroLoading} />
          )
        )}

        <View className="relative z-10 -mt-32 pb-8">
          {/* Top 10 Filmes */}
          <MovieRow
            title=""
            movies={top10Movies}
            onInfo={handleInfo}
            isTop10={true}
            isBigCard={false}
            loading={contentLoading}
            hasMore={false}
          />

          {/* Recomendações de Filmes - só renderiza se o usuário estiver autenticado E houver recomendações */}
          {isAuthenticated && recommendations.length > 0 && (
            <MovieRow
              title="Filmes Recomendados para Você"
              movies={recommendations}
              onInfo={handleInfo}
              isTop10={false}
              isBigCard={false}
              loading={contentLoading}
              hasMore={false}
            />
          )}

          {/* Conteúdo lazy - apenas filmes */}
          <LazyMovieRow
            title="Filmes Populares"
            loadData={loadDataFunctions.popularMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={500}
          />
          <LazyMovieRow
            title="Novos Lançamentos"
            loadData={loadDataFunctions.newReleases}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={700}
          />
          <LazyMovieRow
            title="Filmes Bem Avaliados"
            loadData={loadDataFunctions.topRatedMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={900}
          />
          <LazyMovieRow
            title="Filmes de Ação"
            loadData={loadDataFunctions.actionMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1100}
          />
          <LazyMovieRow
            title="Filmes de Comédia"
            loadData={loadDataFunctions.comedyMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1300}
          />
          <LazyMovieRow
            title="Filmes de Drama"
            loadData={loadDataFunctions.dramaMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1500}
          />
          <LazyMovieRow
            title="Filmes de Terror"
            loadData={loadDataFunctions.horrorMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1700}
          />
          <LazyMovieRow
            title="Filmes de Fantasia"
            loadData={loadDataFunctions.fantasyMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1900}
          />
          <LazyMovieRow
            title="Ficção Científica"
            loadData={loadDataFunctions.sciFiMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2100}
          />
          <LazyMovieRow
            title="Filmes de Animação"
            loadData={loadDataFunctions.animationMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2300}
          />
          <LazyMovieRow
            title="Filmes de Romance"
            loadData={loadDataFunctions.romanceMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2500}
          />
          <LazyMovieRow
            title="Filmes de Thriller"
            loadData={loadDataFunctions.thrillerMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2700}
          />

          {/* MediaGrid Section - Largura total da tela */}

          {/* MediaGrid Section com Infinite Scroll */}
          <View className="mt-8">
            <View className="mb-6 px-4">
              <Text className="mb-2 text-2xl font-bold text-white">Explorar Todas as Séries</Text>
              <Text className="text-base text-gray-400">
                {totalMovies > 0
                  ? `${totalMovies} séries disponíveis`
                  : 'Navegue por nossa coleção completa'}
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
