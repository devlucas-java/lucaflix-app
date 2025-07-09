import api from './api';
import type {
  AllStatsDTO,
  GeneralStatsDTO,
  MovieStatsDTO,
  SerieStatsDTO,
  AnimeStatsDTO,
  TvStatsDTO,
  UserStatsDTO,
  StatsType,
  StatsFilter
} from '../types/statusTypes';

/**
 * Serviço para gerenciar estatísticas administrativas do sistema
 * Compatível com o backend Spring Boot
 */
class AdminStatusService {

  // ==================== ESTATÍSTICAS BÁSICAS ====================

  /**
   * Busca estatísticas gerais do sistema
   * @returns Promise com estatísticas gerais
   */
  async getGeneralStats(): Promise<GeneralStatsDTO> {
    try {
      console.log('📊 Buscando estatísticas gerais...');
      
      const response = await api.get<GeneralStatsDTO>('/admin/stats/general');
      
      console.log('✅ Estatísticas gerais carregadas:', {
        totalMovies: response.data.totalMovies,
        totalSeries: response.data.totalSeries,
        totalAnimes: response.data.totalAnimes,
        totalUsers: response.data.totalUsers
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas gerais:', error);
      throw new Error(
        error.response?.data?.message || 
        'Erro ao carregar estatísticas gerais'
      );
    }
  }

  /**
   * Busca estatísticas básicas de filmes
   * @returns Promise com estatísticas básicas de filmes
   */
  async getMovieStats(): Promise<MovieStatsDTO> {
    try {
      console.log('🎬 Buscando estatísticas básicas de filmes...');
      
      const response = await api.get<MovieStatsDTO>('/admin/stats/movies');
      
      console.log('✅ Estatísticas de filmes carregadas:', {
        totalMovies: response.data.totalMovies,
        totalLikes: response.data.totalLikes,
        averageRating: response.data.averageRating
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas de filmes:', error);
      throw new Error(
        error.response?.data?.message || 
        'Erro ao carregar estatísticas de filmes'
      );
    }
  }

  /**
   * Busca estatísticas básicas de séries
   * @returns Promise com estatísticas básicas de séries
   */
  async getSerieStats(): Promise<SerieStatsDTO> {
    try {
      console.log('📺 Buscando estatísticas básicas de séries...');
      
      const response = await api.get<SerieStatsDTO>('/admin/stats/series');
      
      console.log('✅ Estatísticas de séries carregadas:', {
        totalSeries: response.data.totalSeries,
        totalLikes: response.data.totalLikes,
        averageRating: response.data.averageRating
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas de séries:', error);
      throw new Error(
        error.response?.data?.message || 
        'Erro ao carregar estatísticas de séries'
      );
    }
  }

  /**
   * Busca estatísticas básicas de animes
   * @returns Promise com estatísticas básicas de animes
   */
  async getAnimeStats(): Promise<AnimeStatsDTO> {
    try {
      console.log('🎌 Buscando estatísticas básicas de animes...');
      
      const response = await api.get<AnimeStatsDTO>('/admin/stats/animes');
      
      console.log('✅ Estatísticas de animes carregadas:', {
        totalAnimes: response.data.totalAnimes,
        totalLikes: response.data.totalLikes,
        averageRating: response.data.averageRating
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas de animes:', error);
      throw new Error(
        error.response?.data?.message || 
        'Erro ao carregar estatísticas de animes'
      );
    }
  }

  /**
   * Busca estatísticas básicas de TVs
   * @returns Promise com estatísticas básicas de TVs
   */
  async getTvStats(): Promise<TvStatsDTO> {
    try {
      console.log('📡 Buscando estatísticas básicas de TVs...');
      
      const response = await api.get<TvStatsDTO>('/admin/stats/tvs');
      
      console.log('✅ Estatísticas de TVs carregadas:', {
        totalTvs: response.data.totalTvs,
        totalLikes: response.data.totalLikes,
        averageLikesPerTv: response.data.averageLikesPerTv
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas de TVs:', error);
      throw new Error(
        error.response?.data?.message || 
        'Erro ao carregar estatísticas de TVs'
      );
    }
  }

  /**
   * Busca estatísticas de usuários
   * @returns Promise com estatísticas de usuários
   */
  async getUserStats(): Promise<UserStatsDTO> {
    try {
      console.log('👥 Buscando estatísticas de usuários...');
      
      const response = await api.get<UserStatsDTO>('/admin/stats/users');
      
      console.log('✅ Estatísticas de usuários carregadas:', {
        totalUsers: response.data.totalUsers,
        activeUsers: response.data.activeUsers,
        userEngagementRate: response.data.userEngagementRate
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas de usuários:', error);
      throw new Error(
        error.response?.data?.message || 
        'Erro ao carregar estatísticas de usuários'
      );
    }
  }

  /**
   * Busca todas as estatísticas do sistema
   * @returns Promise com todas as estatísticas
   */
  async getAllStats(): Promise<AllStatsDTO> {
    try {
      console.log('🎯 Buscando todas as estatísticas...');
      
      const response = await api.get<AllStatsDTO>('/admin/stats/all');
      
      console.log('✅ Todas as estatísticas carregadas:', {
        general: response.data.general ? 'OK' : 'Erro',
        movies: response.data.movies ? 'OK' : 'Erro',
        series: response.data.series ? 'OK' : 'Erro',
        animes: response.data.animes ? 'OK' : 'Erro',
        tvs: response.data.tvs ? 'OK' : 'Erro',
        users: response.data.users ? 'OK' : 'Erro'
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar todas as estatísticas:', error);
      throw new Error(
        error.response?.data?.message || 
        'Erro ao carregar todas as estatísticas'
      );
    }
  }

  // ==================== MÉTODOS GENÉRICOS ====================

  /**
   * Busca estatísticas por tipo de mídia
   * @param type Tipo da mídia (movie, anime, serie, tv)
   * @returns Promise com estatísticas
   */
  async getStatsByType(type: StatsType): Promise<MovieStatsDTO | SerieStatsDTO | AnimeStatsDTO | TvStatsDTO> {
    try {
      console.log(`📊 Buscando estatísticas de ${type}...`);

      switch (type) {
        case 'movie':
          return await this.getMovieStats();
        case 'anime':
          return await this.getAnimeStats();
        case 'serie':
          return await this.getSerieStats();
        case 'tv':
          return await this.getTvStats();
        default:
          throw new Error(`Tipo de mídia não suportado: ${type}`);
      }
    } catch (error: any) {
      console.error(`❌ Erro ao buscar estatísticas de ${type}:`, error);
      throw error;
    }
  }

  /**
   * Busca estatísticas com filtros
   * @param filter Filtros para aplicar
   * @returns Promise com estatísticas filtradas
   */
  async getStatsWithFilter(filter: StatsFilter): Promise<MovieStatsDTO | SerieStatsDTO | AnimeStatsDTO | TvStatsDTO> {
    try {
      console.log('🔍 Buscando estatísticas com filtros:', filter);

      // Por enquanto, usa o método básico já que a API não suporta filtros ainda
      // Em versões futuras, pode ser expandido para suportar filtros de data, etc.
      const stats = await this.getStatsByType(filter.type);

      console.log('✅ Estatísticas com filtros carregadas');
      return stats;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas com filtros:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS DE AGREGAÇÃO ====================

  /**
   * Busca estatísticas de todas as mídias de forma otimizada
   * Usa o endpoint /all para buscar tudo de uma vez
   * @returns Promise com estatísticas consolidadas
   */
  async getAllMediaStats(): Promise<{
    general: GeneralStatsDTO;
    movies: MovieStatsDTO;
    series: SerieStatsDTO;
    animes: AnimeStatsDTO;
    tvs: TvStatsDTO;
    users: UserStatsDTO;
  }> {
    try {
      console.log('🎯 Buscando estatísticas de todas as mídias...');

      const allStats = await this.getAllStats();

      const result = {
        general: allStats.general,
        movies: allStats.movies,
        series: allStats.series,
        animes: allStats.animes,
        tvs: allStats.tvs,
        users: allStats.users
      };

      console.log('✅ Estatísticas de todas as mídias carregadas:', {
        totalMovies: allStats.general.totalMovies,
        totalSeries: allStats.general.totalSeries,
        totalAnimes: allStats.general.totalAnimes,
        totalTvs: allStats.general.totalTvs,
        totalUsers: allStats.general.totalUsers
      });

      return result;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas de todas as mídias:', error);
      throw new Error('Erro ao carregar estatísticas gerais do sistema');
    }
  }

  /**
   * Busca apenas estatísticas de conteúdo (sem usuários)
   * @returns Promise com estatísticas de conteúdo
   */
  async getContentStats(): Promise<{
    movies: MovieStatsDTO;
    series: SerieStatsDTO;
    animes: AnimeStatsDTO;
    tvs: TvStatsDTO;
  }> {
    try {
      console.log('📚 Buscando estatísticas de conteúdo...');

      const [movieStats, serieStats, animeStats, tvStats] = await Promise.all([
        this.getMovieStats(),
        this.getSerieStats(),
        this.getAnimeStats(),
        this.getTvStats()
      ]);

      const result = {
        movies: movieStats,
        series: serieStats,
        animes: animeStats,
        tvs: tvStats
      };

      console.log('✅ Estatísticas de conteúdo carregadas');
      return result;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas de conteúdo:', error);
      throw new Error('Erro ao carregar estatísticas de conteúdo');
    }
  }

  /**
   * Verifica a saúde dos endpoints de estatísticas
   * @returns Promise com status de cada endpoint
   */
  async checkStatsHealth(): Promise<{
    general: boolean;
    movie: boolean;
    serie: boolean;
    anime: boolean;
    tv: boolean;
    user: boolean;
    all: boolean;
  }> {
    console.log('🏥 Verificando saúde dos endpoints de estatísticas...');

    const health = {
      general: false,
      movie: false,
      serie: false,
      anime: false,
      tv: false,
      user: false,
      all: false
    };

    // Testa cada endpoint
    const endpoints = [
      { name: 'general', method: () => this.getGeneralStats() },
      { name: 'movie', method: () => this.getMovieStats() },
      { name: 'serie', method: () => this.getSerieStats() },
      { name: 'anime', method: () => this.getAnimeStats() },
      { name: 'tv', method: () => this.getTvStats() },
      { name: 'user', method: () => this.getUserStats() },
      { name: 'all', method: () => this.getAllStats() }
    ];

    await Promise.allSettled(
      endpoints.map(async ({ name, method }) => {
        try {
          await method();
          (health as any)[name] = true;
          console.log(`✅ ${name} - OK`);
        } catch (error) {
          console.log(`❌ ${name} - ERRO`);
        }
      })
    );

    console.log('🏥 Verificação de saúde concluída:', health);
    return health;
  }

  // ==================== MÉTODOS DE UTILIDADE ====================

  /**
   * Calcula estatísticas derivadas baseadas nos dados do backend
   * @param stats Estatísticas base
   * @returns Estatísticas calculadas
   */
  calculateDerivedStats(stats: AllStatsDTO): {
    totalContent: number;
    avgRatingAcrossAllMedia: number;
    totalEngagement: number;
    contentDistribution: {
      movies: number;
      series: number;
      animes: number;
      tvs: number;
    };
  } {
    const totalContent = stats.general.totalMovies + 
                        stats.general.totalSeries + 
                        stats.general.totalAnimes + 
                        stats.general.totalTvs;

    // Calcula média ponderada das avaliações
    const totalRatedContent = stats.movies.totalMovies + stats.series.totalSeries + stats.animes.totalAnimes;
    const weightedRating = totalRatedContent > 0 ? 
      ((stats.movies.averageRating * stats.movies.totalMovies) +
       (stats.series.averageRating * stats.series.totalSeries) +
       (stats.animes.averageRating * stats.animes.totalAnimes)) / totalRatedContent : 0;

    const totalEngagement = stats.general.totalLikes + stats.general.totalListItems;

    const contentDistribution = {
      movies: totalContent > 0 ? Math.round((stats.general.totalMovies / totalContent) * 100) : 0,
      series: totalContent > 0 ? Math.round((stats.general.totalSeries / totalContent) * 100) : 0,
      animes: totalContent > 0 ? Math.round((stats.general.totalAnimes / totalContent) * 100) : 0,
      tvs: totalContent > 0 ? Math.round((stats.general.totalTvs / totalContent) * 100) : 0
    };

    return {
      totalContent,
      avgRatingAcrossAllMedia: Math.round(weightedRating * 100) / 100,
      totalEngagement,
      contentDistribution
    };
  }
}

// Instância singleton do serviço
const adminStatusService = new AdminStatusService();

export default adminStatusService;

// Exporta também a classe para casos onde seja necessário criar múltiplas instâncias
export { AdminStatusService };