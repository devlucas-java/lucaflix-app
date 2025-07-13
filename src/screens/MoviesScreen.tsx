import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { movieService } from '../service/movieService';
import { SearchService } from '../service/searchService';
import authService from '../service/authService';
import type {
  MovieSimpleDTO,
  MovieCompleteDTO,
  PaginatedResponseDTO,
  SerieSimpleDTO,
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
import { getMediaType } from '../utils/mediaService';

const { height: screenHeight } = Dimensions.get('window');
const searchService = new SearchService();

// Tipos para navegação
type RootStackParamList = {
  Home: undefined;
  MediaScreen: {
    media: MediaComplete;
    onBack?: () => void;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Hook para Intersection Observer alternativo no React Native
const useScrollObserver = (callback: () => void, threshold: number = 0.8) => {
  const ref = useRef<View>(null);
  
  const handleLayout = useCallback((event: any) => {
    const { y } = event.nativeEvent.layout;
    if (y < screenHeight * threshold) {
      callback();
    }
  }, [callback, threshold]);

  return { ref, handleLayout };
};

export const MoviesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Estados do hero
  const [heroContent, setHeroContent] = useState<MovieCompleteDTO | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);

  // Estados para as rows de filmes
  const [popularMovies, setPopularMovies] = useState<MovieSimpleDTO[]>([]);
  const [newReleases, setNewReleases] = useState<MovieSimpleDTO[]>([]);
  const [highRatedMovies, setHighRatedMovies] = useState<MovieSimpleDTO[]>([]);
  const [actionMovies, setActionMovies] = useState<MovieSimpleDTO[]>([]);

  // Estados para o MediaGrid 
  const [gridData, setGridData] = useState<PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO> | null>(null);

// Estados de controle
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [gridLoading, setGridLoading] = useState(false);

  // Estados para controle de carregamento por seção
  const [loadedSections, setLoadedSections] = useState({
    hero: false,
    popularMovies: false,
    newReleases: false,
    highRatedMovies: false,
    actionMovies: false,
    grid: false,
    totalCount: false,
  });

  const [loadingSections, setLoadingSections] = useState({
    popularMovies: false,
    newReleases: false,
    highRatedMovies: false,
    actionMovies: false,
    grid: false,
    totalCount: false,
  });

  useEffect(() => {
    const initialize = async () => {
      // Verificar autenticação
      const auth = await authService.isAuthenticated();
      setIsAuthenticated(auth);
      
      // Carregar apenas o hero primeiro
      await loadHeroContent();
    };

    initialize();
  }, []);

  // Carrega apenas o hero primeiro
  const loadHeroContent = async () => {
    try {
      setHeroLoading(true);
      const randomId = Math.floor(Math.random() * 100) + 1;

      try {
        const movieData = await movieService.getMovieById(randomId);
        setHeroContent(movieData);
        setLoadedSections(prev => ({ ...prev, hero: true }));
      } catch (error) {
        try {
          const popularData = await movieService.getPopularMovies(0, 1);
          if (popularData.content.length > 0) {
            const firstMovie = popularData.content[0];
            const completeMovie = await movieService.getMovieById(firstMovie.id);
            setHeroContent(completeMovie);
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

  const loadPopularMovies = async () => {
    if (loadedSections.popularMovies || loadingSections.popularMovies) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, popularMovies: true }));
      const popularMoviesData = await movieService.getPopularMovies(0, 12);
      setPopularMovies(popularMoviesData.content);
      setLoadedSections(prev => ({ ...prev, popularMovies: true }));
    } catch (error) {
      console.error('Error loading popular movies:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, popularMovies: false }));
    }
  };

  const loadNewReleases = async () => {
    if (loadedSections.newReleases || loadingSections.newReleases) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, newReleases: true }));
      const newReleasesData = await movieService.getNewReleases(0, 12);
      setNewReleases(newReleasesData.content);
      setLoadedSections(prev => ({ ...prev, newReleases: true }));
    } catch (error) {
      console.error('Error loading new releases:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, newReleases: false }));
    }
  };

  const loadHighRatedMovies = async () => {
    if (loadedSections.highRatedMovies || loadingSections.highRatedMovies) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, highRatedMovies: true }));
      const highRatedMoviesData = await movieService.getHighRatedMovies(0, 12);
      setHighRatedMovies(highRatedMoviesData.content);
      setLoadedSections(prev => ({ ...prev, highRatedMovies: true }));
    } catch (error) {
      console.error('Error loading high rated movies:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, highRatedMovies: false }));
    }
  };

  const loadActionMovies = async () => {
    if (loadedSections.actionMovies || loadingSections.actionMovies) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, actionMovies: true }));
      const actionMoviesData = await movieService
        .getMoviesByCategory(Categoria.ACAO, 0, 12)
        .catch(() => ({ content: [] }));
      
      setActionMovies(actionMoviesData.content);
      setLoadedSections(prev => ({ ...prev, actionMovies: true }));
    } catch (error) {
      console.error('Error loading action movies:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, actionMovies: false }));
    }
  };

  const loadGridContent = async (page: number = 0) => {
    if (page === 0 && (loadedSections.grid || loadingSections.grid)) return;
    
    try {
      setGridLoading(true);
      if (page === 0) {
        setLoadingSections(prev => ({ ...prev, grid: true }));
      }

      const searchData = await searchService.searchMovies(
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

  const loadTotalMovies = async () => {
    if (loadedSections.totalCount || loadingSections.totalCount) return;
    
    try {
      setLoadingSections(prev => ({ ...prev, totalCount: true }));
      
      const totalData = await searchService.searchMovies(
        undefined,
        undefined,
        0,
        1
      );
      
      setTotalMovies(totalData.totalElements || 0);
      setLoadedSections(prev => ({ ...prev, totalCount: true }));
    } catch (error) {
      console.error('Error loading total movies count:', error);
    } finally {
      setLoadingSections(prev => ({ ...prev, totalCount: false }));
    }
  };

  // Observers para lazy loading
  const popularObserver = useScrollObserver(loadPopularMovies);
  const newReleasesObserver = useScrollObserver(loadNewReleases);
  const highRatedObserver = useScrollObserver(loadHighRatedMovies);
  const actionObserver = useScrollObserver(loadActionMovies);
  const gridObserver = useScrollObserver(() => loadGridContent(0));
  const totalObserver = useScrollObserver(loadTotalMovies);

  // Função otimizada para lidar com o clique na mídia
  const handleInfo = useCallback(
    async (media: MediaSimple) => {
      try {
        const mediaType = getMediaType(media);
        let completeMedia: MediaComplete;

        if (mediaType === 'movie') {
          completeMedia = await movieService.getMovieById(media.id);
        } else if (mediaType === 'serie') {
          // Se for série, usar serieService quando disponível
          completeMedia = await movieService.getMovieById(media.id);
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
      popularMovies: false,
      newReleases: false,
      highRatedMovies: false,
      actionMovies: false,
      grid: false,
      totalCount: false,
    });

    // Reload hero content
    await loadHeroContent();
    
    setRefreshing(false);
  }, []);

  // Skeleton components
  const RowSkeleton = () => (
    <View className="px-4 mb-6">
      <View className="h-5 bg-gray-700 rounded w-32 mb-3" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Array(4).fill(0).map((_, i) => (
          <View key={i} className="w-32 h-48 bg-gray-700 rounded mr-3" />
        ))}
      </ScrollView>
    </View>
  );

  const GridSkeleton = () => (
    <View className="px-4">
      <View className="h-6 bg-gray-700 rounded w-48 mb-4" />
      <FlatList
        data={Array(12).fill(0)}
        numColumns={3}
        renderItem={({ index }) => (
          <View 
            className="flex-1 aspect-[2/3] bg-gray-700 rounded m-1"
            key={index}
          />
        )}
        scrollEnabled={false}
      />
    </View>
  );

  // Loading principal apenas para o hero
  if (heroLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e50914" />
          <Text className="text-text-secondary mt-4">Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <HomeHeader navigation={navigation} scrollY={scrollY} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#e50914']}
            tintColor="#e50914"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
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
          {/* Row 1: Filmes Populares */}
          <View 
            ref={popularObserver.ref}
            onLayout={popularObserver.handleLayout}
          >
            {loadedSections.popularMovies && popularMovies.length > 0 ? (
              <MovieRow
                title=""
                movies={popularMovies}
                onInfo={handleInfo}
                loading={loadingSections.popularMovies}
              />
            ) : loadingSections.popularMovies ? (
              <RowSkeleton />
            ) : (
              <View className="h-4" />
            )}
          </View>

          {/* Row 2: Novos Lançamentos */}
          <View 
            ref={newReleasesObserver.ref}
            onLayout={newReleasesObserver.handleLayout}
          >
            {loadedSections.newReleases && newReleases.length > 0 ? (
              <MovieRow
                title="Novos Lançamentos"
                movies={newReleases}
                onInfo={handleInfo}
                loading={loadingSections.newReleases}
              />
            ) : loadingSections.newReleases ? (
              <RowSkeleton />
            ) : (
              <View className="h-4" />
            )}
          </View>

          {/* Row 3: Filmes Bem Avaliados */}
          <View 
            ref={highRatedObserver.ref}
            onLayout={highRatedObserver.handleLayout}
          >
            {loadedSections.highRatedMovies && highRatedMovies.length > 0 ? (
              <MovieRow
                title="Filmes Bem Avaliados"
                movies={highRatedMovies}
                onInfo={handleInfo}
                loading={loadingSections.highRatedMovies}
              />
            ) : loadingSections.highRatedMovies ? (
              <RowSkeleton />
            ) : (
              <View className="h-4" />
            )}
          </View>

          {/* Row 4: Filmes de Ação */}
          <View 
            ref={actionObserver.ref}
            onLayout={actionObserver.handleLayout}
          >
            {loadedSections.actionMovies && actionMovies.length > 0 ? (
              <MovieRow
                title="Filmes de Ação"
                movies={actionMovies}
                onInfo={handleInfo}
                loading={loadingSections.actionMovies}
              />
            ) : loadingSections.actionMovies ? (
              <RowSkeleton />
            ) : (
              <View className="h-4" />
            )}
          </View>

          {/* MediaGrid Section */}
          <View 
            ref={gridObserver.ref}
            onLayout={gridObserver.handleLayout}
            className="px-4 mt-8"
          >
            <View className="mb-6">
              <Text className="text-2xl font-bold text-text-primary mb-2">
                Explorar Todos os Filmes
              </Text>
              <Text className="text-text-secondary">
                Navegue por nossa coleção completa de filmes
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
                <Icon name="expand-more" size={48} color="#7c869a" />
                <Text className="text-text-muted mt-4 text-center">
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