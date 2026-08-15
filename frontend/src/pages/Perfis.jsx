import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Perfis({ onLogout }) {
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Estado para controlar se estamos EDITANDO ou CRIANDO
  const [perfilEditandoId, setPerfilEditandoId] = useState(null);

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  // Carregar lista de perfis da API
  const carregarPerfis = async () => {
    try {
      setLoading(true);
      const response = await api.get('/permissoes/perfis');
      setPerfis(response.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        const mensagemErro = err.response.data?.detail || 'Você não tem permissão para acessar esta tela.';
        alert(mensagemErro);
      } else {
        alert('Erro ao carregar perfis.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  // Abre o Modal para CRIAR um novo perfil
  const handleAbrirModalNovo = () => {
    setPerfilEditandoId(null);
    setNome('');
    setDescricao('');
    setError('');
    setShowModal(true);
  };

  // Abre o Modal preenchido para EDITAR
  const handleAbrirModalEditar = (perfil) => {
    const id = perfil.ID || perfil.id;
    setPerfilEditandoId(id);
    setNome(perfil.NOME || '');
    setDescricao(perfil.DESCRICAO || '');
    setError('');
    setShowModal(true);
  };

  // Salvar (funciona tanto para CRIAÇÃO quanto para EDIÇÃO)
  const handleSalvar = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (perfilEditandoId) {
        // Modo Edição (PUT)
        await api.put(`/permissoes/perfis/${perfilEditandoId}`, {
          NOME: nome,
          DESCRICAO: descricao,
        });
      } else {
        // Modo Criação (POST)
        await api.post('/permissoes/perfis', {
          NOME: nome,
          DESCRICAO: descricao,
        });
      }

      // Fecha modal e recarrega
      setShowModal(false);
      carregarPerfis();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar perfil.');
    }
  };

  // Excluir Perfil
  const handleExcluir = async (id, nomePerfil) => {
    if (!confirm(`Tem certeza que deseja excluir o perfil "${nomePerfil}"?`)) return;

    try {
      await api.delete(`/permissoes/perfis/${id}`);
      carregarPerfis();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao excluir perfil.');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Perfis</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Controle de perfis de acesso</p>
        </div>
        <div>
          <button onClick={handleAbrirModalNovo} style={styles.btnPrimary}>
            + Novo Perfil
          </button>
        </div>
      </div>

      {/* Tabela de Perfis */}
      <div style={styles.card}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando perfis...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.th}>
                <th style={styles.cell}>ID</th>
                <th style={styles.cell}>Nome</th>
                <th style={styles.cell}>Descrição</th>
                <th style={{ ...styles.cell, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {perfis.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ ...styles.cell, textAlign: 'center', color: '#94a3b8' }}>
                    Nenhum perfil cadastrado.
                  </td>
                </tr>
              ) : (
                perfis.map((p) => {
                  const id = p.ID || p.id;
                  return (
                    <tr key={id} style={styles.tr}>
                      <td style={styles.cell}>#{id}</td>
                      <td style={{ ...styles.cell, fontWeight: '600' }}>{p.NOME}</td>
                      <td style={styles.cell}>{p.DESCRICAO || '-'}</td>
                      <td style={styles.cell}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleAbrirModalEditar(p)}
                            style={styles.btnEdit}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleExcluir(id, p.NOME)}
                            style={styles.btnDelete}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Reutilizável (Novo / Editar) */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0, color: '#0f172a' }}>
              {perfilEditandoId ? 'Editar Perfil' : 'Novo Perfil'}
            </h2>

            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSalvar}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nome do Perfil:</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="Ex: Gerente Financeiro"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Descrição:</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  style={styles.input}
                  placeholder="Ex: Acesso completo aos relatórios e financeiro"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  {perfilEditandoId ? 'Atualizar' : 'Salvar Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos alinhados exatamente com a tela de Clientes
const styles = {
  container: { padding: '2rem', width: '100%', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' },
  th: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  cell: { padding: '0.85rem 1rem', color: '#334155' },
  btnPrimary: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', marginLeft: '0.5rem' },
  btnSecondary: { backgroundColor: '#e2e8f0', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' },
  btnDanger: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', marginLeft: '0.5rem' },
  btnEdit: { backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginRight: '0.4rem' },
  btnDelete: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  inputGroup: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '0.3rem' },
  input: { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' },
  errorAlert: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }
};