// HeroSection/utils/formatUtils.ts

export const formatUtils = {
  formatYear: (date: Date): number => {
    return new Date(date).getFullYear();
  },

  formatDuration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  },

  formatDate: (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR');
  }
};