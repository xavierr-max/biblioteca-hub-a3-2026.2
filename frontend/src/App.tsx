import { useEffect, useState, type FormEvent } from 'react'
import { libraryApi, type Book, type Copy, type Loan, type Reader } from './services/api'
import './index.css'
import './modal.css'

function App() {
  const [active, setActive] = useState(() => localStorage.getItem('biblioteca.activeSection') ?? 'Dashboard')
  const [search, setSearch] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [readers, setReaders] = useState<Reader[]>([])
  const [copies, setCopies] = useState<Copy[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
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
  async function reloadData() {
    const [bookData, readerData, copyData, loanData] = await Promise.all([libraryApi.books(), libraryApi.readers(), libraryApi.copies(), libraryApi.loans()])
    setBooks(bookData); setReaders(readerData); setCopies(copyData); setLoans(loanData)
  }
  useEffect(() => { void reloadData().catch(() => undefined) }, [])
  function navigate(section: string) { setActive(section); localStorage.setItem('biblioteca.activeSection', section) }
  const filtered = books.filter((book) => `${book.title} ${book.isbn13}`.toLowerCase().includes(search.toLowerCase()))
  const activeLoans = loans.filter((loan) => !loan.returnedAt)
  const availableCopies = copies.filter((copy) => copy.status === 'Available').length
  const overdueLoans = activeLoans.filter((loan) => new Date(loan.dueAt) < new Date()).length
  async function submitBook(event: FormEvent) {
    event.preventDefault(); setFormMessage('Salvando...')
    try { await libraryApi.createBook({ ...bookForm, categoryId: Number(bookForm.categoryId) }); await reloadData(); setFormMessage('Livro cadastrado.'); setShowBookForm(false); setBookForm({ title: '', isbn13: '', categoryId: '1' }) }
    catch { setFormMessage('Não foi possível salvar. Verifique a API.') }
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">b</span> biblioteca</div>
        <div className="workspace-label">GESTÃO</div>
        <nav>
          {['Dashboard', 'Livros', 'Leitores', 'Exemplares', 'Empréstimos', 'Relatórios'].map((item, index) => (
            <button className={`nav-item ${active === item ? 'active' : ''}`} onClick={() => navigate(item)} key={item}>
              <span className="nav-icon">{['✦', '▣', '♙', '▤', '↗', '◒'][index]}</span>{item}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><span className="spark">✦</span><strong>Biblioteca em movimento</strong><small>Organize seu acervo com clareza.</small><button>Explorar recursos ↗</button></div>
          <button className="nav-item"><span className="nav-icon">⚙</span>Configurações</button>
          <div className="profile"><div className="avatar">MS</div><div><strong>Marina Silva</strong><small>Bibliotecária</small></div><span>•••</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar livros, leitores..." /></div><div className="top-actions"><span className="notification">◌<i /></span><div className="mini-avatar">MS</div></div></header>

        <section className={`content-wrap ${active === 'Dashboard' ? 'dashboard-view' : 'section-view'}`}>
          <div className="eyebrow">{active === 'Dashboard' ? 'VISÃO GERAL' : 'CATÁLOGO DA BIBLIOTECA'}</div>
          <div className="heading-row"><div><h1>{active === 'Dashboard' ? 'Olá, Marina.' : active}</h1><p>{active === 'Dashboard' ? 'Aqui está o que está acontecendo na sua biblioteca hoje.' : 'Acompanhe e organize seu acervo com simplicidade.'}</p></div><button className="primary-btn" onClick={() => { setFormMessage(''); active === 'Leitores' ? setShowReaderForm(true) : active === 'Exemplares' ? setShowCopyForm(true) : active === 'Empréstimos' ? setShowLoanForm(true) : setShowBookForm(true) }}>+ {active === 'Leitores' ? 'Novo leitor' : active === 'Exemplares' ? 'Novo exemplar' : active === 'Empréstimos' ? 'Novo empréstimo' : 'Novo livro'}</button></div>
          {active !== 'Dashboard' && <DataSection active={active} books={books} readers={readers} copies={copies} loans={loans} />}

          <div className="hero-grid"><div className="hero-card"><div><span className="hero-kicker">RESUMO DO ACERVO</span><h2>Dados vivos,<br /><em>decisões melhores.</em></h2><p>Visão atualizada a partir dos registros do banco de dados.</p><button className="light-btn">Dados do backend ↗</button></div><div className="hero-art"><div className="book-shape one">{books.length}</div><div className="book-shape two">{copies.length}</div><div className="book-shape three">{readers.length}</div></div></div><div className="stats-card"><div className="card-label">EMPRÉSTIMOS ATIVOS <span>AO VIVO</span></div><div className="big-number">{activeLoans.length}</div><p>{overdueLoans} em atraso · {availableCopies} exemplares disponíveis</p><div className="live-meter"><span style={{ width: `${copies.length ? Math.min(100, (availableCopies / copies.length) * 100) : 0}%` }} /></div><div className="bar-labels"><span>Disponibilidade do acervo</span><span>{copies.length ? Math.round((availableCopies / copies.length) * 100) : 0}%</span></div></div></div>

          <div className="section-heading"><h2>Seu espaço hoje</h2><button className="text-btn">Ver relatórios ↗</button></div>
          <div className="metric-grid"><Metric value={String(books.length)} label="livros no acervo" accent="orange" icon="▣" /><Metric value={String(readers.filter((reader) => !reader.isSuspended).length)} label="leitores ativos" accent="cream" icon="♙" /><Metric value={String(activeLoans.length)} label="empréstimos ativos" accent="coral" icon="↗" /><Metric value={String(overdueLoans)} label="devoluções atrasadas" accent="dark" icon="◷" /></div>

          {active === 'Dashboard' && <div className="lower-grid"><section className="panel"><div className="section-heading"><h2>Livros recentes</h2></div><div className="book-list">{filtered.map((book) => <div className="book-row" key={book.bookId}><div className="book-cover coral">{book.title}</div><div className="book-info"><strong>{book.title}</strong><small>ISBN {book.isbn13}</small></div><span className="tag">Categoria #{book.categoryId}</span></div>)}</div></section><section className="panel loans-panel"><div className="section-heading"><h2>Empréstimos recentes</h2></div>{loans.slice(0, 4).map((loan) => <div className="loan-item" key={loan.loanId}><div><strong>Empréstimo #{loan.loanId}</strong><small>Leitor #{loan.readerId} · Exemplar #{loan.copyId}</small></div>{loan.returnedAt ? <span className="tag">Devolvido</span> : <button className="text-btn" onClick={() => registerReturn(loan.loanId)}>Devolver</button>}</div>)}{returnMessage && <p className="api-message">{returnMessage}</p>}</section></div>}
          {showBookForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitBook}><div className="section-heading"><h2>Novo livro</h2><button type="button" className="text-btn" onClick={() => setShowBookForm(false)}>Fechar ×</button></div><label>Título<input required value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} /></label><label>ISBN-13<input required minLength={13} maxLength={13} value={bookForm.isbn13} onChange={(e) => setBookForm({ ...bookForm, isbn13: e.target.value })} /></label><label>ID da categoria<input required type="number" min="1" value={bookForm.categoryId} onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })} /></label>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Salvar livro</button></form></div>}
          {showReaderForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitReader}><div className="section-heading"><h2>Novo leitor</h2><button type="button" className="text-btn" onClick={() => setShowReaderForm(false)}>Fechar ×</button></div><label>Nome completo<input required value={readerForm.fullName} onChange={(e) => setReaderForm({ ...readerForm, fullName: e.target.value })} /></label><label>Matrícula<input required value={readerForm.registrationNumber} onChange={(e) => setReaderForm({ ...readerForm, registrationNumber: e.target.value })} /></label>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Salvar leitor</button></form></div>}
          {showCopyForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitCopy}><div className="section-heading"><h2>Novo exemplar</h2><button type="button" className="text-btn" onClick={() => setShowCopyForm(false)}>Fechar ×</button></div><label>ID do livro<input required type="number" min="1" value={copyForm.bookId} onChange={(e) => setCopyForm({ ...copyForm, bookId: e.target.value })} /></label><label>Código de inventário<input required value={copyForm.inventoryCode} onChange={(e) => setCopyForm({ ...copyForm, inventoryCode: e.target.value })} /></label>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Salvar exemplar</button></form></div>}
          {showLoanForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitLoan}><div className="section-heading"><h2>Novo empréstimo</h2><button type="button" className="text-btn" onClick={() => setShowLoanForm(false)}>Fechar ×</button></div><label>ID do leitor<input required type="number" min="1" value={loanForm.readerId} onChange={(e) => setLoanForm({ ...loanForm, readerId: e.target.value })} /></label><label>ID do exemplar<input required type="number" min="1" value={loanForm.copyId} onChange={(e) => setLoanForm({ ...loanForm, copyId: e.target.value })} /></label><p className="api-message">Prazo padrão: 14 dias corridos.</p>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Registrar empréstimo</button></form></div>}
        </section>
      </main>
    </div>
  )
}

