import React, { useState, useEffect } from 'react';
import shelfLife from './shelfLife';
import './styles.css';

const getStatus = (expiry) => {
  const today = new Date();
  const diff = (new Date(expiry) - today) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'expired';
  if (diff <= 3) return 'near';
  return 'safe';
};

const App = () => {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('items')) || []);
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [filter, setFilter] = useState('all');
  const [wasted, setWasted] = useState(() => JSON.parse(localStorage.getItem('wasted')) || []);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
    localStorage.setItem('wasted', JSON.stringify(wasted));
  }, [items, wasted]);

  useEffect(() => {
    if (name.toLowerCase() in shelfLife && !expiry) {
      const days = shelfLife[name.toLowerCase()];
      const suggestDate = new Date();
      suggestDate.setDate(suggestDate.getDate() + days);
      setExpiry(suggestDate.toISOString().split('T')[0]);
    }
  }, [name]);

  const handleSubmit = () => {
    if (!name || !expiry) return;
    const updatedItem = { name, expiry };
    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = updatedItem;
      setItems(updated);
      setEditingIndex(null);
    } else {
      setItems([...items, updatedItem]);
    }
    setName('');
    setExpiry('');
  };

  const deleteItem = (index) => setItems(items.filter((_, i) => i !== index));
  const editItem = (index) => {
    const item = items[index];
    setName(item.name);
    setExpiry(item.expiry);
    setEditingIndex(index);
  };
  const markWasted = (index) => {
    setWasted([...wasted, items[index]]);
    deleteItem(index);
  };

  const filteredItems = items
    .filter(item => {
      const status = getStatus(item.expiry);
      return filter === 'all' || status === filter;
    })
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      <div className="header">
        <h1>ExpiryAlert</h1>
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="input-group">
        <input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        <button onClick={handleSubmit}>{editingIndex !== null ? 'Update' : 'Add'}</button>
      </div>

      <div className="filters">
        {['all', 'safe', 'near', 'expired'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={filter === type ? 'active-filter' : ''}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <ul className="item-list">
        {filteredItems.map((item, index) => {
          const status = getStatus(item.expiry);
          return (
            <li key={index} className={`item ${status}`}>
              <div className="item-info">
                <strong>{item.name}</strong> – {item.expiry}
              </div>
              <div className="item-actions">
                <button onClick={() => editItem(index)}>✏️</button>
                <button onClick={() => deleteItem(index)}>❌</button>
                <button onClick={() => markWasted(index)}>🗑️</button>
              </div>
            </li>
          );
        })}
      </ul>

      <h3>Wasted Items: {wasted.length}</h3>
      <ul className="wasted-list">
        {wasted.map((item, index) => (
          <li key={index}>{item.name} – {item.expiry}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
