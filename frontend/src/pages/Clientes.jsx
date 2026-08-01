import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Clientes({ onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Estado para controlar se estamos EDITANDO ou CRIANDO
  const [clienteEditandoId, setClienteEditandoId] = useState(null);

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [cpfcnpj, setCpfcnpj] = useState('');
  const [unidade, setUnidade] = useState('');

  // Carregar lista de clientes da API
  const carregarClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clientes/');
      setClientes(response.data);
    } catch (err) {
      alert('Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  // Abre o Modal para CRIAR um novo cliente
  const handleAbrirModalNovo = () => {
    setClienteEditandoId(null);
    setNome('');
    setCpfcnpj('');
    setUnidade('');
    setError('');
    setShowModal(true);
  };

  // Abre o Modal preenchido para EDITAR
  const handleAbrirModalEditar = (cliente) => {
    setClienteEditandoId(cliente.ID);
    setNome(cliente.NOME);
    setCpfcnpj(cliente.CPFCNPJ);
    setUnidade(cliente.UNIDADE);
    setError('');
    setShowModal(true);
  };

  // Salvar (funciona tanto para CRIAÇÃO quanto para EDIÇÃO)
  const handleSalvar = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (clienteEditandoId) {
        // Modo Edição (PUT)
        await api.put(`/clientes/${clienteEditandoId}`, {
          NOME: nome,
          CPFCNPJ: cpfcnpj,
          UNIDADE: unidade,
        });
      } else {
        // Modo Criação (POST)
        await api.post('/clientes/', {
          NOME: nome,
          CPFCNPJ: cpfcnpj,
          UNIDADE: unidade,
        });
      }

      // Fecha modal e recarrega
      setShowModal(false);
      carregarClientes();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar cliente.');
    }
  };

  // Excluir Cliente
  const handleExcluir = async (id, nomeCliente) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${nomeCliente}"?`)) return;

    try {
      await api.delete(`/clientes/${id}`);
      carregarClientes();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao excluir cliente.');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Sistema TMS</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Gestão de Clientes</p>
        </div>
        <div>
          <button onClick={handleAbrirModalNovo} style={styles.btnPrimary}>
            + Novo Cliente
          </button>
          <button onClick={onLogout} style={styles.btnDanger}>
            Sair
          </button>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div style={styles.card}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando clientes...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.th}>
                <th style={styles.cell}>ID</th>
                <th style={styles.cell}>Nome</th>
                <th style={styles.cell}>CPF / CNPJ</th>
                <th style={styles.cell}>Unidade</th>
                <th style={styles.cell}>Data Cadastro</th>
                <th style={{ ...styles.cell, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ ...styles.cell, textAlign: 'center', color: '#94a3b8' }}>
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.ID} style={styles.tr}>
                    <td style={styles.cell}>#{c.ID}</td>
                    <td style={{ ...styles.cell, fontWeight: '600' }}>{c.NOME}</td>
                    <td style={styles.cell}>{c.CPFCNPJ}</td>
                    <td style={styles.cell}>{c.UNIDADE}</td>
                    <td style={styles.cell}>{new Date(c.CRIADO).toLocaleDateString('pt-BR')}</td>
                    <td style={{ ...styles.cell, textAlign: 'center' }}>
                      <button
                        onClick={() => handleAbrirModalEditar(c)}
                        style={styles.btnEdit}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(c.ID, c.NOME)}
                        style={styles.btnDelete}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
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
              {clienteEditandoId ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>

            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSalvar}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nome / Razão Social:</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="Ex: Empresa Exemplo LTDA"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>CPF ou CNPJ (somente números):</label>
                <input
                  type="text"
                  value={cpfcnpj}
                  onChange={(e) => setCpfcnpj(e.target.value)}
                  maxLength={14}
                  required
                  style={styles.input}
                  placeholder="Ex: 12345678901"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Unidade:</label>
                <input
                  type="text"
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="Ex: Matriz"
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
                  {clienteEditandoId ? 'Atualizar' : 'Salvar Cliente'}
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
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
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