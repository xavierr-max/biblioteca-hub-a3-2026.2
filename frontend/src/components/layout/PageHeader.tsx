import React from 'react';
import { SearchField } from '../ui/SearchField';
import { useLibrary } from '../../context/LibraryContext';
import { BookOpen, User as UserIcon } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  searchPlaceholder = 'Buscar no acervo, leitores ou empréstimos...',
  searchValue,
  onSearchChange,
}) => {
  const { currentUser, globalSearch, setGlobalSearch } = useLibrary();

  const searchVal = searchValue !== undefined ? searchValue : globalSearch;
  const handleSearch = onSearchChange || setGlobalSearch;

  return (
    <header className="sticky top-0 z-20 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E7DED2] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Titles */}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#2F241C] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#6D5A4D] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Search & Actions & User avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:block w-64 lg:w-80">
            <SearchField
              value={searchVal}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
            />
          </div>

          {actions && <div className="flex items-center gap-2">{actions}</div>}

          {/* Compact User pill */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[#E7DED2]">
            <div className="w-8 h-8 rounded-full bg-[#E6D5BF] flex items-center justify-center text-[#6F4E37] font-semibold text-xs border border-[#C8A97E]/40">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-[#2F241C] leading-none truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-[#6D5A4D] font-medium mt-0.5 uppercase tracking-wide">
                {currentUser.role === 'ADMIN'
                  ? 'Administrador'
                  : currentUser.role === 'LIBRARIAN'
                  ? 'Bibliotecário'
                  : 'Leitor'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search field bar */}
      <div className="mt-3 md:hidden">
        <SearchField
          value={searchVal}
          onChange={handleSearch}
          placeholder="Buscar no sistema..."
        />
      </div>
    </header>
  );
};
