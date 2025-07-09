// import { Navigate } from "react-router-dom";
// import authService from "../service/authService";
// import type { ReactElement } from "react";


// interface PublicRouteProps {
//   children: ReactElement;
//   restricted?: boolean;
// }

// export const PublicRoute: React.FC<PublicRouteProps> = ({
//   children,
//   restricted = false
// }) => {
//   const isAuthenticated = authService.isAuthenticated();

//   // Se a rota é restrita (login/register) e usuário já está logado
//   if (restricted && isAuthenticated) {
//     console.log('Usuário já autenticado, redirecionando para home');
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };