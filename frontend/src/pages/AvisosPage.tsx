import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Aviso { id: number; titulo: string; cuerpo: string; fechaPublicacion: string; }

function errMsg(err: unknown, fallback: string) {
  return (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? fallback;
}

export default function AvisosPage() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'Administrador';

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [selected, setSelected] = useState<Aviso | null>(null);

  // Crear (admin)
  const [showForm, setShowForm] = useState(false);
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
      setTitulo(''); setCuerpo(''); setSuccess('Aviso publicado exitosamente'); setShowForm(false); load();
    } catch (err: unknown) {
      setError(errMsg(err, 'Error'));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este aviso?')) return;
    try {
      await api.delete(`/avisos/${id}`);
      load();
    } catch (err: unknown) {
      alert(errMsg(err, 'Error'));
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Avisos del Consorcio</h1>
        {esAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo Aviso'}
          </button>
        )}
      </div>

      {esAdmin && showForm && (
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
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.titulo}</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {new Date(selected.fechaPublicacion).toLocaleDateString('es-AR', { dateStyle: 'long' })}
            </p>
            <p style={{ lineHeight: 1.6 }}>{selected.cuerpo}</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr><th>Fecha</th><th>Título</th><th>Resumen</th><th>{esAdmin ? 'Acciones' : ''}</th></tr>
        </thead>
        <tbody>
          {avisos.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay avisos</td></tr>
          )}
          {avisos.map(a => (
            <tr key={a.id}>
              <td style={{ whiteSpace: 'nowrap' }}>{new Date(a.fechaPublicacion).toLocaleDateString('es-AR')}</td>
              <td style={{ fontWeight: 500 }}>{a.titulo}</td>
              <td>{a.cuerpo.length > 80 ? a.cuerpo.slice(0, 80) + '…' : a.cuerpo}</td>
              <td style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelected(a)}>Ver</button>
                {esAdmin && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
