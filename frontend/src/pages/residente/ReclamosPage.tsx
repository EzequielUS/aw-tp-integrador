import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Unidad { id: number; numero: string; }
interface Reclamo {
  id: number; descripcion: string; estado: string;
  fechaCreacion: string; unidad: { numero: string };
}

function badge(estado: string) {
  const map: Record<string, string> = {
    Pendiente: 'badge-pendiente', Aprobado: 'badge-aprobado', Rechazado: 'badge-rechazado',
  };
  return `badge ${map[estado] ?? ''}`;
}

export default function ReclamosPage() {
  const { user } = useAuth();
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [unidadId, setUnidadId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const { data } = await api.get<{ data: Reclamo[] }>('/reclamos');
    // Residente solo ve sus propios reclamos
    const propios = data.data;
    setReclamos(propios);
  }

  useEffect(() => {
    load();
    api.get<{ data: Unidad[] }>('/unidades').then(r => setUnidades(r.data.data)).catch(() => {});
  }, []);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!unidadId) { setError('Seleccioná una unidad'); return; }
    if (descripcion.trim().length < 10) { setError('La descripción debe tener mínimo 10 caracteres'); return; }
    try {
      await api.post('/reclamos', { unidad_id: Number(unidadId), descripcion: descripcion.trim() });
      setSuccess('Reclamo creado exitosamente');
      setUnidadId(''); setDescripcion(''); setShowForm(false);
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error al crear reclamo');
    }
  }

  const filtered = filtroEstado ? reclamos.filter(r => r.estado === filtroEstado) : reclamos;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mis Reclamos</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Reclamo'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Nuevo Reclamo</h2>
          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}
          <form onSubmit={handleCrear}>
            <div className="form-group">
              <label>Unidad</label>
              <select value={unidadId} onChange={e => setUnidadId(e.target.value)} required>
                <option value="">Seleccioná una unidad</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.numero}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Mínimo 10 caracteres" required />
            </div>
            <button type="submit" className="btn btn-primary">Crear Reclamo</button>
          </form>
        </div>
      )}

      <div className="filters">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th><th>Unidad</th><th>Descripción</th><th>Estado</th><th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay reclamos</td></tr>
          )}
          {filtered.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.unidad?.numero}</td>
              <td>{r.descripcion.length > 60 ? r.descripcion.slice(0, 60) + '…' : r.descripcion}</td>
              <td><span className={badge(r.estado)}>{r.estado}</span></td>
              <td>{new Date(r.fechaCreacion).toLocaleDateString('es-AR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
