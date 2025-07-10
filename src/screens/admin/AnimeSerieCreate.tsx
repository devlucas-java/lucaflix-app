import React from 'react';
import { AdminSerieForm } from './adminMedia/AdminSerieForm';
import { HeaderAdmin } from '../../routes/headers/CustomDrawerContent';
import { Footer } from '../../components/Footer';

export const AdminSerieCreate: React.FC = () => {
  return (
    <>
      <HeaderAdmin />
      <AdminSerieForm />
      <Footer />
    </>
  );
};
