import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { useLibrary } from '../context/LibraryContext';
import { RouteId } from '../types/library';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Library,
  UserPlus,
  Users,
} from 'lucide-react';

const UPCOMING_DUE_DAYS = 3;

const parseDate = (date: string) => new Date(`${date}T12:00:00`);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parseDate(date));

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const DashboardPage: React.FC = () => {
  const { books, readers, loans, users, setCurrentRoute } = useLibrary();

  const today = startOfToday();
  const totalCopies = books.reduce((total, book) => total + book.totalCopies, 0);
  const availableCopies = books.reduce(
    (total, book) => total + book.availableCopies,
    0
  );
  const openLoans = loans.filter((loan) => loan.status !== 'RETURNED');
  const overdueLoans = openLoans
    .filter((loan) => parseDate(loan.dueDate) < today)
    .sort(
      (first, second) =>
        parseDate(first.dueDate).getTime() - parseDate(second.dueDate).getTime()
    );
  const upcomingLoans = openLoans
    .filter((loan) => {
      const dueDate = parseDate(loan.dueDate);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDue >= 0 && daysUntilDue <= UPCOMING_DUE_DAYS;
    })
    .sort(
      (first, second) =>
        parseDate(first.dueDate).getTime() - parseDate(second.dueDate).getTime()
    );
  const unavailableBooks = books.filter((book) => book.availableCopies === 0);

  const stats = [
    {
      title: 'Títulos cadastrados',
      value: books.length,
      subtitle: 'Obras catalogadas',
      icon: <BookOpen className="h-5 w-5" />,
      route: 'books' as RouteId,
    },
    {
      title: 'Exemplares físicos',
      value: totalCopies,
      subtitle: 'Unidades do acervo',
      icon: <Library className="h-5 w-5" />,
      route: 'books' as RouteId,
    },
    {
      title: 'Leitores cadastrados',
      value: readers.length,
      subtitle: 'Pessoas registradas',
      icon: <Users className="h-5 w-5" />,
      route: 'readers' as RouteId,
    },
    {
      title: 'Empréstimos ativos',
      value: openLoans.length,
      subtitle: 'Ainda não devolvidos',
      icon: <ArrowUpRight className="h-5 w-5" />,
      route: 'loans' as RouteId,
    },
    {
      title: 'Empréstimos atrasados',
      value: overdueLoans.length,
      subtitle: 'Calculados pela data prevista',
      icon: <AlertTriangle className="h-5 w-5" />,
      route: 'returns' as RouteId,
      emphasis: overdueLoans.length > 0,
    },
    {
      title: 'Exemplares disponíveis',
      value: availableCopies,
      subtitle: 'Prontos para empréstimo',
      icon: <CheckCircle2 className="h-5 w-5" />,
      route: 'books' as RouteId,
    },
  ];

  const activities = [
    ...loans.map((loan) => ({
      id: `loan-${loan.id}`,
      date: loan.loanDate,
      title: 'Empréstimo registrado',
      description: `${loan.bookTitle} para ${loan.readerName}`,
      icon: <ArrowUpRight className="h-4 w-4" />,
      variant: 'info' as const,
    })),
    ...loans
      .filter((loan) => loan.returnDate)
      .map((loan) => ({
        id: `return-${loan.id}`,
        date: loan.returnDate as string,
        title: 'Devolução realizada',
        description: `${loan.bookTitle} por ${loan.readerName}`,
        icon: <ArrowDownLeft className="h-4 w-4" />,
        variant: 'success' as const,
      })),
    ...readers.map((reader) => ({
      id: `reader-${reader.id}`,
      date: reader.registrationDate,
      title: 'Leitor cadastrado',
      description: reader.name,
      icon: <UserPlus className="h-4 w-4" />,
      variant: 'neutral' as const,
    })),
    ...users.map((user) => ({
      id: `user-${user.id}`,
      date: user.createdAt,
      title: 'Usuário do sistema cadastrado',
      description: user.name,
      icon: <Users className="h-4 w-4" />,
      variant: 'neutral' as const,
    })),
  ]
    .sort(
      (first, second) =>
        parseDate(second.date).getTime() - parseDate(first.date).getTime()
    )
    .slice(0, 6);

  const shortcuts: Array<{
    label: string;
    description: string;
    route: RouteId;
    icon: React.ReactNode;
  }> = [
    {
      label: 'Novo livro',
      description: 'Ir para Livros e Acervo',
      route: 'books',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: 'Novo leitor',
      description: 'Ir para Leitores',
      route: 'readers',
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      label: 'Novo empréstimo',
      description: 'Ir para Empréstimos',
      route: 'loans',
      icon: <ArrowUpRight className="h-5 w-5" />,
    },
    {
      label: 'Registrar devolução',
      description: 'Ir para Devoluções',
      route: 'returns',
      icon: <ArrowDownLeft className="h-5 w-5" />,
    },
  ];

  const operationalAlerts = [
    ...overdueLoans.map((loan) => ({
      id: `overdue-${loan.id}`,
      title: 'Prazo de devolução vencido',
      description: `${loan.readerName} • ${loan.bookTitle}`,
      meta: `Venceu em ${formatDate(loan.dueDate)}`,
      icon: <CircleAlert className="h-4 w-4" />,
      variant: 'danger' as const,
      route: 'returns' as RouteId,
    })),
    ...upcomingLoans.map((loan) => ({
      id: `upcoming-${loan.id}`,
      title: 'Devolução próxima do vencimento',
      description: `${loan.readerName} • ${loan.bookTitle}`,
      meta: `Prevista para ${formatDate(loan.dueDate)}`,
      icon: <CalendarClock className="h-4 w-4" />,
      variant: 'warning' as const,
      route: 'loans' as RouteId,
    })),
    ...unavailableBooks.map((book) => ({
      id: `unavailable-${book.id}`,
      title: 'Livro sem exemplares disponíveis',
      description: book.title,
      meta: `${book.totalCopies} exemplar(es) cadastrado(s)`,
      icon: <BookOpen className="h-4 w-4" />,
      variant: 'neutral' as const,
      route: 'books' as RouteId,
    })),
  ];

  const alertStyle = {
    danger: {
      icon: 'bg-[#FFEBEE] text-[#C62828]',
      badge: 'danger' as const,
      label: 'Atrasado',
    },
    warning: {
      icon: 'bg-[#FFF8E1] text-[#B76E00]',
      badge: 'warning' as const,
      label: 'Próximo',
    },
    neutral: {
      icon: 'bg-[#F2E9DE] text-[#6F4E37]',
      badge: 'neutral' as const,
      label: 'Indisponível',
    },
  };

  const activityStyle = {
    info: 'bg-[#E3F2FD] text-[#1565C0]',
    success: 'bg-[#EDF7ED] text-[#2E7D32]',
    neutral: 'bg-[#F2E9DE] text-[#6F4E37]',
  };

  return (
    <div>
      <PageHeader
        title="Painel Principal"
        subtitle="Indicadores e movimentações operacionais da biblioteca"
      />

      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section aria-labelledby="dashboard-indicators">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2
                id="dashboard-indicators"
                className="text-base font-bold text-[#2F241C]"
              >
                Visão geral
              </h2>
              <p className="text-xs text-[#6D5A4D]">
                Dados consolidados da camada compartilhada
              </p>
            </div>
            <StatusBadge variant="success">Dados atualizados</StatusBadge>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat) => (
              <Card
                key={stat.title}
                variant="interactive"
                onClick={() => setCurrentRoute(stat.route)}
                className={stat.emphasis ? 'border-[#C62828]/30' : ''}
              >
                <div className="flex min-h-28 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium leading-tight text-[#6D5A4D]">
                      {stat.title}
                    </span>
                    <span
                      className={`shrink-0 rounded-lg p-2 ${
                        stat.emphasis
                          ? 'bg-[#FFEBEE] text-[#C62828]'
                          : 'bg-[#F2E9DE] text-[#6F4E37]'
                      }`}
                    >
                      {stat.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2F241C]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] leading-tight text-[#6D5A4D]">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="dashboard-shortcuts">
          <div className="mb-3">
            <h2
              id="dashboard-shortcuts"
              className="text-base font-bold text-[#2F241C]"
            >
              Atalhos operacionais
            </h2>
            <p className="text-xs text-[#6D5A4D]">
              Acesse rapidamente a área correspondente
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {shortcuts.map((shortcut) => (
              <Button
                key={shortcut.route}
                type="button"
                variant="outline"
                onClick={() => setCurrentRoute(shortcut.route)}
                className="min-w-0 justify-start gap-3 rounded-xl p-3 text-left"
              >
                <span className="shrink-0 rounded-lg bg-[#F2E9DE] p-2 text-[#6F4E37]">
                  {shortcut.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-[#2F241C] sm:text-sm">
                    {shortcut.label}
                  </span>
                  <span className="hidden truncate text-[11px] text-[#6D5A4D] sm:block">
                    {shortcut.description}
                  </span>
                </span>
                <ArrowRight className="hidden h-4 w-4 shrink-0 text-[#9B887B] sm:block" />
              </Button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <section
            aria-labelledby="dashboard-alerts"
            className="min-w-0 xl:col-span-3"
          >
            <Card
              header={
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      id="dashboard-alerts"
                      className="text-sm font-semibold text-[#2F241C]"
                    >
                      Alertas operacionais
                    </h2>
                    {operationalAlerts.length > 0 && (
                      <span className="rounded-full bg-[#F2E9DE] px-2 py-0.5 text-[11px] font-semibold text-[#6F4E37]">
                        {operationalAlerts.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6D5A4D]">
                    Prazos e disponibilidade que exigem acompanhamento
                  </p>
                </div>
              }
            >
              <div className="mb-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[#FFEBEE] px-2 py-2 text-center">
                  <p className="text-base font-bold text-[#C62828]">
                    {overdueLoans.length}
                  </p>
                  <p className="text-[10px] font-medium text-[#C62828]">
                    Vencidos
                  </p>
                </div>
                <div className="rounded-lg bg-[#FFF8E1] px-2 py-2 text-center">
                  <p className="text-base font-bold text-[#B76E00]">
                    {upcomingLoans.length}
                  </p>
                  <p className="text-[10px] font-medium text-[#B76E00]">
                    Próximos
                  </p>
                </div>
                <div className="rounded-lg bg-[#F2E9DE] px-2 py-2 text-center">
                  <p className="text-base font-bold text-[#6F4E37]">
                    {unavailableBooks.length}
                  </p>
                  <p className="text-[10px] font-medium text-[#6F4E37]">
                    Indisponíveis
                  </p>
                </div>
              </div>
              {operationalAlerts.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="h-6 w-6" />}
                  title="Nenhum alerta operacional"
                  description="Não há atrasos, vencimentos próximos ou títulos indisponíveis."
                  className="py-10"
                />
              ) : (
                <div className="divide-y divide-[#E7DED2]">
                  {operationalAlerts.slice(0, 6).map((alert) => {
                    const style = alertStyle[alert.variant];
                    return (
                      <Button
                        key={alert.id}
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentRoute(alert.route)}
                        className="w-full min-w-0 items-start justify-start gap-3 rounded-none px-0 py-3 text-left first:pt-0 last:pb-0"
                      >
                        <span
                          className={`mt-0.5 shrink-0 rounded-lg p-2 ${style.icon}`}
                        >
                          {alert.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-[#2F241C]">
                              {alert.title}
                            </span>
                            <StatusBadge variant={style.badge} dot={false}>
                              {style.label}
                            </StatusBadge>
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-[#6D5A4D]">
                            {alert.description}
                          </span>
                          <span className="mt-1 block text-[11px] text-[#9B887B]">
                            {alert.meta}
                          </span>
                        </span>
                        <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-[#9B887B]" />
                      </Button>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>

          <section
            aria-labelledby="dashboard-activities"
            className="min-w-0 xl:col-span-2"
          >
            <Card
              header={
                <div>
                  <h2
                    id="dashboard-activities"
                    className="text-sm font-semibold text-[#2F241C]"
                  >
                    Atividades recentes
                  </h2>
                  <p className="text-xs text-[#6D5A4D]">
                    Eventos reais ordenados por data
                  </p>
                </div>
              }
            >
              {activities.length === 0 ? (
                <EmptyState
                  icon={<Clock3 className="h-6 w-6" />}
                  title="Nenhuma atividade registrada"
                  description="As movimentações aparecerão aqui quando houver dados."
                  className="py-10"
                />
              ) : (
                <ol className="space-y-4">
                  {activities.map((activity) => (
                    <li key={activity.id} className="flex min-w-0 gap-3">
                      <span
                        className={`shrink-0 rounded-lg p-2 ${
                          activityStyle[activity.variant]
                        }`}
                      >
                        {activity.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-[#2F241C]">
                          {activity.title}
                        </span>
                        <span className="block truncate text-xs text-[#6D5A4D]">
                          {activity.description}
                        </span>
                      </span>
                      <time
                        dateTime={activity.date}
                        className="shrink-0 text-[10px] text-[#9B887B]"
                      >
                        {formatDate(activity.date)}
                      </time>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};
