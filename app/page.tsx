'use client';

import { useState, useEffect, useCallback } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

type Filter = 'all' | 'active' | 'done';

const SPIRAL_COUNT = 13;

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 10" width="12" height="10" fill="none" aria-hidden="true">
      <path
        d="M1 5.5 L4.5 9 L11 1.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [mounted, setMounted] = useState(false);

  // ハイドレーション後に localStorage を読む
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('notebook-todos');
      if (saved) setTodos(JSON.parse(saved));
    } catch {
      // 無視
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('notebook-todos', JSON.stringify(todos));
  }, [todos, mounted]);

  const addTodo = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setTodos(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text,
        completed: false,
      },
    ]);
    setInput('');
  }, [input]);

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);

  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const statusText =
    todos.length === 0
      ? 'なにか書いてみよう'
      : activeCount === 0
      ? 'ぜんぶできた！'
      : `あと ${activeCount} 件`;

  const FILTER_LABELS: Record<Filter, string> = {
    all: 'すべて',
    active: 'やること',
    done: 'できた！',
  };

  const EMPTY_MESSAGES: Record<Filter, string> = {
    all: 'なにか書いてみよう',
    active: 'ぜんぶできた！',
    done: 'まだないよ',
  };

  return (
    <main className="desk">
      <div className="notebook">
        {/* スパイラル製本 */}
        <div className="spiral-bar" aria-hidden="true">
          {Array.from({ length: SPIRAL_COUNT }).map((_, i) => (
            <div key={i} className="spiral-ring" />
          ))}
        </div>

        {/* 紙面 */}
        <div className="paper">
          {/* ヘッダー */}
          <div className="paper-header">
            <h1 className="notebook-title">やること帳</h1>
            <div className="header-right">
              <span className="notebook-date">{dateStr}</span>
              <span className="notebook-status">{statusText}</span>
            </div>
          </div>

          {/* フィルタータブ */}
          <div className="filter-row">
            <div className="filter-spacer" />
            {(['all', 'active', 'done'] as const).map(f => (
              <button
                key={f}
                className={`filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          {/* 入力エリア */}
          <div className="input-row">
            <span className="input-arrow" aria-hidden="true">→</span>
            <input
              className="todo-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) addTodo();
              }}
              placeholder="タスクを書く..."
              maxLength={100}
              aria-label="新しいタスク"
            />
            <button className="add-btn" onClick={addTodo}>
              追加
            </button>
          </div>

          <hr className="rule-divider" />

          {/* ToDoリスト */}
          <ul className="todo-list" role="list">
            {filtered.length === 0 ? (
              <li className="empty-state">{EMPTY_MESSAGES[filter]}</li>
            ) : (
              filtered.map(todo => (
                <li
                  key={todo.id}
                  className={`todo-item${todo.completed ? ' completed' : ''}`}
                >
                  <button
                    className={`checkbox${todo.completed ? ' checked' : ''}`}
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
                  >
                    {todo.completed && <CheckIcon />}
                  </button>
                  <span className="todo-text" title={todo.text}>
                    {todo.text}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => removeTodo(todo.id)}
                    aria-label="削除"
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* 完了済みを一括削除 */}
          {hasCompleted && (
            <div className="paper-footer">
              <button className="clear-btn" onClick={clearCompleted}>
                完了済みを消す
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
