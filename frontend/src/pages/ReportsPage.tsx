import React, { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Table } from '../components/ui/Table';
import { useLibrary } from '../context/LibraryContext';
import {
  buildMovementHistory,
  createCsv,
  getDerivedLoanStatus,
  isDateInPeriod,
  MovementEvent,
  wasLoanReturnedLate,
} from '../domain/reporting';
import { Book, Loan } from '../types/library';
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  History,
  Library,
  RotateCcw,
} from 'lucide-react';

type ReportTab = 'CATALOG' | 'LOANS' | 'RETURNS' | 'HISTORY';
type PeriodFilter = 'ALL' | 'LAST_30' | 'CURRENT_MONTH' | 'CURRENT_YEAR';

interface CatalogRow {
  book: Book;
  total: number;
  available: number;
  loaned: number;
}

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('pt-BR').format(
        new Date(`${value}T12:00:00`)
      )
    : 'Não disponível';

export const ReportsPage: React.FC = () => {
  const { books, copies, loans, readers, showToast } = useLibrary();
  const [activeTab, setActiveTab] = useState<ReportTab>('CATALOG');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<
    'ALL' | 'AVAILABLE' | 'UNAVAILABLE'
  >('ALL');
  const [archiveFilter, setArchiveFilter] = useState<
    'ALL' | 'ACTIVE' | 'ARCHIVED'
  >('ALL');

  const [loanPeriod, setLoanPeriod] = useState<PeriodFilter>('ALL');
  const [loanStatus, setLoanStatus] = useState<
    'ALL' | 'ACTIVE' | 'OVERDUE' | 'RETURNED'
  >('ALL');
  const [loanReader, setLoanReader] = useState('ALL');
  const [loanBook, setLoanBook] = useState('ALL');

  const [returnPeriod, setReturnPeriod] = useState<PeriodFilter>('ALL');
  const [returnSituation, setReturnSituation] = useState<
    'ALL' | 'ON_TIME' | 'LATE'
  >('ALL');
  const [returnReader, setReturnReader] = useState('ALL');
  const [returnBook, setReturnBook] = useState('ALL');

  const [historyPeriod, setHistoryPeriod] = useState<PeriodFilter>('ALL');
  const [historyType, setHistoryType] = useState<
    'ALL' | 'LOAN' | 'RETURN'
  >('ALL');

  const catalogRows = useMemo<CatalogRow[]>(
    () =>
      books.map((book) => {
        const bookCopies = copies.filter((copy) => copy.bookId === book.id);
        return {
          book,
          total: bookCopies.length,
          available: bookCopies.filter(
            (copy) => copy.status === 'AVAILABLE'
          ).length,
          loaned: bookCopies.filter((copy) => copy.status === 'LOANED').length,
        };
      }),
    [books, copies]
  );

  const movementHistory = useMemo(
    () => buildMovementHistory(loans),
    [loans]
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(books.map((book) => book.category).filter(Boolean)))
        .sort((first, second) => first.localeCompare(second, 'pt-BR')),
    [books]
  );

  const filteredCatalog = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return catalogRows
      .filter(({ book, available }) => {
        if (
          term &&
          !book.title.toLowerCase().includes(term) &&
          !book.author.toLowerCase().includes(term) &&
          !book.isbn.toLowerCase().replace(/[-\s]/g, '').includes(
            term.replace(/[-\s]/g, '')
          )
        ) {
          return false;
        }
        if (categoryFilter !== 'ALL' && book.category !== categoryFilter) {
          return false;
        }
        if (availabilityFilter === 'AVAILABLE' && available === 0) {
          return false;
        }
        if (availabilityFilter === 'UNAVAILABLE' && available > 0) {
          return false;
        }
        if (archiveFilter === 'ACTIVE' && book.isArchived) return false;
        if (archiveFilter === 'ARCHIVED' && !book.isArchived) return false;
        return true;
      })
      .sort((first, second) => {
        const comparison = first.book.title.localeCompare(
          second.book.title,
          'pt-BR'
        );
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [
    catalogRows,
    searchTerm,
    categoryFilter,
    availabilityFilter,
    archiveFilter,
    sortOrder,
  ]);

  const filteredLoans = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return loans
      .filter((loan) => {
        const status = getDerivedLoanStatus(loan);
        if (
          term &&
          !loan.id.toLowerCase().includes(term) &&
          !loan.bookTitle.toLowerCase().includes(term) &&
          !loan.readerName.toLowerCase().includes(term) &&
          !loan.copyCode.toLowerCase().includes(term)
        ) {
          return false;
        }
        if (loanStatus !== 'ALL' && status !== loanStatus) return false;
        if (loanReader !== 'ALL' && loan.readerId !== loanReader) return false;
        if (loanBook !== 'ALL' && loan.bookId !== loanBook) return false;
        return isDateInPeriod(loan.loanDate, loanPeriod);
      })
      .sort((first, second) => {
        const comparison = first.loanDate.localeCompare(second.loanDate);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [
    loans,
    searchTerm,
    loanStatus,
    loanReader,
    loanBook,
    loanPeriod,
    sortOrder,
  ]);

  const filteredReturns = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return loans
      .filter((loan) => {
        if (!loan.returnDate) return false;
        if (
          term &&
          !loan.id.toLowerCase().includes(term) &&
          !loan.bookTitle.toLowerCase().includes(term) &&
          !loan.readerName.toLowerCase().includes(term) &&
          !loan.copyCode.toLowerCase().includes(term)
        ) {
          return false;
        }
        if (returnReader !== 'ALL' && loan.readerId !== returnReader) {
          return false;
        }
        if (returnBook !== 'ALL' && loan.bookId !== returnBook) return false;
        const late = wasLoanReturnedLate(loan);
        if (returnSituation === 'ON_TIME' && late) return false;
        if (returnSituation === 'LATE' && !late) return false;
        return isDateInPeriod(loan.returnDate, returnPeriod);
      })
      .sort((first, second) => {
        const comparison = (first.returnDate || '').localeCompare(
          second.returnDate || ''
        );
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [
    loans,
    searchTerm,
    returnReader,
    returnBook,
    returnSituation,
    returnPeriod,
    sortOrder,
  ]);

  const filteredHistory = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const events = movementHistory.filter((event) => {
      if (
        term &&
        !event.loanId.toLowerCase().includes(term) &&
        !event.bookTitle.toLowerCase().includes(term) &&
        !event.readerName.toLowerCase().includes(term) &&
        !event.copyCode.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (historyType !== 'ALL' && event.type !== historyType) return false;
      return isDateInPeriod(event.date, historyPeriod);
    });
    return sortOrder === 'desc' ? events : [...events].reverse();
  }, [
    movementHistory,
    searchTerm,
    historyType,
    historyPeriod,
    sortOrder,
  ]);

  const openLoans = loans.filter(
    (loan) => getDerivedLoanStatus(loan) !== 'RETURNED'
  );
  const overdueLoans = loans.filter(
    (loan) => getDerivedLoanStatus(loan) === 'OVERDUE'
  );
  const returnedLoans = loans.filter((loan) => Boolean(loan.returnDate));
  const availableCopies = copies.filter(
    (copy) => copy.status === 'AVAILABLE'
  ).length;

  const categoryDistribution = useMemo(
    () =>
      categories
        .map((category) => {
          const bookIds = new Set(
            books
              .filter((book) => book.category === category)
              .map((book) => book.id)
          );
          return {
            category,
            copies: copies.filter((copy) => bookIds.has(copy.bookId)).length,
          };
        })
        .sort((first, second) => second.copies - first.copies),
    [books, copies, categories]
  );

  const currentResultCount =
    activeTab === 'CATALOG'
      ? filteredCatalog.length
      : activeTab === 'LOANS'
      ? filteredLoans.length
      : activeTab === 'RETURNS'
      ? filteredReturns.length
      : filteredHistory.length;

  const clearFilters = () => {
    setSearchTerm('');
    setSortOrder('asc');
    setCategoryFilter('ALL');
    setAvailabilityFilter('ALL');
    setArchiveFilter('ALL');
    setLoanPeriod('ALL');
    setLoanStatus('ALL');
    setLoanReader('ALL');
    setLoanBook('ALL');
    setReturnPeriod('ALL');
    setReturnSituation('ALL');
    setReturnReader('ALL');
    setReturnBook('ALL');
    setHistoryPeriod('ALL');
    setHistoryType('ALL');
  };

  const getCsvData = (): {
    name: string;
    headers: string[];
    rows: Array<Array<unknown>>;
  } => {
    if (activeTab === 'CATALOG') {
      return {
        name: 'acervo',
        headers: [
          'Livro',
          'Autor',
          'ISBN',
          'Categoria',
          'Exemplares totais',
          'Disponíveis',
          'Emprestados',
          'Situação',
        ],
        rows: filteredCatalog.map(({ book, total, available, loaned }) => [
          book.title,
          book.author,
          book.isbn,
          book.category,
          total,
          available,
          loaned,
          book.isArchived
            ? 'Arquivado'
            : available > 0
            ? 'Disponível'
            : 'Indisponível',
        ]),
      };
    }
    if (activeTab === 'LOANS') {
      return {
        name: 'emprestimos',
        headers: [
          'Código do empréstimo',
          'Livro',
          'Leitor',
          'Exemplar',
          'Data do empréstimo',
          'Previsão de devolução',
          'Situação',
        ],
        rows: filteredLoans.map((loan) => [
          loan.id,
          loan.bookTitle,
          loan.readerName,
          loan.copyCode,
          formatDate(loan.loanDate),
          formatDate(loan.dueDate),
          getDerivedLoanStatus(loan) === 'OVERDUE'
            ? 'Atrasado'
            : getDerivedLoanStatus(loan) === 'RETURNED'
            ? 'Devolvido'
            : 'Ativo',
        ]),
      };
    }
    if (activeTab === 'RETURNS') {
      return {
        name: 'devolucoes',
        headers: [
          'Empréstimo',
          'Livro',
          'Leitor',
          'Data prevista',
          'Data efetiva',
          'Situação',
        ],
        rows: filteredReturns.map((loan) => [
          loan.id,
          loan.bookTitle,
          loan.readerName,
          formatDate(loan.dueDate),
          formatDate(loan.returnDate),
          wasLoanReturnedLate(loan)
            ? 'Devolvido com atraso'
            : 'Devolvido no prazo',
        ]),
      };
    }
    return {
      name: 'historico-movimentacoes',
      headers: [
        'Tipo',
        'Empréstimo',
        'Livro',
        'Leitor',
        'Exemplar',
        'Data',
        'Detalhes',
      ],
      rows: filteredHistory.map((event) => [
        event.type === 'LOAN' ? 'Empréstimo' : 'Devolução',
        event.loanId,
        event.bookTitle,
        event.readerName,
        event.copyCode,
        formatDate(event.date),
        event.details,
      ]),
    };
  };

  const exportCsv = () => {
    const data = getCsvData();
    const csv = createCsv(data.headers, data.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bibliotecahub-${data.name}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast({
      title: 'CSV exportado',
      description: `${data.rows.length} registro(s) filtrado(s) foram incluídos no arquivo.`,
      variant: 'success',
    });
  };

  const renderFilters = () => {
    if (activeTab === 'CATALOG') {
      return (
        <>
          <Select
            label="Categoria"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            options={[
              { value: 'ALL', label: 'Todas as categorias' },
              ...categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
          />
          <Select
            label="Disponibilidade"
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(
                event.target.value as typeof availabilityFilter
              )
            }
            options={[
              { value: 'ALL', label: 'Todas' },
              { value: 'AVAILABLE', label: 'Com exemplares disponíveis' },
              { value: 'UNAVAILABLE', label: 'Sem exemplares disponíveis' },
            ]}
          />
          <Select
            label="Arquivamento"
            value={archiveFilter}
            onChange={(event) =>
              setArchiveFilter(event.target.value as typeof archiveFilter)
            }
            options={[
              { value: 'ALL', label: 'Ativos e arquivados' },
              { value: 'ACTIVE', label: 'Somente ativos' },
              { value: 'ARCHIVED', label: 'Somente arquivados' },
            ]}
          />
        </>
      );
    }
    if (activeTab === 'LOANS') {
      return (
        <>
          <PeriodSelect value={loanPeriod} onChange={setLoanPeriod} />
          <Select
            label="Status"
            value={loanStatus}
            onChange={(event) =>
              setLoanStatus(event.target.value as typeof loanStatus)
            }
            options={[
              { value: 'ALL', label: 'Todos os status' },
              { value: 'ACTIVE', label: 'Ativos' },
              { value: 'OVERDUE', label: 'Atrasados' },
              { value: 'RETURNED', label: 'Devolvidos' },
            ]}
          />
          <ReaderSelect
            readers={readers}
            value={loanReader}
            onChange={setLoanReader}
          />
          <BookSelect
            books={books}
            value={loanBook}
            onChange={setLoanBook}
          />
        </>
      );
    }
    if (activeTab === 'RETURNS') {
      return (
        <>
          <PeriodSelect value={returnPeriod} onChange={setReturnPeriod} />
          <Select
            label="Situação"
            value={returnSituation}
            onChange={(event) =>
              setReturnSituation(event.target.value as typeof returnSituation)
            }
            options={[
              { value: 'ALL', label: 'Todas as devoluções' },
              { value: 'ON_TIME', label: 'No prazo' },
              { value: 'LATE', label: 'Com atraso' },
            ]}
          />
          <ReaderSelect
            readers={readers}
            value={returnReader}
            onChange={setReturnReader}
          />
          <BookSelect
            books={books}
            value={returnBook}
            onChange={setReturnBook}
          />
        </>
      );
    }
    return (
      <>
        <PeriodSelect value={historyPeriod} onChange={setHistoryPeriod} />
        <Select
          label="Tipo de movimentação"
          value={historyType}
          onChange={(event) =>
            setHistoryType(event.target.value as typeof historyType)
          }
          options={[
            { value: 'ALL', label: 'Todas as movimentações' },
            { value: 'LOAN', label: 'Empréstimos' },
            { value: 'RETURN', label: 'Devoluções' },
          ]}
        />
      </>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultas e Relatórios"
        subtitle="Acompanhe o acervo e as movimentações da biblioteca"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={exportCsv}
          >
            Exportar CSV
          </Button>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pesquisar na consulta atual..."
      />

      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {[
            {
              label: 'Total de títulos',
              value: books.length,
              icon: <BookOpen className="h-5 w-5" />,
            },
            {
              label: 'Exemplares físicos',
              value: copies.length,
              icon: <Library className="h-5 w-5" />,
            },
            {
              label: 'Disponíveis',
              value: availableCopies,
              icon: <CheckCircle2 className="h-5 w-5" />,
            },
            {
              label: 'Empréstimos ativos',
              value: openLoans.length,
              icon: <ArrowUpRight className="h-5 w-5" />,
            },
            {
              label: 'Atrasados',
              value: overdueLoans.length,
              icon: <Clock3 className="h-5 w-5" />,
            },
            {
              label: 'Devoluções',
              value: returnedLoans.length,
              icon: <ArrowDownLeft className="h-5 w-5" />,
            },
          ].map((indicator) => (
            <Card key={indicator.label}>
              <div className="flex min-h-24 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium leading-tight text-[#6D5A4D]">
                    {indicator.label}
                  </p>
                  <span className="rounded-lg bg-[#F2E9DE] p-2 text-[#6F4E37]">
                    {indicator.icon}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#2F241C]">
                  {indicator.value}
                </p>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card
            header={
              <div>
                <h2 className="text-sm font-semibold text-[#2F241C]">
                  Exemplares por categoria
                </h2>
                <p className="text-xs text-[#6D5A4D]">
                  Distribuição física do acervo
                </p>
              </div>
            }
          >
            <div className="space-y-3">
              {categoryDistribution.map((item) => {
                const percentage =
                  copies.length > 0
                    ? Math.round((item.copies / copies.length) * 100)
                    : 0;
                return (
                  <div key={item.category}>
                    <div className="mb-1 flex justify-between gap-3 text-xs">
                      <span className="truncate font-medium text-[#2F241C]">
                        {item.category}
                      </span>
                      <span className="shrink-0 text-[#6D5A4D]">
                        {item.copies} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#E7DED2]/60">
                      <div
                        className="h-full rounded-full bg-[#6F4E37]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            header={
              <div>
                <h2 className="text-sm font-semibold text-[#2F241C]">
                  Situação dos exemplares
                </h2>
                <p className="text-xs text-[#6D5A4D]">
                  Disponibilidade operacional atual
                </p>
              </div>
            }
          >
            <div className="space-y-4">
              {[
                {
                  label: 'Disponíveis',
                  value: copies.filter((copy) => copy.status === 'AVAILABLE')
                    .length,
                  color: 'bg-[#2E7D32]',
                },
                {
                  label: 'Emprestados',
                  value: copies.filter((copy) => copy.status === 'LOANED')
                    .length,
                  color: 'bg-[#1565C0]',
                },
                {
                  label: 'Manutenção ou extravio',
                  value: copies.filter(
                    (copy) =>
                      copy.status === 'MAINTENANCE' || copy.status === 'LOST'
                  ).length,
                  color: 'bg-[#B76E00]',
                },
              ].map((item) => {
                const percentage =
                  copies.length > 0
                    ? Math.round((item.value / copies.length) * 100)
                    : 0;
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-[#2F241C]">
                        {item.label}
                      </span>
                      <span className="text-[#6D5A4D]">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#E7DED2]/60">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ['CATALOG', 'Acervo', BookOpen],
            ['LOANS', 'Empréstimos', ArrowUpRight],
            ['RETURNS', 'Devoluções', ArrowDownLeft],
            ['HISTORY', 'Histórico', History],
          ].map(([id, label, Icon]) => (
            <Button
              key={String(id)}
              variant={activeTab === id ? 'primary' : 'outline'}
              icon={React.createElement(Icon as React.ElementType, {
                className: 'h-4 w-4',
              })}
              onClick={() => {
                setActiveTab(id as ReportTab);
                setSearchTerm('');
              }}
            >
              {String(label)}
            </Button>
          ))}
        </section>

        <section className="rounded-xl border border-[#E7DED2] bg-[#FFFDF9] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#2F241C]">
                Filtros da consulta
              </h2>
              <p className="text-xs text-[#6D5A4D]">
                {currentResultCount} resultado(s) após os filtros
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={clearFilters}
              >
                Limpar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                icon={<Filter className="h-3.5 w-3.5" />}
                onClick={() => setFiltersOpen((current) => !current)}
              >
                {filtersOpen ? 'Recolher' : 'Filtros'}
              </Button>
            </div>
          </div>
          <div
            className={`grid-cols-1 gap-3 border-t border-[#E7DED2] pt-3 sm:grid-cols-2 lg:grid-cols-4 ${
              filtersOpen ? 'grid' : 'hidden md:grid'
            }`}
          >
            {renderFilters()}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#6D5A4D]">
                Ordenação
              </p>
              <Button
                variant="outline"
                className="w-full"
                icon={<ArrowUpDown className="h-4 w-4" />}
                onClick={() =>
                  setSortOrder((current) =>
                    current === 'asc' ? 'desc' : 'asc'
                  )
                }
              >
                {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
              </Button>
            </div>
          </div>
        </section>

        {activeTab === 'CATALOG' && (
          <CatalogReport rows={filteredCatalog} />
        )}
        {activeTab === 'LOANS' && (
          <LoansReport rows={filteredLoans} />
        )}
        {activeTab === 'RETURNS' && (
          <ReturnsReport rows={filteredReturns} />
        )}
        {activeTab === 'HISTORY' && (
          <HistoryReport rows={filteredHistory} />
        )}
      </div>
    </div>
  );
};

function PeriodSelect({
  value,
  onChange,
}: {
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
}) {
  return (
    <Select
      label="Período"
      value={value}
      onChange={(event) => onChange(event.target.value as PeriodFilter)}
      options={[
        { value: 'ALL', label: 'Todo o período' },
        { value: 'LAST_30', label: 'Últimos 30 dias' },
        { value: 'CURRENT_MONTH', label: 'Mês atual' },
        { value: 'CURRENT_YEAR', label: 'Ano atual' },
      ]}
    />
  );
}

function ReaderSelect({
  readers,
  value,
  onChange,
}: {
  readers: ReturnType<typeof useLibrary>['readers'];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      label="Leitor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={[
        { value: 'ALL', label: 'Todos os leitores' },
        ...readers
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
          .map((reader) => ({ value: reader.id, label: reader.name })),
      ]}
    />
  );
}

function BookSelect({
  books,
  value,
  onChange,
}: {
  books: Book[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      label="Livro"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={[
        { value: 'ALL', label: 'Todos os livros' },
        ...books
          .slice()
          .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
          .map((book) => ({ value: book.id, label: book.title })),
      ]}
    />
  );
}

function ReportEmpty() {
  return (
    <EmptyState
      icon={<BarChart3 className="h-6 w-6" />}
      title="Nenhum resultado encontrado"
      description="A consulta não possui registros correspondentes aos filtros aplicados."
    />
  );
}

function CatalogReport({ rows }: { rows: CatalogRow[] }) {
  if (rows.length === 0) return <ReportEmpty />;
  return (
    <>
      <div className="hidden md:block">
        <Table
          columns={[
            {
              key: 'book',
              header: 'Livro / Autor',
              render: ({ book }) => (
                <div>
                  <p className="text-sm font-semibold text-[#2F241C]">
                    {book.title}
                  </p>
                  <p className="text-xs text-[#6D5A4D]">{book.author}</p>
                </div>
              ),
            },
            {
              key: 'isbn',
              header: 'ISBN',
              render: ({ book }) => (
                <span className="font-mono text-xs">{book.isbn}</span>
              ),
            },
            {
              key: 'category',
              header: 'Categoria',
              render: ({ book }) => (
                <span className="text-xs">{book.category}</span>
              ),
            },
            { key: 'total', header: 'Total' },
            { key: 'available', header: 'Disponíveis' },
            { key: 'loaned', header: 'Emprestados' },
            {
              key: 'status',
              header: 'Status',
              render: ({ book, available }) =>
                book.isArchived ? (
                  <StatusBadge variant="neutral">Arquivado</StatusBadge>
                ) : available > 0 ? (
                  <StatusBadge variant="success">Disponível</StatusBadge>
                ) : (
                  <StatusBadge variant="danger">Indisponível</StatusBadge>
                ),
            },
          ]}
          data={rows}
          keyExtractor={(row) => row.book.id}
        />
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map(({ book, total, available, loaned }) => (
          <Card key={book.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold text-[#2F241C]">
                  {book.title}
                </p>
                <p className="truncate text-xs text-[#6D5A4D]">{book.author}</p>
              </div>
              {book.isArchived ? (
                <StatusBadge variant="neutral">Arquivado</StatusBadge>
              ) : available > 0 ? (
                <StatusBadge variant="success">Disponível</StatusBadge>
              ) : (
                <StatusBadge variant="danger">Indisponível</StatusBadge>
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#E7DED2] pt-3 text-xs">
              <Metric label="Total" value={total} />
              <Metric label="Disponíveis" value={available} />
              <Metric label="Emprestados" value={loaned} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function LoansReport({ rows }: { rows: Loan[] }) {
  if (rows.length === 0) return <ReportEmpty />;
  return (
    <>
      <div className="hidden md:block">
        <Table
          columns={[
            {
              key: 'id',
              header: 'Código',
              render: (loan) => (
                <span className="font-mono text-xs font-semibold text-[#6F4E37]">
                  {loan.id}
                </span>
              ),
            },
            { key: 'bookTitle', header: 'Livro' },
            { key: 'readerName', header: 'Leitor' },
            {
              key: 'copyCode',
              header: 'Exemplar',
              render: (loan) => (
                <span className="font-mono text-xs">{loan.copyCode}</span>
              ),
            },
            {
              key: 'loanDate',
              header: 'Empréstimo',
              render: (loan) => formatDate(loan.loanDate),
            },
            {
              key: 'dueDate',
              header: 'Previsão',
              render: (loan) => formatDate(loan.dueDate),
            },
            {
              key: 'status',
              header: 'Situação',
              render: (loan) => <LoanStatus loan={loan} />,
            },
          ]}
          data={rows}
          keyExtractor={(loan) => loan.id}
        />
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((loan) => (
          <Card key={loan.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold text-[#6F4E37]">
                  {loan.id}
                </p>
                <p className="line-clamp-2 text-sm font-bold text-[#2F241C]">
                  {loan.bookTitle}
                </p>
                <p className="truncate text-xs text-[#6D5A4D]">
                  {loan.readerName}
                </p>
              </div>
              <LoanStatus loan={loan} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#E7DED2] pt-3 text-xs">
              <Metric label="Exemplar" value={loan.copyCode} />
              <Metric label="Empréstimo" value={formatDate(loan.loanDate)} />
              <Metric label="Previsão" value={formatDate(loan.dueDate)} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function ReturnsReport({ rows }: { rows: Loan[] }) {
  if (rows.length === 0) return <ReportEmpty />;
  return (
    <>
      <div className="hidden md:block">
        <Table
          columns={[
            {
              key: 'id',
              header: 'Empréstimo',
              render: (loan) => (
                <span className="font-mono text-xs font-semibold text-[#6F4E37]">
                  {loan.id}
                </span>
              ),
            },
            { key: 'bookTitle', header: 'Livro' },
            { key: 'readerName', header: 'Leitor' },
            {
              key: 'dueDate',
              header: 'Data prevista',
              render: (loan) => formatDate(loan.dueDate),
            },
            {
              key: 'returnDate',
              header: 'Data efetiva',
              render: (loan) => formatDate(loan.returnDate),
            },
            {
              key: 'status',
              header: 'Situação',
              render: (loan) =>
                wasLoanReturnedLate(loan) ? (
                  <StatusBadge variant="warning">Com atraso</StatusBadge>
                ) : (
                  <StatusBadge variant="success">No prazo</StatusBadge>
                ),
            },
          ]}
          data={rows}
          keyExtractor={(loan) => loan.id}
        />
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((loan) => (
          <Card key={loan.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold text-[#2F241C]">
                  {loan.bookTitle}
                </p>
                <p className="truncate text-xs text-[#6D5A4D]">
                  {loan.readerName}
                </p>
              </div>
              {wasLoanReturnedLate(loan) ? (
                <StatusBadge variant="warning">Com atraso</StatusBadge>
              ) : (
                <StatusBadge variant="success">No prazo</StatusBadge>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E7DED2] pt-3 text-xs">
              <Metric label="Prazo" value={formatDate(loan.dueDate)} />
              <Metric label="Devolução" value={formatDate(loan.returnDate)} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function HistoryReport({ rows }: { rows: MovementEvent[] }) {
  if (rows.length === 0) return <ReportEmpty />;
  return (
    <Card>
      <ol className="divide-y divide-[#E7DED2]">
        {rows.map((event) => (
          <li
            key={event.id}
            className="flex min-w-0 items-start gap-3 py-4 first:pt-0 last:pb-0"
          >
            <span
              className={`shrink-0 rounded-lg p-2 ${
                event.type === 'LOAN'
                  ? 'bg-[#E3F2FD] text-[#1565C0]'
                  : 'bg-[#EDF7ED] text-[#2E7D32]'
              }`}
            >
              {event.type === 'LOAN' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#2F241C]">
                  {event.type === 'LOAN'
                    ? 'Empréstimo registrado'
                    : 'Devolução registrada'}
                </span>
                <StatusBadge
                  variant={event.type === 'LOAN' ? 'info' : 'success'}
                  dot={false}
                >
                  {event.copyCode}
                </StatusBadge>
              </span>
              <span className="mt-0.5 block text-xs text-[#2F241C]">
                {event.bookTitle}
              </span>
              <span className="block truncate text-[11px] text-[#6D5A4D]">
                {event.readerName} • {event.details}
              </span>
            </span>
            <time
              dateTime={event.date}
              className="shrink-0 text-[10px] text-[#9B887B]"
            >
              {formatDate(event.date)}
            </time>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function LoanStatus({ loan }: { loan: Loan }) {
  const status = getDerivedLoanStatus(loan);
  if (status === 'OVERDUE') {
    return <StatusBadge variant="danger">Atrasado</StatusBadge>;
  }
  if (status === 'RETURNED') {
    return <StatusBadge variant="success">Devolvido</StatusBadge>;
  }
  return <StatusBadge variant="info">Ativo</StatusBadge>;
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[10px] text-[#6D5A4D]">{label}</span>
      <span className="block truncate font-semibold text-[#2F241C]">
        {value}
      </span>
    </div>
  );
}
