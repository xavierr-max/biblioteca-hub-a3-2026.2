import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Card } from '../components/ui/Card';
import { useLibrary } from '../context/LibraryContext';
import { UserRole } from '../types/library';
import { Plus, Shield, UserCheck, ShieldAlert } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, currentUser, setCurrentUser, showToast } = useLibrary();

  const handleSwitchUser = (user: (typeof users)[0]) => {
    setCurrentUser(user);
    showToast({
      title: 'Perfil Ativo Alterado',
      description: `Você agora está visualizando a aplicação como ${user.name} (${user.role}).`,
      variant: 'default',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários do Sistema"
        subtitle="Gerenciamento de acessos, papéis e permissões do BibliotecaHub"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() =>
              showToast({
                title: 'Cadastro de Usuário',
                description:
                  'A gestão completa de credenciais e senhas será implementada na Etapa 7.',
                variant: 'default',
              })
            }
          >
            Novo Usuário
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Role Explanation Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFEBEE] flex items-center justify-center text-[#C62828]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2F241C]">Administrador</p>
                <p className="text-[11px] text-[#6D5A4D]">
                  Gerencia acessos, permissões e cadastros gerais.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E3F2FD] flex items-center justify-center text-[#1565C0]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2F241C]">Bibliotecário</p>
                <p className="text-[11px] text-[#6D5A4D]">
                  Controla acervo, leitores, empréstimos e devoluções.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EDF7ED] flex items-center justify-center text-[#2E7D32]">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2F241C]">Leitor</p>
                <p className="text-[11px] text-[#6D5A4D]">
                  Consulta catálogo e disponibilidade de exemplares.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Table
          columns={[
            {
              key: 'name',
              header: 'Nome do Usuário',
              render: (user) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E6D5BF] flex items-center justify-center text-[#6F4E37] font-semibold text-xs shrink-0">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#2F241C]">
                      {user.name}
                      {user.id === currentUser.id && (
                        <span className="ml-2 text-[10px] font-bold text-[#6F4E37] bg-[#F2E9DE] px-2 py-0.5 rounded-full">
                          Sua Sessão Atual
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-[#6D5A4D]">{user.email}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'Perfil / Permissão',
              render: (user) => {
                const roleMap: Record<UserRole, { label: string; variant: 'danger' | 'info' | 'success' }> = {
                  ADMIN: { label: 'Administrador', variant: 'danger' },
                  LIBRARIAN: { label: 'Bibliotecário', variant: 'info' },
                  READER: { label: 'Leitor', variant: 'success' },
                };
                const r = roleMap[user.role];
                return <StatusBadge variant={r.variant}>{r.label}</StatusBadge>;
              },
            },
            {
              key: 'status',
              header: 'Status',
              render: (user) => (
                <StatusBadge variant={user.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </StatusBadge>
              ),
            },
            {
              key: 'createdAt',
              header: 'Criação',
              render: (user) => (
                <span className="text-xs font-mono text-[#6D5A4D]">
                  {user.createdAt}
                </span>
              ),
            },
            {
              key: 'actions',
              header: 'Ação',
              className: 'text-right',
              render: (user) => (
                <Button
                  variant={user.id === currentUser.id ? 'ghost' : 'outline'}
                  size="sm"
                  disabled={user.id === currentUser.id}
                  onClick={() => handleSwitchUser(user)}
                >
                  {user.id === currentUser.id ? 'Logado' : 'Simular Perfil'}
                </Button>
              ),
            },
          ]}
          data={users}
          keyExtractor={(u) => u.id}
        />
      </div>
    </div>
  );
};
