import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Rutina {
  id: number; fechaAsignacion: string; estado: string;
  encargado: { nombre: string; apellido: string };
}
interface Persona { id: number; nombre: string; apellido: string; rol?: string; }
interface Tarea { id: number; descripcion: string; estado: string; }

const ESTADO_BADGE: Record<string, string> = {
  Pendiente: 'badge-pendiente', 'En progreso': 'badge-enprogreso', Completada: 'badge-completada',
};

function errMsg(err: unknown, fallback: string) {
  return (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? fallback;
}

function progreso(tareas: Tarea[]) {
  if (!tareas.length) return 0;
  return Math.round((tareas.filter(t => t.estado === 'Finalizada').length / tareas.length) * 100);
}

export default function RutinasPage() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'Administrador';
  const esEncargado = user?.rol === 'Encargado';

  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [encargados, setEncargados] = useState<Persona[]>([]);
  const [error, setError] = useState('');

  // Crear (admin)
  const [showCreate, setShowCreate] = useState(false);
  const [encargadoId, setEncargadoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [tareasText, setTareasText] = useState('');

  // Detalle / tareas modal (compartido)
  const [detalle, setDetalle] = useState<{ rutina: Rutina; tareas: Tarea[] } | null>(null);

  async function load() {
    const { data } = await api.get<{ data: Rutina[] }>('/rutinas');
    setRutinas(data.data);
  }

  useEffect(() => {
    load();
    if (esAdmin) {
      api.get<{ data: Persona[] }>('/personas').then(r => setEncargados(r.data.data.filter(p => p.rol === 'Encargado'))).catch(() => {});
    }
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
      setError(errMsg(err, 'Error'));
    }
  }

  async function handleVerDetalle(r: Rutina) {
    const { data } = await api.get<{ data: Tarea[] }>(`/rutinas/${r.id}/tareas`);
    setDetalle({ rutina: r, tareas: data.data });
  }

  async function handleIniciar(r: Rutina) {
    setError('');
    try {
      await api.patch(`/rutinas/${r.id}`, { estado: 'En progreso' });
      load();
      if (detalle?.rutina.id === r.id) handleVerDetalle({ ...r, estado: 'En progreso' });
    } catch (err: unknown) {
      setError(errMsg(err, 'Error'));
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{esEncargado ? 'Mis Rutinas' : 'Rutinas'}</h1>
        {esAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancelar' : '+ Nueva Rutina'}
          </button>
        )}
      </div>

      {showCreate && esAdmin && (
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

      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <h2>Rutina #{detalle.rutina.id} — {detalle.rutina.fechaAsignacion}</h2>
            <p style={{ marginBottom: '0.5rem' }}>
              {!esEncargado && <>{detalle.rutina.encargado?.nombre} {detalle.rutina.encargado?.apellido} · </>}
              Estado: <span className={`badge ${ESTADO_BADGE[detalle.rutina.estado] ?? ''}`}>{detalle.rutina.estado}</span>
            </p>
            {esEncargado && (
              <>
                <div style={{ background: '#f1f5f9', borderRadius: 6, height: 10, margin: '0.75rem 0', overflow: 'hidden' }}>
                  <div style={{ background: '#22c55e', height: '100%', width: `${progreso(detalle.tareas)}%`, transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                  {progreso(detalle.tareas)}% completado ({detalle.tareas.filter(t => t.estado === 'Finalizada').length}/{detalle.tareas.length} tareas)
                </p>
              </>
            )}
            {error && <p className="error-msg">{error}</p>}
            {esEncargado && detalle.rutina.estado === 'Pendiente' && (
              <button className="btn btn-primary" style={{ marginBottom: '1rem' }} onClick={() => handleIniciar(detalle.rutina)}>
                Marcar como En Progreso
              </button>
            )}
            <table>
              <thead><tr><th>Descripción</th><th>Estado</th></tr></thead>
              <tbody>
                {detalle.tareas.map(t => (
                  <tr key={t.id}>
                    <td>{t.descripcion}</td>
                    <td><span className={`badge ${ESTADO_BADGE[t.estado] ?? 'badge-pendiente'}`}>{t.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>#</th>
            {!esEncargado && <th>Encargado</th>}
            <th>Fecha</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rutinas.length === 0 && (
            <tr><td colSpan={esEncargado ? 4 : 5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay rutinas</td></tr>
          )}
          {rutinas.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              {!esEncargado && <td>{r.encargado?.nombre} {r.encargado?.apellido}</td>}
              <td>{r.fechaAsignacion}</td>
              <td><span className={`badge ${ESTADO_BADGE[r.estado] ?? ''}`}>{r.estado}</span></td>
              <td style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleVerDetalle(r)}>Ver tareas</button>
                {esEncargado && r.estado === 'Pendiente' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleIniciar(r)}>Iniciar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
