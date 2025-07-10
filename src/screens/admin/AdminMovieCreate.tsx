// AdminMovieCreate.tsx
import React from 'react';
import { AdminMovieForm } from './adminMedia/AdminMovieForm';
import { HeaderAdmin } from '../../routes/headers/CustomDrawerContent';
import { Footer } from '../../components/Footer';

export const AdminMovieCreate: React.FC = () => {
  return (
    <>
      <HeaderAdmin />
      <AdminMovieForm />
      <Footer />
    </>
  );
};
