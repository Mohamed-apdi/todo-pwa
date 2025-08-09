'use client';

import { useEffect, useMemo, useState } from 'react';

type Todo = { id: string; text: string; done: boolean; createdAt: number };

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [notifReady, setNotifReady] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('todos');
      if (raw) setTodos(JSON.parse(raw));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch {}
  }, [todos]);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'todos' && e.newValue) setTodos(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    setNotifReady(typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator);
  }, []);

  const remaining = useMemo(() => todos.filter(t => !t.done).length, [todos]);

  async function enableNotifications() {
    if (!notifReady) return;
    let perm = Notification.permission;
    if (perm !== 'granted') {
      perm = await Notification.requestPermission();
    }
    if (perm === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('Notifications enabled', {
        body: 'You will get a ping when you add a task.',
        icon: '/icons/icon-192.png',
      });
    }
  }

  function addTodo() {
    const t = text.trim();
    if (!t) return;
    setTodos(prev => [{ id: crypto.randomUUID(), text: t, done: false, createdAt: Date.now() }, ...prev]);
    setText('');

    (async () => {
      try {
        if (notifReady && Notification.permission === 'granted') {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification('New todo added', {
            body: t,
            icon: '/icons/icon-192.png',
            data: '/',
          });
        }
      } catch {}
    })();
  }

  function toggle(id: string) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function clearCompleted() {
    setTodos(prev => prev.filter(t => !t.done));
  }

  return (
    <main className="mx-auto max-w-md p-6">
      {/* Header with icons */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Todo</h1>
        <div className="flex items-center gap-3">
          {/* Scan icon link */}
          <a
            href="/scan"
            title="Scan"
            aria-label="Scan"
            className="rounded border px-2 py-1 hover:bg-gray-100"
          >
            📷
          </a>
          {/* Notifications icon button */}
          <button
            onClick={enableNotifications}
            title="Enable notifications"
            aria-label="Enable notifications"
            className="rounded border px-2 py-1 hover:bg-gray-100"
          >
            🔔
          </button>
        </div>
      </header>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Add a task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button className="px-4 py-2 rounded bg-black text-white" onClick={addTodo}>Add</button>
      </div>

      <div className="flex items-center justify-between mb-3 text-sm">
        <span>{remaining} remaining</span>
        <button className="underline" onClick={clearCompleted}>Clear completed</button>
      </div>

      <ul className="space-y-2">
        {todos.map(t => (
          <li key={t.id} className="flex items-center gap-2 p-2 bg-white rounded border">
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span className={`flex-1 ${t.done ? 'line-through text-gray-400' : ''}`}>{t.text}</span>
            <button className="text-sm underline" onClick={() => remove(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
