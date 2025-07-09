import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Ícones SVG
const PlayIcon = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M8 5v14l11-7z" />
  </Svg>
);

const ArrowLeftIcon = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M19 12H5" />
    <Path d="M12 19l-7-7 7-7" />
  </Svg>
);

const EditIcon = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const VolumeIcon = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M11 5L6 9H2v6h4l5 4V5z" />
    <Path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </Svg>
);

// Mock types (you can replace with your actual types)
interface MediaProps {
  title: string;
  sinopse: string;
  anoLancamento?: number;
  minAge: string;
  categoria: string[];
  type: 'MOVIE' | 'SERIE' | 'ANIME';
  duracaoMinutos?: number;
  totalTemporadas?: number;
  totalEpisodios?: number;
  backdropURL1?: string;
  backdropURL2?: string;
  backdropURL3?: string;
  backdropURL4?: string;
  posterURL1?: string;
  posterURL2?: string;
  embed1?: string;
  embed2?: string;
  temporadas?: Array<{
    numeroTemporada: number;
    episodios: Array<{
      id: number;
      numeroEpisodio: number;
      title: string;
      sinopse: string;
      duracaoMinutos: number;
      embed1: string;
    }>;
  }>;
}

interface MediaScreenProps {
  media: MediaProps;
  onBack: () => void;
  onMediaSelect?: (media: any) => void;
  onMediaChange?: (media: any) => void;
}

// Mock auth service
const authService = {
  isAuthenticated: () => true,
  isAdmin: () => true,
};

// Função para verificar se URL é válida
const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
  
  try {
    const urlObj = new URL(trimmed);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' || urlObj.protocol === 'data:';
  } catch {
    return false;
  }
};

// Função para obter backdrop válido
const getValidBackdrop = (media: MediaProps): string => {
  const backdrops = [
    media.backdropURL1,
    media.backdropURL2,
    media.backdropURL3,
    media.backdropURL4,
  ].filter((url) => isValidUrl(url));

  if (backdrops.length > 0) {
    return backdrops[0]!;
  }

  const posters = [media.posterURL1, media.posterURL2].filter((url) => isValidUrl(url));
  return posters.length > 0 ? posters[0]! : '';
};

// Type guards
const isMovieComplete = (media: MediaProps): boolean => {
  return 'duracaoMinutos' in media && !('totalTemporadas' in media);
};

const isSerieComplete = (media: MediaProps): boolean => {
  return 'totalTemporadas' in media && media.type === 'SERIE';
};

const isAnimeComplete = (media: MediaProps): boolean => {
  return 'totalTemporadas' in media && media.type === 'ANIME';
};

