import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { movieService } from '../service/movieService';
import { serieService } from '../service/seriesService';
import { animeService } from '../service/animeService';
import { myListService } from '../service/myListService';
import {
  isMovieSimple,
  isSerieSimple,
  isAnimeSimple,
} from '../types/mediaTypes';
import type {
  MovieSimpleDTO,
  SerieSimpleDTO,
  AnimeSimpleDTO,
  MovieCompleteDTO,
  SerieCompleteDTO,
  AnimeCompleteDTO,
  MediaSimple,
  PaginatedResponseDTO,
} from '../types/mediaTypes';

const { width } = Dimensions.get('window');

// Componentes de ícones SVG
const ChevronLeft = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRight = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Heart = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Film = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.82 2H4.18C2.97 2 2 2.97 2 4.18v15.64C2 21.03 2.97 22 4.18 22h15.64c1.21 0 2.18-.97 2.18-2.18V4.18C22 2.97 21.03 2 19.82 2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Tv = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 2l-5 5-5-5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Zap = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Filter = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type FilterType = 'ALL' | 'MOVIE' | 'SERIE' | 'ANIME';

interface FilterButton {
  type: FilterType;
  label: string;
  icon: React.ComponentType<any>;
  count: number;
}

interface MyListScreenProps {
  navigation: any;
  route?: any;
}

