import React, { useState } from 'react';
import { AppLayout } from './AppLayout';
import { Search } from '../pages/search.tsx';
import { AppTitle } from './AppTitle.tsx';

const App: React.FC = () => {
  const [page, setPage] = useState(Search);
  const mainTitle = <AppTitle switchPage={setPage} />;
  return <AppLayout drawerContent={page.renderSidebar()} mainContent={page.renderContent()} mainTitle={mainTitle} />;
};

export default App;
