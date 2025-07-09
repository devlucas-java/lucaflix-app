import { useState, useEffect } from 'react';
import { 
  Search, 
  Shield, 
  ShieldOff,  
  Lock, 
  Unlock, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  User, 
  RefreshCw,
  Eye,
  X,
  Menu,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

import type { UserListResponse } from '../../../types/userType';
import { TypePlan, TypeRole } from '../../../types/userType'
import { superAdminService } from '../../../service/superAdminService';


export const UserAdminPage = () => {
  const [users, setUsers] = useState<UserListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserListResponse | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    plan: 'all',
    status: 'all'
  });

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await superAdminService.searchUsers(searchTerm, currentPage, 10);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      showNotification('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: string = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleAction = async (action: string, userId: string, actionName: string) => {
    setActionLoading(`${action}-${userId}`);
    try {
      const response = await (superAdminService as any)[action](userId);
      showNotification(response.message);
      loadUsers();
    } catch (error) {
      showNotification(`Erro ao ${actionName}`, 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleUserDetails = async (userId: string) => {
    try {
      const response = await superAdminService.getUserInfo(userId);
      setSelectedUser(response.data!);
      setShowUserDetails(true);
    } catch (error) {
      showNotification('Erro ao carregar detalhes do usuário', 'error');
    }
  };

  const getRoleColor = (role: TypeRole) => {
    switch (role) {
      case TypeRole.SUPER_ADMIN: return 'text-red-400 bg-red-900/30 border-red-500/30';
      case TypeRole.ADMIN: return 'text-blue-400 bg-blue-900/30 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-800/50 border-gray-600/30';
    }
  };

  const getPlanColor = (plan: TypePlan) => {
    switch (plan) {
      case TypePlan.PREMIUM: return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
      case TypePlan.MAXIMUM: return 'text-purple-400 bg-purple-900/30 border-purple-500/30';
      default: return 'text-green-400 bg-green-900/30 border-green-500/30';
    }
  };

  const getStatusColor = (user: UserListResponse) => {
    if (!user.isAccountEnabled || user.isAccountLocked) {
      return 'text-red-400 bg-red-900/30 border-red-500/30';
    }
    return 'text-green-400 bg-green-900/30 border-green-500/30';
  };

  const getStatusText = (user: UserListResponse) => {
    if (!user.isAccountEnabled) return 'Desabilitado';
    if (user.isAccountLocked) return 'Bloqueado';
    return 'Ativo';
  };

  return (
    <div className="min-h-screen bg-black text-white p-3 md:p-6">
      {/* Notification */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 md:px-6 md:py-4 rounded-lg shadow-2xl border max-w-sm ${
          notification.type === 'error' 
            ? 'bg-red-900/90 border-red-500/50 text-red-100' 
            : 'bg-green-900/90 border-green-500/50 text-green-100'
        }`}>
          <p className="text-sm">{notification.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
          Gerenciamento de Usuários
        </h1>
        <p className="text-gray-400 text-sm md:text-lg">Administre usuários, permissões e planos</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-800 mb-4 md:mb-6">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
          >
            <Menu className="h-4 w-4" />
            Filtros
          </button>
        </div>

        <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 md:h-5 md:w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou username..."
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500 transition-all text-sm md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <select
                className="px-3 py-2 md:px-4 md:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white text-sm md:text-base"
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="all">Todas as Funções</option>
                <option value="USER">Usuário</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>

              <select
                className="px-3 py-2 md:px-4 md:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white text-sm md:text-base"
                value={filters.plan}
                onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
              >
                <option value="all">Todos os Planos</option>
                <option value="FREE">Free</option>
                <option value="PREMIUM">Premium</option>
                <option value="MAXIMUM">Maximum</option>
              </select>

              <select
                className="px-3 py-2 md:px-4 md:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white text-sm md:text-base"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="blocked">Bloqueados</option>
              </select>

              <button
                onClick={loadUsers}
                className="px-4 py-2 md:px-6 md:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-semibold text-sm md:text-base"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-white">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-400">@{user.username}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleUserDetails(user.id)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-all"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <p className="text-xs text-gray-400">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPlanColor(user.plan)}`}>
                    {user.plan || 'FREE'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user)}`}>
                    {getStatusText(user)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Action buttons - simplified for mobile */}
                {user.role === TypeRole.USER && (
                  <button
                    onClick={() => handleAction('promoteUser', user.id, 'promover usuário')}
                    disabled={actionLoading === `promoteUser-${user.id}`}
                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                    title="Promover"
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                )}

                {user.isAccountEnabled && !user.isAccountLocked ? (
                  <button
                    onClick={() => handleAction('blockUser', user.id, 'bloquear usuário')}
                    disabled={actionLoading === `blockUser-${user.id}`}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                    title="Bloquear"
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('unblockUser', user.id, 'desbloquear usuário')}
                    disabled={actionLoading === `unblockUser-${user.id}`}
                    className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                    title="Desbloquear"
                  >
                    <Unlock className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
                      handleAction('deleteUser', user.id, 'deletar usuário');
                    }
                  }}
                  disabled={actionLoading === `deleteUser-${user.id}`}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                  title="Deletar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPlanColor(user.plan)}`}>
                        {user.plan || 'FREE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user)}`}>
                        {getStatusText(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUserDetails(user.id)}
                          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-all"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Role Actions */}
                        {user.role === TypeRole.USER && (
                          <button
                            onClick={() => handleAction('promoteUser', user.id, 'promover usuário')}
                            disabled={actionLoading === `promoteUser-${user.id}`}
                            className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                            title="Promover para Admin"
                          >
                            {actionLoading === `promoteUser-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Shield className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {user.role === TypeRole.ADMIN && (
                          <button
                            onClick={() => handleAction('demoteUser', user.id, 'rebaixar usuário')}
                            disabled={actionLoading === `demoteUser-${user.id}`}
                            className="text-orange-400 hover:text-orange-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                            title="Rebaixar para User"
                          >
                            {actionLoading === `demoteUser-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <ShieldOff className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Plan Actions */}
                        {user.plan === TypePlan.FREE && (
                          <button
                            onClick={() => handleAction('upgradeUserPlan', user.id, 'atualizar plano')}
                            disabled={actionLoading === `upgradeUserPlan-${user.id}`}
                            className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                            title="Upgrade para Premium"
                          >
                            {actionLoading === `upgradeUserPlan-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {user.plan === TypePlan.PREMIUM && (
                          <button
                            onClick={() => handleAction('cutUserPlan', user.id, 'cortar plano')}
                            disabled={actionLoading === `cutUserPlan-${user.id}`}
                            className="text-gray-400 hover:text-gray-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                            title="Cortar para Free"
                          >
                            {actionLoading === `cutUserPlan-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Block/Unblock Actions */}
                        {user.isAccountEnabled && !user.isAccountLocked ? (
                          <button
                            onClick={() => handleAction('blockUser', user.id, 'bloquear usuário')}
                            disabled={actionLoading === `blockUser-${user.id}`}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                            title="Bloquear usuário"
                          >
                            {actionLoading === `blockUser-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction('unblockUser', user.id, 'desbloquear usuário')}
                            disabled={actionLoading === `unblockUser-${user.id}`}
                            className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                            title="Desbloquear usuário"
                          >
                            {actionLoading === `unblockUser-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Delete Action */}
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
                              handleAction('deleteUser', user.id, 'deletar usuário');
                            }
                          }}
                          disabled={actionLoading === `deleteUser-${user.id}`}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                          title="Deletar usuário"
                        >
                          {actionLoading === `deleteUser-${user.id}` ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-800/30 px-4 py-3 flex items-center justify-between border-t border-gray-800 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}


                disabled={currentPage === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Mostrando <span className="font-medium">{currentPage * 10 + 1}</span> até{' '}
                  <span className="font-medium">
                    {Math.min((currentPage + 1) * 10, users.length)}
                  </span>{' '}
                  de <span className="font-medium">{users.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + Math.max(0, currentPage - 2);
                    if (pageNum >= totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-red-600 border-red-600 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Detalhes do Usuário</h2>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-gray-400">@{selectedUser.username}</p>
                    <p className="text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>

                {/* User Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Função</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Plano</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPlanColor(selectedUser.plan)}`}>
                      {selectedUser.plan}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Status</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedUser)}`}>
                      {getStatusText(selectedUser)}
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Status da Conta</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Conta Habilitada:</span>
                      <span className={selectedUser.isAccountEnabled ? 'text-green-400' : 'text-red-400'}>
                        {selectedUser.isAccountEnabled ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Conta Bloqueada:</span>
                      <span className={selectedUser.isAccountLocked ? 'text-red-400' : 'text-green-400'}>
                        {selectedUser.isAccountLocked ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Credenciais Expiradas:</span>
                      <span className={selectedUser.isCredentialsExpired ? 'text-red-400' : 'text-green-400'}>
                        {selectedUser.isCredentialsExpired ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Conta Expirada:</span>
                      <span className={selectedUser.isAccountExpired ? 'text-red-400' : 'text-green-400'}>
                        {selectedUser.isAccountExpired ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.role === TypeRole.USER && (
                      <button
                        onClick={() => {
                          handleAction('promoteUser', selectedUser.id, 'promover usuário');
                          setShowUserDetails(false);
                        }}
                        disabled={actionLoading === `promoteUser-${selectedUser.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-all"
                      >
                        <Shield className="h-4 w-4" />
                        Promover para Admin
                      </button>
                    )}

                    {selectedUser.role === TypeRole.ADMIN && (
                      <button
                        onClick={() => {
                          handleAction('demoteUser', selectedUser.id, 'rebaixar usuário');
                          setShowUserDetails(false);
                        }}
                        disabled={actionLoading === `demoteUser-${selectedUser.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 transition-all"
                      >
                        <ShieldOff className="h-4 w-4" />
                        Rebaixar para User
                      </button>
                    )}

                    {selectedUser.plan === TypePlan.FREE && (
                      <button
                        onClick={() => {
                          handleAction('upgradeUserPlan', selectedUser.id, 'atualizar plano');
                          setShowUserDetails(false);
                        }}
                        disabled={actionLoading === `upgradeUserPlan-${selectedUser.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 transition-all"
                      >
                        <TrendingUp className="h-4 w-4" />
                        Upgrade Plano
                      </button>
                    )}

                    {selectedUser.plan === TypePlan.PREMIUM && (
                      <button
                        onClick={() => {
                          handleAction('cutUserPlan', selectedUser.id, 'cortar plano');
                          setShowUserDetails(false);
                        }}
                        disabled={actionLoading === `cutUserPlan-${selectedUser.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50 transition-all"
                      >
                        <TrendingDown className="h-4 w-4" />
                        Cortar Plano
                      </button>
                    )}

                    {selectedUser.isAccountEnabled && !selectedUser.isAccountLocked ? (
                      <button
                        onClick={() => {
                          handleAction('blockUser', selectedUser.id, 'bloquear usuário');
                          setShowUserDetails(false);
                        }}
                        disabled={actionLoading === `blockUser-${selectedUser.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-all"
                      >
                        <Lock className="h-4 w-4" />
                        Bloquear Usuário
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleAction('unblockUser', selectedUser.id, 'desbloquear usuário');
                          setShowUserDetails(false);
                        }}
                        disabled={actionLoading === `unblockUser-${selectedUser.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-all"
                      >
                        <Unlock className="h-4 w-4" />
                        Desbloquear Usuário
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
                          handleAction('deleteUser', selectedUser.id, 'deletar usuário');
                          setShowUserDetails(false);
                        }
                      }}
                      disabled={actionLoading === `deleteUser-${selectedUser.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar Usuário
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdminPage;