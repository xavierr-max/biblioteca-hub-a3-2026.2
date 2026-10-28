import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { ToastContainer } from '../ui/Toast';

export interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8F4EE] flex text-[#2F241C] antialiased overflow-x-hidden selection:bg-[#E6D5BF] selection:text-[#2F241C]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-y-auto">
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};
