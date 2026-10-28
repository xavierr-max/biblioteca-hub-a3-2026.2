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
import { useLibrary, BookFormData, validateISBN } from '../context/LibraryContext';
import { Book, BookCopy } from '../types/library';
import {
  Plus,
  BookOpen,
  Eye,
  Info,
  Edit3,
  Trash2,
  Archive,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Library,
  RotateCcw,
  MapPin,
  Barcode,
} from 'lucide-react';

export const BooksPage: React.FC = () => {
  const {
    books,
    copies,
    loans,
    globalSearch,
    addBook,
    updateBook,
    deleteBook,
    toggleArchiveBook,
    updateCopyStatus,
  } = useLibrary();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form Drawer state (Add or Edit)
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    year: new Date().getFullYear(),
    totalCopies: 1,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof BookFormData, string>>>({});

  // Delete confirmation Modal state
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deleteErrorFeedback, setDeleteErrorFeedback] = useState<{
    message: string;
    canArchive: boolean;
  } | null>(null);

  // Copy status editor modal inside Drawer
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);
  const [copyNewStatus, setCopyNewStatus] = useState<BookCopy['status']>('AVAILABLE');
  const [copyNewLocation, setCopyNewLocation] = useState<string>('');

  // Search, Filters & Sorting state
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE' | 'ARCHIVED'>('ALL');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'year' | 'copies'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Distinct categories
  const allCategories = useMemo(() => {
    const cats = new Set(books.map((b) => b.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [books]);

  // Filtered and Sorted books
  const filteredBooks = useMemo(() => {
    const term = (localSearch || globalSearch).toLowerCase().trim();

    return books
      .filter((b) => {
        // Search term filter
        if (term) {
          const matchTitle = b.title.toLowerCase().includes(term);
          const matchAuthor = b.author.toLowerCase().includes(term);
          const matchIsbn = b.isbn.toLowerCase().replace(/[-\s]/g, '').includes(term.replace(/[-\s]/g, ''));
          const matchCat = b.category.toLowerCase().includes(term);
          if (!matchTitle && !matchAuthor && !matchIsbn && !matchCat) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'ALL' && b.category !== selectedCategory) {
          return false;
        }

        // Availability & Archive filter
        if (availabilityFilter === 'AVAILABLE') {
          if (b.availableCopies <= 0 || b.isArchived) return false;
        } else if (availabilityFilter === 'UNAVAILABLE') {
          if (b.availableCopies > 0 || b.isArchived) return false;
        } else if (availabilityFilter === 'ARCHIVED') {
          if (!b.isArchived) return false;
        } else {
          // 'ALL': by default hide archived unless explicitly chosen
          if (b.isArchived) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'title') {
          comparison = a.title.localeCompare(b.title, 'pt-BR');
        } else if (sortBy === 'author') {
          comparison = a.author.localeCompare(b.author, 'pt-BR');
        } else if (sortBy === 'year') {
          comparison = a.year - b.year;
        } else if (sortBy === 'copies') {
          comparison = a.availableCopies - b.availableCopies;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [books, localSearch, globalSearch, selectedCategory, availabilityFilter, sortBy, sortOrder]);

  const handleOpenCreateDrawer = () => {
    setEditingBookId(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      year: new Date().getFullYear(),
      totalCopies: 1,
      notes: '',
    });
    setFormErrors({});
    setIsFormDrawerOpen(true);
  };

  const handleOpenEditDrawer = (book: Book) => {
    setEditingBookId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher,
      year: book.year,
      totalCopies: book.totalCopies,
      notes: book.notes || '',
    });
    setFormErrors({});
    setIsFormDrawerOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<keyof BookFormData, string>> = {};

    if (!formData.title.trim()) {
      errors.title = 'O título do livro é obrigatório.';
    }
    if (!formData.author.trim()) {
      errors.author = 'O autor é obrigatório.';
    }
    if (!formData.isbn.trim()) {
      errors.isbn = 'O ISBN é obrigatório.';
    } else if (!validateISBN(formData.isbn.trim())) {
      errors.isbn = 'ISBN inválido. Digite um código ISBN-10 ou ISBN-13 válido.';
    }
    if (formData.totalCopies < 0) {
      errors.totalCopies = 'A quantidade não pode ser negativa.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingBookId) {
      const res = updateBook(editingBookId, formData);
      if (!res.success) {
        setFormErrors({ isbn: res.error });
        return;
      }
    } else {
      const res = addBook(formData);
      if (!res.success) {
        setFormErrors({ isbn: res.error });
        return;
      }
    }

    setIsFormDrawerOpen(false);
  };

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setDeleteErrorFeedback(null);
  };

  const confirmDelete = () => {
    if (!bookToDelete) return;
    const res = deleteBook(bookToDelete.id);
    if (res.success) {
      setBookToDelete(null);
      if (selectedBook?.id === bookToDelete.id) {
        setSelectedBook(null);
        setIsDrawerOpen(false);
        setIsModalOpen(false);
      }
    } else {
      setDeleteErrorFeedback({
        message: res.error || 'Erro ao excluir.',
        canArchive: Boolean(res.canArchiveInstead),
      });
    }
  };

  const handleArchiveBook = (bookId: string) => {
    toggleArchiveBook(bookId);
    setBookToDelete(null);
    setDeleteErrorFeedback(null);
  };

  const handleUpdateCopy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCopy) return;
    const res = updateCopyStatus(editingCopy.id, copyNewStatus, copyNewLocation);
    if (res.success) {
      setEditingCopy(null);
    }
  };

  const handleOpenBookModal = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleOpenBookDrawer = (book: Book) => {
    setSelectedBook(book);
    setIsDrawerOpen(true);
  };

  const getActiveLoansCount = (bookId: string) => {
    return loans.filter(
      (l) => l.bookId === bookId && (l.status === 'ACTIVE' || l.status === 'OVERDUE')
    ).length;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Livros e Acervo"
        subtitle="Catalogação e consulta de títulos e exemplares da biblioteca"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateDrawer}
          >
            Novo Livro
          </Button>
        }
        searchValue={localSearch}
        onSearchChange={setLocalSearch}
        searchPlaceholder="Filtrar por título, autor, ISBN ou categoria..."
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filter and Control Bar */}
        <div className="bg-[#FFFDF9] border border-[#E7DED2] rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#6D5A4D]">
              <Info className="w-4 h-4 text-[#6F4E37] shrink-0" />
              <span>
                Exibindo <strong>{filteredBooks.length}</strong> de{' '}
                <strong>{books.length}</strong> título(s) cadastrado(s).
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant="success">Disponível</StatusBadge>
              <StatusBadge variant="danger">Esgotado</StatusBadge>
              <StatusBadge variant="neutral">Arquivado</StatusBadge>
            </div>
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#E7DED2]">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6D5A4D] block mb-1">
                Categoria
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Todas as categorias' },
                  ...allCategories.map((c) => ({ value: c, label: c })),
                ]}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6D5A4D] block mb-1">
                Disponibilidade
              </label>
              <Select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                options={[
                  { value: 'ALL', label: 'Todos os ativos' },
                  { value: 'AVAILABLE', label: 'Apenas disponíveis' },
                  { value: 'UNAVAILABLE', label: 'Apenas indisponíveis/esgotados' },
                  { value: 'ARCHIVED', label: 'Títulos arquivados' },
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
                  { value: 'title', label: 'Título' },
                  { value: 'author', label: 'Autor' },
                  { value: 'year', label: 'Ano de publicação' },
                  { value: 'copies', label: 'Exemplares disponíveis' },
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

        {filteredBooks.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="Nenhum livro encontrado"
            description="Não encontramos nenhum título correspondente aos filtros ou termos pesquisados. Tente ajustar os parâmetros ou cadastre um novo título."
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalSearch('');
                    setSelectedCategory('ALL');
                    setAvailabilityFilter('ALL');
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
                  Novo Livro
                </Button>
              </div>
            }
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table
                columns={[
                  {
                    key: 'title',
                    header: 'Título / Autor',
                    render: (book) => (
                      <div>
                        <p className="font-semibold text-[#2F241C] text-sm">
                          {book.title}
                          {book.isArchived && (
                            <span className="ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F2E9DE] text-[#6D5A4D]">
                              Arquivado
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#6D5A4D] mt-0.5">{book.author}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'isbn',
                    header: 'ISBN',
                    render: (book) => (
                      <span className="font-mono text-xs text-[#2F241C] block">{book.isbn}</span>
                    ),
                  },
                  {
                    key: 'category',
                    header: 'Categoria',
                    render: (book) => (
                      <span className="text-xs text-[#2F241C]">{book.category}</span>
                    ),
                  },
                  {
                    key: 'publisher',
                    header: 'Editora / Ano',
                    render: (book) => (
                      <span className="text-xs text-[#6D5A4D]">
                        {book.publisher} ({book.year})
                      </span>
                    ),
                  },
                  {
                    key: 'totalCopies',
                    header: 'Totais',
                    render: (book) => (
                      <span className="text-xs font-semibold text-[#2F241C]">
                        {book.totalCopies}
                      </span>
                    ),
                  },
                  {
                    key: 'availableCopies',
                    header: 'Disponíveis',
                    render: (book) => (
                      <span
                        className={`text-xs font-bold ${
                          book.availableCopies > 0 ? 'text-[#2E7D32]' : 'text-[#C62828]'
                        }`}
                      >
                        {book.availableCopies}
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Situação',
                    render: (book) => {
                      if (book.isArchived) {
                        return <StatusBadge variant="neutral">Arquivado</StatusBadge>;
                      }
                      const isAvailable = book.availableCopies > 0;
                      return (
                        <StatusBadge variant={isAvailable ? 'success' : 'danger'}>
                          {isAvailable ? 'Disponível' : 'Esgotado'}
                        </StatusBadge>
                      );
                    },
                  },
                  {
                    key: 'actions',
                    header: 'Ações',
                    className: 'text-right',
                    render: (book) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBookDrawer(book);
                          }}
                          title="Ver Ficha e Exemplares"
                        >
                          Ficha
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditDrawer(book);
                          }}
                          title="Editar Dados Bibliográficos"
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
                            handleDeleteClick(book);
                          }}
                          title="Excluir ou Arquivar"
                        >
                          Excluir
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={filteredBooks}
                keyExtractor={(b) => b.id}
                onRowClick={(b) => handleOpenBookDrawer(b)}
              />
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3">
              {filteredBooks.map((book) => {
                const isAvailable = book.availableCopies > 0;
                return (
                  <Card
                    key={book.id}
                    className="p-4"
                    onClick={() => handleOpenBookDrawer(book)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#6F4E37]">
                            {book.category}
                          </span>
                          {book.isArchived && (
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#F2E9DE] text-[#6D5A4D]">
                              Arquivado
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-[#2F241C] mt-0.5 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#6D5A4D] mt-0.5">{book.author}</p>
                      </div>
                      <StatusBadge variant={book.isArchived ? 'neutral' : isAvailable ? 'success' : 'danger'}>
                        {book.isArchived ? 'Arquivado' : isAvailable ? 'Disponível' : 'Esgotado'}
                      </StatusBadge>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#E7DED2] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#6D5A4D] block text-[11px]">ISBN</span>
                        <span className="font-mono text-[#2F241C]">{book.isbn}</span>
                      </div>
                      <div>
                        <span className="text-[#6D5A4D] block text-[11px]">Exemplares</span>
                        <span className="font-semibold text-[#2F241C]">
                          {book.availableCopies} disp. de {book.totalCopies}
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
                          handleOpenBookDrawer(book);
                        }}
                      >
                        Ficha
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit3 className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDrawer(book);
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
                          handleDeleteClick(book);
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

    </div>
  );
};
