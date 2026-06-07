import { useEffect, useState } from 'react';
import api from '../services/api';

interface Aviso {
  id: number; titulo: string; cuerpo: string; fechaPublicacion: string;
}

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [selected, setSelected] = useState<Aviso | null>(null);

  useEffect(() => {
    api.get<{ data: Aviso[] }>('/avisos').then(r => setAvisos(r.data.data));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Avisos del Consorcio</h1>
      </div>

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
          <tr><th>Fecha</th><th>Título</th><th>Resumen</th><th></th></tr>
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
              <td><button className="btn btn-secondary btn-sm" onClick={() => setSelected(a)}>Ver</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
