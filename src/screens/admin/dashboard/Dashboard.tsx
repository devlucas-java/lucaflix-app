import React from 'react';
import { Film, Plus, Edit, Tv, Gamepad2 } from 'lucide-react';
import AdminDashboardStatus from "./AdminDashboardStatus";
import MediaAdminPage from "./MediaAdminPage";
import UserAdminPage from "./UserAdminPage";

export enum SectionType {
  users = 'users',
  medias = 'medias',
  home = 'home',
}

interface DashboardProps {
  section: SectionType;
}

// Componente principal do Dashboard
export const Dashboard: React.FC<DashboardProps> = ({ section }) => {
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const handleUpdateClick = (type: 'movie' | 'serie' | 'anime') => {
    const id = prompt(`Digite o ID do ${type} para editar:`);
    if (id && id.trim()) {
      navigate(`/admin/${type}/update/${id.trim()}`);
    }
  };

  const renderHomeSection = () => (
    <div className="space-y-8 bg-black">
      {/* Status Dashboard */}
      <AdminDashboardStatus />
      
      {/* Ações Rápidas */}
      <div className="bg-black rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-400 mb-6 flex items-center">
          <Plus className="mr-2" />
          Ações Rápidas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Criar Filme */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Film size={32} />
              <span className="text-2xl font-bold">Filmes</span>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/movie/create')}
                className="w-full bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md transition-colors font-medium flex items-center justify-center"
              >
                <Plus size={16} className="mr-2" />
                Criar Filme
              </button>
              <button
                onClick={() => handleUpdateClick('movie')}
                className="w-full bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md transition-colors font-medium flex items-center justify-center"
              >
                <Edit size={16} className="mr-2" />
                Editar Filme
              </button>
            </div>
          </div>

          {/* Criar Série */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Tv size={32} />
              <span className="text-2xl font-bold">Séries</span>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/serie/create')}
                className="w-full bg-white text-green-600 hover:bg-gray-100 px-4 py-2 rounded-md transition-colors font-medium flex items-center justify-center"
              >
                <Plus size={16} className="mr-2" />
                Criar Série
              </button>
              <button
                onClick={() => handleUpdateClick('serie')}
                className="w-full bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md transition-colors font-medium flex items-center justify-center"
              >
                <Edit size={16} className="mr-2" />
                Editar Série
              </button>
            </div>
          </div>

          {/* Criar Anime */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Gamepad2 size={32} />
              <span className="text-2xl font-bold">Animes</span>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/anime/create')}
                className="w-full bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-md transition-colors font-medium flex items-center justify-center"
              >
                <Plus size={16} className="mr-2" />
                Criar Anime
              </button>
              <button
                onClick={() => handleUpdateClick('anime')}
                className="w-full bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-md transition-colors font-medium flex items-center justify-center"
              >
                <Edit size={16} className="mr-2" />
                Editar Anime
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case SectionType.home:
        return renderHomeSection();
      
      case SectionType.users:
        return <UserAdminPage />;
      
      case SectionType.medias:
        return <MediaAdminPage />;
      
      default:
        return renderHomeSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};