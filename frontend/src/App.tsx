import { useEffect, useState, type FormEvent } from 'react'
import { libraryApi, type Author, type Book, type Category, type Copy, type Loan, type Reader } from './services/api'
import './index.css'
import './modal.css'

function App() {
  const [active, setActive] = useState(() => localStorage.getItem('biblioteca.activeSection') ?? 'Dashboard')
  const [books, setBooks] = useState<Book[]>([])
  const [readers, setReaders] = useState<Reader[]>([])
  const [copies, setCopies] = useState<Copy[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [catalogModal, setCatalogModal] = useState<'Categorias' | 'Autores' | null>(null)
  const [catalogEdit, setCatalogEdit] = useState<{ type: 'Categorias' | 'Autores'; id?: number; name: string } | null>(null)
  const [showBookForm, setShowBookForm] = useState(false)
  const [bookForm, setBookForm] = useState({ title: '', isbn13: '', categoryId: '1' })
  const [showReaderForm, setShowReaderForm] = useState(false)
  const [readerForm, setReaderForm] = useState({ fullName: '', registrationNumber: '' })
  const [showCopyForm, setShowCopyForm] = useState(false)
  const [copyForm, setCopyForm] = useState({ bookId: '1', inventoryCode: '' })
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [loanForm, setLoanForm] = useState({ readerId: '1', copyId: '1' })
  const [returnMessage, setReturnMessage] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [editState, setEditState] = useState<{ section: string; id: number } | null>(null)
  const [deleteState, setDeleteState] = useState<{ section: string; id: number } | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('biblioteca.librarianProfile')
    return saved ? JSON.parse(saved) as { firstName: string; lastName: string; email: string; phone: string } : { firstName: 'Marina', lastName: 'Silva', email: '', phone: '' }
  })
  async function reloadData() {
    const [bookData, readerData, copyData, loanData, categoryData, authorData] = await Promise.all([libraryApi.books(), libraryApi.readers(), libraryApi.copies(), libraryApi.loans(), libraryApi.categories(), libraryApi.authors()])
    setBooks(bookData); setReaders(readerData); setCopies(copyData); setLoans(loanData); setCategories(categoryData); setAuthors(authorData)
  }
  useEffect(() => { void reloadData().catch(() => undefined) }, [])
  function navigate(section: string) { setActive(section); localStorage.setItem('biblioteca.activeSection', section) }
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); localStorage.setItem('biblioteca.librarianProfile', JSON.stringify(profile)); setProfileOpen(false)
  }
  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase()
  const activeLoans = loans.filter((loan) => !loan.returnedAt)
  const availableCopies = copies.filter((copy) => copy.status === 'Available').length
  const overdueLoans = activeLoans.filter((loan) => new Date(loan.dueAt) < new Date()).length
  async function submitBook(event: FormEvent) {
    event.preventDefault(); setFormMessage('Salvando...')
    try { await libraryApi.createBook({ ...bookForm, categoryId: Number(bookForm.categoryId) }); await reloadData(); setFormMessage('Livro cadastrado.'); setShowBookForm(false); setBookForm({ title: '', isbn13: '', categoryId: '1' }) }
    catch { setFormMessage('Não foi possível salvar. Verifique a API.') }
  }
  async function submitCatalog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!catalogEdit) return
    try {
      if (catalogEdit.type === 'Categorias') catalogEdit.id ? await libraryApi.updateCategory(catalogEdit.id, { name: catalogEdit.name, isActive: true }) : await libraryApi.createCategory({ name: catalogEdit.name, isActive: true })
      else catalogEdit.id ? await libraryApi.updateAuthor(catalogEdit.id, { name: catalogEdit.name }) : await libraryApi.createAuthor({ name: catalogEdit.name })
      await reloadData(); setCatalogEdit(null); setFormMessage('Registro salvo.')
    } catch { setFormMessage('Não foi possível salvar. Verifique duplicidade e vínculos.') }
  }
  async function deleteCatalog(type: 'Categorias' | 'Autores', id: number) {
    try { type === 'Categorias' ? await libraryApi.deleteCategory(id) : await libraryApi.deleteAuthor(id); await reloadData() } catch { setFormMessage('Não foi possível excluir. O registro pode possuir vínculos.') }
  }
  async function submitReader(event: FormEvent) {
    event.preventDefault(); setFormMessage('Salvando...')
    try { await libraryApi.createReader(readerForm); await reloadData(); setFormMessage('Leitor cadastrado.'); setShowReaderForm(false); setReaderForm({ fullName: '', registrationNumber: '' }) }
    catch { setFormMessage('Não foi possível salvar. Verifique a API.') }
  }
  async function submitCopy(event: FormEvent) {
    event.preventDefault(); setFormMessage('Salvando...')
    try { await libraryApi.createCopy({ bookId: Number(copyForm.bookId), inventoryCode: copyForm.inventoryCode }); await reloadData(); setFormMessage('Exemplar cadastrado.'); setShowCopyForm(false); setCopyForm({ bookId: '1', inventoryCode: '' }) }
    catch { setFormMessage('Não foi possível salvar. Verifique o livro e a API.') }
  }
  async function submitLoan(event: FormEvent) {
    event.preventDefault(); setFormMessage('Registrando empréstimo...')
    try { await libraryApi.createLoan({ readerId: Number(loanForm.readerId), copyId: Number(loanForm.copyId) }); await reloadData(); setFormMessage('Empréstimo registrado por 14 dias.'); setShowLoanForm(false); setLoanForm({ readerId: '1', copyId: '1' }) }
    catch { setFormMessage('Não foi possível registrar. Confirme leitor e exemplar disponíveis.') }
  }
  async function registerReturn(loanId: number) {
    setReturnMessage('Registrando devolução...')
    try { await libraryApi.returnLoan(loanId); await reloadData(); setReturnMessage('Devolução registrada com sucesso.') }
    catch { setReturnMessage('Não foi possível registrar a devolução. Confirme o ID do empréstimo.') }
  }
  async function deleteRecord(activeSection: string, id: number) {
    try {
      if (activeSection === 'Livros') await libraryApi.deleteBook(id)
      if (activeSection === 'Leitores') await libraryApi.deleteReader(id)
      if (activeSection === 'Exemplares') await libraryApi.deleteCopy(id)
      if (activeSection === 'Empréstimos') await libraryApi.deleteLoan(id)
      await reloadData(); setFormMessage('Registro removido.'); setDeleteState(null)
    } catch { setFormMessage('Não foi possível remover. Verifique vínculos e empréstimos ativos.') }
  }
  async function editRecord(activeSection: string, id: number) {
    setEditState({ section: activeSection, id })
  }
  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editState) return
    const data = new FormData(event.currentTarget)
    try {
      if (editState.section === 'Livros') await libraryApi.updateBook(editState.id, { title: String(data.get('title')), isbn13: String(data.get('isbn13')), categoryId: Number(data.get('categoryId')), isArchived: data.get('isArchived') === 'on' })
      if (editState.section === 'Leitores') await libraryApi.updateReader(editState.id, { fullName: String(data.get('fullName')), registrationNumber: String(data.get('registrationNumber')), isSuspended: data.get('isSuspended') === 'on' })
      if (editState.section === 'Exemplares') await libraryApi.updateCopy(editState.id, { bookId: Number(data.get('bookId')), inventoryCode: String(data.get('inventoryCode')), status: String(data.get('status')) as Copy['status'] })
      if (editState.section === 'Empréstimos') await libraryApi.updateLoan(editState.id, { readerId: Number(data.get('readerId')), copyId: Number(data.get('copyId')), dueAt: String(data.get('dueAt')), returnedAt: data.get('returnedAt') ? String(data.get('returnedAt')) : null })
      await reloadData(); setEditState(null); setFormMessage('Registro atualizado.')
    } catch { setFormMessage('Não foi possível atualizar o registro.') }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">b</span> biblioteca</div>
        <div className="workspace-label">GESTÃO</div>
        <nav>
          {[['Dashboard', 'space_dashboard'], ['Livros', 'menu_book'], ['Leitores', 'groups'], ['Exemplares', 'inventory_2'], ['Empréstimos', 'swap_horiz'], ['Categorias', 'category'], ['Autores', 'edit_note']].map(([item, icon]) => (
            <button className={`nav-item ${active === item ? 'active' : ''}`} onClick={() => navigate(item)} key={item}>
              <span className="nav-icon">{icon}</span>{item}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><span className="nav-icon">settings</span>Configurações</button>
          <button className="profile profile-button" onClick={() => setProfileOpen(true)} aria-label="Editar perfil da bibliotecária"><div className="avatar">{initials}</div><div><strong>{profile.firstName} {profile.lastName}</strong><small>Bibliotecária · Editar perfil</small></div><span className="material-symbols-rounded">edit</span></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="top-actions"><span className="notification">◌<i /></span><button className="mini-avatar profile-avatar-button" onClick={() => setProfileOpen(true)} aria-label="Editar perfil">{initials}</button></div></header>

        <section className={`content-wrap ${active === 'Dashboard' ? 'dashboard-view' : 'section-view'}`}>
          <div className="eyebrow">{active === 'Dashboard' ? 'VISÃO GERAL' : 'CATÁLOGO DA BIBLIOTECA'}</div>
          <div className="heading-row"><div><h1>{active === 'Dashboard' ? 'Olá, Marina.' : active}</h1><p>{active === 'Dashboard' ? 'Aqui está o que está acontecendo na sua biblioteca hoje.' : 'Acompanhe e organize seu acervo com simplicidade.'}</p></div><button className="primary-btn" onClick={() => { setFormMessage(''); active === 'Categorias' || active === 'Autores' ? (setCatalogModal(active), setCatalogEdit({ type: active, name: '' })) : active === 'Leitores' ? setShowReaderForm(true) : active === 'Exemplares' ? setShowCopyForm(true) : active === 'Empréstimos' ? setShowLoanForm(true) : setShowBookForm(true) }}>+ {active === 'Categorias' ? 'Nova categoria' : active === 'Autores' ? 'Novo autor' : active === 'Leitores' ? 'Novo leitor' : active === 'Exemplares' ? 'Novo exemplar' : active === 'Empréstimos' ? 'Novo empréstimo' : 'Novo livro'}</button></div>
          {(active === 'Categorias' || active === 'Autores') && <CatalogSection type={active} categories={categories} authors={authors} onEdit={(type, item) => { setCatalogModal(type); setCatalogEdit({ type, id: item.id, name: item.name }) }} onDelete={deleteCatalog} />}
          {active !== 'Dashboard' && active !== 'Categorias' && active !== 'Autores' && <DataSection active={active} books={books} readers={readers} copies={copies} loans={loans} onDelete={(section, id) => setDeleteState({ section, id })} onEdit={editRecord} />}

          <div className="hero-grid"><div className="hero-card"><div><span className="hero-kicker">RESUMO DO ACERVO</span><h2>Dados vivos,<br /><em>decisões melhores.</em></h2><p>Visão atualizada a partir dos registros do banco de dados.</p><button className="light-btn">Dados do backend ↗</button></div><div className="hero-art"><div className="book-shape one">{books.length}</div><div className="book-shape two">{copies.length}</div><div className="book-shape three">{readers.length}</div></div></div><div className="stats-card"><div className="card-label">EMPRÉSTIMOS ATIVOS <span>AO VIVO</span></div><div className="big-number">{activeLoans.length}</div><p>{overdueLoans} em atraso · {availableCopies} exemplares disponíveis</p><div className="live-meter"><span style={{ width: `${copies.length ? Math.min(100, (availableCopies / copies.length) * 100) : 0}%` }} /></div><div className="bar-labels"><span>Disponibilidade do acervo</span><span>{copies.length ? Math.round((availableCopies / copies.length) * 100) : 0}%</span></div></div></div>

          <div className="section-heading"><h2>Seu espaço hoje</h2><button className="text-btn" onClick={() => void reloadData()}>Atualizar dados ↻</button></div>
          <div className="metric-grid"><Metric value={String(books.length)} label="livros no acervo" accent="orange" icon="▣" /><Metric value={String(readers.filter((reader) => !reader.isSuspended).length)} label="leitores ativos" accent="cream" icon="♙" /><Metric value={String(activeLoans.length)} label="empréstimos ativos" accent="coral" icon="↗" /><Metric value={String(overdueLoans)} label="devoluções atrasadas" accent="dark" icon="◷" /></div>

          {active === 'Dashboard' && <div className="lower-grid"><section className="panel"><div className="section-heading"><h2>Livros recentes</h2></div><div className="book-list">{books.map((book) => <div className="book-row" key={book.bookId}><div className="book-cover coral">{book.title}</div><div className="book-info"><strong>{book.title}</strong><small>{book.authors?.map((author) => author.name).join(', ') || 'Autores não informados'} · {book.categoryName || `Categoria #${book.categoryId}`}</small></div><span className="tag">ISBN {book.isbn13}</span></div>)}</div></section><section className="panel loans-panel"><div className="section-heading"><h2>Empréstimos recentes</h2></div>{loans.slice(0, 4).map((loan) => <div className="loan-item" key={loan.loanId}><div><strong>Empréstimo #{loan.loanId}</strong><small>Leitor #{loan.readerId} · Exemplar #{loan.copyId}</small></div>{loan.returnedAt ? <span className="tag">Devolvido</span> : <button className="text-btn" onClick={() => registerReturn(loan.loanId)}>Devolver</button>}</div>)}{returnMessage && <p className="api-message">{returnMessage}</p>}</section></div>}
          {showBookForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitBook}><div className="section-heading"><h2>Novo livro</h2><button type="button" className="text-btn" onClick={() => setShowBookForm(false)}>Fechar ×</button></div><label>Título<input required value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} /></label><label>ISBN-13<input required minLength={13} maxLength={13} value={bookForm.isbn13} onChange={(e) => setBookForm({ ...bookForm, isbn13: e.target.value })} /></label><label>ID da categoria<input required type="number" min="1" value={bookForm.categoryId} onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })} /></label>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Salvar livro</button></form></div>}
          {showReaderForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitReader}><div className="section-heading"><h2>Novo leitor</h2><button type="button" className="text-btn" onClick={() => setShowReaderForm(false)}>Fechar ×</button></div><label>Nome completo<input required value={readerForm.fullName} onChange={(e) => setReaderForm({ ...readerForm, fullName: e.target.value })} /></label><label>Matrícula<input required value={readerForm.registrationNumber} onChange={(e) => setReaderForm({ ...readerForm, registrationNumber: e.target.value })} /></label>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Salvar leitor</button></form></div>}
          {showCopyForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitCopy}><div className="section-heading"><h2>Novo exemplar</h2><button type="button" className="text-btn" onClick={() => setShowCopyForm(false)}>Fechar ×</button></div><label>ID do livro<input required type="number" min="1" value={copyForm.bookId} onChange={(e) => setCopyForm({ ...copyForm, bookId: e.target.value })} /></label><label>Código de inventário<input required value={copyForm.inventoryCode} onChange={(e) => setCopyForm({ ...copyForm, inventoryCode: e.target.value })} /></label>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Salvar exemplar</button></form></div>}
          {showLoanForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitLoan}><div className="section-heading"><h2>Novo empréstimo</h2><button type="button" className="text-btn" onClick={() => setShowLoanForm(false)}>Fechar ×</button></div><label>ID do leitor<input required type="number" min="1" value={loanForm.readerId} onChange={(e) => setLoanForm({ ...loanForm, readerId: e.target.value })} /></label><label>ID do exemplar<input required type="number" min="1" value={loanForm.copyId} onChange={(e) => setLoanForm({ ...loanForm, copyId: e.target.value })} /></label><p className="api-message">Prazo padrão: 14 dias corridos.</p>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Registrar empréstimo</button></form></div>}
          {catalogModal && catalogEdit && <div className="modal-backdrop"><form className="book-form" onSubmit={submitCatalog}><div className="section-heading"><h2>{catalogEdit.id ? 'Editar' : 'Novo'} {catalogModal === 'Categorias' ? 'categoria' : 'autor'}</h2><button type="button" className="text-btn" onClick={() => { setCatalogModal(null); setCatalogEdit(null) }}>Fechar ×</button></div><label>Nome<input required value={catalogEdit.name} onChange={(e) => setCatalogEdit({ ...catalogEdit, name: e.target.value })} /></label>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Salvar</button></form></div>}
          {profileOpen && <div className="modal-backdrop"><form className="book-form" onSubmit={saveProfile}><div className="section-heading"><div><span className="card-label">PREFERÊNCIAS</span><h2>Perfil da bibliotecária</h2></div><button type="button" className="text-btn" onClick={() => setProfileOpen(false)}>Fechar ×</button></div><p className="section-description">Esses dados personalizam sua experiência neste navegador. Não é necessário criar uma conta ou entrar.</p><label>Nome<input required value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></label><label>Sobrenome<input required value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></label><label>E-mail (opcional)<input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label><label>Telefone (opcional)<input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setProfileOpen(false)}>Cancelar</button><button className="primary-btn" type="submit">Salvar perfil</button></div></form></div>}
          {editState && <EditModal state={editState} books={books} readers={readers} copies={copies} loans={loans} onClose={() => setEditState(null)} onSubmit={submitEdit} />}
          {deleteState && <div className="modal-backdrop"><div className="book-form confirm-modal"><div className="section-heading"><h2>Excluir registro?</h2><button className="text-btn" onClick={() => setDeleteState(null)}>Fechar ×</button></div><p className="section-description">Essa ação será enviada para a API e poderá ser bloqueada se houver vínculos ativos.</p><div className="modal-actions"><button className="secondary-btn" onClick={() => setDeleteState(null)}>Cancelar</button><button className="danger-btn" onClick={() => void deleteRecord(deleteState.section, deleteState.id)}>Excluir registro</button></div></div></div>}
        </section>
      </main>
    </div>
  )
}

