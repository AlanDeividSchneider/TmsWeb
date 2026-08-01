import { useState } from 'react';
import api from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // O OAuth2PasswordBearer do FastAPI espera dados em formato x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Salva o token JWT no navegador
      localStorage.setItem('token', response.data.access_token);
      onLoginSuccess();
    } catch (err) {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Sistema TMS - Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        
        <div style={styles.inputGroup}>
          <label>Usuário:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Entrar</button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f9' },
  card: { padding: '2rem', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '320px' },
  inputGroup: { marginBottom: '1rem', display: 'flex', flexDirection: 'column' },
  input: { padding: '0.5rem', marginTop: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' },
  button: { width: '100%', padding: '0.7rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }
};