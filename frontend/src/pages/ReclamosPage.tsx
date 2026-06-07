import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Unidad { id: number; numero: string; }
interface Reclamo {
  id: number; descripcion: string; estado: string; fechaCreacion: string;
  unidad: { numero: string };
  creador?: { nombre: string; apellido: string };
}

function badge(estado: string) {
  const map: Record<string, string> = {
    Pendiente: 'badge-pendiente', Aprobado: 'badge-aprobado', Rechazado: 'badge-rechazado',
  };
  return `badge ${map[estado] ?? ''}`;
}

function errMsg(err: unknown, fallback: string) {
  return (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? fallback;
}

export default function ReclamosPage() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'Administrador';
  const puedeCrear = user?.rol === 'Residente' || user?.rol === 'Encargado';

  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('');

  // Crear
  const [showForm, setShowForm] = useState(false);
  const [unidadId, setUnidadId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Triage (admin)
  const [selected, setSelected] = useState<Reclamo | null>(null);
  const [accion, setAccion] = useState<'aprobar' | 'rechazar' | null>(null);
  const [nivelGravedad, setNivelGravedad] = useState('Media');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [triageError, setTriageError] = useState('');

  async function load() {
    const { data } = await api.get<{ data: Reclamo[] }>('/reclamos');
    setReclamos(data.data);
  }

  useEffect(() => {
    load();
    if (puedeCrear) {
      api.get<{ data: Unidad[] }>('/unidades').then(r => setUnidades(r.data.data)).catch(() => {});
    }
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
      setError(errMsg(err, 'Error al crear reclamo'));
    }
  }

  async function handleDecision() {
    if (!selected) return;
    setTriageError('');
    try {
      if (accion === 'rechazar' && !motivoRechazo.trim()) { setTriageError('El motivo de rechazo es requerido'); return; }
      await api.patch(`/reclamos/${selected.id}`, {
        estado: accion === 'aprobar' ? 'Aprobado' : 'Rechazado',
        ...(accion === 'aprobar' && { nivel_gravedad: nivelGravedad }),
        ...(accion === 'rechazar' && { motivo_rechazo: motivoRechazo }),
      });
      setSelected(null); setAccion(null); setMotivoRechazo(''); setNivelGravedad('Media');
      load();
    } catch (err: unknown) {
      setTriageError(errMsg(err, 'Error'));
    }
  }

  const filtered = filtroEstado ? reclamos.filter(r => r.estado === filtroEstado) : reclamos;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reclamos</h1>
        {puedeCrear && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo Reclamo'}
          </button>
        )}
      </div>

      {showForm && puedeCrear && (
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

      {selected && accion && esAdmin && (
        <div className="modal-overlay" onClick={() => { setSelected(null); setAccion(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{accion === 'aprobar' ? 'Aprobar Reclamo' : 'Rechazar Reclamo'}</h2>
            <p style={{ marginBottom: '1rem', color: '#475569' }}>{selected.descripcion}</p>
            {triageError && <p className="error-msg">{triageError}</p>}
            {accion === 'aprobar' && (
              <div className="form-group">
                <label>Nivel de Gravedad</label>
                <select value={nivelGravedad} onChange={e => setNivelGravedad(e.target.value)}>
                  <option>Baja</option><option>Media</option><option>Alta</option>
                </select>
              </div>
            )}
            {accion === 'rechazar' && (
              <div className="form-group">
                <label>Motivo de rechazo</label>
                <textarea value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)} placeholder="Explicar por qué se rechaza..." />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setSelected(null); setAccion(null); }}>Cancelar</button>
              <button className={`btn ${accion === 'aprobar' ? 'btn-primary' : 'btn-danger'}`} onClick={handleDecision}>
                {accion === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
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
            <th>#</th>
            {esAdmin && <th>Creador</th>}
            <th>Unidad</th><th>Descripción</th><th>Estado</th><th>Fecha</th>
            {esAdmin && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={esAdmin ? 7 : 5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay reclamos</td></tr>
          )}
          {filtered.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              {esAdmin && <td>{r.creador?.nombre} {r.creador?.apellido}</td>}
              <td>{r.unidad?.numero}</td>
              <td>{r.descripcion.length > 60 ? r.descripcion.slice(0, 60) + '…' : r.descripcion}</td>
              <td><span className={badge(r.estado)}>{r.estado}</span></td>
              <td>{new Date(r.fechaCreacion).toLocaleDateString('es-AR')}</td>
              {esAdmin && (
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  {r.estado === 'Pendiente' ? (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => { setSelected(r); setAccion('aprobar'); setTriageError(''); }}>Aprobar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setSelected(r); setAccion('rechazar'); setTriageError(''); }}>Rechazar</button>
                    </>
                  ) : <span style={{ color: '#94a3b8' }}>—</span>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
