// HeroSection/utils/logger.ts
import { theme } from '../theme/theme';

export const devLog = (message: string, ...args: any[]) => {
  if (theme.development) {
    console.log(`[HeroSection] ${message}`, ...args);
  }
};

export const devError = (message: string, ...args: any[]) => {
  if (theme.development) {
    console.error(`[HeroSection ERROR] ${message}`, ...args);
  }
};