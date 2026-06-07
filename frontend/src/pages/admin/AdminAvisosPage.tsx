import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Aviso { id: number; titulo: string; cuerpo: string; fechaPublicacion: string; }

export default function AdminAvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const { data } = await api.get<{ data: Aviso[] }>('/avisos');
    setAvisos(data.data);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess('');
    if (titulo.trim().length < 5) { setError('Título mínimo 5 caracteres'); return; }
    if (cuerpo.trim().length < 10) { setError('Cuerpo mínimo 10 caracteres'); return; }
    try {
      await api.post('/avisos', { titulo: titulo.trim(), cuerpo: cuerpo.trim() });
      setTitulo(''); setCuerpo(''); setSuccess('Aviso publicado exitosamente'); load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este aviso?')) return;
    try {
      await api.delete(`/avisos/${id}`);
      load();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Publicar Avisos</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Nuevo Aviso</h2>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Título</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Mínimo 5 caracteres" required />
          </div>
          <div className="form-group">
            <label>Cuerpo</label>
            <textarea rows={4} value={cuerpo} onChange={e => setCuerpo(e.target.value)} placeholder="Mínimo 10 caracteres" required />
          </div>
          <button type="submit" className="btn btn-primary">Publicar</button>
        </form>
      </div>

      <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Avisos publicados</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Título</th><th>Fecha</th><th></th></tr>
        </thead>
        <tbody>
          {avisos.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay avisos</td></tr>
          )}
          {avisos.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.titulo}</td>
              <td>{new Date(a.fechaPublicacion).toLocaleDateString('es-AR')}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