function DataSection({ active, books, readers, copies, loans }: { active: string; books: Book[]; readers: Reader[]; copies: Copy[]; loans: Loan[] }) {
  const rows = active === 'Livros' ? books.map((x) => [x.title, `ISBN ${x.isbn13}`, `Categoria #${x.categoryId}`]) : active === 'Leitores' ? readers.map((x) => [x.fullName, x.registrationNumber, x.isSuspended ? 'Suspenso' : 'Ativo']) : active === 'Exemplares' ? copies.map((x) => [x.inventoryCode, `Livro #${x.bookId}`, x.status]) : loans.map((x) => [`Empréstimo #${x.loanId}`, `Leitor #${x.readerId} · Exemplar #${x.copyId}`, x.returnedAt ? 'Devolvido' : 'Ativo'])
  return <section className="panel section-panel"><div className="section-heading"><h2>{active}</h2><span className="tag">{rows.length} registros</span></div><div className="data-table">{rows.map((row, i) => <div className="data-row" key={`${row[0]}-${i}`}><strong>{row[0]}</strong><span>{row[1]}</span><span className="tag">{row[2]}</span></div>)}</div>{rows.length === 0 && <div className="empty-state"><strong>Nenhum registro no banco</strong><small>Cadastre o primeiro registro usando o botão acima.</small></div>}</section>
}
function Metric({ value, label, accent, icon }: { value: string; label: string; accent: string; icon: string }) { return <div className={`metric ${accent}`}><div className="metric-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div><small>↗</small></div> }

export default App
