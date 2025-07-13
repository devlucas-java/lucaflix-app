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
import { serieService } from '../service/seriesService';
import {
  MovieSimpleDTO,
  SerieSimpleDTO,
  MediaComplete,
  MediaSimple,
  Categoria,
} from '../types/mediaTypes';
import { HeroSection } from '../components/HeroSection';
import { MovieRow } from '../components/MovieRow';
import { loadMediaById, getMediaType } from '../utils/mediaService';
import { FacaLogin } from '../components/FacaLogin';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeHeader } from '~/routes/headers/HomeHeader';
import { BemVindoLoading } from '../components/loading/BemVindoLoading';
import authService from '~/service/authService';

// Hook para carregamento lazy
const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const triggerVisibility = useCallback(() => {
    if (!hasTriggered) {
      setIsVisible(true);
      setHasTriggered(true);
    }
  }, [hasTriggered]);

  return [triggerVisibility, isVisible] as const;
};

// Componente para carregamento lazy
const LazyMovieRow: React.FC<{
  title: string;
  loadData: () => Promise<MediaSimple[]>;
  onInfo: (media: MediaSimple) => void;
  isTop10?: boolean;
  isBigCard?: boolean;
  globalLoading?: boolean;
  loadingDelay?: number;
}> = ({ title, loadData, onInfo, isTop10, isBigCard, globalLoading = false, loadingDelay = 0 }) => {
  const [triggerLoad, isVisible] = useIntersectionObserver();
  const [data, setData] = useState<MediaSimple[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isVisible && !loaded && !loading && !globalLoading) {
      setLoading(true);

      const loadWithDelay = async () => {
        if (loadingDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, loadingDelay));
        }
        return loadData();
      };

      loadWithDelay()
        .then(setData)
        .catch(console.error)
        .finally(() => {
          setLoading(false);
          setLoaded(true);
        });
    }
  }, [isVisible, loaded, loading, loadData, globalLoading, loadingDelay]);

  useEffect(() => {
    if (!globalLoading) {
      const timer = setTimeout(() => {
        triggerLoad();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [triggerLoad, globalLoading]);

  if (globalLoading) {
    return (
      <View className="mb-8 px-4">
        <Text className="mb-4 text-xl font-bold text-white">{title}</Text>
        <View className="flex h-32 items-center justify-center">
          <ActivityIndicator size="large" color="#E50914" />
          <Text className="mt-2 text-sm text-gray-400">Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <MovieRow
      title={title}
      movies={data}
      onInfo={onInfo}
      isTop10={isTop10}
      isBigCard={isBigCard}
      loading={loading}
      hasMore={false}
    />
  );
};

type RootStackParamList = {
  Home: undefined;
  MediaScreen: {
    media: MediaComplete;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Estados principais
  const [heroContent, setHeroContent] = useState<MediaComplete | null>(null);
  const [recommendations, setRecommendations] = useState<MediaSimple[]>([]);
  const [top10Movies, setTop10Movies] = useState<MovieSimpleDTO[]>([]);
  const [top10Series, setTop10Series] = useState<SerieSimpleDTO[]>([]);

  // Estados de loading
  const [initialLoading, setInitialLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      const auth = await authService.isAuthenticated(); // aguarda o resultado
      setIsAuthenticated(auth);
      await loadInitialContent(); // se essa também for async
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

      await Promise.all([loadTop10Content(), loadAuthenticatedContent()]);

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
      if (result) {
        setHeroContent(result.media);
      }
    } catch (error) {
      console.error('Error loading hero:', error);
    }
  };

  const loadTop10Content = async () => {
    try {
      const [moviesData, seriesData] = await Promise.all([
        movieService.getTop10MostLiked(),
        serieService.getTop10MostLiked(),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTop10Movies(moviesData);
      setTop10Series(seriesData);
    } catch (error) {
      console.error('Error loading top 10:', error);
    }
  };

  const loadAuthenticatedContent = async () => {
    if (isAuthenticated) {
      try {
        const [movieRecs, serieRecs] = await Promise.all([
          movieService.getRecommendations(0, 10),
          serieService.getRecommendations(0, 10),
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Verificar se as recomendações existem e têm conteúdo
        const movieRecommendations = movieRecs?.content || [];
        const serieRecommendations = serieRecs?.content || [];

        const allRecommendations = [...movieRecommendations, ...serieRecommendations];

        console.log('Recomendações carregadas:', allRecommendations.length);
        setRecommendations(allRecommendations);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setRecommendations([]);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialContent();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Funções de carregamento lazy
  const loadDataFunctions = {
    popularMovies: () => movieService.getPopularMovies(0, 12).then((data) => data.content),
    popularSeries: () => serieService.getPopularSeries(0, 12).then((data) => data.content),
    newReleases: () => movieService.getNewReleases(0, 12).then((data) => data.content),
    topRatedMovies: () => movieService.getHighRatedMovies(0, 12).then((data) => data.content),
    highRatedSeries: () => serieService.getHighRatedSeries(0, 12).then((data) => data.content),
    recentSeries: () => serieService.getRecentSeries(0, 12).then((data) => data.content),
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
  };

  // Função otimizada para lidar com o clique na mídia
  const handleInfo = useCallback(
    async (media: MediaSimple) => {
      try {
        const mediaType = getMediaType(media);
        let completeMedia: MediaComplete;

        if (mediaType === 'movie') {
          completeMedia = await movieService.getMovieById(media.id);
        } else if (mediaType === 'serie') {
          completeMedia = await serieService.getSerieById(media.id);
        } else {
          completeMedia = await movieService.getMovieById(media.id);
        }

        navigation.navigate('MediaScreen', {
          media: completeMedia,
        });
      } catch (error) {
        console.error('Error loading media details:', error);
      }
    },
    [navigation]
  );

  const handleHeroInfo = useCallback(() => {
    if (heroContent) {
      navigation.navigate('MediaScreen', { media: heroContent });
    }
  }, [heroContent, navigation]);

  if (initialLoading) {
    return <BemVindoLoading />;
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
            <HeroSection media={heroContent} onInfo={handleHeroInfo} loading={heroLoading} />
          )
        )}

        <View className="relative z-10 -mt-32 pb-8">
          {/* Top 10 Filmes */}
          <MovieRow
            title="Top 10 Filmes"
            movies={top10Movies}
            onInfo={handleInfo}
            isTop10={true}
            isBigCard={false}
            loading={contentLoading}
            hasMore={false}
          />

          {/* Recomendações - só renderiza se o usuário estiver autenticado E houver recomendações */}
          {isAuthenticated && recommendations.length > 0 && (
            <MovieRow
              title="Recomendados para Você"
              movies={recommendations}
              onInfo={handleInfo}
              isTop10={false}
              isBigCard={false}
              loading={contentLoading}
              hasMore={false}
            />
          )}

          {/* Top 10 Séries */}
          <MovieRow
            title="Top 10 Séries"
            movies={top10Series}
            onInfo={handleInfo}
            isTop10={true}
            loading={contentLoading}
            hasMore={false}
          />

          {/* Conteúdo lazy */}
          <LazyMovieRow
            title="Filmes Populares"
            loadData={loadDataFunctions.popularMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={500}
          />
          <LazyMovieRow
            title="Séries Populares"
            loadData={loadDataFunctions.popularSeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={700}
          />
          <LazyMovieRow
            title="Novos Lançamentos"
            loadData={loadDataFunctions.newReleases}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={900}
          />
          <LazyMovieRow
            title="Filmes Bem Avaliados"
            loadData={loadDataFunctions.topRatedMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1100}
          />
          <LazyMovieRow
            title="Séries Bem Avaliadas"
            loadData={loadDataFunctions.highRatedSeries}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1300}
          />
          <LazyMovieRow
            title="Filmes de Ação"
            loadData={loadDataFunctions.actionMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1500}
          />
          <LazyMovieRow
            title="Filmes de Comédia"
            loadData={loadDataFunctions.comedyMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1700}
          />
          <LazyMovieRow
            title="Filmes de Drama"
            loadData={loadDataFunctions.dramaMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1900}
          />
          <LazyMovieRow
            title="Filmes de Terror"
            loadData={loadDataFunctions.horrorMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2100}
          />
          <LazyMovieRow
            title="Filmes de Fantasia"
            loadData={loadDataFunctions.fantasyMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2300}
          />
          <LazyMovieRow
            title="Ficção Científica"
            loadData={loadDataFunctions.sciFiMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2500}
          />

          {/* Componente de login para usuários não autenticados */}
          {!isAuthenticated && <FacaLogin />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
