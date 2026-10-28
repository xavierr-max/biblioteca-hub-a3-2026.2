import React, { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Table } from '../components/ui/Table';
import { useLibrary } from '../context/LibraryContext';
import { Loan } from '../types/library';
import {
  AlertTriangle,
  ArrowDownLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  Library,
  RotateCcw,
  UserRound,
} from 'lucide-react';

type ReturnTab = 'PENDING' | 'HISTORY';

const UPCOMING_DAYS = 3;

const parseDate = (value: string) => new Date(`${value}T12:00:00`);

const todayValue = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .split('T')[0];
};

const formatDate = (value?: string) =>
  value ? new Intl.DateTimeFormat('pt-BR').format(parseDate(value)) : '—';

const isReturned = (loan: Loan) =>
  loan.status === 'RETURNED' || Boolean(loan.returnDate);

const isOverdue = (loan: Loan) => {
  if (isReturned(loan)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDate(loan.dueDate) < today;
};

const isUpcoming = (loan: Loan) => {
  if (isReturned(loan) || isOverdue(loan)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil(
    (parseDate(loan.dueDate).getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return days >= 0 && days <= UPCOMING_DAYS;
};

const wasReturnedLate = (loan: Loan) =>
  Boolean(
    loan.returnDate &&
      parseDate(loan.returnDate).getTime() > parseDate(loan.dueDate).getTime()
  );

const pendingStatusBadge = (loan: Loan) => {
  if (isOverdue(loan)) {
    return <StatusBadge variant="danger">Atrasado</StatusBadge>;
  }
  if (isUpcoming(loan)) {
    return <StatusBadge variant="warning">Próximo do vencimento</StatusBadge>;
  }
  return <StatusBadge variant="info">Aguardando devolução</StatusBadge>;
};

const historyStatusBadge = (loan: Loan) =>
  wasReturnedLate(loan) ? (
    <StatusBadge variant="warning">Devolvido com atraso</StatusBadge>
  ) : (
    <StatusBadge variant="success">Devolvido no prazo</StatusBadge>
  );

export const ReturnsPage: React.FC = () => {
  const { loans, books, readers, copies, registerReturn } = useLibrary();
  const [activeTab, setActiveTab] = useState<ReturnTab>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [detailsLoan, setDetailsLoan] = useState<Loan | null>(null);
  const [returnDate, setReturnDate] = useState(todayValue());
  const [returnError, setReturnError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingLoans = loans.filter((loan) => !isReturned(loan));
  const returnedLoans = loans.filter(isReturned);
  const overdueLoans = pendingLoans.filter(isOverdue);
  const upcomingLoans = pendingLoans.filter(isUpcoming);

  const displayedLoans = useMemo(() => {
    const source = activeTab === 'PENDING' ? pendingLoans : returnedLoans;
    const term = searchTerm.toLowerCase().trim();
    return source
      .filter((loan) => {
        if (!term) return true;
        return (
          loan.id.toLowerCase().includes(term) ||
          loan.bookTitle.toLowerCase().includes(term) ||
          loan.readerName.toLowerCase().includes(term) ||
          loan.copyCode.toLowerCase().includes(term)
        );
      })
      .sort((first, second) => {
        if (activeTab === 'HISTORY') {
          return (
            parseDate(second.returnDate || second.dueDate).getTime() -
            parseDate(first.returnDate || first.dueDate).getTime()
          );
        }
        return (
          parseDate(first.dueDate).getTime() -
          parseDate(second.dueDate).getTime()
        );
      });
  }, [activeTab, pendingLoans, returnedLoans, searchTerm]);

  const openReturnModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setReturnDate(todayValue());
    setReturnError('');
  };

  const closeReturnModal = () => {
    setSelectedLoan(null);
    setReturnDate(todayValue());
    setReturnError('');
    setIsSubmitting(false);
  };

  const confirmReturn = () => {
    if (!selectedLoan) return;
    setIsSubmitting(true);
    setReturnError('');
    const result = registerReturn(selectedLoan.id, returnDate);
    setIsSubmitting(false);
    if (!result.success) {
      setReturnError(
        result.error || 'Não foi possível registrar esta devolução.'
      );
      return;
    }
    closeReturnModal();
  };

  const getBook = (loan: Loan) =>
    books.find((book) => book.id === loan.bookId);
  const getReader = (loan: Loan) =>
    readers.find((reader) => reader.id === loan.readerId);
  const getCopy = (loan: Loan) =>
    loan.copyId
      ? copies.find((copy) => copy.id === loan.copyId)
      : copies.find(
          (copy) =>
            copy.bookId === loan.bookId && copy.code === loan.copyCode
        );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devoluções"
        subtitle="Recebimento de exemplares e histórico de devoluções"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por livro, leitor, exemplar ou empréstimo..."
      />

      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'Aguardando devolução',
              value: pendingLoans.length,
              icon: <ArrowDownLeft className="h-5 w-5" />,
              tone: 'bg-[#E3F2FD] text-[#1565C0]',
            },
            {
              label: 'Em atraso',
              value: overdueLoans.length,
              icon: <AlertTriangle className="h-5 w-5" />,
              tone: 'bg-[#FFEBEE] text-[#C62828]',
            },
            {
              label: 'Vencem em até 3 dias',
              value: upcomingLoans.length,
              icon: <Clock3 className="h-5 w-5" />,
              tone: 'bg-[#FFF8E1] text-[#B76E00]',
            },
            {
              label: 'Devoluções concluídas',
              value: returnedLoans.length,
              icon: <CheckCircle2 className="h-5 w-5" />,
              tone: 'bg-[#EDF7ED] text-[#2E7D32]',
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

        <section className="flex items-center gap-2 border-b border-[#E7DED2]">
          <Button
            variant="ghost"
            className={`rounded-b-none border-b-2 ${
              activeTab === 'PENDING'
                ? 'border-[#6F4E37] text-[#6F4E37]'
                : 'border-transparent text-[#6D5A4D]'
            }`}
            onClick={() => setActiveTab('PENDING')}
          >
            Pendentes ({pendingLoans.length})
          </Button>
          <Button
            variant="ghost"
            className={`rounded-b-none border-b-2 ${
              activeTab === 'HISTORY'
                ? 'border-[#6F4E37] text-[#6F4E37]'
                : 'border-transparent text-[#6D5A4D]'
            }`}
            onClick={() => setActiveTab('HISTORY')}
          >
            Histórico ({returnedLoans.length})
          </Button>
        </section>

        <div>
          <h2 className="text-base font-bold text-[#2F241C]">
            {activeTab === 'PENDING'
              ? 'Empréstimos aguardando devolução'
              : 'Histórico de devoluções concluídas'}
          </h2>
          <p className="mt-0.5 text-xs text-[#6D5A4D]">
            Exibindo {displayedLoans.length} registro(s) nesta consulta.
          </p>
        </div>

        {displayedLoans.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'PENDING' ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Library className="h-6 w-6" />
              )
            }
            title={
              searchTerm
                ? 'Nenhum registro encontrado'
                : activeTab === 'PENDING'
                ? 'Nenhuma devolução pendente'
                : 'Nenhuma devolução concluída'
            }
            description={
              searchTerm
                ? 'Revise os termos da pesquisa ou limpe a busca.'
                : activeTab === 'PENDING'
                ? 'Todos os exemplares emprestados já foram recebidos.'
                : 'As devoluções registradas aparecerão neste histórico.'
            }
            action={
              searchTerm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                >
                  Limpar busca
                </Button>
              ) : undefined
            }
          />
        ) : (
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
                  {
                    key: 'bookTitle',
                    header: 'Livro',
                    render: (loan) => (
                      <div>
                        <p className="max-w-52 truncate text-sm font-semibold text-[#2F241C]">
                          {loan.bookTitle}
                        </p>
                        <p className="max-w-52 truncate text-[11px] text-[#6D5A4D]">
                          {getBook(loan)?.author || 'Autor não localizado'}
                        </p>
                      </div>
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
                    key: 'readerName',
                    header: 'Leitor',
                    render: (loan) => (
                      <div>
                        <p className="text-xs font-medium text-[#2F241C]">
                          {loan.readerName}
                        </p>
                        <p className="text-[11px] text-[#6D5A4D]">
                          {getReader(loan)?.identifier || loan.readerId}
                        </p>
                      </div>
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
                    header:
                      activeTab === 'PENDING'
                        ? 'Prazo'
                        : 'Prazo / Devolução',
                    render: (loan) => (
                      <div className="text-xs text-[#6D5A4D]">
                        <span className="block">{formatDate(loan.dueDate)}</span>
                        {activeTab === 'HISTORY' && (
                          <span className="block font-semibold text-[#2F241C]">
                            {formatDate(loan.returnDate)}
                          </span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Situação',
                    render: (loan) =>
                      activeTab === 'PENDING'
                        ? pendingStatusBadge(loan)
                        : historyStatusBadge(loan),
                  },
                  {
                    key: 'actions',
                    header: 'Ações',
                    className: 'text-right',
                    render: (loan) =>
                      activeTab === 'PENDING' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<RotateCcw className="h-3.5 w-3.5" />}
                          onClick={(event) => {
                            event.stopPropagation();
                            openReturnModal(loan);
                          }}
                        >
                          Registrar devolução
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye className="h-3.5 w-3.5" />}
                          onClick={(event) => {
                            event.stopPropagation();
                            setDetailsLoan(loan);
                          }}
                        >
                          Detalhes
                        </Button>
                      ),
                  },
                ]}
                data={displayedLoans}
                keyExtractor={(loan) => loan.id}
                onRowClick={(loan) =>
                  activeTab === 'PENDING'
                    ? openReturnModal(loan)
                    : setDetailsLoan(loan)
                }
              />
            </div>

            <div className="space-y-3 md:hidden">
              {displayedLoans.map((loan) => (
                <Card
                  key={loan.id}
                  variant="interactive"
                  onClick={() =>
                    activeTab === 'PENDING'
                      ? openReturnModal(loan)
                      : setDetailsLoan(loan)
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] font-semibold text-[#6F4E37]">
                        {loan.id}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-sm font-bold text-[#2F241C]">
                        {loan.bookTitle}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#6D5A4D]">
                        {loan.readerName}
                      </p>
                    </div>
                    {activeTab === 'PENDING'
                      ? pendingStatusBadge(loan)
                      : historyStatusBadge(loan)}
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
                        Prazo
                      </span>
                      <span>{formatDate(loan.dueDate)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#6D5A4D]">
                        {activeTab === 'PENDING' ? 'Ação' : 'Devolvido em'}
                      </span>
                      {activeTab === 'PENDING' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="mt-1"
                          onClick={(event) => {
                            event.stopPropagation();
                            openReturnModal(loan);
                          }}
                        >
                          Receber
                        </Button>
                      ) : (
                        <span>{formatDate(loan.returnDate)}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedLoan && (
        <Modal
          isOpen={Boolean(selectedLoan)}
          onClose={closeReturnModal}
          title="Registrar devolução"
          description={`Empréstimo ${selectedLoan.id}`}
          footer={
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="outline" onClick={closeReturnModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                icon={<CheckCircle2 className="h-4 w-4" />}
                disabled={isSubmitting}
                onClick={confirmReturn}
              >
                {isSubmitting ? 'Confirmando...' : 'Confirmar devolução'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {returnError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-[#C62828]/30 bg-[#FFEBEE] p-3 text-xs text-[#C62828]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{returnError}</p>
              </div>
            )}

            <div className="space-y-3 rounded-xl border border-[#E7DED2] bg-[#F8F4EE] p-4">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-[#F2E9DE] p-2 text-[#6F4E37]">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#2F241C]">
                    {selectedLoan.bookTitle}
                  </p>
                  <p className="text-xs text-[#6D5A4D]">
                    {getBook(selectedLoan)?.author || 'Autor não localizado'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-[#E7DED2] pt-3 text-xs">
                <div>
                  <span className="block text-[#6D5A4D]">Exemplar</span>
                  <span className="font-mono font-semibold text-[#2F241C]">
                    {selectedLoan.copyCode}
                  </span>
                  <span className="block text-[11px] text-[#6D5A4D]">
                    {getCopy(selectedLoan)?.location || 'Localização não encontrada'}
                  </span>
                </div>
                <div>
                  <span className="block text-[#6D5A4D]">Leitor</span>
                  <span className="font-semibold text-[#2F241C]">
                    {selectedLoan.readerName}
                  </span>
                  <span className="block font-mono text-[11px] text-[#6D5A4D]">
                    {getReader(selectedLoan)?.identifier || selectedLoan.readerId}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#E7DED2] p-3 text-xs">
              <div>
                <span className="block text-[#6D5A4D]">Empréstimo</span>
                <span className="font-semibold text-[#2F241C]">
                  {formatDate(selectedLoan.loanDate)}
                </span>
              </div>
              <div>
                <span className="block text-[#6D5A4D]">Prazo previsto</span>
                <span className="font-semibold text-[#2F241C]">
                  {formatDate(selectedLoan.dueDate)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="mb-1 block text-[#6D5A4D]">
                  Situação atual
                </span>
                {pendingStatusBadge(selectedLoan)}
              </div>
            </div>

            <Input
              label="Data efetiva da devolução *"
              type="date"
              min={selectedLoan.loanDate}
              max={todayValue()}
              value={returnDate}
              onChange={(event) => {
                setReturnDate(event.target.value);
                setReturnError('');
              }}
              helperText="Pode ser ajustada para registrar um recebimento ocorrido anteriormente."
            />
          </div>
        </Modal>
      )}

      {detailsLoan && (
        <Modal
          isOpen={Boolean(detailsLoan)}
          onClose={() => setDetailsLoan(null)}
          title="Detalhes da devolução"
          description={`Empréstimo ${detailsLoan.id}`}
          footer={
            <Button variant="outline" onClick={() => setDetailsLoan(null)}>
              Fechar
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs font-semibold text-[#6F4E37]">
                {detailsLoan.copyCode}
              </p>
              {historyStatusBadge(detailsLoan)}
            </div>
            <div className="space-y-3 rounded-xl border border-[#E7DED2] bg-[#F8F4EE] p-4 text-xs">
              <div>
                <span className="block text-[#6D5A4D]">Livro</span>
                <span className="font-semibold text-[#2F241C]">
                  {detailsLoan.bookTitle}
                </span>
              </div>
              <div>
                <span className="block text-[#6D5A4D]">Leitor</span>
                <span className="font-semibold text-[#2F241C]">
                  {detailsLoan.readerName}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#E7DED2] p-3 text-xs">
              <div>
                <span className="block text-[#6D5A4D]">Empréstimo</span>
                <span className="font-semibold">
                  {formatDate(detailsLoan.loanDate)}
                </span>
              </div>
              <div>
                <span className="block text-[#6D5A4D]">Prazo</span>
                <span className="font-semibold">
                  {formatDate(detailsLoan.dueDate)}
                </span>
              </div>
              <div>
                <span className="block text-[#6D5A4D]">Devolução</span>
                <span className="font-semibold text-[#2E7D32]">
                  {formatDate(detailsLoan.returnDate)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
