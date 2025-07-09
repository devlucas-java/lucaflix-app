import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { movieService } from "../service/movieService";
import { serieService } from "../service/seriesService";
import authService from "../service/authService";
import type {
  MovieSimpleDTO,
  SerieSimpleDTO,
  MovieCompleteDTO,
  SerieCompleteDTO,
  AnimeSimpleDTO,
  AnimeCompleteDTO,
} from "../types/mediaTypes";
import { Categoria } from "../types/mediaTypes";
import { HeroSection } from "../components/HeroSection";
import { MovieRow } from "../components/MovieRow";
import {
  formatTitleForUrl,
  loadMediaById,
  getMediaType,
  isMovie,
  isAnime,
  isSerie,
} from "../utils/mediaService";
import { FacaLogin } from "../components/FacaLogin";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width, height } = Dimensions.get('window');

// Hook para detectar quando elemento entra na viewport (simulado para RN)
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

// Componente para carregamento lazy de seções
const LazyMovieRow: React.FC<{
  title: string;
  loadData: () => Promise<any[]>;
  onInfo: (media: any) => void;
  isTop10?: boolean;
  isBigCard?: boolean;
  onViewableItemsChanged?: () => void;
  globalLoading?: boolean;
  loadingDelay?: number;
}> = ({ 
  title, 
  loadData, 
  onInfo, 
  isTop10, 
  isBigCard, 
  onViewableItemsChanged,
  globalLoading = false,
  loadingDelay = 0
}) => {
  const [triggerLoad, isVisible] = useIntersectionObserver();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isVisible && !loaded && !loading && !globalLoading) {
      setLoading(true);
      
      // Simula delay de carregamento se especificado
      const loadWithDelay = async () => {
        if (loadingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, loadingDelay));
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

  // Trigger carregamento quando componente aparecer na tela
  useEffect(() => {
    if (!globalLoading) {
      const timer = setTimeout(() => {
        if (onViewableItemsChanged) {
          onViewableItemsChanged();
        }
        triggerLoad();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [triggerLoad, onViewableItemsChanged, globalLoading]);

  // Se globalLoading está ativo, mostra loading
  if (globalLoading) {
    return (
      <View className="px-4 mb-8">
        <Text className="text-white text-xl font-bold mb-4">{title}</Text>
        <View className="flex items-center justify-center h-32">
          <ActivityIndicator size="large" color="#E50914" />
          <Text className="text-gray-400 text-sm mt-2">Carregando conteúdo...</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <MovieRow
        title={title}
        movies={data}
        onInfo={onInfo}
        isTop10={isTop10}
        isBigCard={isBigCard}
        loading={loading}
        hasMore={false}
      />
    </View>
  );
};

type RootStackParamList = {
  Home: undefined;
  MediaPage: {
    media: MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [heroContent, setHeroContent] = useState<
    MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO | null
  >(null);

  // Estados para conteúdo crítico (carregado imediatamente)
  const [recommendations, setRecommendations] = useState<
    (MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO)[]
  >([]);
  const [top10Movies, setTop10Movies] = useState<MovieSimpleDTO[]>([]);
  const [top10Series, setTop10Series] = useState<SerieSimpleDTO[]>([]);

  // Estados de loading
  const [initialLoading, setInitialLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Estados de loading para seções específicas
  const [loadingStates, setLoadingStates] = useState({
    recommendations: false,
    top10Movies: false,
    top10Series: false,
  });

  useEffect(() => {
    setIsAuthenticated(true);
    loadInitialContent();
  }, []);

  // Função para atualizar loading de seções específicas
  const updateLoadingState = (section: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [section]: loading }));
  };

  // Carrega apenas conteúdo crítico inicialmente
  const loadInitialContent = async () => {
    try {
      setInitialLoading(true);
      setHeroLoading(true);
      setContentLoading(true);

      // Carrega hero primeiro
      await loadHeroContent();
      setHeroLoading(false);

      // Carrega conteúdo crítico em paralelo
      await Promise.all([
        loadTop10Content(),
        loadAuthenticatedContent(),
      ]);

      setContentLoading(false);
    } catch (error) {
      console.error("Error loading initial content:", error);
      setHeroLoading(false);
      setContentLoading(false);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadHeroContent = async () => {
    try {
      // Simula loading mínimo para hero
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const randomId = Math.floor(Math.random() * (120 - 40 + 1)) + 40;
      const result = await loadMediaById(randomId);
      if (result) {
        setHeroContent(result.media);
      }
    } catch (error) {
      console.error("Error loading hero content:", error);
    }
  };

  const loadTop10Content = async () => {
    try {
      updateLoadingState('top10Movies', true);
      updateLoadingState('top10Series', true);

      const [top10MoviesData, top10SeriesData] = await Promise.all([
        movieService.getTop10MostLiked(),
        serieService.getTop10MostLiked(),
      ]);

      // Simula delay para demonstrar loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTop10Movies(top10MoviesData);
      setTop10Series(top10SeriesData);
    } catch (error) {
      console.error("Error loading top 10 content:", error);
    } finally {
      updateLoadingState('top10Movies', false);
      updateLoadingState('top10Series', false);
    }
  };

  const loadAuthenticatedContent = async () => {
    if (isAuthenticated) {
      try {
        updateLoadingState('recommendations', true);
        
        const [movieRecommendations, serieRecommendations] = await Promise.all([
          movieService.getRecommendations(0, 10),
          serieService.getRecommendations(0, 10),
        ]);

        // Simula delay para demonstrar loading
        await new Promise(resolve => setTimeout(resolve, 1200));

        setRecommendations([
          ...movieRecommendations.content,
          ...serieRecommendations.content,
        ]);
      } catch (error) {
        console.error("Error loading authenticated content:", error);
        setIsAuthenticated(false);
      } finally {
        updateLoadingState('recommendations', false);
      }
    }
  };

  // Função para refresh (pull to refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialContent();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Funções para carregamento lazy com delays escalonados
  const loadPopularMovies = useCallback(
    () => movieService.getPopularMovies(0, 12).then(data => data.content),
    []
  );

  const loadPopularSeries = useCallback(
    () => serieService.getPopularSeries(0, 12).then(data => data.content),
    []
  );

  const loadNewReleases = useCallback(
    () => movieService.getNewReleases(0, 12).then(data => data.content),
    []
  );

  const loadTopRatedMovies = useCallback(
    () => movieService.getHighRatedMovies(0, 12).then(data => data.content),
    []
  );

  const loadHighRatedSeries = useCallback(
    () => serieService.getHighRatedSeries(0, 12).then(data => data.content),
    []
  );

  const loadRecentSeries = useCallback(
    () => serieService.getRecentSeries(0, 12).then(data => data.content),
    []
  );

  const loadActionMovies = useCallback(
    () => movieService.getMoviesByCategory(Categoria.ACAO, 0, 12).then(data => data.content).catch(() => []),
    []
  );

  const loadActionSeries = useCallback(
    () => serieService.getSeriesByCategory(Categoria.ACAO, 0, 12).then(data => data.content).catch(() => []),
    []
  );

  const loadComedyMovies = useCallback(
    () => movieService.getMoviesByCategory(Categoria.COMEDIA, 0, 12).then(data => data.content).catch(() => []),
    []
  );

  const loadComedySeries = useCallback(
    () => serieService.getSeriesByCategory(Categoria.COMEDIA, 0, 12).then(data => data.content).catch(() => []),
    []
  );

  const loadDramaMovies = useCallback(
    () => movieService.getMoviesByCategory(Categoria.DRAMA, 0, 12).then(data => data.content).catch(() => []),
    []
  );

  const loadDramaSeries = useCallback(
    () => serieService.getSeriesByCategory(Categoria.DRAMA, 0, 12).then(data => data.content).catch(() => []),
    []
  );

  const loadHorrorMovies = useCallback(
    () => movieService.getMoviesByCategory(Categoria.SUSPENSE, 0, 12).then(data => data.content).catch(() => []),
    []
  );

  const loadFantasyMovies = useCallback(
    () => movieService.getMoviesByCategory(Categoria.FANTASIA, 0, 12).then(data => data.content).catch(() => []),
    []
  );

  const loadSciFiMovies = useCallback(
    () => movieService.getMoviesByCategory(Categoria.FICCAO_CIENTIFICA, 0, 12).then(data => data.content).catch(() => []),
    []
  );

  const handleInfo = async (
    media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO
  ) => {
    try {
      const mediaType = getMediaType(media);

      let completeMedia: MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO;

      if (mediaType === "movie") {
        completeMedia = await movieService.getMovieById(media.id);
      } else if (mediaType === "serie") {
        completeMedia = await serieService.getSerieById(media.id);
      } else {
        completeMedia = await movieService.getMovieById(media.id);
      }

      navigation.navigate('MediaPage', { media: completeMedia });
    } catch (error) {
      console.error("Error loading media details:", error);
    }
  };

  const handleHeroInfo = () => {
    if (heroContent) {
      navigation.navigate('MediaPage', { media: heroContent });
    }
  };

  // Loading inicial completo
  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E50914" />
          <Text className="text-white text-lg mt-4">Carregando CineFlix...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E50914"
            colors={["#E50914"]}
            title="Atualizando..."
            titleColor="#fff"
          />
        }
      >
        {/* Hero Section */}
        {heroLoading ? (
          <View className="h-96 bg-gray-900 justify-center items-center">
            <ActivityIndicator size="large" color="#E50914" />
            <Text className="text-white text-base mt-4">Carregando destaque...</Text>
          </View>
        ) : (
          heroContent && (
            <HeroSection
              media={heroContent}
              useH1={true}
              onInfo={handleHeroInfo}
              loading={heroLoading}
            />
          )
        )}

        <View className="relative z-10 -mt-32 pb-8">
          {/* Conteúdo crítico - com loading states específicos */}
          {isAuthenticated && (
            <MovieRow
              title="Recomendado para Você"
              movies={recommendations}
              onInfo={handleInfo}
              loading={loadingStates.recommendations}
              hasMore={false}
            />
          )}

          <MovieRow
            title="Top 10 Filmes"
            movies={top10Movies}
            onInfo={handleInfo}
            isTop10={true}
            isBigCard={true}
            loading={loadingStates.top10Movies}
            hasMore={false}
          />

          <MovieRow
            title="Top 10 Séries"
            movies={top10Series}
            onInfo={handleInfo}
            isTop10={true}
            isBigCard={true}
            loading={loadingStates.top10Series}
            hasMore={false}
          />

          {/* Conteúdo lazy - carrega conforme scroll com delays escalonados */}
          <LazyMovieRow
            title="Filmes Populares"
            loadData={loadPopularMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={500}
          />

          <LazyMovieRow
            title="Séries Populares"
            loadData={loadPopularSeries}
            onInfo={handleInfo}
            isBigCard={false}
            globalLoading={contentLoading}
            loadingDelay={700}
          />

          <LazyMovieRow
            title="Novos Lançamentos - Filmes"
            loadData={loadNewReleases}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={900}
          />

          <LazyMovieRow
            title="Filmes Bem Avaliados"
            loadData={loadTopRatedMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1100}
          />

          <LazyMovieRow
            title="Séries Bem Avaliadas"
            loadData={loadHighRatedSeries}
            onInfo={handleInfo}
            isBigCard={false}
            globalLoading={contentLoading}
            loadingDelay={1300}
          />

          <LazyMovieRow
            title="Séries Recentes"
            loadData={loadRecentSeries}
            onInfo={handleInfo}
            isBigCard={false}
            globalLoading={contentLoading}
            loadingDelay={1500}
          />

          <LazyMovieRow
            title="Filmes de Ação"
            loadData={loadActionMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={1700}
          />

          <LazyMovieRow
            title="Séries de Ação"
            loadData={loadActionSeries}
            onInfo={handleInfo}
            isBigCard={true}
            globalLoading={contentLoading}
            loadingDelay={1900}
          />

          <LazyMovieRow
            title="Filmes de Comédia"
            loadData={loadComedyMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2100}
          />

          <LazyMovieRow
            title="Séries de Comédia"
            loadData={loadComedySeries}
            onInfo={handleInfo}
            isBigCard={false}
            globalLoading={contentLoading}
            loadingDelay={2300}
          />

          <LazyMovieRow
            title="Filmes de Drama"
            loadData={loadDramaMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2500}
          />

          <LazyMovieRow
            title="Séries de Drama"
            loadData={loadDramaSeries}
            onInfo={handleInfo}
            isBigCard={false}
            globalLoading={contentLoading}
            loadingDelay={2700}
          />

          <LazyMovieRow
            title="Filmes de Terror"
            loadData={loadHorrorMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={2900}
          />

          <LazyMovieRow
            title="Filmes de Fantasia"
            loadData={loadFantasyMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={3100}
          />

          <LazyMovieRow
            title="Filmes de Ficção Científica"
            loadData={loadSciFiMovies}
            onInfo={handleInfo}
            globalLoading={contentLoading}
            loadingDelay={3300}
          />

          {!isAuthenticated && <FacaLogin />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};