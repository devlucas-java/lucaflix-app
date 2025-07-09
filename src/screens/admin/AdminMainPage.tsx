import React, { useState, useEffect } from 'react';
import { Dashboard, SectionType } from './dashboard/Dashboard';
import { HeaderAdmin } from '../../components/headers/CustomDrawerContent';

// Página principal do Admin que gerencia o estado das seções
export const AdminMainPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType>(SectionType.home);

  // Verificar parâmetros da URL na inicialização
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    
    if (sectionParam && Object.values(SectionType).includes(sectionParam as SectionType)) {
      setActiveSection(sectionParam as SectionType);
    }
  }, []);

  // Atualizar URL quando a seção muda
  const handleSectionChange = (section: string) => {
    const sectionType = section as SectionType;
    setActiveSection(sectionType);
    
    // Atualizar URL sem recarregar a página
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen min-w-screen bg-black">
      <HeaderAdmin
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <Dashboard section={activeSection} />
    </div>
  );
};

export default AdminMainPage;