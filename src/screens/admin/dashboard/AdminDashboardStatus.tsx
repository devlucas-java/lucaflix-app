import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Film, 
  Tv, 
  Heart, 
  List, 
  TrendingUp, 
  RefreshCw,
  AlertCircle,
  Star,
  Target,
  Activity
} from 'lucide-react';
import adminStatusService from '../../../service/adminStatusService';
import type { AllStatsDTO } from '../../../types/statusTypes';

const AdminDashboardStatus: React.FC = () => {
  const [stats, setStats] = useState<AllStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      setError(null);
      const data = await adminStatusService.getAllStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatRating = (rating: number): string => {
    return rating.toFixed(1);
  };

  const getQualityColor = (rating: number): string => {
    if (rating >= 8.0) return 'text-green-400';
    if (rating >= 6.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    color?: string;
  }> = ({ title, value, subtitle, icon, trend, color = 'text-red-500' }) => (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-red-600/50 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gray-800 ${color.replace('text-', 'text-')} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-white text-2xl font-bold mb-1">{value}</h3>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );

  const QualityBar: React.FC<{
    high: number;
    medium: number;
    low: number;
    total: number;
    title: string;
  }> = ({ high, medium, low, total, title }) => {
    const highPerc = total > 0 ? (high / total) * 100 : 0;
    const mediumPerc = total > 0 ? (medium / total) * 100 : 0;
    const lowPerc = total > 0 ? (low / total) * 100 : 0;

    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-400" />
          {title} - Distribuição de Qualidade
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Alta (≥8.0)</span>
            <span>{high} ({highPerc.toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${highPerc}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Média (6.0-7.9)</span>
            <span>{medium} ({mediumPerc.toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${mediumPerc}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Baixa (&lt;6.0)</span>
            <span>{low} ({lowPerc.toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${lowPerc}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Erro ao Carregar</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              loadStats();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const derivedStats = adminStatusService.calculateDerivedStats(stats);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-red-900/20 to-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
              {stats.general.lastUpdate && (
                <p className="text-gray-500 text-sm mt-1">
                  Última atualização: {new Date(stats.general.lastUpdate).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
<button
  onClick={handleRefresh}
  disabled={refreshing}
  className="w-10 sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white 
             px-2 sm:px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
>
  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
  <span className="hidden sm:inline ml-2">
    {refreshing ? 'Atualizando...' : 'Atualizar'}
  </span>
</button>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Conteúdo"
            value={formatNumber(derivedStats.totalContent)}
            subtitle="Filmes, Séries, Animes e TV"
            icon={<BarChart3 className="w-6 h-6" />}
            color="text-red-500"
          />
          <StatCard
            title="Usuários Totais"
            value={formatNumber(stats.general.totalUsers)}
            subtitle={`${stats.users.activeUsers} ativos`}
            icon={<Users className="w-6 h-6" />}
            color="text-blue-500"
          />
          <StatCard
            title="Total de Likes"
            value={formatNumber(stats.general.totalLikes)}
            subtitle="Engajamento geral"
            icon={<Heart className="w-6 h-6" />}
            color="text-pink-500"
          />
          <StatCard
            title="Itens em Listas"
            value={formatNumber(stats.general.totalListItems)}
            subtitle="Conteúdo salvo"
            icon={<List className="w-6 h-6" />}
            color="text-green-500"
          />
        </div>

        {/* Estatísticas por Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Filmes"
            value={formatNumber(stats.movies.totalMovies)}
            subtitle={`Avaliação média: ${formatRating(stats.movies.averageRating)}`}
            icon={<Film className="w-6 h-6" />}
            color="text-red-500"
          />
          <StatCard
            title="Séries"
            value={formatNumber(stats.series.totalSeries)}
            subtitle={`Avaliação média: ${formatRating(stats.series.averageRating)}`}
            icon={<Tv className="w-6 h-6" />}
            color="text-blue-500"
          />
          <StatCard
            title="Animes"
            value={formatNumber(stats.animes.totalAnimes)}
            subtitle={`Avaliação média: ${formatRating(stats.animes.averageRating)}`}
            icon={<Target className="w-6 h-6" />}
            color="text-purple-500"
          />
          <StatCard
            title="TV"
            value={formatNumber(stats.tvs.totalTvs)}
            subtitle={`${formatNumber(stats.tvs.totalLikes)} likes`}
            icon={<Activity className="w-6 h-6" />}
            color="text-orange-500"
          />
        </div>

        {/* Métricas de Engajamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              Engajamento de Usuários
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Taxa de Engajamento</span>
                <span className="text-white font-semibold">{stats.users.userEngagementRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Usuários com Listas</span>
                <span className="text-white font-semibold">{formatNumber(stats.users.usersWithLists)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Likes por Usuário</span>
                <span className="text-white font-semibold">{stats.users.averageLikesPerUser.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
              Distribuição de Conteúdo
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Filmes</span>
                <span className="text-white font-semibold">{derivedStats.contentDistribution.movies}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Séries</span>
                <span className="text-white font-semibold">{derivedStats.contentDistribution.series}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Animes</span>
                <span className="text-white font-semibold">{derivedStats.contentDistribution.animes}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TV</span>
                <span className="text-white font-semibold">{derivedStats.contentDistribution.tvs}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Avaliações Médias
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Filmes</span>
                <span className={`font-semibold ${getQualityColor(stats.movies.averageRating)}`}>
                  {formatRating(stats.movies.averageRating)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Séries</span>
                <span className={`font-semibold ${getQualityColor(stats.series.averageRating)}`}>
                  {formatRating(stats.series.averageRating)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Animes</span>
                <span className={`font-semibold ${getQualityColor(stats.animes.averageRating)}`}>
                  {formatRating(stats.animes.averageRating)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Geral</span>
                <span className={`font-semibold ${getQualityColor(derivedStats.avgRatingAcrossAllMedia)}`}>
                  {formatRating(derivedStats.avgRatingAcrossAllMedia)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribuição de Qualidade */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QualityBar
            title="Filmes"
            high={stats.movies.highRatedMovies}
            medium={stats.movies.mediumRatedMovies}
            low={stats.movies.lowRatedMovies}
            total={stats.movies.totalMovies}
          />
          <QualityBar
            title="Séries"
            high={stats.series.highRatedSeries}
            medium={stats.series.mediumRatedSeries}
            low={stats.series.lowRatedSeries}
            total={stats.series.totalSeries}
          />
          <QualityBar
            title="Animes"
            high={stats.animes.highRatedAnimes}
            medium={stats.animes.mediumRatedAnimes}
            low={stats.animes.lowRatedAnimes}
            total={stats.animes.totalAnimes}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardStatus;