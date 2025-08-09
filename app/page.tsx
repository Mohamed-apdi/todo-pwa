'use client';

import { useEffect, useMemo, useState } from 'react';

type Todo = { id: string; text: string; done: boolean; createdAt: number };

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');

  // Load from localStorage on first render
  useEffect(() => {
    try {
      const raw = localStorage.getItem('todos');
      if (raw) setTodos(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist any change
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

  const remaining = useMemo(() => todos.filter(t => !t.done).length, [todos]);

  function addTodo() {
    const t = text.trim();
    if (!t) return;
    setTodos(prev => [{ id: crypto.randomUUID(), text: t, done: false, createdAt: Date.now() }, ...prev]);
    setText('');
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
      <h1 className="text-2xl font-semibold mb-4">Todo</h1>
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
