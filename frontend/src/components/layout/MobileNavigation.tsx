import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { RouteId } from '../../types/library';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowUpRight,
  MoreHorizontal,
  ArrowDownLeft,
  BarChart3,
  ShieldCheck,
  Library,
  X,
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';

export const MobileNavigation: React.FC = () => {
  const { currentRoute, setCurrentRoute, loans, currentUser } = useLibrary();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const activeLoansCount = loans.filter(
    (l) => l.status === 'ACTIVE' || l.status === 'OVERDUE'
  ).length;

  // Primary routes on bottom bar
  const primaryTabs: { id: RouteId; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Início',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'books',
      label: 'Livros',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'readers',
      label: 'Leitores',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'loans',
      label: 'Empréstimos',
      icon: <ArrowUpRight className="w-5 h-5" />,
      badge: activeLoansCount,
    },
  ];

  const secondaryRoutes: { id: RouteId; label: string; description: string; icon: React.ReactNode }[] = [
    {
      id: 'returns',
      label: 'Devoluções',
      description: 'Baixa de exemplares e histórico de devoluções',
      icon: <ArrowDownLeft className="w-5 h-5 text-[#6F4E37]" />,
    },
    {
      id: 'reports',
      label: 'Consultas e Relatórios',
      description: 'Estatísticas de circulação e métricas do acervo',
      icon: <BarChart3 className="w-5 h-5 text-[#6F4E37]" />,
    },
    {
      id: 'users',
      label: 'Usuários do Sistema',
      description: 'Controle de administradores e bibliotecários',
      icon: <ShieldCheck className="w-5 h-5 text-[#6F4E37]" />,
    },
  ];

  const isSecondaryActive = secondaryRoutes.some((r) => r.id === currentRoute);

  return (
    <>
      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#E7DED2] px-2 py-1.5 safe-area-pb">
        <div className="flex items-center justify-around">
          {primaryTabs.map((tab) => {
            const isActive = currentRoute === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentRoute(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg min-w-[56px] transition-colors ${
                  isActive
                    ? 'text-[#6F4E37]'
                    : 'text-[#6D5A4D] hover:text-[#2F241C]'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#6F4E37] text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    isActive ? 'font-semibold text-[#6F4E37]' : ''
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* "Mais" Menu Button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg min-w-[56px] transition-colors ${
              isSecondaryActive
                ? 'text-[#6F4E37]'
                : 'text-[#6D5A4D] hover:text-[#2F241C]'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span
              className={`text-[10px] mt-1 font-medium ${
                isSecondaryActive ? 'font-semibold text-[#6F4E37]' : ''
              }`}
            >
              Mais
            </span>
          </button>
        </div>
      </nav>

      {/* Secondary screens Drawer for Mobile */}
      <Drawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="Mais Opções"
        description="Navegação secundária do sistema"
        position="bottom"
      >
        <div className="space-y-2 pb-6">
          {secondaryRoutes.map((route) => {
            const isActive = currentRoute === route.id;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => {
                  setCurrentRoute(route.id);
                  setIsMoreOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-[#F2E9DE] border-[#C8A97E] text-[#2F241C]'
                    : 'bg-[#FFFDF9] border-[#E7DED2] hover:bg-[#F8F4EE] text-[#2F241C]'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#E6D5BF]/50 flex items-center justify-center shrink-0">
                  {route.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2F241C]">
                    {route.label}
                  </p>
                  <p className="text-xs text-[#6D5A4D] truncate">
                    {route.description}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Compact User info inside More */}
          <div className="mt-4 pt-4 border-t border-[#E7DED2] flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[#E6D5BF] flex items-center justify-center text-[#6F4E37] font-bold text-xs border border-[#C8A97E]">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#2F241C]">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-[#6D5A4D]">
                {currentUser.email} • {currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};
