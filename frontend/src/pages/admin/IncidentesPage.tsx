import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Incidente {
  id: number; nivelGravedad: string; descripcion: string; estado: string; fechaCreacion: string;
}
interface Persona { id: number; nombre: string; apellido: string; }

const GRAVEDAD_BADGE: Record<string, string> = { Baja: 'badge-baja', Media: 'badge-media', Alta: 'badge-alta' };
const ESTADO_BADGE: Record<string, string> = {
  Abierto: 'badge-abierto', 'En progreso': 'badge-enprogreso', Resuelto: 'badge-resuelto',
};
const NEXT_ESTADO: Record<string, string> = { Abierto: 'En progreso', 'En progreso': 'Resuelto' };

export default function IncidentesPage() {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [encargados, setEncargados] = useState<Persona[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [nivel, setNivel] = useState('Media');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');
  // Tarea modal
  const [tareaModal, setTareaModal] = useState<Incidente | null>(null);
  const [encargadoId, setEncargadoId] = useState('');
  const [tareaDesc, setTareaDesc] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');

  async function load() {
    const { data } = await api.get<{ data: Incidente[] }>('/incidentes');
    setIncidentes(data.data);
  }

  useEffect(() => {
    load();
    api.get<{ data: Persona[] }>('/personas').then(r => setEncargados(r.data.data.filter((p: Persona & { rol?: string }) => (p as { rol?: string }).rol === 'Encargado'))).catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (desc.trim().length < 10) { setError('Descripción mínimo 10 caracteres'); return; }
    try {
      await api.post('/incidentes', { nivel_gravedad: nivel, descripcion: desc.trim() });
      setDesc(''); setShowCreate(false); load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  async function handleAvanzar(inc: Incidente) {
    const next = NEXT_ESTADO[inc.estado];
    if (!next) return;
    try {
      await api.patch(`/incidentes/${inc.id}`, { estado: next });
      load();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  async function handleAddTarea(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!tareaModal) return;
    try {
      await api.post(`/incidentes/${tareaModal.id}/tareas`, {
        encargado_id: Number(encargadoId),
        descripcion: tareaDesc.trim(),
        ...(fechaLimite && { fecha_limite: fechaLimite }),
      });
      setTareaModal(null); setEncargadoId(''); setTareaDesc(''); setFechaLimite('');
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestión de Incidentes</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancelar' : '+ Nuevo Incidente'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Nivel de Gravedad</label>
              <select value={nivel} onChange={e => setNivel(e.target.value)}>
                <option>Baja</option><option>Media</option><option>Alta</option>
              </select>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mínimo 10 caracteres" required />
            </div>
            <button type="submit" className="btn btn-primary">Crear Incidente</button>
          </form>
        </div>
      )}

      {tareaModal && (
        <div className="modal-overlay" onClick={() => setTareaModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Asignar Tarea — Incidente #{tareaModal.id}</h2>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleAddTarea}>
              <div className="form-group">
                <label>Encargado</label>
                <select value={encargadoId} onChange={e => setEncargadoId(e.target.value)} required>
                  <option value="">Seleccioná un encargado</option>
                  {encargados.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Descripción de la tarea</label>
                <textarea value={tareaDesc} onChange={e => setTareaDesc(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Fecha límite (opcional)</label>
                <input type="datetime-local" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setTareaModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Asignar Tarea</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr><th>#</th><th>Gravedad</th><th>Descripción</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {incidentes.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay incidentes</td></tr>
          )}
          {incidentes.map(inc => (
            <tr key={inc.id}>
              <td>{inc.id}</td>
              <td><span className={`badge ${GRAVEDAD_BADGE[inc.nivelGravedad] ?? ''}`}>{inc.nivelGravedad}</span></td>
              <td>{inc.descripcion.length > 55 ? inc.descripcion.slice(0, 55) + '…' : inc.descripcion}</td>
              <td><span className={`badge ${ESTADO_BADGE[inc.estado] ?? ''}`}>{inc.estado}</span></td>
              <td>{new Date(inc.fechaCreacion).toLocaleDateString('es-AR')}</td>
              <td style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {NEXT_ESTADO[inc.estado] && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleAvanzar(inc)}>
                    → {NEXT_ESTADO[inc.estado]}
                  </button>
                )}
                {inc.estado !== 'Resuelto' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => { setTareaModal(inc); setError(''); }}>
                    + Tarea
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
