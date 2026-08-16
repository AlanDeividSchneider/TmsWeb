import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Clientes({ onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Estado para controlar se estamos EDITANDO ou CRIANDO
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  const [success, setSuccess] = useState('');

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [cpfcnpj, setCpfcnpj] = useState('');
  const [unidade, setUnidade] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const [codigoIbge, setCodigoIbge] = useState('');

  // Carregar lista de clientes da API
  const carregarClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clientes/');
      setClientes(response.data);
    } catch (err) {
      // Verifica se o erro veio da API e se o status é 403 (Acesso Negado)
      if (err.response && err.response.status === 403) {
        const mensagemErro = err.response.data?.detail || 'Você não tem permissão para acessar esta tela.';
        alert(mensagemErro);
      } else {
        alert('Erro ao carregar clientes.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const limparFormulario = () => {
    setNome('');
    setCpfcnpj('');
    setUnidade('');
    setInscricaoEstadual('');
    setEmail('');
    setCep('');
    setEndereco('');
    setNumero('');
    setBairro('');
    setCidade('');
    setEstado('');
    setTelefone('');
    setCelular('');
    setCodigoIbge('');
  };

  // Abre o Modal para CRIAR um novo cliente
  const handleAbrirModalNovo = () => {
    setClienteEditandoId(null);
    limparFormulario();
    setError('');
    setShowModal(true);
  };

  // Abre o Modal preenchido para EDITAR
  const handleAbrirModalEditar = (cliente) => {
    setClienteEditandoId(cliente.ID);
    setNome(cliente.NOME || '');
    setCpfcnpj(cliente.CPFCNPJ || '');
    setUnidade(cliente.UNIDADE || '');
    setInscricaoEstadual(cliente.INSCRICAO_ESTADUAL || '');
    setEmail(cliente.EMAIL || '');
    setCep(cliente.CEP || '');
    setEndereco(cliente.ENDERECO || '');
    setNumero(cliente.NUMERO || '');
    setBairro(cliente.BAIRRO || '');
    setCidade(cliente.CIDADE || '');
    setEstado(cliente.ESTADO || '');
    setTelefone(cliente.TELEFONE || '');
    setCelular(cliente.CELULAR || '');
    setCodigoIbge(cliente.CODIGO_IBGE_CIDADE || '');
    setError('');
    setShowModal(true);
  };

  // Salvar (funciona tanto para CRIAÇÃO quanto para EDIÇÃO)
  const handleSalvar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      NOME: nome,
      CPFCNPJ: cpfcnpj,
      UNIDADE: unidade,
      INSCRICAO_ESTADUAL: inscricaoEstadual || null,
      EMAIL: email || null,
      CEP: cep || null,
      ENDERECO: endereco || null,
      NUMERO: numero || null,
      BAIRRO: bairro || null,
      CIDADE: cidade || null,
      ESTADO: estado || null,
      TELEFONE: telefone || null,
      CELULAR: celular || null,
      CODIGO_IBGE_CIDADE: codigoIbge || null,
    };

    try {
      if (clienteEditandoId) {
        // Modo Edição (PUT)
        await api.put(`/clientes/${clienteEditandoId}`, payload);
        setSuccess('Cliente atualizado com sucesso!');
      } else {
        // Modo Criação (POST)
        await api.post('/clientes/', payload);
        setSuccess('Cliente atualizado com sucesso!');
      }

      // Fecha modal e recarrega
      setShowModal(false);
      carregarClientes();

      setTimeout(() => {
        setSuccess('');
      }, 4000);
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
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Clientes</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Controle de clientes</p>
        </div>
        <div>
          <button onClick={handleAbrirModalNovo} style={styles.btnPrimary}>
            + Novo Cliente
          </button>
        </div>
      </div>

      {success && <div style={styles.successAlert}>{success}</div>}

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
                    <td style={styles.cell}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
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
                      </div>
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
          <div style={styles.modalLarge}>
            {/* Cabeçalho do Modal */}
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem' }}>
                  {clienteEditandoId ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Preencha os dados cadastrais do cliente para emissão de documentos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={styles.btnClose}
              >
                ✕
              </button>
            </div>

            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSalvar} style={{ marginTop: '1.5rem' }}>

              {/* SEÇÃO 1: DADOS PRINCIPAIS */}
              <div style={styles.sectionHeader}>Dados Principais</div>
              <div style={styles.grid}>
                <div style={{ ...styles.inputGroup, gridColumn: 'span 8' }}>
                  <label style={styles.label}>Nome / Razão Social *</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="Ex: Transportes Silva LTDA"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 4' }}>
                  <label style={styles.label}>CPF / CNPJ *</label>
                  <input
                    type="text"
                    value={cpfcnpj}
                    onChange={(e) => setCpfcnpj(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="Somente números"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 6' }}>
                  <label style={styles.label}>Unidade *</label>
                  <input
                    type="text"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="Ex: Matriz / Filial Chapecó"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 6' }}>
                  <label style={styles.label}>Inscrição Estadual</label>
                  <input
                    type="text"
                    value={inscricaoEstadual}
                    onChange={(e) => setInscricaoEstadual(e.target.value)}
                    style={styles.input}
                    placeholder="Ex: 122351690"
                  />
                </div>
              </div>

              {/* SEÇÃO 2: CONTATO */}
              <div style={styles.sectionHeader}>Contato</div>
              <div style={styles.grid}>
                <div style={{ ...styles.inputGroup, gridColumn: 'span 6' }}>
                  <label style={styles.label}>E-Mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    placeholder="desenvolvimento@empresa.com"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 3' }}>
                  <label style={styles.label}>Telefone</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    style={styles.input}
                    placeholder="(49) 3322-1100"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 3' }}>
                  <label style={styles.label}>Celular</label>
                  <input
                    type="text"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    style={styles.input}
                    placeholder="(49) 99999-8888"
                  />
                </div>
              </div>

              {/* SEÇÃO 3: ENDEREÇO */}
              <div style={styles.sectionHeader}>Endereço</div>
              <div style={styles.grid}>
                <div style={{ ...styles.inputGroup, gridColumn: 'span 3' }}>
                  <label style={styles.label}>CEP</label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    style={styles.input}
                    placeholder="89809-534"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 6' }}>
                  <label style={styles.label}>Endereço</label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    style={styles.input}
                    placeholder="Rua / Avenida"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 3' }}>
                  <label style={styles.label}>Número</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    style={styles.input}
                    placeholder="Ex: 731"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 4' }}>
                  <label style={styles.label}>Bairro</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    style={styles.input}
                    placeholder="Ex: Efapi"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 4' }}>
                  <label style={styles.label}>Cidade</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    style={styles.input}
                    placeholder="Ex: Chapecó"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>UF</label>
                  <input
                    type="text"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                    maxLength={2}
                    style={styles.input}
                    placeholder="SC"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Cód. IBGE</label>
                  <input
                    type="text"
                    value={codigoIbge}
                    onChange={(e) => setCodigoIbge(e.target.value)}
                    maxLength={7}
                    style={styles.input}
                    placeholder="4204202"
                  />
                </div>
              </div>

              {/* Rodapé com botões */}
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  {clienteEditandoId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
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
  // Layout Principal
  container: { padding: '2rem', width: '100%', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },

  // Tabela
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' },
  th: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  cell: { padding: '0.85rem 1rem', color: '#334155' },

  // Botões Genéricos
  btnPrimary: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  btnSecondary: { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' },
  btnDanger: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', marginLeft: '0.5rem' },
  btnEdit: { backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginRight: '0.4rem' },
  btnDelete: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },

  btnClose: {
    position: 'absolute',
    right: 0,
    top: 0,
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px'
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1.5rem'
  },
  modalLarge: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '860px',
    maxHeight: '88vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)'
  },
  modalHeader: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '1rem'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0'
  },

  // Formulário e Grid
  sectionHeader: {
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#2563eb',
    marginTop: '1.25rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.25rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '0.85rem 1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '0.3rem'
  },
  input: {
    width: '100%',
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    backgroundColor: '#f8fafc'
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '6px',
    marginTop: '1rem',
    fontSize: '0.85rem'
  },

  // Alertas

  successAlert: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  }
};
