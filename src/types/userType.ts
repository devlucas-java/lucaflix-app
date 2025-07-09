
import { Type } from "./mediaTypes";


export interface PasswordVerificationRequest {
  password: string;
}


// Types and Enums
export enum TypeRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum TypePlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  MAXIMUM = 'MAXIMUM'
}

export interface UserListResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: TypeRole;
  plan: TypePlan;
  isAccountEnabled: boolean;
  isAccountLocked: boolean;
  isCredentialsExpired: boolean;
  isAccountExpired: boolean;
}

export interface PaginatedResponseDTO<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T = any> {
  data?: T;
  message: string;
  status?: number;
  success?: boolean;
}


export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: TypeRole;
  plan: TypePlan;
  isAccountEnabled: boolean;
  isAccountLocked: boolean;
  isCredentialsExpired: boolean;
  isAccountExpired: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// adminTypes.ts
export interface Episodio {
  id?: number;
  numero: number;
  nome: string;
  descricao: string;
  duracao: number;
  videoUrl: string;
  thumbnailUrl?: string;
  dataLancamento: string;
}

export interface Temporada {
  id?: number;
  numero: number;
  nome: string;
  descricao: string;
  dataLancamento: string;
  episodios: Episodio[];
}

export interface CreateSerieDTO {
  titulo: string;
  descricao: string;
  dataLancamento: string;
  duracao: number;
  classificacao: string;
  type: Type;
  generos: any[];
  temporadas: Temporada[];
}

export interface CreateSerieCompleteDTO {
  titulo: string;
  descricao: string;
  dataLancamento: string;
  duracao: number;
  classificacao: string;
  type: Type;
  generos: any[];
  temporadas: Temporada[];
}