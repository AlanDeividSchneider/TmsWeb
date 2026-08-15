import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [perfis, setPerfis] = useState([]); // Guarda a lista dinâmica de perfis da API
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Estado para controlar Edição
  const [funcEditandoId, setFuncEditandoId] = useState(null);

  // Campos do Formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [unidade, setUnidade] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('');

  // Carrega Funcionários e Perfis em paralelo
  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resFuncionarios, resPerfis] = await Promise.all([
        api.get('/funcionarios/'),
        api.get('/permissoes/perfis') // Busca a lista de perfis do banco de dados
      ]);

      setFuncionarios(resFuncionarios.data);
      setPerfis(resPerfis.data);

      // Define o primeiro perfil disponível como valor padrão
      if (resPerfis.data.length > 0 && !perfil) {
        setPerfil(String(resPerfis.data[0].ID));
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAbrirModalNovo = () => {
    setFuncEditandoId(null);
    setNome('');
    setCpf('');
    setUnidade('');
    setLogin('');
    setSenha('');
    // Seleciona o primeiro perfil por padrão se existir
    setPerfil(perfis.length > 0 ? String(perfis[0].ID) : '');
    setError('');
    setShowModal(true);
  };

  const handleAbrirModalEditar = (func) => {
    setFuncEditandoId(func.ID);
    setNome(func.NOME);
    setCpf(func.CPF);
    setUnidade(func.UNIDADE);
    setLogin(func.LOGIN);
    setSenha('');
    setPerfil(String(func.PERFIL));
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id, nomeFunc) => {
    if (!id) {
      alert('Erro: ID do funcionário inválido.');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o funcionário "${nomeFunc}"?`)) {
      return;
    }

    try {
      await api.delete(`/funcionarios/${id}`);
      alert('Funcionário excluído com sucesso!');
      carregarDados();
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert(err.response.data?.detail || 'Você não tem permissão para excluir funcionários.');
      } else if (err.response && err.response.data?.detail) {
        alert(err.response.data.detail);
      } else {
        alert('Erro ao excluir funcionário.');
      }
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (funcEditandoId) {
        // Modo Edição
        const payload = {
          NOME: nome,
          UNIDADE: unidade,
          PERFIL: Number(perfil),
        };
        if (senha) payload.SENHA = senha;

        await api.put(`/funcionarios/${funcEditandoId}`, payload);
      } else {
        // Modo Criação
        await api.post('/funcionarios/', {
          NOME: nome,
          CPF: cpf,
          UNIDADE: unidade,
          LOGIN: login,
          SENHA: senha,
          PERFIL: Number(perfil),
        });
      }

      setShowModal(false);
      carregarDados();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar funcionário.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Funcionários</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Controle de usuários e permissões de acesso</p>
        </div>
        <button onClick={handleAbrirModalNovo} style={styles.btnPrimary}>
          + Novo Funcionário
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.th}>
                <th style={styles.cell}>ID</th>
                <th style={styles.cell}>Nome</th>
                <th style={styles.cell}>Login</th>
                <th style={styles.cell}>CPF</th>
                <th style={styles.cell}>Unidade</th>
                <th style={styles.cell}>Perfil</th>
                <th style={{ ...styles.cell, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((f) => {
                // Localiza dinamicamente o objeto do perfil correspondente
                const perfilEncontrado = perfis.find((p) => String(p.ID) === String(f.PERFIL));
                const nomePerfil = perfilEncontrado ? perfilEncontrado.NOME : f.PERFIL;

                return (
                  <tr key={f.ID} style={styles.tr}>
                    <td style={styles.cell}>#{f.ID}</td>
                    <td style={{ ...styles.cell, fontWeight: '600' }}>{f.NOME}</td>
                    <td style={styles.cell}>{f.LOGIN}</td>
                    <td style={styles.cell}>{f.CPF}</td>
                    <td style={styles.cell}>{f.UNIDADE}</td>
                    <td style={styles.cell}>
                      <span
                        style={
                          String(nomePerfil).toUpperCase() === 'ADMINISTRADOR'
                            ? styles.badgeAdmin
                            : styles.badgeUser
                        }
                      >
                        {nomePerfil}
                      </span>
                    </td>
                    <td style={{ ...styles.cell, textAlign: 'center' }}>
                      <button onClick={() => handleAbrirModalEditar(f)} style={styles.btnEdit}>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(f.ID, f.NOME)}
                        style={styles.btnDelete}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Reutilizável */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0, color: '#0f172a' }}>
              {funcEditandoId ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h2>

            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSalvar}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nome Completo:</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>CPF (11 dígitos):</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    disabled={!!funcEditandoId}
                    maxLength={11}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Unidade:</label>
                  <input
                    type="text"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Login de Acesso:</label>
                  <input
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    disabled={!!funcEditandoId}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Perfil:</label>
                  <select
                    value={perfil}
                    onChange={(e) => setPerfil(e.target.value)}
                    style={styles.input}
                  >
                    {perfis.map((p) => (
                      <option key={p.ID} value={p.ID}>
                        {p.NOME}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {funcEditandoId ? 'Nova Senha (deixe em branco para manter a atual):' : 'Senha:'}
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required={!funcEditandoId}
                  minLength={6}
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  {funcEditandoId ? 'Atualizar' : 'Salvar Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos
const styles = {
  container: { padding: '2rem', width: '100%', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' },
  th: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  cell: { padding: '0.85rem 1rem', color: '#334155' },
  row: { display: 'flex', gap: '1rem' },
  btnPrimary: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' },
  btnSecondary: { backgroundColor: '#e2e8f0', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' },
  btnEdit: { backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginRight: '0.4rem' },
  btnDelete: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  badgeAdmin: { backgroundColor: '#fef3c7', color: '#92400e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  badgeUser: { backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  inputGroup: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '0.3rem' },
  input: { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' },
  errorAlert: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }
};