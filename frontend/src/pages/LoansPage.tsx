import React, { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Drawer } from '../components/ui/Drawer';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { SearchField } from '../components/ui/SearchField';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Table } from '../components/ui/Table';
import { useLibrary } from '../context/LibraryContext';
import { Loan } from '../types/library';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  Library,
  MapPin,
  Plus,
  UserRound,
} from 'lucide-react';

type DerivedLoanStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED';
type PeriodFilter = 'ALL' | 'LAST_30' | 'CURRENT_MONTH' | 'CURRENT_YEAR';

const PAGE_SIZE = 8;
const UPCOMING_DAYS = 3;

const parseDate = (value: string) => new Date(`${value}T12:00:00`);

const todayValue = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .split('T')[0];
};

const addDays = (dateValue: string, days: number) => {
  const date = parseDate(dateValue);
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .split('T')[0];
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR').format(parseDate(value));

const getLoanStatus = (loan: Loan): DerivedLoanStatus => {
  if (loan.status === 'RETURNED' || loan.returnDate) return 'RETURNED';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDate(loan.dueDate) < today ? 'OVERDUE' : 'ACTIVE';
};

const getStatusBadge = (loan: Loan) => {
  const status = getLoanStatus(loan);
  if (status === 'OVERDUE') {
    return <StatusBadge variant="danger">Atrasado</StatusBadge>;
  }
  if (status === 'RETURNED') {
    return <StatusBadge variant="success">Devolvido</StatusBadge>;
  }
  return <StatusBadge variant="info">Em andamento</StatusBadge>;
};

export const LoansPage: React.FC = () => {
  const { loans, readers, books, copies, addLoan } = useLibrary();

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | DerivedLoanStatus
  >('ALL');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('ALL');
  const [sortBy, setSortBy] = useState<'loanDate' | 'dueDate'>('loanDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [isLoanDrawerOpen, setIsLoanDrawerOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [readerSearch, setReaderSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedReaderId, setSelectedReaderId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedCopyId, setSelectedCopyId] = useState('');
  const [loanDate, setLoanDate] = useState(todayValue());
  const [dueDate, setDueDate] = useState(addDays(todayValue(), 14));
  const [flowError, setFlowError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedReader = readers.find(
    (reader) => reader.id === selectedReaderId
  );
  const selectedBook = books.find((book) => book.id === selectedBookId);
  const selectedCopy = copies.find((copy) => copy.id === selectedCopyId);

  const activeLoans = loans.filter(
    (loan) => getLoanStatus(loan) === 'ACTIVE'
  );
  const overdueLoans = loans.filter(
    (loan) => getLoanStatus(loan) === 'OVERDUE'
  );
  const upcomingLoans = activeLoans.filter((loan) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil(
      (parseDate(loan.dueDate).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days >= 0 && days <= UPCOMING_DAYS;
  });

  const filteredLoans = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return loans
      .filter((loan) => {
        const status = getLoanStatus(loan);
        if (statusFilter !== 'ALL' && status !== statusFilter) return false;

        if (normalizedSearch) {
          const matches =
            loan.id.toLowerCase().includes(normalizedSearch) ||
            loan.readerName.toLowerCase().includes(normalizedSearch) ||
            loan.bookTitle.toLowerCase().includes(normalizedSearch) ||
            loan.copyCode.toLowerCase().includes(normalizedSearch);
          if (!matches) return false;
        }

        const date = parseDate(loan.loanDate);
        if (periodFilter === 'LAST_30' && date < thirtyDaysAgo) return false;
        if (
          periodFilter === 'CURRENT_MONTH' &&
          (date.getMonth() !== now.getMonth() ||
            date.getFullYear() !== now.getFullYear())
        ) {
          return false;
        }
        if (
          periodFilter === 'CURRENT_YEAR' &&
          date.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }

        return true;
      })
      .sort((first, second) => {
        const firstDate = parseDate(first[sortBy]).getTime();
        const secondDate = parseDate(second[sortBy]).getTime();
        return sortOrder === 'asc'
          ? firstDate - secondDate
          : secondDate - firstDate;
      });
  }, [loans, searchTerm, statusFilter, periodFilter, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, periodFilter, sortBy, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredLoans.length / PAGE_SIZE));
  const paginatedLoans = filteredLoans.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const availableReaders = useMemo(() => {
    const term = readerSearch.toLowerCase().trim();
    return readers
      .filter((reader) => {
        if (!term) return true;
        return (
          reader.name.toLowerCase().includes(term) ||
          (reader.identifier || reader.cpf || '')
            .toLowerCase()
            .includes(term)
        );
      })
      .sort((first, second) =>
        first.name.localeCompare(second.name, 'pt-BR')
      );
  }, [readers, readerSearch]);

  const availableBooks = useMemo(() => {
    const term = bookSearch.toLowerCase().trim();
    return books
      .filter((book) => {
        if (book.isArchived) return false;
        if (!term) return true;
        return (
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.isbn.toLowerCase().replace(/[-\s]/g, '').includes(
            term.replace(/[-\s]/g, '')
          )
        );
      })
      .sort((first, second) =>
        first.title.localeCompare(second.title, 'pt-BR')
      );
  }, [books, bookSearch]);

  const availableCopies = useMemo(() => {
    if (!selectedBookId) return [];
    return copies.filter((copy) => {
      if (copy.bookId !== selectedBookId || copy.status !== 'AVAILABLE') {
        return false;
      }
      return !loans.some(
        (loan) =>
          getLoanStatus(loan) !== 'RETURNED' &&
          (loan.copyId === copy.id ||
            (!loan.copyId &&
              loan.bookId === copy.bookId &&
              loan.copyCode === copy.code))
      );
    });
  }, [copies, loans, selectedBookId]);

  const resetFlow = () => {
    const today = todayValue();
    setStep(1);
    setReaderSearch('');
    setBookSearch('');
    setSelectedReaderId('');
    setSelectedBookId('');
    setSelectedCopyId('');
    setLoanDate(today);
    setDueDate(addDays(today, 14));
    setFlowError('');
    setIsSubmitting(false);
  };

  const openLoanFlow = () => {
    resetFlow();
    setIsLoanDrawerOpen(true);
  };

  const closeLoanFlow = () => {
    setIsLoanDrawerOpen(false);
    resetFlow();
  };

  const goToNextStep = () => {
    setFlowError('');
    if (step === 1) {
      if (!selectedReader) {
        setFlowError('Selecione um leitor existente para continuar.');
        return;
      }
      if (selectedReader.status !== 'REGULAR') {
        setFlowError(
          'O leitor selecionado está inativo ou suspenso e não pode realizar empréstimos.'
        );
        return;
      }
    }
    if (step === 2) {
      if (!selectedBook || !selectedCopy) {
        setFlowError('Selecione um livro e um exemplar disponível.');
        return;
      }
      if (selectedBook.isArchived || selectedCopy.status !== 'AVAILABLE') {
        setFlowError('O livro ou exemplar selecionado não está disponível.');
        return;
      }
    }
    if (step === 3) {
      const parsedLoanDate = parseDate(loanDate);
      const parsedDueDate = parseDate(dueDate);
      const today = parseDate(todayValue());
      if (
        !loanDate ||
        !dueDate ||
        Number.isNaN(parsedLoanDate.getTime()) ||
        Number.isNaN(parsedDueDate.getTime())
      ) {
        setFlowError('Informe datas válidas para continuar.');
        return;
      }
      if (parsedLoanDate > today) {
        setFlowError('A data do empréstimo não pode estar no futuro.');
        return;
      }
      if (parsedDueDate <= parsedLoanDate) {
        setFlowError(
          'A previsão de devolução deve ser posterior à data do empréstimo.'
        );
        return;
      }
    }
    setStep((current) => Math.min(4, current + 1));
  };

  const confirmLoan = () => {
    setFlowError('');
    setIsSubmitting(true);
    const result = addLoan({
      readerId: selectedReaderId,
      copyId: selectedCopyId,
      loanDate,
      dueDate,
    });
    setIsSubmitting(false);
    if (!result.success) {
      setFlowError(
        result.error ||
          'Não foi possível registrar o empréstimo. Revise os dados.'
      );
      return;
    }
    closeLoanFlow();
  };

  const stepLabels = ['Leitor', 'Exemplar', 'Datas', 'Revisão'];

  const renderWizardStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <SearchField
            value={readerSearch}
            onChange={setReaderSearch}
            placeholder="Buscar por nome ou matrícula..."
          />
          <div className="space-y-2">
            {availableReaders.map((reader) => {
              const isSelected = reader.id === selectedReaderId;
              const isAvailable = reader.status === 'REGULAR';
              return (
                <Button
                  key={reader.id}
                  type="button"
                  variant={isSelected ? 'secondary' : 'outline'}
                  disabled={!isAvailable}
                  onClick={() => {
                    setSelectedReaderId(reader.id);
                    setFlowError('');
                  }}
                  className="w-full justify-start p-3 text-left"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="shrink-0 rounded-lg bg-[#F2E9DE] p-2 text-[#6F4E37]">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#2F241C]">
                        {reader.name}
                      </span>
                      <span className="block truncate text-xs text-[#6D5A4D]">
                        {reader.identifier || reader.cpf || reader.id}
                        {reader.course ? ` • ${reader.course}` : ''}
                      </span>
                    </span>
                    <StatusBadge
                      variant={isAvailable ? 'success' : 'warning'}
                    >
                      {isAvailable ? 'Regular' : 'Indisponível'}
                    </StatusBadge>
                  </span>
                </Button>
              );
            })}
            {availableReaders.length === 0 && (
              <EmptyState
                icon={<UserRound className="h-5 w-5" />}
                title="Nenhum leitor encontrado"
                description="Revise os termos usados na pesquisa."
                className="py-7"
              />
            )}
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            <SearchField
              value={bookSearch}
              onChange={setBookSearch}
              placeholder="Buscar por título, autor ou ISBN..."
            />
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {availableBooks.map((book) => {
                const isSelected = book.id === selectedBookId;
                const count = copies.filter(
                  (copy) =>
                    copy.bookId === book.id && copy.status === 'AVAILABLE'
                ).length;
                return (
                  <Button
                    key={book.id}
                    type="button"
                    variant={isSelected ? 'secondary' : 'outline'}
                    disabled={count === 0}
                    onClick={() => {
                      setSelectedBookId(book.id);
                      setSelectedCopyId('');
                      setFlowError('');
                    }}
                    className="w-full justify-start p-3 text-left"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 rounded-lg bg-[#F2E9DE] p-2 text-[#6F4E37]">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#2F241C]">
                          {book.title}
                        </span>
                        <span className="block truncate text-xs text-[#6D5A4D]">
                          {book.author} • {book.category}
                        </span>
                      </span>
                      <StatusBadge variant={count > 0 ? 'success' : 'danger'}>
                        {count} disp.
                      </StatusBadge>
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {selectedBook && (
            <div className="border-t border-[#E7DED2] pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6D5A4D]">
                Selecione o exemplar físico
              </p>
              {availableCopies.length === 0 ? (
                <EmptyState
                  icon={<Library className="h-5 w-5" />}
                  title="Nenhum exemplar disponível"
                  description="Todos os exemplares deste título estão emprestados, em manutenção ou extraviados."
                  className="py-7"
                />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {availableCopies.map((copy) => (
                    <Button
                      key={copy.id}
                      type="button"
                      variant={
                        copy.id === selectedCopyId ? 'secondary' : 'outline'
                      }
                      onClick={() => {
                        setSelectedCopyId(copy.id);
                        setFlowError('');
                      }}
                      className="justify-start p-3 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block font-mono text-xs font-bold text-[#2F241C]">
                          {copy.code}
                        </span>
                        <span className="flex items-center gap-1 truncate text-[11px] text-[#6D5A4D]">
                          <MapPin className="h-3 w-3" />
                          {copy.location}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E7DED2] bg-[#F8F4EE] p-4">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-[#6F4E37]" />
              <div>
                <p className="text-sm font-semibold text-[#2F241C]">
                  Prazo demonstrativo do MVP
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#6D5A4D]">
                  A previsão foi preenchida com 14 dias, mas pode ser ajustada
                  pelo funcionário antes da confirmação.
                </p>
              </div>
            </div>
          </div>
          <Input
            label="Data do Empréstimo *"
            type="date"
            max={todayValue()}
            value={loanDate}
            onChange={(event) => {
              const value = event.target.value;
              setLoanDate(value);
              if (value) setDueDate(addDays(value, 14));
              setFlowError('');
            }}
          />
          <Input
            label="Previsão de Devolução *"
            type="date"
            min={loanDate ? addDays(loanDate, 1) : undefined}
            value={dueDate}
            onChange={(event) => {
              setDueDate(event.target.value);
              setFlowError('');
            }}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-[#C8A97E]/70 bg-[#F8F4EE] p-4">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#2E7D32]" />
            <p className="text-sm font-semibold text-[#2F241C]">
              Revise os dados antes de confirmar
            </p>
          </div>
          <dl className="space-y-3 text-xs">
            <div>
              <dt className="text-[#6D5A4D]">Leitor</dt>
              <dd className="font-semibold text-[#2F241C]">
                {selectedReader?.name}
              </dd>
              <dd className="font-mono text-[#6D5A4D]">
                {selectedReader?.identifier ||
                  selectedReader?.cpf ||
                  selectedReader?.id}
              </dd>
            </div>
            <div className="border-t border-[#E7DED2] pt-3">
              <dt className="text-[#6D5A4D]">Livro e exemplar</dt>
              <dd className="font-semibold text-[#2F241C]">
                {selectedBook?.title}
              </dd>
              <dd className="font-mono text-[#6D5A4D]">
                {selectedCopy?.code} • {selectedCopy?.location}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[#E7DED2] pt-3">
              <div>
                <dt className="text-[#6D5A4D]">Empréstimo</dt>
                <dd className="font-semibold text-[#2F241C]">
                  {formatDate(loanDate)}
                </dd>
              </div>
              <div>
                <dt className="text-[#6D5A4D]">Devolução prevista</dt>
                <dd className="font-semibold text-[#2F241C]">
                  {formatDate(dueDate)}
                </dd>
              </div>
            </div>
          </dl>
        </div>
        <p className="text-xs leading-relaxed text-[#6D5A4D]">
          Ao confirmar, o exemplar será marcado como emprestado e deixará de
          aparecer entre os exemplares disponíveis.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empréstimos"
        subtitle="Registro e acompanhamento da circulação de exemplares"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={openLoanFlow}
          >
            Novo empréstimo
          </Button>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por leitor, livro, exemplar ou código..."
      />

      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'Ativos',
              value: activeLoans.length,
              icon: <ArrowUpRight className="h-5 w-5" />,
              tone: 'bg-[#E3F2FD] text-[#1565C0]',
            },
            {
              label: 'Atrasados',
              value: overdueLoans.length,
              icon: <AlertTriangle className="h-5 w-5" />,
              tone: 'bg-[#FFEBEE] text-[#C62828]',
            },
            {
              label: 'Próximos do vencimento',
              value: upcomingLoans.length,
              icon: <Clock3 className="h-5 w-5" />,
              tone: 'bg-[#FFF8E1] text-[#B76E00]',
            },
            {
              label: 'Total registrado',
              value: loans.length,
              icon: <Library className="h-5 w-5" />,
              tone: 'bg-[#F2E9DE] text-[#6F4E37]',
            },
          ].map((indicator) => (
            <Card key={indicator.label}>
              <div className="flex min-h-20 items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#6D5A4D]">
                    {indicator.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#2F241C]">
                    {indicator.value}
                  </p>
                </div>
                <span className={`shrink-0 rounded-lg p-2 ${indicator.tone}`}>
                  {indicator.icon}
                </span>
              </div>
            </Card>
          ))}
        </section>

        <section className="rounded-xl border border-[#E7DED2] bg-[#FFFDF9] p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'ALL' | DerivedLoanStatus
                )
              }
              options={[
                { value: 'ALL', label: 'Todos os status' },
                { value: 'ACTIVE', label: 'Em andamento' },
                { value: 'OVERDUE', label: 'Atrasados' },
                { value: 'RETURNED', label: 'Devolvidos' },
              ]}
            />
            <Select
              label="Período do empréstimo"
              value={periodFilter}
              onChange={(event) =>
                setPeriodFilter(event.target.value as PeriodFilter)
              }
              options={[
                { value: 'ALL', label: 'Todo o período' },
                { value: 'LAST_30', label: 'Últimos 30 dias' },
                { value: 'CURRENT_MONTH', label: 'Mês atual' },
                { value: 'CURRENT_YEAR', label: 'Ano atual' },
              ]}
            />
            <Select
              label="Ordenar por"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as 'loanDate' | 'dueDate')
              }
              options={[
                { value: 'loanDate', label: 'Data do empréstimo' },
                { value: 'dueDate', label: 'Previsão de devolução' },
              ]}
            />
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#6D5A4D]">
                Ordem
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
                {sortOrder === 'asc' ? 'Mais antigos primeiro' : 'Mais recentes primeiro'}
              </Button>
            </div>
          </div>
          <p className="mt-3 border-t border-[#E7DED2] pt-3 text-xs text-[#6D5A4D]">
            Exibindo <strong>{filteredLoans.length}</strong> de{' '}
            <strong>{loans.length}</strong> empréstimo(s).
          </p>
        </section>

        {filteredLoans.length === 0 ? (
          <EmptyState
            icon={<ArrowUpRight className="h-6 w-6" />}
            title="Nenhum empréstimo encontrado"
            description="Não há movimentações correspondentes aos filtros selecionados."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setPeriodFilter('ALL');
                }}
              >
                Limpar filtros
              </Button>
            }
          />
        ) : (
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
                  {
                    key: 'readerName',
                    header: 'Leitor',
                    render: (loan) => (
                      <div>
                        <p className="text-sm font-semibold text-[#2F241C]">
                          {loan.readerName}
                        </p>
                        <p className="text-[11px] text-[#6D5A4D]">
                          {readers.find((reader) => reader.id === loan.readerId)
                            ?.identifier || loan.readerId}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: 'bookTitle',
                    header: 'Livro',
                    render: (loan) => (
                      <p className="max-w-52 truncate text-xs font-medium text-[#2F241C]">
                        {loan.bookTitle}
                      </p>
                    ),
                  },
                  {
                    key: 'copyCode',
                    header: 'Exemplar',
                    render: (loan) => (
                      <span className="font-mono text-xs text-[#2F241C]">
                        {loan.copyCode}
                      </span>
                    ),
                  },
                  {
                    key: 'loanDate',
                    header: 'Empréstimo',
                    render: (loan) => (
                      <span className="text-xs text-[#6D5A4D]">
                        {formatDate(loan.loanDate)}
                      </span>
                    ),
                  },
                  {
                    key: 'dueDate',
                    header: 'Previsão',
                    render: (loan) => (
                      <span className="text-xs text-[#6D5A4D]">
                        {formatDate(loan.dueDate)}
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (loan) => getStatusBadge(loan),
                  },
                  {
                    key: 'actions',
                    header: 'Ações',
                    className: 'text-right',
                    render: (loan) => (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="h-3.5 w-3.5" />}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedLoan(loan);
                        }}
                      >
                        Detalhes
                      </Button>
                    ),
                  },
                ]}
                data={paginatedLoans}
                keyExtractor={(loan) => loan.id}
                onRowClick={setSelectedLoan}
              />
            </div>

            <div className="space-y-3 md:hidden">
              {paginatedLoans.map((loan) => (
                <Card
                  key={loan.id}
                  variant="interactive"
                  onClick={() => setSelectedLoan(loan)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] font-semibold text-[#6F4E37]">
                        {loan.id}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-bold text-[#2F241C]">
                        {loan.readerName}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-[#6D5A4D]">
                        {loan.bookTitle}
                      </p>
                    </div>
                    {getStatusBadge(loan)}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#E7DED2] pt-3 text-xs">
                    <div>
                      <span className="block text-[10px] text-[#6D5A4D]">
                        Exemplar
                      </span>
                      <span className="font-mono font-semibold">
                        {loan.copyCode}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#6D5A4D]">
                        Empréstimo
                      </span>
                      <span>{formatDate(loan.loanDate)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#6D5A4D]">
                        Previsão
                      </span>
                      <span>{formatDate(loan.dueDate)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[#6D5A4D]">
                  Página {page} de {pageCount}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pageCount}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Drawer
        isOpen={isLoanDrawerOpen}
        onClose={closeLoanFlow}
        title="Novo empréstimo"
        description={`Passo ${step} de 4 — ${stepLabels[step - 1]}`}
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <Button variant="ghost" onClick={closeLoanFlow}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  onClick={() => {
                    setFlowError('');
                    setStep((current) => current - 1);
                  }}
                >
                  Voltar
                </Button>
              )}
              {step < 4 ? (
                <Button
                  variant="primary"
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                  onClick={goToNextStep}
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  variant="primary"
                  icon={<Check className="h-4 w-4" />}
                  disabled={isSubmitting}
                  onClick={confirmLoan}
                >
                  {isSubmitting ? 'Confirmando...' : 'Confirmar empréstimo'}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-2">
            {stepLabels.map((label, index) => {
              const number = index + 1;
              const completed = number < step;
              const current = number === step;
              return (
                <div key={label} className="text-center">
                  <div
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                      completed
                        ? 'border-[#6F4E37] bg-[#6F4E37] text-white'
                        : current
                        ? 'border-[#C8A97E] bg-[#F2E9DE] text-[#6F4E37]'
                        : 'border-[#E7DED2] bg-[#FFFDF9] text-[#9B887B]'
                    }`}
                  >
                    {completed ? <Check className="h-4 w-4" /> : number}
                  </div>
                  <p
                    className={`mt-1 truncate text-[10px] ${
                      current ? 'font-semibold text-[#6F4E37]' : 'text-[#6D5A4D]'
                    }`}
                  >
                    {label}
                  </p>
                </div>
              );
            })}
          </div>

          {flowError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-[#C62828]/30 bg-[#FFEBEE] p-3 text-xs text-[#C62828]"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{flowError}</p>
            </div>
          )}

          {renderWizardStep()}
        </div>
      </Drawer>

      {selectedLoan && (
        <Modal
          isOpen={Boolean(selectedLoan)}
          onClose={() => setSelectedLoan(null)}
          title="Ficha do empréstimo"
          description={`Registro ${selectedLoan.id}`}
          footer={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLoan(null)}
            >
              Fechar
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs font-semibold text-[#6F4E37]">
                {selectedLoan.id}
              </p>
              {getStatusBadge(selectedLoan)}
            </div>
            <div className="space-y-3 rounded-xl border border-[#E7DED2] bg-[#F8F4EE] p-4 text-xs">
              <div>
                <span className="block text-[#6D5A4D]">Leitor</span>
                <span className="font-semibold text-[#2F241C]">
                  {selectedLoan.readerName}
                </span>
                <span className="block font-mono text-[11px] text-[#6D5A4D]">
                  {readers.find(
                    (reader) => reader.id === selectedLoan.readerId
                  )?.identifier || selectedLoan.readerId}
                </span>
              </div>
              <div className="border-t border-[#E7DED2] pt-3">
                <span className="block text-[#6D5A4D]">Livro</span>
                <span className="font-semibold text-[#2F241C]">
                  {selectedLoan.bookTitle}
                </span>
                <span className="block font-mono text-[11px] text-[#6D5A4D]">
                  {selectedLoan.copyCode}
                  {selectedLoan.copyId ? ` • ${selectedLoan.copyId}` : ''}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#E7DED2] p-3 text-xs">
              <div>
                <span className="block text-[#6D5A4D]">Empréstimo</span>
                <span className="font-semibold">
                  {formatDate(selectedLoan.loanDate)}
                </span>
              </div>
              <div>
                <span className="block text-[#6D5A4D]">
                  Devolução prevista
                </span>
                <span className="font-semibold">
                  {formatDate(selectedLoan.dueDate)}
                </span>
              </div>
              {selectedLoan.returnDate && (
                <div>
                  <span className="block text-[#6D5A4D]">
                    Devolução efetiva
                  </span>
                  <span className="font-semibold text-[#2E7D32]">
                    {formatDate(selectedLoan.returnDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
