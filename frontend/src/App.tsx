import { useEffect, useState, type FormEvent } from 'react'
import { libraryApi } from './services/api'
import './index.css'
import './modal.css'

const fallbackBooks = [
  { title: 'Clean Code', author: 'Robert C. Martin', category: 'Tecnologia', status: 'Disponível', color: 'coral' },
  { title: 'Dom Casmurro', author: 'Machado de Assis', category: 'Literatura', status: 'Emprestado', color: 'cream' },
  { title: 'O Design do Dia a Dia', author: 'Don Norman', category: 'Design', status: 'Disponível', color: 'orange' },
]

function App() {
  const [active, setActive] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [books, setBooks] = useState(fallbackBooks)
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [apiOffline, setApiOffline] = useState(false)
  const [showBookForm, setShowBookForm] = useState(false)
  const [bookForm, setBookForm] = useState({ title: '', isbn13: '', categoryId: '1' })
  const [showReaderForm, setShowReaderForm] = useState(false)
  const [readerForm, setReaderForm] = useState({ fullName: '', registrationNumber: '' })
  const [formMessage, setFormMessage] = useState('')
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL ?? 'http://localhost:5180/api/books')
      .then((response) => { if (!response.ok) throw new Error('API unavailable'); return response.json() })
      .then((items: Array<{ title: string; isbn13: string }>) => setBooks(items.map((item, index) => ({ title: item.title, author: 'Catálogo conectado', category: `ISBN ${item.isbn13}`, status: index % 2 ? 'Emprestado' : 'Disponível', color: ['coral', 'cream', 'orange'][index % 3] }))))
      .catch(() => setApiOffline(true))
      .finally(() => setLoadingBooks(false))
  }, [])
  const filtered = books.filter((book) => `${book.title} ${book.author}`.toLowerCase().includes(search.toLowerCase()))
  async function submitBook(event: FormEvent) {
    event.preventDefault(); setFormMessage('Salvando...')
    try { await libraryApi.createBook({ ...bookForm, categoryId: Number(bookForm.categoryId) }); setFormMessage('Livro cadastrado.'); setShowBookForm(false); setBookForm({ title: '', isbn13: '', categoryId: '1' }) }
    catch { setFormMessage('Não foi possível salvar. Verifique a API.') }
  }
  async function submitReader(event: FormEvent) {
    event.preventDefault(); setFormMessage('Salvando...')
    try { await libraryApi.createReader(readerForm); setFormMessage('Leitor cadastrado.'); setShowReaderForm(false); setReaderForm({ fullName: '', registrationNumber: '' }) }
    catch { setFormMessage('Não foi possível salvar. Verifique a API.') }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">b</span> biblioteca</div>
        <div className="workspace-label">GESTÃO</div>
        <nav>
          {['Dashboard', 'Livros', 'Leitores', 'Empréstimos', 'Relatórios'].map((item, index) => (
            <button className={`nav-item ${active === item ? 'active' : ''}`} onClick={() => setActive(item)} key={item}>
              <span className="nav-icon">{['✦', '▣', '♙', '↗', '◒'][index]}</span>{item}
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

        <section className="content-wrap">
          <div className="eyebrow">{active === 'Dashboard' ? 'VISÃO GERAL' : 'CATÁLOGO DA BIBLIOTECA'}</div>
          <div className="heading-row"><div><h1>{active === 'Dashboard' ? 'Olá, Marina.' : active}</h1><p>{active === 'Dashboard' ? 'Aqui está o que está acontecendo na sua biblioteca hoje.' : 'Acompanhe e organize seu acervo com simplicidade.'}</p></div><button className="primary-btn" onClick={() => { setFormMessage(''); active === 'Leitores' ? setShowReaderForm(true) : setShowBookForm(true) }}>+ {active === 'Leitores' ? 'Novo leitor' : 'Novo livro'}</button></div>

          <div className="hero-grid"><div className="hero-card"><div><span className="hero-kicker">RESUMO DO DIA</span><h2>Seu acervo está<br /><em>ganhando vida.</em></h2><p>12 novos empréstimos foram registrados esta semana.</p><button className="light-btn">Ver movimentações ↗</button></div><div className="hero-art"><div className="book-shape one">A</div><div className="book-shape two">B</div><div className="book-shape three">C</div></div></div><div className="stats-card"><div className="card-label">ATIVIDADE <span>•••</span></div><div className="big-number">24 <small>+18%</small></div><p>empréstimos este mês</p><div className="bars">{[35, 54, 42, 75, 58, 88, 68, 96, 74, 100].map((height, i) => <span key={i} style={{ height: `${height}%` }} className={i === 9 ? 'highlight' : ''} />)}</div><div className="bar-labels"><span>01</span><span>10</span><span>20</span><span>30</span></div></div></div>

          <div className="section-heading"><h2>Seu espaço hoje</h2><button className="text-btn">Ver relatórios ↗</button></div>
          <div className="metric-grid"><Metric value="248" label="livros no acervo" accent="orange" icon="▣" /><Metric value="86" label="leitores ativos" accent="cream" icon="♙" /><Metric value="12" label="empréstimos ativos" accent="coral" icon="↗" /><Metric value="03" label="devoluções atrasadas" accent="dark" icon="◷" /></div>

          <div className="lower-grid"><section className="panel"><div className="section-heading"><h2>Livros recentes</h2><button className="text-btn">Ver catálogo ↗</button></div>{loadingBooks && <p className="api-message">Carregando catálogo...</p>}{apiOffline && <p className="api-message">API indisponível · mostrando dados de demonstração</p>}<div className="book-list">{filtered.map((book) => <div className="book-row" key={book.title}><div className={`book-cover ${book.color}`}>{book.title.split(' ').map((word) => <span key={word}>{word}</span>)}</div><div className="book-info"><strong>{book.title}</strong><small>{book.author} · {book.category}</small></div><span className={`status ${book.status === 'Disponível' ? 'available' : 'loaned'}`}>{book.status}</span><span className="row-more">•••</span></div>)}</div></section><section className="panel loans-panel"><div className="section-heading"><h2>Próximas devoluções</h2><button className="text-btn">Ver todas</button></div><div className="loan-item"><div className="loan-date"><strong>12</strong><small>JUN</small></div><div><strong>Dom Casmurro</strong><small>Lucas Andrade</small></div><span className="tag warning">Amanhã</span></div><div className="loan-item"><div className="loan-date"><strong>15</strong><small>JUN</small></div><div><strong>Clean Code</strong><small>Beatriz Souza</small></div><span className="tag">3 dias</span></div><div className="loan-item"><div className="loan-date"><strong>18</strong><small>JUN</small></div><div><strong>O Design do Dia a Dia</strong><small>Rafael Costa</small></div><span className="tag">6 dias</span></div></section></div>
          {showBookForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitBook}><div className="section-heading"><h2>Novo livro</h2><button type="button" className="text-btn" onClick={() => setShowBookForm(false)}>Fechar ×</button></div><label>Título<input required value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} /></label><label>ISBN-13<input required minLength={13} maxLength={13} value={bookForm.isbn13} onChange={(e) => setBookForm({ ...bookForm, isbn13: e.target.value })} /></label><label>ID da categoria<input required type="number" min="1" value={bookForm.categoryId} onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })} /></label>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Salvar livro</button></form></div>}
          {showReaderForm && <div className="modal-backdrop"><form className="book-form" onSubmit={submitReader}><div className="section-heading"><h2>Novo leitor</h2><button type="button" className="text-btn" onClick={() => setShowReaderForm(false)}>Fechar ×</button></div><label>Nome completo<input required value={readerForm.fullName} onChange={(e) => setReaderForm({ ...readerForm, fullName: e.target.value })} /></label><label>Matrícula<input required value={readerForm.registrationNumber} onChange={(e) => setReaderForm({ ...readerForm, registrationNumber: e.target.value })} /></label>{formMessage && <p className="api-message">{formMessage}</p>}<button className="primary-btn" type="submit">Salvar leitor</button></form></div>}
        </section>
      </main>
    </div>
  )
}

function Metric({ value, label, accent, icon }: { value: string; label: string; accent: string; icon: string }) { return <div className={`metric ${accent}`}><div className="metric-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div><small>↗</small></div> }

export default App
