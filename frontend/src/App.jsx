import { useState } from 'react';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Funcionarios from './pages/Funcionarios';
import GestaoPermissoes from './pages/GestaoPermissoes';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [abaAtiva, setAbaAtiva] = useState('clientes'); // 'clientes', 'funcionarios' ou 'permissoes'
  const [menuAberto, setMenuAberto] = useState(null); // 'cadastros', 'gestao' ou null

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // Alterna a abertura do menu dropdown
  const toggleMenu = (menu) => {
    setMenuAberto((prev) => (prev === menu ? null : menu));
  };

  // Seleciona a aba e fecha o menu
  const selecionarAba = (aba) => {
    setAbaAtiva(aba);
    setMenuAberto(null);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Verifica se alguma tela do módulo está ativa para destacar o botão principal
  const isCadastrosAtivo = abaAtiva === 'clientes' || abaAtiva === 'funcionarios';
  const isGestaoAtivo = abaAtiva === 'permissoes';

  return (
    <div>
      {/* Menu Superior / Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLinks}>
          <span style={styles.brand}>TMS System</span>

          {/* Módulo: Cadastros */}
          <div style={styles.dropdownContainer}>
            <button
              onClick={() => toggleMenu('cadastros')}
              style={isCadastrosAtivo ? styles.navBtnActive : styles.navBtn}
            >
              Cadastros ▾
            </button>

            {menuAberto === 'cadastros' && (
              <div style={styles.dropdownMenu}>
                <button
                  onClick={() => selecionarAba('clientes')}
                  style={abaAtiva === 'clientes' ? styles.dropdownItemActive : styles.dropdownItem}
                >
                  Clientes
                </button>
                <button
                  onClick={() => selecionarAba('funcionarios')}
                  style={abaAtiva === 'funcionarios' ? styles.dropdownItemActive : styles.dropdownItem}
                >
                  Funcionários
                </button>
              </div>
            )}
          </div>

          {/* Módulo: Gestão */}
          <div style={styles.dropdownContainer}>
            <button
              onClick={() => toggleMenu('gestao')}
              style={isGestaoAtivo ? styles.navBtnActive : styles.navBtn}
            >
              Gestão ▾
            </button>

            {menuAberto === 'gestao' && (
              <div style={styles.dropdownMenu}>
                <button
                  onClick={() => selecionarAba('permissoes')}
                  style={abaAtiva === 'permissoes' ? styles.dropdownItemActive : styles.dropdownItem}
                >
                  Permissões
                </button>
              </div>
            )}
          </div>
        </div>

        <button onClick={handleLogout} style={styles.btnLogout}>
          Sair
        </button>
      </nav>

      {/* Renderiza a tela baseada na aba ativa */}
      <main>
        {abaAtiva === 'clientes' && <Clientes onLogout={handleLogout} />}
        {abaAtiva === 'funcionarios' && <Funcionarios />}
        {abaAtiva === 'permissoes' && <GestaoPermissoes />}
      </main>
    </div>
  );
}

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '0.75rem 2rem' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '1rem' },
  brand: { color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '1rem' },
  navBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.95rem', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '4px' },
  navBtnActive: { background: '#1e293b', border: 'none', color: '#38bdf8', fontSize: '0.95rem', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: '600' },
  
  /* Estilos do Dropdown */
  dropdownContainer: { position: 'relative' },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '0.5rem',
    backgroundColor: '#1e293b',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    border: '1px solid #334155',
    minWidth: '160px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  dropdownItem: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    padding: '0.6rem 1rem',
    textAlign: 'left',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '100%'
  },
  dropdownItemActive: {
    background: '#334155',
    border: 'none',
    color: '#38bdf8',
    padding: '0.6rem 1rem',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%'
  },

  btnLogout: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }
};