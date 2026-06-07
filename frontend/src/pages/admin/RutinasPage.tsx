import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Rutina {
  id: number; fechaAsignacion: string; estado: string;
  encargado: { nombre: string; apellido: string };
}
interface Persona { id: number; nombre: string; apellido: string; rol?: string; }
interface Tarea { id: number; descripcion: string; estado: string; }

const ESTADO_BADGE: Record<string, string> = {
  Pendiente: 'badge-pendiente', 'En progreso': 'badge-enprogreso', Completada: 'badge-completada',
};

export default function RutinasPage() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [encargados, setEncargados] = useState<Persona[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [encargadoId, setEncargadoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [tareasText, setTareasText] = useState('');
  const [error, setError] = useState('');
  const [tareasModal, setTareasModal] = useState<{ rutina: Rutina; tareas: Tarea[] } | null>(null);

  async function load() {
    const { data } = await api.get<{ data: Rutina[] }>('/rutinas');
    setRutinas(data.data);
  }

  useEffect(() => {
    load();
    api.get<{ data: Persona[] }>('/personas').then(r => setEncargados(r.data.data.filter(p => p.rol === 'Encargado'))).catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setError('');
    const tareas = tareasText.split('\n').map(t => t.trim()).filter(Boolean);
    if (!encargadoId) { setError('Seleccioná un encargado'); return; }
    if (!fecha) { setError('La fecha es requerida'); return; }
    if (tareas.length === 0) { setError('Ingresá al menos una tarea'); return; }
    try {
      await api.post('/rutinas', { encargado_id: Number(encargadoId), fecha_asignacion: fecha, tareas });
      setShowCreate(false); setEncargadoId(''); setFecha(''); setTareasText(''); load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  async function handleVerTareas(rutina: Rutina) {
    const { data } = await api.get<{ data: Tarea[] }>(`/rutinas/${rutina.id}/tareas`);
    setTareasModal({ rutina, tareas: data.data });
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Rutinas</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancelar' : '+ Nueva Rutina'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Encargado</label>
              <select value={encargadoId} onChange={e => setEncargadoId(e.target.value)} required>
                <option value="">Seleccioná un encargado</option>
                {encargados.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Fecha de asignación</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Tareas (una por línea)</label>
              <textarea rows={5} value={tareasText} onChange={e => setTareasText(e.target.value)} placeholder={"Limpieza de pasillos\nRiego de plantas\nRevisión de iluminación"} required />
            </div>
            <button type="submit" className="btn btn-primary">Crear Rutina</button>
          </form>
        </div>
      )}

      {tareasModal && (
        <div className="modal-overlay" onClick={() => setTareasModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Tareas — Rutina #{tareasModal.rutina.id}</h2>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              {tareasModal.rutina.encargado?.nombre} · {tareasModal.rutina.fechaAsignacion}
            </p>
            <table>
              <thead><tr><th>#</th><th>Descripción</th><th>Estado</th></tr></thead>
              <tbody>
                {tareasModal.tareas.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.descripcion}</td>
                    <td><span className={`badge ${ESTADO_BADGE[t.estado] ?? ''}`}>{t.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setTareasModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr><th>#</th><th>Encargado</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {rutinas.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay rutinas</td></tr>
          )}
          {rutinas.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.encargado?.nombre} {r.encargado?.apellido}</td>
              <td>{r.fechaAsignacion}</td>
              <td><span className={`badge ${ESTADO_BADGE[r.estado] ?? ''}`}>{r.estado}</span></td>
              <td>
                <button className="btn btn-secondary btn-sm" onClick={() => handleVerTareas(r)}>Ver tareas</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
