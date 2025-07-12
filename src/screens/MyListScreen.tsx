import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { movieService } from '../service/movieService';
import { serieService } from '../service/seriesService';
import { animeService } from '../service/animeService';
import { myListService } from '../service/myListService';
import { MediaGrid } from '../components/MediaGrid';
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

type FilterType = 'ALL' | 'MOVIE' | 'SERIE' | 'ANIME';

interface FilterButton {
  type: FilterType;
  label: string;
  icon: string;
  iconLibrary: 'MaterialIcons' | 'Ionicons';
  count: number;
}

interface MyListScreenProps {
  navigation: any;
  route?: any;
}

export const MyListScreen: React.FC<MyListScreenProps> = ({ navigation, route }) => {
  const [allItems, setAllItems] = useState<MediaSimple[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(21); // Múltiplo de 3 para garantir 3 colunas
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // Estados das seções para contagem
  const [movies, setMovies] = useState<MovieSimpleDTO[]>([]);
  const [series, setSeries] = useState<SerieSimpleDTO[]>([]);
  const [animes, setAnimes] = useState<AnimeSimpleDTO[]>([]);

  // Estado para loading da mídia
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    fetchMyList();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeFilter, allItems]);

  const fetchMyList = async () => {
    setLoading(true);
    try {
      // Buscar todas as páginas para ter todos os dados
      const allItemsList: MediaSimple[] = [];
      let currentPageData = 0;
      let hasMore = true;

      while (hasMore) {
        const result = await myListService.getMyList(currentPageData, 50);
        allItemsList.push(...result.content);
        hasMore = result.hasNext;
        currentPageData++;
      }

      // Separar por tipo usando type guards
      const moviesList: MovieSimpleDTO[] = [];
      const seriesList: SerieSimpleDTO[] = [];
      const animesList: AnimeSimpleDTO[] = [];

      allItemsList.forEach((item) => {
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
      setAllItems(allItemsList);
    } catch (error) {
      console.error('Erro ao buscar lista:', error);
      Alert.alert('Erro', 'Não foi possível carregar sua lista');
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered: MediaSimple[] = [];
    
    switch (activeFilter) {
      case 'MOVIE':
        filtered = movies;
        break;
      case 'SERIE':
        filtered = series;
        break;
      case 'ANIME':
        filtered = animes;
        break;
      default:
        filtered = allItems;
    }

    setFilteredItems(filtered);
    setCurrentPage(0);
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
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(newPage);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const getCurrentPageData = (): PaginatedResponseDTO<MediaSimple> => {
    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const pageContent = filteredItems.slice(startIndex, endIndex);

    return {
      content: pageContent,
      currentPage,
      totalPages,
      totalElements: totalItems,
      size: itemsPerPage,
      first: currentPage === 0,
      last: currentPage === totalPages - 1 || totalPages === 0,
      hasNext: currentPage < totalPages - 1,
      hasPrevious: currentPage > 0,
    };
  };

  const renderIcon = (iconName: string, iconLibrary: 'MaterialIcons' | 'Ionicons', size: number, color: string) => {
    if (iconLibrary === 'Ionicons') {
      return <Ionicons name={iconName} size={size} color={color} />;
    }
    return <Icon name={iconName} size={size} color={color} />;
  };

  const renderFilterButtons = () => {
    const filters: FilterButton[] = [
      { type: 'ALL', label: 'Todos', icon: 'filter-list', iconLibrary: 'MaterialIcons', count: allItems.length },
      { type: 'MOVIE', label: 'Filmes', icon: 'movie', iconLibrary: 'MaterialIcons', count: movies.length },
      { type: 'SERIE', label: 'Séries', icon: 'tv', iconLibrary: 'MaterialIcons', count: series.length },
      { type: 'ANIME', label: 'Animes', icon: 'flash', iconLibrary: 'Ionicons', count: animes.length },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className=""
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <View className="flex-row h-14 space-x-3">
          {filters.map(({ type, label, icon, iconLibrary, count }) => (
            <TouchableOpacity
              key={type}
              onPress={() => handleFilterChange(type)}
              className={`flex-row items-center space-x-2 px-4 py-2 rounded-full ${
                activeFilter === type
                  ? 'bg-red-600'
                  : 'bg-gray-800'
              }`}
            >
              {renderIcon(icon, iconLibrary, 16, 'white')}
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

  const renderStats = () => {
    const stats = [
      { label: 'Total', value: allItems.length, color: 'text-red-500' },
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

  const renderLoadingScreen = () => (
    <View className="flex-1 bg-black">
      <View className="flex-1 px-4 pt-8">
        <View className="flex-row items-center mb-8">
          <Ionicons name="heart" size={32} color="#EF4444" />
          <Text className="text-white text-2xl font-bold ml-3">Minha Lista</Text>
        </View>
        
        <View className="flex-row justify-center items-center flex-1">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="text-white ml-3">Carregando sua lista...</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    const sectionTitle = activeFilter === 'MOVIE' ? 'Filmes' : 
                        activeFilter === 'SERIE' ? 'Séries' : 
                        activeFilter === 'ANIME' ? 'Animes' : 'itens';

    return (
      <View className="flex-1 items-center justify-center py-20">
        <Ionicons name="heart-outline" size={60} color="#6B7280" />
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
  };

  if (loading) {
    return renderLoadingScreen();
  }

  const currentPageData = getCurrentPageData();

  return (
    <View className="flex-1 bg-black">

      <View className='h-18' />

      {/* Header */}
      <View className="px-4 pt-4 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <View className="flex-row items-center">
              <Ionicons name="heart" size={32} color="#EF4444" />
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
      {currentPageData.content.length > 0 ? (
        <MediaGrid
          data={currentPageData}
          loading={false}
          onPageChange={handlePageChange}
          onMediaInfo={handleMediaPress}
          gridSize="small" // Para garantir 3 colunas
        />
      ) : (
        renderEmptyState()
      )}

      {/* Loading da mídia */}
      {mediaLoading && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-2">Carregando detalhes...</Text>
        </View>
      )}
    </View>
  );
};