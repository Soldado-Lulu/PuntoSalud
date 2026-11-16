import { useEffect, useMemo, useState } from 'react';
import { Search, Pill, Wifi, WifiOff, RefreshCw, ShieldAlert, ChevronDown, ChevronUp, Download, BookOpen, X } from 'lucide-react';
import { readCatalog, saveCatalog } from './db.js';
const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function Details({ title, value }) { return value ? <div className="detail"><h4>{title}</h4><p>{value}</p></div> : null; }
function Medicine({ item }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="medicine">
    <div className="medicine-head"><div className="pill-icon"><Pill size={23}/></div><div className="medicine-main"><div className="med-top"><h3>{item.genericName}</h3><span className={item.verified ? 'tag verified':'tag'}>{item.verified ? 'Verificado' : 'Sin verificar'}</span></div><p className="muted">{item.therapeuticClass || 'Medicamento'}</p></div></div>
    {item.description && <p className="description">{item.description}</p>}
    <div className="chips">{(item.products||[]).map(p => <span className="chip" key={p.id}>{p.brandName}{p.strength ? ' · '+p.strength : ''}</span>)}</div>
    <button type="button" className="details-btn" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'Ocultar información' : 'Ver información completa'} {expanded ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</button>
    {expanded && <div className="details">
      <Details title="Función" value={item.functionDescription}/>
      <Details title="Precauciones" value={item.precautions}/>
      <Details title="Contraindicaciones" value={item.contraindications}/>
      <Details title="Posibles efectos secundarios" value={item.sideEffects}/>
      {(item.products||[]).map(product => <div key={product.id} className="product"><strong>{product.brandName}</strong><Details title="Composición" value={product.composition}/><Details title="Presentación" value={product.presentation}/><Details title="Concentración" value={product.strength}/></div>)}
      {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Consultar fuente</a>}
      {!item.verified && <p className="unverified">Registro de demostración no verificado; no utilizar como guía clínica.</p>}
    </div>}
  </article>;
}
export default function App() {
  const [catalog, setCatalog] = useState(null), [query, setQuery] = useState('');
  const [status, setStatus] = useState('Cargando catálogo…'), [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  useEffect(() => {
    const yes = () => setOnline(true), no = () => setOnline(false);
    window.addEventListener('online', yes); window.addEventListener('offline', no);
    const onPrompt = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => { window.removeEventListener('online', yes); window.removeEventListener('offline', no); window.removeEventListener('beforeinstallprompt', onPrompt); };
  }, []);
  async function sync() {
    if (!navigator.onLine) { setStatus('Sin internet. Mostrando los datos guardados.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/sync/catalog', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      await saveCatalog(data); // Guardar antes de mostrar; evita prometer offline sin copia
      setCatalog(data);
      setStatus('Catálogo actualizado y disponible sin internet.');
    } catch (err) { setStatus('No se pudo sincronizar. '+(catalog ? 'Usando copia local.' : 'Conéctate para descargar el catálogo por primera vez.')); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    (async () => {
      try { const local = await readCatalog(); if (active && local) { setCatalog(local); setStatus('Copia local cargada.'); } }
      catch { if (active) setStatus('No se pudo leer el almacenamiento local.'); }
      if (active && navigator.onLine) await sync();
      else if (active) setStatus('Sin internet. '+(await readCatalog().catch(()=>null) ? 'Usando copia guardada.' : 'Necesitas internet para la primera descarga.'));
    })();
    return () => { active = false; };
  }, []);
  const filtered = useMemo(() => (catalog?.medications || []).filter(item => {
    const text = [item.genericName,item.therapeuticClass,item.description,...(item.products||[]).map(p => p.brandName),...(item.symptoms||[]).map(s => s.name)].join(' ');
    return normalize(text).includes(normalize(query));
  }), [catalog, query]);
  const date = catalog?.updatedAt ? new Date(catalog.updatedAt).toLocaleString('es-BO') : null;
  return <><header className="header"><div className="container nav"><div className="brand"><span className="brand-mark"><Pill size={22}/></span><div><strong>FarmaConsulta</strong><small>Catálogo informativo</small></div></div><span className={'online '+(online ? 'good':'bad')}>{online ? <Wifi size={16}/> : <WifiOff size={16}/>}<span>{online ? 'Con conexión':'Sin conexión'}</span></span></div></header>
    <main className="container"><section className="hero"><div className="eyebrow"><BookOpen size={15}/> INFORMACIÓN FARMACÉUTICA</div><h1>Encuentra información sobre medicamentos</h1><p>Consulta nombres genéricos, marcas, composiciones y precauciones. También podrás buscar sin conexión después de la primera sincronización.</p><div className="search"><Search size={20}/><input autoComplete="off" aria-label="Buscar medicamentos" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por medicamento, marca o síntoma…"/>{query && <button type="button" aria-label="Borrar búsqueda" onClick={()=>setQuery('')}><X size={18}/></button>}</div><div className="actions"><button className="sync-btn" type="button" disabled={loading || !online} onClick={sync}><RefreshCw size={16} className={loading?'spin':''}/>{loading ? 'Actualizando…':'Actualizar catálogo'}</button>{installPrompt && <button type="button" className="install-btn" onClick={async()=>{const prompt=installPrompt;setInstallPrompt(null);await prompt.prompt();}}><Download size={16}/> Instalar aplicación</button>}</div><p className="status" role="status">{status}{date ? ' · Último cambio: '+date : ''}</p></section>
    <section className="notice"><ShieldAlert size={22}/><div><strong>Información educativa, no una receta médica.</strong><p>Los síntomas no bastan para elegir un tratamiento. No te automediques con antibióticos ni utilices fichas sin verificar como indicación clínica. Ante síntomas graves, busca atención médica.</p></div></section>
    <section className="results"><div className="results-title"><h2>Medicamentos</h2><span>{filtered.length} {filtered.length===1 ? 'resultado':'resultados'}</span></div>{filtered.length ? <div className="med-list">{filtered.map(item => <Medicine key={item.id} item={item}/>)}</div> : <div className="empty">{catalog ? 'No encontramos coincidencias. Prueba con otra palabra.' : 'Todavía no hay datos locales. Conéctate y pulsa “Actualizar catálogo”.'}</div>}</section>
    <footer>FarmaConsulta · La información debe ser validada por profesionales antes de publicarse.</footer></main></>;
}