export const MyListScreen: React.FC<MyListScreenProps> = ({ navigation, route }) => {
  const [data, setData] = useState<PaginatedResponseDTO<MediaSimple> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(20);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // Estados das seções
  const [movies, setMovies] = useState<MovieSimpleDTO[]>([]);
  const [series, setSeries] = useState<SerieSimpleDTO[]>([]);
  const [animes, setAnimes] = useState<AnimeSimpleDTO[]>([]);
  const [allItems, setAllItems] = useState<MediaSimple[]>([]);

  // Estado para loading da mídia
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    fetchMyList();
  }, [currentPage]);

  const fetchMyList = async () => {
    setLoading(true);
    try {
      const result = await myListService.getMyList(currentPage, itemsPerPage);
      setData(result);
      setAllItems(result.content);

      // Separar por tipo usando type guards
      const moviesList: MovieSimpleDTO[] = [];
      const seriesList: SerieSimpleDTO[] = [];
      const animesList: AnimeSimpleDTO[] = [];

      result.content.forEach((item) => {
        if (isMovieSimple(item)) {
          moviesList.push(item);
        } else if (isAnimeSimple(item)) {
          animesList.push(item);
        } else if (isSerieSimple(item)) {
          seriesList.push(item);
        }
      });

      setMovies(moviesList);
      setSeries(seriesList);
      setAnimes(animesList);
    } catch (error) {
      console.error('Erro ao buscar lista:', error);
      Alert.alert('Erro', 'Não foi possível carregar sua lista');
      setData({
        content: [],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        size: itemsPerPage,
        first: true,
        last: true,
        hasNext: false,
        hasPrevious: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMediaPress = async (media: MediaSimple) => {
    if (mediaLoading) return;

    try {
      setMediaLoading(true);

      let completeMedia: MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO;

      if (isMovieSimple(media)) {
        completeMedia = await movieService.getMovieById(media.id);
      } else if (isAnimeSimple(media)) {
        completeMedia = await animeService.getAnimeById(media.id);
      } else if (isSerieSimple(media)) {
        completeMedia = await serieService.getSerieById(media.id);
      } else {
        throw new Error('Tipo de mídia não suportado');
      }

      // Navegar para a tela de detalhes da mídia
      navigation.navigate('MediaDetail', {
        media: completeMedia
      });
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da mídia');
    } finally {
      setMediaLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const getFilteredContent = (): MediaSimple[] => {
    if (!data) return [];

    switch (activeFilter) {
      case 'MOVIE':
        return movies;
      case 'SERIE':
        return series;
      case 'ANIME':
        return animes;
      default:
        return allItems;
    }
  };

  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
    return true;
  };

  const getValidPoster = (media: MediaSimple): string => {
    const posters = [media.posterURL1, media.posterURL2].filter((url) => isValidUrl(url));
    return posters.length > 0 ? posters[0]! : '';
  };

  const renderFilterButtons = () => {
    const filters: FilterButton[] = [
      { type: 'ALL', label: 'Todos', icon: Filter, count: allItems.length },
      { type: 'MOVIE', label: 'Filmes', icon: Film, count: movies.length },
      { type: 'SERIE', label: 'Séries', icon: Tv, count: series.length },
      { type: 'ANIME', label: 'Animes', icon: Zap, count: animes.length },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <View className="flex-row space-x-3">
          {filters.map(({ type, label, icon: Icon, count }) => (
            <TouchableOpacity
              key={type}
              onPress={() => handleFilterChange(type)}
              className={`flex-row items-center space-x-2 px-4 py-2 rounded-full ${
                activeFilter === type
                  ? 'bg-red-600'
                  : 'bg-gray-800'
              }`}
            >
              <Icon size={16} color="white" />
              <Text className="text-white font-medium">{label}</Text>
              <View
                className={`px-2 py-1 rounded-full ${
                  activeFilter === type ? 'bg-red-700' : 'bg-gray-700'
                }`}
              >
                <Text className="text-white text-xs">{count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    const { currentPage, totalPages, hasNext, hasPrevious } = data;

    return (
      <View className="flex-row justify-center items-center space-x-4 mt-6 mb-4">
        <TouchableOpacity
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className={`flex-row items-center space-x-2 px-4 py-2 rounded-lg ${
            hasPrevious ? 'bg-gray-800' : 'bg-gray-900 opacity-50'
          }`}
        >
          <ChevronLeft size={16} color="white" />
          <Text className="text-white">Anterior</Text>
        </TouchableOpacity>

        <Text className="text-white px-4 py-2">
          {currentPage + 1} de {totalPages}
        </Text>

        <TouchableOpacity
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`flex-row items-center space-x-2 px-4 py-2 rounded-lg ${
            hasNext ? 'bg-gray-800' : 'bg-gray-900 opacity-50'
          }`}
        >
          <Text className="text-white">Próximo</Text>
          <ChevronRight size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderStats = () => {
    if (!data) return null;

    const stats = [
      { label: 'Total', value: data.totalElements, color: 'text-red-500' },
      { label: 'Filmes', value: movies.length, color: 'text-blue-500' },
      { label: 'Séries', value: series.length, color: 'text-green-500' },
      { label: 'Animes', value: animes.length, color: 'text-purple-500' },
    ];

    return (
      <View className="flex-row justify-between mb-6 px-4">
        {stats.map((stat, index) => (
          <View key={index} className="bg-gray-900 rounded-lg p-4 flex-1 mx-1 border border-gray-800">
            <Text className={`text-2xl font-bold text-center ${stat.color}`}>
              {stat.value}
            </Text>
            <Text className="text-sm text-gray-400 text-center">{stat.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMediaItem = ({ item }: { item: MediaSimple }) => {
    const posterUrl = getValidPoster(item);
    const aspectRatio = 2 / 3;
    const itemWidth = (width - 48) / 3; // 3 items per row with margins

    return (
      <TouchableOpacity
        onPress={() => handleMediaPress(item)}
        className="mb-4"
        style={{ width: itemWidth }}
        disabled={mediaLoading}
      >
        <View
          className="bg-gray-800 rounded-lg overflow-hidden"
          style={{ height: itemWidth / aspectRatio }}
        >
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gray-700 items-center justify-center">
              <Film size={40} color="#6B7280" />
            </View>
          )}
        </View>
        <Text className="text-white text-sm mt-2 text-center" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-gray-400 text-xs text-center">
          {item.anoLancamento || 'N/A'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    const filteredContent = getFilteredContent();

    if (filteredContent.length === 0) {
      const sectionTitle = activeFilter === 'MOVIE' ? 'Filmes' : 
                          activeFilter === 'SERIE' ? 'Séries' : 
                          activeFilter === 'ANIME' ? 'Animes' : 'itens';

      return (
        <View className="flex-1 items-center justify-center py-20">
          <Heart size={60} color="#6B7280" />
          <Text className="text-gray-400 text-lg mt-4 mb-2">
            {activeFilter === 'ALL' ? 'Sua lista está vazia' : `Nenhum ${sectionTitle.toLowerCase()} encontrado`}
          </Text>
          <Text className="text-gray-500 text-center px-8">
            {activeFilter === 'ALL' 
              ? 'Adicione filmes, séries e animes aos seus favoritos para vê-los aqui'
              : `Adicione ${sectionTitle.toLowerCase()} aos seus favoritos para vê-los aqui`
            }
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredContent}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderPagination}
      />
    );
  };

  const renderLoadingScreen = () => (
    <View className="flex-1 bg-black">
      <View className="flex-1 px-4 pt-8">
        <View className="flex-row items-center mb-8">
          <Heart size={32} color="#EF4444" />
          <Text className="text-white text-2xl font-bold ml-3">Minha Lista</Text>
        </View>
        
        <View className="flex-row justify-center items-center flex-1">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="text-white ml-3">Carregando sua lista...</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return renderLoadingScreen();
  }

  return (
    <View className="flex-1 bg-black">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <View className="flex-row items-center">
                <Heart size={32} color="#EF4444" />
                <Text className="text-white text-3xl font-bold ml-3">Minha Lista</Text>
              </View>
              <Text className="text-gray-400 mt-1 ml-11">
                Seus filmes, séries e animes favoritos
              </Text>
            </View>
          </View>

          {/* Estatísticas */}
          {renderStats()}
        </View>

        {/* Botões de Filtro */}
        {renderFilterButtons()}

        {/* Conteúdo */}
        {renderContent()}

        {/* Loading do media */}
        {mediaLoading && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-2">Carregando detalhes...</Text>
          </View>
        )}
      </View>
    </View>
  );
};