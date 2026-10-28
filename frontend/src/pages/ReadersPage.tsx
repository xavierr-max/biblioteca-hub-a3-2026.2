import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { EmptyState } from '../components/ui/EmptyState';
import { useLibrary, ReaderFormData, isValidEmail, isValidPhone } from '../context/LibraryContext';
import { Reader } from '../types/library';
import {
  Plus,
  Users,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  Ban,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const ReadersPage: React.FC = () => {
  const {
    readers,
    loans,
    globalSearch,
    addReader,
    updateReader,
    deleteReader,
    toggleReaderStatus,
  } = useLibrary();

  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Form Drawer state (Add or Edit)
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingReaderId, setEditingReaderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReaderFormData>({
    name: '',
    identifier: '',
    email: '',
    phone: '',
    course: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ReaderFormData, string>>>({});

  // Delete Confirmation Modal state
  const [readerToDelete, setReaderToDelete] = useState<Reader | null>(null);
  const [deleteErrorFeedback, setDeleteErrorFeedback] = useState<{
    message: string;
    canDeactivate: boolean;
  } | null>(null);

  // Filters, search & sorting state
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'REGULAR' | 'SUSPENDED' | 'BLOCKED'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'registrationDate' | 'identifier' | 'activeLoans'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered & sorted readers
  const filteredReaders = useMemo(() => {
    const term = (localSearch || globalSearch).toLowerCase().trim();

    return readers
      .filter((r) => {
        if (term) {
          const matchName = r.name.toLowerCase().includes(term);
          const matchIdentifier = (r.identifier || '').toLowerCase().includes(term);
          const matchEmail = (r.email || '').toLowerCase().includes(term);
          const matchCourse = (r.course || '').toLowerCase().includes(term);
          const matchCpf = r.cpf ? r.cpf.includes(term) : false;
          if (!matchName && !matchIdentifier && !matchEmail && !matchCourse && !matchCpf) {
            return false;
          }
        }

        if (statusFilter !== 'ALL' && r.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name, 'pt-BR');
        } else if (sortBy === 'registrationDate') {
          comparison = a.registrationDate.localeCompare(b.registrationDate);
        } else if (sortBy === 'identifier') {
          comparison = (a.identifier || '').localeCompare(b.identifier || '');
        } else if (sortBy === 'activeLoans') {
          comparison = a.activeLoansCount - b.activeLoansCount;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [readers, localSearch, globalSearch, statusFilter, sortBy, sortOrder]);

  const readerLoans = selectedReader
    ? loans.filter((l) => l.readerId === selectedReader.id)
    : [];

  const handleOpenCreateDrawer = () => {
    setEditingReaderId(null);
    setFormData({
      name: '',
      identifier: '',
      email: '',
      phone: '',
      course: '',
      notes: '',
    });
    setFormErrors({});
    setIsFormDrawerOpen(true);
  };

  const handleOpenEditDrawer = (reader: Reader) => {
    setEditingReaderId(reader.id);
    setFormData({
      name: reader.name,
      identifier: reader.identifier || '',
      email: reader.email || '',
      phone: reader.phone || '',
      course: reader.course || '',
      notes: reader.notes || '',
    });
    setFormErrors({});
    setIsFormDrawerOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<keyof ReaderFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'O nome completo do leitor é obrigatório.';
    }
    if (!formData.identifier.trim()) {
      errors.identifier = 'A matrícula ou identificador acadêmico é obrigatório.';
    }
    if (formData.email?.trim() && !isValidEmail(formData.email.trim())) {
      errors.email = 'E-mail em formato inválido.';
    }
    if (formData.phone?.trim() && !isValidPhone(formData.phone.trim())) {
      errors.phone = 'Telefone inválido (informe com DDD).';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingReaderId) {
      const res = updateReader(editingReaderId, formData);
      if (!res.success) {
        setFormErrors({ identifier: res.error });
        return;
      }
    } else {
      const res = addReader(formData);
      if (!res.success) {
        setFormErrors({ identifier: res.error });
        return;
      }
    }

    setIsFormDrawerOpen(false);
  };

  const handleDeleteClick = (reader: Reader) => {
    setReaderToDelete(reader);
    setDeleteErrorFeedback(null);
  };

  const confirmDelete = () => {
    if (!readerToDelete) return;
    const res = deleteReader(readerToDelete.id);
    if (res.success) {
      setReaderToDelete(null);
      if (selectedReader?.id === readerToDelete.id) {
        setSelectedReader(null);
        setIsDetailsDrawerOpen(false);
      }
    } else {
      setDeleteErrorFeedback({
        message: res.error || 'Erro ao excluir.',
        canDeactivate: Boolean(res.canDeactivateInstead),
      });
    }
  };

  const handleToggleStatus = (readerId: string) => {
    toggleReaderStatus(readerId);
    setReaderToDelete(null);
    setDeleteErrorFeedback(null);
  };

  const handleOpenDetails = (reader: Reader) => {
    setSelectedReader(reader);
    setIsDetailsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leitores"
        subtitle="Cadastro e histórico de leitores e usuários da biblioteca"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateDrawer}
          >
            Novo Leitor
          </Button>
        }
        searchValue={localSearch}
        onSearchChange={setLocalSearch}
        searchPlaceholder="Buscar por nome, matrícula, e-mail ou curso..."
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filter and Control Bar */}
        <div className="bg-[#FFFDF9] border border-[#E7DED2] rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#6D5A4D]">
              <Users className="w-4 h-4 text-[#6F4E37] shrink-0" />
              <span>
                Exibindo <strong>{filteredReaders.length}</strong> de{' '}
                <strong>{readers.length}</strong> leitor(es) cadastrado(s).
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant="success">Regular</StatusBadge>
              <StatusBadge variant="warning">Inativo / Suspenso</StatusBadge>
            </div>
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-[#E7DED2]">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6D5A4D] block mb-1">
                Status
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                options={[
                  { value: 'ALL', label: 'Todos os status' },
                  { value: 'REGULAR', label: 'Apenas regulares' },
                  { value: 'SUSPENDED', label: 'Apenas inativos / suspensos' },
                ]}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6D5A4D] block mb-1">
                Ordenar por
              </label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: 'name', label: 'Nome do leitor' },
                  { value: 'registrationDate', label: 'Data de cadastro' },
                  { value: 'identifier', label: 'Matrícula / Identificador' },
                  { value: 'activeLoans', label: 'Empréstimos ativos' },
                ]}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6D5A4D] block mb-1">
                Ordem
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={sortOrder === 'asc' ? 'primary' : 'outline'}
                  size="md"
                  className="flex-1 text-xs"
                  onClick={() => setSortOrder('asc')}
                >
                  Crescente (A-Z)
                </Button>
                <Button
                  type="button"
                  variant={sortOrder === 'desc' ? 'primary' : 'outline'}
                  size="md"
                  className="flex-1 text-xs"
                  onClick={() => setSortOrder('desc')}
                >
                  Decrescente (Z-A)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filteredReaders.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="Nenhum leitor encontrado"
            description="Não encontramos nenhum registro correspondente aos filtros ou termos pesquisados. Tente ajustar os parâmetros ou cadastre um novo leitor."
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalSearch('');
                    setStatusFilter('ALL');
                  }}
                >
                  Limpar filtros
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenCreateDrawer}
                >
                  Novo Leitor
                </Button>
              </div>
            }
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table
                columns={[
                  {
                    key: 'name',
                    header: 'Nome Completo',
                    render: (reader) => (
                      <div>
                        <p className="font-semibold text-sm text-[#2F241C]">
                          {reader.name}
                        </p>
                        {reader.notes && (
                          <p className="text-[11px] text-[#9B887B] truncate max-w-[200px]">
                            {reader.notes}
                          </p>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'identifier',
                    header: 'Matrícula',
                    render: (reader) => (
                      <span className="font-mono text-xs font-semibold text-[#2F241C]">
                        {reader.identifier || reader.cpf || '—'}
                      </span>
                    ),
                  },
                  {
                    key: 'contact',
                    header: 'Contato',
                    render: (reader) => (
                      <div className="text-xs space-y-0.5">
                        <span className="text-[#2F241C] block">{reader.email || '—'}</span>
                        <span className="text-[#6D5A4D]">{reader.phone || '—'}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'course',
                    header: 'Curso / Vínculo',
                    render: (reader) => (
                      <span className="text-xs text-[#2F241C]">
                        {reader.course || 'Geral'}
                      </span>
                    ),
                  },
                  {
                    key: 'registrationDate',
                    header: 'Cadastro',
                    render: (reader) => (
                      <span className="text-xs text-[#6D5A4D] font-mono">
                        {reader.registrationDate}
                      </span>
                    ),
                  },
                  {
                    key: 'activeLoansCount',
                    header: 'Empréstimos',
                    render: (reader) => (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          reader.activeLoansCount > 0
                            ? 'bg-[#E3F2FD] text-[#1565C0]'
                            : 'bg-[#F2E9DE] text-[#6D5A4D]'
                        }`}
                      >
                        {reader.activeLoansCount} ativo(s)
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (reader) => {
                      const isRegular = reader.status === 'REGULAR';
                      return (
                        <StatusBadge variant={isRegular ? 'success' : 'warning'}>
                          {isRegular ? 'Regular' : 'Inativo'}
                        </StatusBadge>
                      );
                    },
                  },
                  {
                    key: 'actions',
                    header: 'Ações',
                    className: 'text-right',
                    render: (reader) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(reader);
                          }}
                          title="Ver Perfil e Histórico"
                        >
                          Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditDrawer(reader);
                          }}
                          title="Editar Cadastro"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#C62828] hover:bg-[#FFEBEE]"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(reader);
                          }}
                          title="Desativar ou Excluir"
                        >
                          Excluir
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={filteredReaders}
                keyExtractor={(r) => r.id}
                onRowClick={(r) => handleOpenDetails(r)}
              />
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3">
              {filteredReaders.map((reader) => {
                const isRegular = reader.status === 'REGULAR';
                return (
                  <Card
                    key={reader.id}
                    className="p-4"
                    onClick={() => handleOpenDetails(reader)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-mono font-semibold text-[#6F4E37] block">
                          {reader.identifier || reader.cpf || 'SEM MATRÍCULA'}
                        </span>
                        <h3 className="text-sm font-bold text-[#2F241C] mt-0.5">
                          {reader.name}
                        </h3>
                        <p className="text-xs text-[#6D5A4D] mt-0.5">
                          {reader.course || 'Sem curso informado'}
                        </p>
                      </div>
                      <StatusBadge variant={isRegular ? 'success' : 'warning'}>
                        {isRegular ? 'Regular' : 'Inativo'}
                      </StatusBadge>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#E7DED2] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#6D5A4D] block text-[11px]">Contato</span>
                        <span className="text-[#2F241C] truncate block">
                          {reader.email || reader.phone || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6D5A4D] block text-[11px]">Empréstimos</span>
                        <span className="font-semibold text-[#2F241C]">
                          {reader.activeLoansCount} ativo(s)
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-[#E7DED2]/60">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(reader);
                        }}
                      >
                        Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit3 className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDrawer(reader);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#C62828]"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(reader);
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Reader Details Drawer */}
      {selectedReader && (
        <Drawer
          isOpen={isDetailsDrawerOpen}
          onClose={() => setIsDetailsDrawerOpen(false)}
          title="Ficha do Leitor"
          description={`Matrícula / ID: ${selectedReader.identifier || selectedReader.cpf || selectedReader.id}`}
          position="right"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant={selectedReader.status === 'REGULAR' ? 'ghost' : 'outline'}
                size="sm"
                icon={selectedReader.status === 'REGULAR' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  handleToggleStatus(selectedReader.id);
                  setSelectedReader({
                    ...selectedReader,
                    status: selectedReader.status === 'REGULAR' ? 'SUSPENDED' : 'REGULAR',
                  });
                }}
              >
                {selectedReader.status === 'REGULAR' ? 'Desativar Leitor' : 'Reativar Leitor'}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setIsDetailsDrawerOpen(false);
                    handleOpenEditDrawer(selectedReader);
                  }}
                >
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsDetailsDrawerOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Avatar & Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E6D5BF] flex items-center justify-center text-[#6F4E37] font-bold text-sm">
                {selectedReader.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-[#2F241C] text-base">
                  {selectedReader.name}
                </h4>
                <StatusBadge
                  variant={selectedReader.status === 'REGULAR' ? 'success' : 'warning'}
                >
                  {selectedReader.status === 'REGULAR' ? 'Cadastro Regular' : 'Inativo / Suspenso'}
                </StatusBadge>
              </div>
            </div>

            {/* Academic & Contact Info Card */}
            <div className="border border-[#E7DED2] rounded-xl p-3 bg-[#F8F4EE] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6D5A4D]">Matrícula / Identificador:</span>
                <span className="font-mono font-semibold text-[#2F241C]">
                  {selectedReader.identifier || '—'}
                </span>
              </div>
              {selectedReader.course && (
                <div className="flex justify-between">
                  <span className="text-[#6D5A4D]">Curso ou Vínculo:</span>
                  <span className="font-semibold text-[#2F241C]">{selectedReader.course}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[#2F241C]">
                <Mail className="w-4 h-4 text-[#6D5A4D]" />
                <span>{selectedReader.email || 'E-mail não cadastrado'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#2F241C]">
                <Phone className="w-4 h-4 text-[#6D5A4D]" />
                <span>{selectedReader.phone || 'Telefone não cadastrado'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#2F241C]">
                <Calendar className="w-4 h-4 text-[#6D5A4D]" />
                <span>Data de Registro: {selectedReader.registrationDate}</span>
              </div>
              {selectedReader.notes && (
                <div className="pt-2 border-t border-[#E7DED2]">
                  <span className="text-[#6D5A4D] block mb-0.5">Observações:</span>
                  <p className="text-xs text-[#2F241C] italic">{selectedReader.notes}</p>
                </div>
              )}
            </div>

            {/* Loan History */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#6D5A4D] mb-2">
                Histórico de Empréstimos Vinculados ({readerLoans.length})
              </h5>
              <div className="space-y-2">
                {readerLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-2.5 rounded-lg border border-[#E7DED2] bg-[#FFFDF9] text-xs flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-[#2F241C]">{loan.bookTitle}</p>
                      <p className="text-[11px] text-[#6D5A4D]">
                        Exemplar: {loan.copyCode} • Devolução: {loan.dueDate}
                      </p>
                    </div>
                    <StatusBadge
                      variant={
                        loan.status === 'ACTIVE'
                          ? 'info'
                          : loan.status === 'OVERDUE'
                          ? 'danger'
                          : 'success'
                      }
                    >
                      {loan.status === 'ACTIVE'
                        ? 'Ativo'
                        : loan.status === 'OVERDUE'
                        ? 'Atrasado'
                        : 'Devolvido'}
                    </StatusBadge>
                  </div>
                ))}
                {readerLoans.length === 0 && (
                  <EmptyState
                    icon={<FileText className="w-5 h-5" />}
                    title="Nenhum empréstimo registrado"
                    description="Este leitor ainda não realizou empréstimos na biblioteca."
                    className="py-6"
                  />
                )}
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Form Drawer: Add / Edit Reader */}
      <Drawer
        isOpen={isFormDrawerOpen}
        onClose={() => setIsFormDrawerOpen(false)}
        title={editingReaderId ? 'Editar Leitor' : 'Novo Leitor'}
        description={
          editingReaderId
            ? 'Atualize os dados cadastrais do leitor.'
            : 'Cadastre um novo leitor para controle de circulação e empréstimos.'
        }
        position="right"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormDrawerOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={handleFormSubmit}>
              {editingReaderId ? 'Salvar Alterações' : 'Cadastrar Leitor'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="Ex: Beatriz Silveira de Alencar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />

          <Input
            label="Matrícula / Identificador Acadêmico *"
            placeholder="Ex: MAT-202510 ou 12825134078"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            error={formErrors.identifier}
            helperText="Identificador institucional único do leitor."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="E-mail Institucional"
              type="email"
              placeholder="Ex: beatriz@aluno.edu.br"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
            />
            <Input
              label="Telefone / Celular"
              placeholder="Ex: (11) 98765-4321"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={formErrors.phone}
            />
          </div>

          <Input
            label="Curso ou Vínculo Institucional"
            placeholder="Ex: Ciência da Computação, Docente, Pesquisador"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          />

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6D5A4D]">
              Observações (opcional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Anotações gerais, autorizações de retirada, etc."
              className="w-full bg-[#FFFDF9] text-[#2F241C] placeholder-[#9B887B] border border-[#E7DED2] hover:border-[#C8A97E] focus:border-[#C8A97E] focus:outline-none focus:ring-2 focus:ring-[#C8A97E] rounded-lg p-3 text-sm transition-all"
            />
          </div>
        </form>
      </Drawer>

      {/* Delete / Deactivate Confirmation Modal */}
      {readerToDelete && (
        <Modal
          isOpen={Boolean(readerToDelete)}
          onClose={() => setReaderToDelete(null)}
          title="Exclusão de Leitor"
          description={`Confirmação de exclusão do cadastro: "${readerToDelete.name}"`}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setReaderToDelete(null)}>
                Cancelar
              </Button>
              {deleteErrorFeedback?.canDeactivate ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Ban className="w-4 h-4" />}
                  onClick={() => handleToggleStatus(readerToDelete.id)}
                >
                  {readerToDelete.status === 'REGULAR'
                    ? 'Desativar / Suspender Leitor'
                    : 'Reativar Cadastro'}
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={confirmDelete}
                >
                  Confirmar Exclusão
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-4">
            {deleteErrorFeedback ? (
              <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#B76E00]/40 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#B76E00] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#2F241C] space-y-1">
                    <p className="font-semibold text-sm">Bloqueio de Integridade Referencial</p>
                    <p className="leading-relaxed">{deleteErrorFeedback.message}</p>
                  </div>
                </div>
                {deleteErrorFeedback.canDeactivate && (
                  <p className="text-xs text-[#6D5A4D] bg-[#FFFDF9] p-3 rounded-lg border border-[#E7DED2]">
                    <strong>Alternativa recomendada:</strong> Desativar o cadastro do leitor impede novos empréstimos enquanto mantém o histórico acadêmico preservado para consultas e auditorias.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#2F241C]">
                  Tem certeza que deseja excluir o leitor <strong>"{readerToDelete.name}"</strong>?
                </p>
                <p className="text-xs text-[#6D5A4D] leading-relaxed">
                  Esta ação é irreversível e só é permitida para leitores que nunca realizaram empréstimos na biblioteca.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
