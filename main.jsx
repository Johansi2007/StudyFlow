import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [cards, setCards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [tab, setTab] = useState('cards');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadData() {
    if (!supabase || !session) return;
    const [{ data: c, error: ce }, { data: t, error: te }] = await Promise.all([
      supabase.from('flashcards').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false })
    ]);
    if (ce || te) setMessage(ce?.message || te?.message || 'Daten konnten nicht geladen werden.');
    setCards(c || []); setTasks(t || []);
  }
  useEffect(() => { loadData(); }, [session]);

  async function authenticate(e) {
    e.preventDefault(); setMessage('');
    if (!supabase) return;
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setMessage(result.error.message);
    else if (mode === 'signup' && !result.data.session) setMessage('Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach.');
  }
  async function addCard(e) {
    e.preventDefault(); setMessage('');
    const { error } = await supabase.from('flashcards').insert({ front, back });
    if (error) setMessage(error.message); else { setFront(''); setBack(''); loadData(); }
  }
  async function addTask(e) {
    e.preventDefault(); setMessage('');
    const { error } = await supabase.from('tasks').insert({ title: taskTitle });
    if (error) setMessage(error.message); else { setTaskTitle(''); loadData(); }
  }
  async function toggleTask(task) {
    const { error } = await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id);
    if (error) setMessage(error.message); else loadData();
  }
  async function deleteCard(id) {
    const { error } = await supabase.from('flashcards').delete().eq('id', id);
    if (error) setMessage(error.message); else loadData();
  }

  if (!supabase) return <main className="setup"><div className="brand">✦ StudyFlow</div><h1>Dein Lernen. Dein Flow.</h1><p>Die Website ist bereit. Es fehlen noch die beiden Supabase-Verbindungswerte.</p><ol><li>Kopiere <code>.env.example</code> zu <code>.env.local</code>.</li><li>Trage dort deine Project URL und den Publishable Key ein.</li><li>Starte die Website mit <code>npm run dev</code> neu.</li></ol><p className="hint">Die Verbindungswerte niemals in öffentliche Chats oder GitHub hochladen.</p></main>;

  if (!session) return <main className="auth"><div className="brand">✦ StudyFlow</div><section className="panel"><p className="eyebrow">LERNEN LEICHT GEMACHT</p><h1>{mode === 'login' ? 'Willkommen zurück.' : 'Erstelle deinen Account.'}</h1><p className="muted">Dein persönlicher Platz für Schule und Lernen.</p><form onSubmit={authenticate}><label>E-Mail<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="du@beispiel.at" /></label><label>Passwort<input type="password" minLength="8" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Mindestens 8 Zeichen" /></label><button>{mode === 'login' ? 'Einloggen' : 'Kostenlos registrieren'}</button></form><p className="switch">{mode === 'login' ? 'Noch kein Konto?' : 'Schon registriert?'} <a onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Registrieren' : 'Einloggen'}</a></p>{message && <p className="message">{message}</p>}</section></main>;

  return <main className="app"><header><div className="brand">✦ StudyFlow</div><div className="user">{session.user.email}<button className="ghost" onClick={() => supabase.auth.signOut()}>Abmelden</button></div></header><section className="welcome"><p className="eyebrow">DEIN SCHUL-COCKPIT</p><h1>Schön, dass du da bist.</h1><p className="muted">Ein Schritt nach dem anderen. Du schaffst das.</p></section><nav><button className={tab==='cards'?'selected':''} onClick={()=>setTab('cards')}>Karteikarten</button><button className={tab==='tasks'?'selected':''} onClick={()=>setTab('tasks')}>Aufgaben</button></nav>{tab==='cards'?<section className="panel"><h2>Deine Karteikarten</h2><form className="add" onSubmit={addCard}><input required value={front} onChange={e=>setFront(e.target.value)} placeholder="Vorderseite / Frage"/><input required value={back} onChange={e=>setBack(e.target.value)} placeholder="Rückseite / Antwort"/><button>Hinzufügen</button></form><div className="items">{cards.map(c=><article className="item" key={c.id}><div><b>{c.front}</b><p>{c.back}</p></div><button className="ghost" onClick={()=>deleteCard(c.id)}>Löschen</button></article>)}{!cards.length&&<p className="muted">Noch keine Karteikarten. Lege deine erste an!</p>}</div></section>:<section className="panel"><h2>Deine Aufgaben</h2><form className="add" onSubmit={addTask}><input required value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="Neue Aufgabe …"/><button>Hinzufügen</button></form><div className="items">{tasks.map(t=><article className="item" key={t.id}><label className="check"><input type="checkbox" checked={!!t.done} onChange={()=>toggleTask(t)}/><span className={t.done?'done':''}>{t.title}</span></label></article>)}{!tasks.length&&<p className="muted">Noch keine Aufgaben eingetragen.</p>}</div></section>}{message&&<p className="message">{message}</p>}<footer>StudyFlow · Deine Daten bleiben deinem Konto zugeordnet.</footer></main>;
}

createRoot(document.getElementById('root')).render(<App />);
