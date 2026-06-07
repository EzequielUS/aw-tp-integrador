import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Unidad { id: number; numero: string; }

export default function CrearReclamoPage() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [unidadId, setUnidadId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get<{ data: Unidad[] }>('/unidades').then(r => setUnidades(r.data.data)).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess('');
    if (!unidadId) { setError('Seleccioná una unidad'); return; }
    if (descripcion.trim().length < 10) { setError('La descripción debe tener mínimo 10 caracteres'); return; }
    try {
      await api.post('/reclamos', { unidad_id: Number(unidadId), descripcion: descripcion.trim() });
      setSuccess('Reclamo creado exitosamente'); setUnidadId(''); setDescripcion('');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Crear Reclamo</h1>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Unidad afectada</label>
            <select value={unidadId} onChange={e => setUnidadId(e.target.value)} required>
              <option value="">Seleccioná una unidad</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.numero}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Descripción del problema</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describí el problema (mínimo 10 caracteres)" required />
          </div>
          <button type="submit" className="btn btn-primary">Crear Reclamo</button>
        </form>
      </div>
    </div>
  );
}
