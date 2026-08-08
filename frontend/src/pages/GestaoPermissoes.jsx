import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

export default function GestaoPermissoes() {
    const [perfis, setPerfis] = useState([]);
    const [todasPermissoes, setTodasPermissoes] = useState([]);
    const [perfilSelecionado, setPerfilSelecionado] = useState(null);

    // Usamos Set para performance de busca/muda de O(1)
    const [permissoesAtivas, setPermissoesAtivas] = useState(new Set());
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        carregarDadosIniciais();
    }, []);

    const carregarDadosIniciais = async () => {
        try {
            setLoading(true);
            const [resPerfis, resPerms] = await Promise.all([
                api.get('/permissoes/perfis'),
                api.get('/permissoes/todas'),
            ]);
            setPerfis(resPerfis.data);
            setTodasPermissoes(resPerms.data);

            if (resPerfis.data.length > 0) {
                selecionarPerfil(resPerfis.data[0], resPerms.data);
            }
        } catch (err) {
            alert('Erro ao carregar permissões e perfis.');
        } finally {
            setLoading(false);
        }
    };

    const selecionarPerfil = (perfil, listaPermissoes = todasPermissoes) => {
        setPerfilSelecionado(perfil);

        const listaBruta = perfil.permissoes || perfil.PERMISSOES || [];
        let idsAtivos = [];

        if (Array.isArray(listaBruta) && listaBruta.length > 0) {
            const primeiroItem = listaBruta[0];

            // Caso 1: Array de Objetos (ex: [{ ID: 1, CHAVE: '...' }])
            if (typeof primeiroItem === 'object' && primeiroItem !== null) {
                idsAtivos = listaBruta.map((p) => Number(p.ID || p.id));
            }
            // Caso 2: Array de Strings/Chaves (ex: ['CLIENTES_VER', 'FUNCIONARIOS_VER'])
            else if (typeof primeiroItem === 'string') {
                idsAtivos = listaPermissoes
                    .filter((p) => listaBruta.includes(p.CHAVE || p.chave))
                    .map((p) => Number(p.ID || p.id));
            }
            // Caso 3: Array de números/IDs diretamente (ex: [1, 2, 3])
            else if (typeof primeiroItem === 'number') {
                idsAtivos = listaBruta.map((id) => Number(id));
            }
        }

        // Armazena no Set convertendo todos para Number
        setPermissoesAtivas(new Set(idsAtivos.filter((id) => !isNaN(id))));
    };

    // Alterna uma única permissão
    const handleToggle = (id) => {
        const idNum = Number(id);
        setPermissoesAtivas((prevSet) => {
            const novoSet = new Set(prevSet);
            if (novoSet.has(idNum)) {
                novoSet.delete(idNum);
            } else {
                novoSet.add(idNum);
            }
            return novoSet;
        });
    };

    // Marcar/Desmarcar todas as permissões de um módulo específico
    const handleToggleModulo = (modulo, marcar) => {
        const idsDoModulo = todasPermissoes
            .filter((p) => p.MODULO === modulo)
            .map((p) => p.ID);

        setPermissoesAtivas((prevSet) => {
            const novoSet = new Set(prevSet);
            idsDoModulo.forEach((id) => {
                if (marcar) {
                    novoSet.add(id);
                } else {
                    novoSet.delete(id);
                }
            });
            return novoSet;
        });
    };

    // Salva no backend convertendo o Set de volta para Array
    const handleSalvar = async () => {
        if (!perfilSelecionado) return;

        try {
            setSalvando(true);
            await api.put(`/permissoes/perfis/${perfilSelecionado.ID}`, {
                PERMISSAO_IDS: Array.from(permissoesAtivas),
            });
            alert('Permissões salvas com sucesso!');
            carregarDadosIniciais();
        } catch (err) {
            alert('Erro ao salvar permissões.');
        } finally {
            setSalvando(false);
        }
    };

    // Filtra permissões pela busca do usuário sem re-renderizar a árvore inteira
    const permissoesFiltradas = useMemo(() => {
        if (!busca) return todasPermissoes;
        const termo = busca.toLowerCase();
        return todasPermissoes.filter(
            (p) =>
                p.NOME.toLowerCase().includes(termo) ||
                p.CHAVE.toLowerCase().includes(termo) ||
                p.MODULO.toLowerCase().includes(termo)
        );
    }, [todasPermissoes, busca]);

    // Agrupa as permissões filtradas por módulo
    const modulosAgrupados = useMemo(() => {
        return permissoesFiltradas.reduce((acc, perm) => {
            acc[perm.MODULO] = acc[perm.MODULO] || [];
            acc[perm.MODULO].push(perm);
            return acc;
        }, {});
    }, [permissoesFiltradas]);

    if (loading) return <div style={{ padding: 20 }}>Carregando permissões...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h2>Gestão de Permissões</h2>

            <div style={{ display: 'flex', gap: 30, marginTop: 20 }}>
                {/* Painel Esquerdo: Perfis */}
                <div style={{ width: '250px', borderRight: '1px solid #ccc', paddingRight: 15 }}>
                    <h3>Perfis</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {perfis.map((p) => (
                            <li
                                key={p.ID}
                                onClick={() => selecionarPerfil(p)}
                                style={{
                                    padding: '10px 15px',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    backgroundColor: perfilSelecionado?.ID === p.ID ? '#007bff' : '#f8f9fa',
                                    color: perfilSelecionado?.ID === p.ID ? '#fff' : '#333',
                                    marginBottom: 8,
                                    fontWeight: perfilSelecionado?.ID === p.ID ? 'bold' : 'normal',
                                }}
                            >
                                {p.NOME}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Painel Direito: Permissões em Grade/Módulos */}
                <div style={{ flex: 1 }}>
                    {perfilSelecionado && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                <h3>Permissões do Perfil: {perfilSelecionado.NOME}</h3>
                                <button
                                    onClick={handleSalvar}
                                    disabled={salvando}
                                    style={{
                                        padding: '8px 20px',
                                        backgroundColor: '#28a745',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>

                            {/* Campo de Busca */}
                            <input
                                type="text"
                                placeholder="Buscar por nome, chave ou módulo..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginBottom: 20,
                                    boxSizing: 'border-box',
                                    borderRadius: 4,
                                    border: '1px solid #ccc',
                                }}
                            />

                            {/* Renderização Agrupada por Módulo */}
                            {Object.keys(modulosAgrupados).map((modulo) => {
                                const permsDoModulo = modulosAgrupados[modulo];
                                const todosMarcados = permsDoModulo.every((p) => permissoesAtivas.has(p.ID));

                                return (
                                    <div
                                        key={modulo}
                                        style={{
                                            marginBottom: 20,
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 6,
                                            padding: 15,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justify: 'space-between',
                                                alignItems: 'center',
                                                borderBottom: '1px solid #eee',
                                                paddingBottom: 8,
                                                marginBottom: 10,
                                            }}
                                        >
                                            <h4 style={{ margin: 0 }}>Módulo: {modulo}</h4>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleModulo(modulo, !todosMarcados)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#007bff',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                }}
                                            >
                                                {todosMarcados ? 'Desmarcar todos do módulo' : 'Marcar todos do módulo'}
                                            </button>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                                            {permsDoModulo.map((perm) => (
                                                <label
                                                    key={perm.ID}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 8,
                                                        padding: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: permissoesAtivas.has(perm.ID) ? '#eef6ff' : '#transparent',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={permissoesAtivas.has(Number(perm.ID || perm.id))}
                                                        onChange={() => handleToggle(Number(perm.ID || perm.id))}
                                                        style={{ marginTop: 3 }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{perm.NOME}</div>
                                                        <small style={{ color: '#666', fontSize: '12px' }}>{perm.DESCRICAO || perm.CHAVE}</small>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}