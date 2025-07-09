// ===== FUNÇÕES DE FORMATAÇÃO DE URL =====

export const formatTitleForUrl = (id: number, title: string, year: number, isMovie: boolean): string => {
  const mediaType = isMovie ? 'filme' : 'serie';
  const formattedTitle = title
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplos
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
    
  return `/${id}/${mediaType}-${formattedTitle}-${year}`;
};

export const parseMediaId = (params: string): number | null => {
  const id = parseInt(params);
  return isNaN(id) ? null : id;
};





// ===== FUNÇÕES DE FORMATAÇÃO DE DATA E TEMPO =====

export const formatYear = (date: Date | string): number => {
  return new Date(date).getFullYear();
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};





// ===== FUNÇÕES DE MODAL =====
import { useState } from "react";


export const [isModalOpen, setIsModalOpen] = useState(false);

export function onCloseModal():void { 
  return setIsModalOpen(false)}

