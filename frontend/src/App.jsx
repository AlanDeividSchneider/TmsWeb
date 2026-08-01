import { useState } from 'react';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Funcionarios from './pages/Funcionarios';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [abaAtiva, setAbaAtiva] = useState('clientes'); // 'clientes' ou 'funcionarios'

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      {/* Menu Superior / Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLinks}>
          <span style={styles.brand}>TMS System</span>
          <button
            onClick={() => setAbaAtiva('clientes')}
            style={abaAtiva === 'clientes' ? styles.navBtnActive : styles.navBtn}
          >
            Clientes
          </button>
          <button
            onClick={() => setAbaAtiva('funcionarios')}
            style={abaAtiva === 'funcionarios' ? styles.navBtnActive : styles.navBtn}
          >
            Funcionários
          </button>
        </div>
        <button onClick={handleLogout} style={styles.btnLogout}>
          Sair
        </button>
      </nav>

      {/* Renderiza a tela baseada na aba ativa */}
      <main>
        {abaAtiva === 'clientes' ? <Clientes onLogout={handleLogout} /> : <Funcionarios />}
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
  btnLogout: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }
};