// Tradução das categorias
const getCategoryName = (categoria: string): string => {
  const categoryMap: { [key: string]: string } = {
    ACAO: 'Ação',
    COMEDIA: 'Comédia',
    DRAMA: 'Drama',
    SUSPENSE: 'Suspense',
    TERROR: 'Terror',
    ROMANCE: 'Romance',
    FICCAO_CIENTIFICA: 'Ficção Científica',
    AVENTURA: 'Aventura',
    FANTASIA: 'Fantasia',
    DOCUMENTARIO: 'Documentário',
    ANIMACAO: 'Animação',
    INFANTIL: 'Infantil',
    DESCONHECIDA: 'Desconhecida',
  };
  return categoryMap[categoria] || categoria;
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const MediaScreen: React.FC<MediaScreenProps> = ({
  media,
  onBack,
  onMediaSelect,
  onMediaChange,
}) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);

  const isMovie = isMovieComplete(media);
  const isSerie = isSerieComplete(media);
  const isAnime = isAnimeComplete(media);

  // Verificar se o usuário é admin
  const isLoggedIn = authService.isAuthenticated();
  const isAdmin = isLoggedIn && authService.isAdmin();

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set([...prev, imageUrl]));
  };

  const handlePlayVideo = (embedUrl: string) => {
    if (embedUrl && embedUrl.trim() !== '') {
      const playerUrl = `https://player.exemplo.com/${embedUrl}`;
      Linking.openURL(playerUrl);
    }
  };

  const handleUpdateMedia = () => {
    let mediaType = '';
    if (isMovie) mediaType = 'filme';
    else if (isSerie) mediaType = 'serie';
    else if (isAnime) mediaType = 'anime';
    
    Alert.alert('Atualizar', `Atualizar ${mediaType}: ${media.title}`);
  };

  const getMediaTypeLabel = () => {
    if (isMovie) return 'filme';
    if (isSerie) return 'série';
    if (isAnime) return 'anime';
    return 'mídia';
  };

  const getSeasonEpisodeInfo = () => {
    if (isMovie && media.duracaoMinutos) {
      return formatDuration(media.duracaoMinutos);
    }
    
    if (isSerie || isAnime) {
      const seasonText = media.totalTemporadas === 1 ? 'temporada' : 'temporadas';
      const episodeText = media.totalEpisodios === 1 ? 'episódio' : 'episódios';
      
      return `${media.totalTemporadas} ${seasonText} • ${media.totalEpisodios} ${episodeText}`;
    }
    
    return '';
  };

  const getMovieEpisodes = (movie: MediaProps) => {
    const episodes = [];

    if (movie.embed1 && movie.embed1.trim() !== '') {
      episodes.push({
        id: 1,
        numeroEpisodio: 1,
        title: `${movie.title} - Parte 1`,
        sinopse: movie.sinopse,
        duracaoMinutos: Math.floor((movie.duracaoMinutos || 120) / 2),
        embed: movie.embed1,
      });
    }

    if (movie.embed2 && movie.embed2.trim() !== '') {
      episodes.push({
        id: 2,
        numeroEpisodio: 2,
        title: `${movie.title} - Parte 2`,
        sinopse: movie.sinopse,
        duracaoMinutos: Math.ceil((movie.duracaoMinutos || 120) / 2),
        embed: movie.embed2,
      });
    }

    return episodes;
  };

  const backdropUrl = getValidBackdrop(media);
  const shouldShowBackdrop = backdropUrl && !imageErrors.has(backdropUrl);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com Hero Section */}
        <View style={styles.heroSection}>
          {/* Backdrop Image */}
          <View style={styles.backdropContainer}>
            {shouldShowBackdrop ? (
              <Image
                source={{ uri: backdropUrl }}
                style={styles.backdrop}
                onError={() => handleImageError(backdropUrl)}
              />
            ) : (
              <View style={styles.placeholderBackdrop}>
                <PlayIcon size={60} color="#6B7280" />
              </View>
            )}
            
            {/* Gradient Overlay */}
            <View style={styles.gradientOverlay} />
          </View>

          {/* Header Controls */}
          <View style={styles.headerControls}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
            >
              <ArrowLeftIcon size={24} color="#fff" />
            </TouchableOpacity>
            
            {/* Logo */}
            <View style={styles.logo}>
              <Text style={styles.logoText}>LUCAFLIX</Text>
            </View>
            
            {isAdmin && (
              <TouchableOpacity
                onPress={handleUpdateMedia}
                style={styles.editButton}
              >
                <EditIcon size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Title and Main Info */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{media.title}</Text>
            
            {/* Media Info */}
            <View style={styles.mediaInfo}>
              <Text style={styles.mediaInfoText}>
                {media.anoLancamento ?? 'N/A'}
              </Text>
              <Text style={styles.mediaInfoText}>
                {getSeasonEpisodeInfo()}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>HD</Text>
              </View>
              <View style={styles.badge}>
                <VolumeIcon size={12} color="#fff" />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>CC</Text>
              </View>
              {isAnime && (
                <View style={styles.animeBadge}>
                  <Text style={styles.badgeText}>ANIME</Text>
                </View>
              )}
            </View>

            {/* Age Rating */}
            <View style={styles.ageRating}>
              <View style={styles.ageRatingBadge}>
                <Text style={styles.ageRatingText}>{media.minAge}</Text>
              </View>
              <Text style={styles.ageRatingLabel}>violência</Text>
            </View>

            {/* Play Button */}
            <TouchableOpacity
              onPress={() => {
                if (isMovie) {
                  handlePlayVideo(media.embed1 || '');
                } else if (media.temporadas && media.temporadas.length > 0) {
                  const firstEpisode = media.temporadas[0]?.episodios?.[0];
                  if (firstEpisode) {
                    handlePlayVideo(firstEpisode.embed1);
                  }
                }
              }}
              style={styles.playButton}
            >
              <PlayIcon size={24} color="#000" />
              <Text style={styles.playButtonText}>Assistir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Sections */}
        <View style={styles.contentSection}>
          {/* Synopsis */}
          <View style={styles.synopsisSection}>
            <Text style={styles.synopsis}>{media.sinopse}</Text>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reparto: </Text>
              <Text style={styles.infoValue}>
                {isAnime 
                  ? 'Elenco de dublagem japonês original' 
                  : 'Arnold Schwarzenegger, Monica Barbaro, Milan Carter,'
                }
              </Text>
              <Text style={styles.infoMore}> más</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Géneros: </Text>
              <Text style={styles.infoValue}>
                {media.categoria.map(getCategoryName).join(', ')}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Esta {getMediaTypeLabel()} es: </Text>
              <Text style={styles.infoValue}>
                {isAnime 
                  ? 'Emocionante, Aventura, Japonês' 
                  : 'Peculiar, Irreverente, Emocionante'
                }
              </Text>
            </View>
          </View>

          {/* Episodes Section */}
          <View style={styles.episodesSection}>
            <View style={styles.episodeHeader}>
              <Text style={styles.episodeTitle}>
                {isMovie ? 'Partes disponíveis' : 'Episódios'}
              </Text>
              
              {((isSerie || isAnime) && media.temporadas && media.temporadas.length > 1) && (
                <View style={styles.seasonSelector}>
                  <Text style={styles.seasonText}>
                    Temporada {selectedSeason}
                  </Text>
                </View>
              )}
            </View>

            {/* Episodes List */}
            <View style={styles.episodesList}>
              {isMovie && getMovieEpisodes(media).map((episode) => (
                <TouchableOpacity
                  key={episode.id}
                  onPress={() => handlePlayVideo(episode.embed)}
                  style={styles.episodeItem}
                >
                  <View style={styles.episodeNumber}>
                    <Text style={styles.episodeNumberText}>
                      {episode.numeroEpisodio}
                    </Text>
                  </View>
                  
                  <View style={styles.episodeInfo}>
                    <Text style={styles.episodeTitle}>
                      {episode.title}
                    </Text>
                    <Text style={styles.episodeDuration}>
                      {formatDuration(episode.duracaoMinutos)}
                    </Text>
                  </View>
                  
                  <View style={styles.episodePlayIcon}>
                    <PlayIcon size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))}

              {((isSerie || isAnime) && media.temporadas) &&
                media.temporadas
                  .find(t => t.numeroTemporada === selectedSeason)
                  ?.episodios?.map((episode) => (
                    <TouchableOpacity
                      key={episode.id}
                      onPress={() => handlePlayVideo(episode.embed1)}
                      style={styles.episodeItem}
                    >
                      <View style={styles.episodeNumber}>
                        <Text style={styles.episodeNumberText}>
                          {episode.numeroEpisodio}
                        </Text>
                      </View>
                      
                      <View style={styles.episodeInfo}>
                        <Text style={styles.episodeTitle}>
                          {episode.title}
                        </Text>
                        <Text style={styles.episodeDuration}>
                          {formatDuration(episode.duracaoMinutos)}
                        </Text>
                        <Text style={styles.episodeSynopsis} numberOfLines={2}>
                          {episode.sinopse}
                        </Text>
                      </View>
                      
                      <View style={styles.episodePlayIcon}>
                        <PlayIcon size={20} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    position: 'relative',
  },
  backdropContainer: {
    height: height * 0.6,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderBackdrop: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  headerControls: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  logo: {
    backgroundColor: '#dc2626',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 8,
  },
  titleSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mediaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  mediaInfoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
  animeBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ageRatingBadge: {
    backgroundColor: '#d97706',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ageRatingText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ageRatingLabel: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  playButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  playButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  synopsisSection: {
    marginBottom: 24,
  },
  synopsis: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  additionalInfo: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  infoMore: {
    color: '#dc2626',
    fontSize: 14,
  },
  episodesSection: {
    marginBottom: 24,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  seasonSelector: {
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  seasonText: {
    color: '#fff',
    fontSize: 14,
  },
  episodesList: {
    gap: 8,
  },
  episodeItem: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeNumber: {
    width: 64,
    height: 64,
    backgroundColor: '#374151',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  episodeNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 4,
  },
  episodeDuration: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  episodeSynopsis: {
    color: '#d1d5db',
    fontSize: 12,
  },
  episodePlayIcon: {
    marginLeft: 12,
  },
});

// Mock data for demonstration
const mockMedia: MediaProps = {
  title: "Exemplo de Filme",
  sinopse: "Uma história épica sobre aventura e descoberta que vai cativar você do início ao fim.",
  anoLancamento: 2024,
  minAge: "16",
  categoria: ["ACAO", "AVENTURA", "FICCAO_CIENTIFICA"],
  type: "MOVIE",
  duracaoMinutos: 120,
  backdropURL1: "https://images.unsplash.com/photo-1489599038631-ba0046ceef47?w=1200&h=600&fit=crop",
  embed1: "sample-embed-1",
  embed2: "sample-embed-2"
};

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <MediaScreen 
        media={mockMedia} 
        onBack={() => console.log('Back pressed')} 
      />
    </View>
  );
}