function DataSection({ active, books, readers, copies, loans, onDelete, onEdit }: { active: string; books: Book[]; readers: Reader[]; copies: Copy[]; loans: Loan[]; onDelete: (section: string, id: number) => void; onEdit: (section: string, id: number) => void }) {
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const rows = active === 'Livros' ? books.map((x) => ({ id: x.bookId, cells: [x.title, x.authors?.map((author) => author.name).join(', ') || 'Autores não informados', x.categoryName || `Categoria #${x.categoryId}`] })) : active === 'Leitores' ? readers.map((x) => ({ id: x.readerId, cells: [x.fullName, x.registrationNumber, x.isSuspended ? 'Suspenso' : 'Ativo'] })) : active === 'Exemplares' ? copies.map((x) => ({ id: x.copyId, cells: [x.inventoryCode, `Livro #${x.bookId}`, x.status] })) : loans.map((x) => ({ id: x.loanId, cells: [`Empréstimo #${x.loanId}`, `Leitor #${x.readerId} · Exemplar #${x.copyId}`, x.returnedAt ? 'Devolvido' : 'Ativo'] }))
  return <section className="panel section-panel"><div className="section-heading"><div><h2>{active}</h2><small className="section-description">Gerencie os registros com uma visão rápida e ações diretas.</small></div><div className="view-toggle"><button className={view === 'cards' ? 'selected' : ''} onClick={() => setView('cards')}>▦ Cards</button><button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}>☷ Lista</button><span className="tag">{rows.length} registros</span></div></div>{view === 'cards' ? <div className="entity-grid">{rows.map((row) => <article className="entity-card" key={`${row.cells[0]}-${row.id}`}><div className={`entity-icon ${active.toLowerCase()}`}>{active === 'Livros' ? '▣' : active === 'Leitores' ? '♙' : active === 'Exemplares' ? '▤' : '↗'}</div><div className="entity-card-body"><span className="card-label">{active.slice(0, -1).toUpperCase()}</span><h3>{row.cells[0]}</h3><p>{row.cells[1]}</p><span className="tag">{row.cells[2]}</span></div><div className="entity-actions"><button onClick={() => onEdit(active, row.id)}>Editar</button><button onClick={() => onDelete(active, row.id)}>Excluir</button></div></article>)}</div> : <div className="data-table">{rows.map((row) => <div className="data-row" key={`${row.cells[0]}-${row.id}`}><strong>{row.cells[0]}</strong><span>{row.cells[1]}</span><span className="tag">{row.cells[2]}</span><button className="text-btn" onClick={() => onEdit(active, row.id)}>Editar</button><button className="text-btn" onClick={() => onDelete(active, row.id)}>Excluir</button></div>)}</div>}{rows.length === 0 && <div className="empty-state"><strong>Nenhum registro no banco</strong><small>Cadastre o primeiro registro usando o botão acima.</small></div>}</section>
}
function CatalogSection({ type, categories, authors, onEdit, onDelete }: { type: 'Categorias' | 'Autores'; categories: Category[]; authors: Author[]; onEdit: (type: 'Categorias' | 'Autores', item: { id: number; name: string }) => void; onDelete: (type: 'Categorias' | 'Autores', id: number) => void }) {
  const items = type === 'Categorias' ? categories.map((x) => ({ id: x.categoryId, name: x.name, status: x.isActive ? 'Ativa' : 'Inativa' })) : authors.map((x) => ({ id: x.authorId, name: x.name, status: 'Autor' }))
  return <section className="panel section-panel"><div className="section-heading"><div><h2>{type}</h2><small className="section-description">Cadastre e organize os dados usados no catálogo.</small></div><span className="tag">{items.length} registros</span></div><div className="entity-grid">{items.map((item) => <article className="entity-card" key={item.id}><div className="entity-icon">{type === 'Categorias' ? '▤' : '♙'}</div><div className="entity-card-body"><span className="card-label">{type === 'Categorias' ? 'CATEGORIA' : 'AUTOR'}</span><h3>{item.name}</h3><span className="tag">{item.status}</span></div><div className="entity-actions"><button onClick={() => onEdit(type, item)}>Editar</button><button onClick={() => onDelete(type, item.id)}>Excluir</button></div></article>)}</div>{items.length === 0 && <div className="empty-state"><strong>Nenhum registro cadastrado</strong><small>Use o botão acima para criar o primeiro.</small></div>}</section>
}
function EditModal({ state, books, readers, copies, loans, onClose, onSubmit }: { state: { section: string; id: number }; books: Book[]; readers: Reader[]; copies: Copy[]; loans: Loan[]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const book = books.find((x) => x.bookId === state.id); const reader = readers.find((x) => x.readerId === state.id); const copy = copies.find((x) => x.copyId === state.id); const loan = loans.find((x) => x.loanId === state.id)
  return <div className="modal-backdrop"><form className="book-form edit-modal" onSubmit={onSubmit}><div className="section-heading"><div><span className="card-label">GERENCIAMENTO</span><h2>Editar {state.section.slice(0, -1).toLowerCase()}</h2></div><button type="button" className="text-btn" onClick={onClose}>Fechar ×</button></div>{state.section === 'Livros' && book && <><label>Título<input name="title" required defaultValue={book.title} /></label><label>ISBN-13<input name="isbn13" required minLength={13} maxLength={13} defaultValue={book.isbn13} /></label><label>ID da categoria<input name="categoryId" required type="number" min="1" defaultValue={book.categoryId} /></label><label className="checkbox-label"><input name="isArchived" type="checkbox" defaultChecked={book.isArchived} /> Livro arquivado</label></>}{state.section === 'Leitores' && reader && <><label>Nome completo<input name="fullName" required defaultValue={reader.fullName} /></label><label>Matrícula<input name="registrationNumber" required defaultValue={reader.registrationNumber} /></label><label className="checkbox-label"><input name="isSuspended" type="checkbox" defaultChecked={reader.isSuspended} /> Leitor suspenso</label></>}{state.section === 'Exemplares' && copy && <><label>ID do livro<input name="bookId" required type="number" min="1" defaultValue={copy.bookId} /></label><label>Código de inventário<input name="inventoryCode" required defaultValue={copy.inventoryCode} /></label><label>Status<select name="status" defaultValue={copy.status}><option>Available</option><option>Loaned</option><option>Maintenance</option><option>Lost</option></select></label></>}{state.section === 'Empréstimos' && loan && <><label>ID do leitor<input name="readerId" required type="number" min="1" defaultValue={loan.readerId} /></label><label>ID do exemplar<input name="copyId" required type="number" min="1" defaultValue={loan.copyId} /></label><label>Prazo<input name="dueAt" required type="datetime-local" defaultValue={loan.dueAt.slice(0, 16)} /></label><label>Devolvido em<input name="returnedAt" type="datetime-local" defaultValue={loan.returnedAt?.slice(0, 16) ?? ''} /></label></>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button><button className="primary-btn" type="submit">Salvar alterações</button></div></form></div>
}
function Metric({ value, label, accent, icon }: { value: string; label: string; accent: string; icon: string }) { return <div className={`metric ${accent}`}><div className="metric-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div><small>↗</small></div> }

export default App
