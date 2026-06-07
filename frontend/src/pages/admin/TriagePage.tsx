import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Reclamo {
  id: number; descripcion: string; estado: string; fechaCreacion: string;
  creador: { nombre: string; apellido: string };
  unidad: { numero: string };
}

export default function TriagePage() {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [selected, setSelected] = useState<Reclamo | null>(null);
  const [action, setAction] = useState<'aprobar' | 'rechazar' | null>(null);
  const [nivelGravedad, setNivelGravedad] = useState('Media');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get<{ data: Reclamo[] }>('/reclamos');
    setReclamos(data.data.filter(r => r.estado === 'Pendiente'));
  }

  useEffect(() => { load(); }, []);

  async function handleDecision() {
    if (!selected) return;
    setError('');
    try {
      if (action === 'rechazar' && !motivoRechazo.trim()) { setError('El motivo de rechazo es requerido'); return; }
      await api.patch(`/reclamos/${selected.id}`, {
        estado: action === 'aprobar' ? 'Aprobado' : 'Rechazado',
        ...(action === 'aprobar' && { nivel_gravedad: nivelGravedad }),
        ...(action === 'rechazar' && { motivo_rechazo: motivoRechazo }),
      });
      setSelected(null); setAction(null); setMotivoRechazo(''); setNivelGravedad('Media');
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Triage de Reclamos</h1>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{reclamos.length} pendiente(s)</span>
      </div>

      {selected && action && (
        <div className="modal-overlay" onClick={() => { setSelected(null); setAction(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{action === 'aprobar' ? 'Aprobar Reclamo' : 'Rechazar Reclamo'}</h2>
            <p style={{ marginBottom: '1rem', color: '#475569' }}>{selected.descripcion}</p>
            {error && <p className="error-msg">{error}</p>}
            {action === 'aprobar' && (
              <div className="form-group">
                <label>Nivel de Gravedad</label>
                <select value={nivelGravedad} onChange={e => setNivelGravedad(e.target.value)}>
                  <option>Baja</option><option>Media</option><option>Alta</option>
                </select>
              </div>
            )}
            {action === 'rechazar' && (
              <div className="form-group">
                <label>Motivo de rechazo</label>
                <textarea value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)} placeholder="Explicar por qué se rechaza..." />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setSelected(null); setAction(null); }}>Cancelar</button>
              <button className={`btn ${action === 'aprobar' ? 'btn-primary' : 'btn-danger'}`} onClick={handleDecision}>
                {action === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr><th>#</th><th>Residente</th><th>Unidad</th><th>Descripción</th><th>Fecha</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {reclamos.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay reclamos pendientes</td></tr>
          )}
          {reclamos.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.creador?.nombre} {r.creador?.apellido}</td>
              <td>{r.unidad?.numero}</td>
              <td>{r.descripcion.length > 55 ? r.descripcion.slice(0, 55) + '…' : r.descripcion}</td>
              <td>{new Date(r.fechaCreacion).toLocaleDateString('es-AR')}</td>
              <td style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => { setSelected(r); setAction('aprobar'); }}>Aprobar</button>
                <button className="btn btn-danger btn-sm" onClick={() => { setSelected(r); setAction('rechazar'); }}>Rechazar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
