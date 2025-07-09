// import React, { type ReactElement } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import authService from '../service/authService';

// interface ProtectedRouteProps {
//   children: ReactElement;
//   requireAuth?: boolean;
//   requireAdmin?: boolean;
//   adminLevel?: number;
// }

// export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
//   children,
//   requireAuth = true,
//   requireAdmin = false,
//   adminLevel = 0
// }) => {
//   const location = useLocation();
//   const isAuthenticated = authService.isAuthenticated();
//   const isAdmin = authService.isAdmin();
//   const userAdminLevel = authService.getAdminLevel();

//   // Se requerer autenticação e usuário não estiver logado
//   if (requireAuth && !isAuthenticated) {
//     console.log('Usuário não autenticado, redirecionando para login');
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // Se requerer admin e usuário não for admin
//   if (requireAdmin && !isAdmin) {
//     console.log('Usuário não é admin, redirecionando para home');
//     return <Navigate to="/" replace />;
//   }

//   // Se requerer nível específico de admin
//   if (requireAdmin && adminLevel > 0 && userAdminLevel < adminLevel) {
//     console.log(`Nível de admin insuficiente. Requerido: ${adminLevel}, Atual: ${userAdminLevel}`);
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };