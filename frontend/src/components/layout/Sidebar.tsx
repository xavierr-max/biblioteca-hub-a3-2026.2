import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { RouteId } from '../../types/library';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  ShieldCheck,
  Library,
  LogOut,
} from 'lucide-react';

interface NavItem {
  id: RouteId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { currentRoute, setCurrentRoute, books, readers, loans, currentUser, showToast } =
    useLibrary();

  const activeLoansCount = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE').length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'books',
      label: 'Livros e Acervo',
      icon: <BookOpen className="w-4 h-4" />,
      badge: books.length,
    },
    {
      id: 'readers',
      label: 'Leitores',
      icon: <Users className="w-4 h-4" />,
      badge: readers.length,
    },
    {
      id: 'loans',
      label: 'Empréstimos',
      icon: <ArrowUpRight className="w-4 h-4" />,
      badge: activeLoansCount,
    },
    {
      id: 'returns',
      label: 'Devoluções',
      icon: <ArrowDownLeft className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Consultas e Relatórios',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'users',
      label: 'Usuários do Sistema',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#FFFDF9] border-r border-[#E7DED2] h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[#E7DED2] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#6F4E37] flex items-center justify-center text-[#FFFDF9] shadow-xs">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base text-[#2F241C] tracking-tight block">
              Biblioteca<span className="text-[#6F4E37]">Hub</span>
            </span>
            <span className="text-[10px] text-[#6D5A4D] tracking-wide block uppercase font-medium">
              Gestão de Acervo
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9B887B]">
            Menu Principal
          </p>
        </div>
        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentRoute(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#6F4E37] text-[#FFFDF9] shadow-xs'
                  : 'text-[#2F241C] hover:bg-[#F8F4EE] hover:text-[#6F4E37]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#FFFDF9]' : 'text-[#6D5A4D]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-[#4E3727] text-[#FFFDF9]'
                      : 'bg-[#F2E9DE] text-[#6D5A4D]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer User Profile Card */}
      <div className="p-4 border-t border-[#E7DED2] bg-[#F8F4EE]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#E6D5BF] flex items-center justify-center text-[#6F4E37] font-bold text-xs border border-[#C8A97E]/50 shrink-0">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#2F241C] truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-[#6D5A4D] truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              showToast({
                title: 'Sessão ativa',
                description: 'Perfil autenticado no modo de demonstração acadêmica.',
                variant: 'neutral' as any,
              })
            }
            className="p-1.5 rounded-lg text-[#9B887B] hover:text-[#6F4E37] hover:bg-[#F2E9DE] transition-colors shrink-0"
            title="Status da Sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
