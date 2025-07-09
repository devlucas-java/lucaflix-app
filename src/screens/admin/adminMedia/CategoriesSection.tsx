import React from 'react';
import { Categoria, CATEGORIA_LABELS } from '../../../types/mediaTypes';

interface CategoriesSectionProps {
  selectedCategories: Categoria[];
  onCategoryToggle: (categoria: Categoria) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  selectedCategories,
  onCategoryToggle
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Categorias *
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({selectedCategories.length} selecionada{selectedCategories.length !== 1 ? 's' : ''})
        </span>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(key as Categoria)}
              onChange={() => onCategoryToggle(key as Categoria)}
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>
      
      {selectedCategories.length === 0 && (
        <p className="text-red-500 text-sm mt-2">
          Selecione pelo menos uma categoria
        </p>
      )}
    </div>
  );
};