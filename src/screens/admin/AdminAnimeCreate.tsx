// AdminAnimeCreate.tsx
import React from "react";
import { AdminAnimeForm } from "./adminMedia/AdminAnimeForm";
import { HeaderAdmin } from "../../components/headers/CustomDrawerContent";
import { Footer } from "../../components/Footer";

export const AdminAnimeCreate: React.FC = () => {
  return (
    <>
      <HeaderAdmin />
      <AdminAnimeForm />
      <Footer />
    </>
  );
};
