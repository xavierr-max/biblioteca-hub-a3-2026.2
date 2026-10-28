import React from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { BooksPage } from './pages/BooksPage';
import { ReadersPage } from './pages/ReadersPage';
import { LoansPage } from './pages/LoansPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';

function AppContent() {
  const { currentRoute } = useLibrary();

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardPage />;
      case 'books':
        return <BooksPage />;
      case 'readers':
        return <ReadersPage />;
      case 'loans':
        return <LoansPage />;
      case 'returns':
        return <ReturnsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <UsersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderCurrentPage()}</AppLayout>;
}

export default function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
}
