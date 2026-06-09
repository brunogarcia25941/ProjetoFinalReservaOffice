import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosConfig';

function GuestInput({ guests = [], onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Carregar todos os utilizadores para autocompletar localmente
    api.get('/picklists/users')
      .then(res => {
        setAllUsers(res.data || []);
      })
      .catch(err => {
        console.error('Erro ao carregar lista de utilizadores para sugestões:', err);
      });
  }, []);

  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const query = inputValue.toLowerCase();
    const filtered = allUsers.filter(user => {
      const nameMatch = user.name && user.name.toLowerCase().includes(query);
      const emailMatch = user.email && user.email.toLowerCase().includes(query);
      const notAlreadyInvited = !guests.some(g => g.toLowerCase() === user.email.toLowerCase());
      return (nameMatch || emailMatch) && notAlreadyInvited;
    });

    setFilteredSuggestions(filtered);
    setSelectedIndex(prev => Math.min(prev, filtered.length - 1));
  }, [inputValue, allUsers, guests]);

  useEffect(() => {
    // Fechar dropdown ao clicar fora
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addGuest = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    if (!validateEmail(cleanEmail)) {
      alert('Por favor, introduz um endereço de email válido.');
      return;
    }

    if (guests.some(g => g.toLowerCase() === cleanEmail)) {
      setInputValue('');
      setShowSuggestions(false);
      return;
    }

    const updatedGuests = [...guests, cleanEmail];
    onChange(updatedGuests);
    setInputValue('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const removeGuest = (indexToRemove) => {
    const updatedGuests = guests.filter((_, index) => index !== indexToRemove);
    onChange(updatedGuests);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        addGuest(filteredSuggestions[selectedIndex].email);
      } else if (inputValue.trim()) {
        addGuest(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowSuggestions(true);
      setSelectedIndex(prev => (prev + 1) % Math.max(filteredSuggestions.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === ',' || e.key === ';') {
      e.preventDefault();
      addGuest(inputValue);
    }
  };

  // Encontrar o nome de um utilizador interno com base no email
  const getUserName = (email) => {
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    return found ? found.name : null;
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700">
        Convidados
      </label>
      
      {/* Container de Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {guests.map((email, index) => {
          const nomeInterno = getUserName(email);
          const isInternal = !!nomeInterno;
          
          return (
            <div 
              key={index} 
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shadow-sm transition-all animate-fade-in ${
                isInternal 
                  ? 'bg-blue-50 border-blue-200 text-blue-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span>
                {nomeInterno ? `${nomeInterno} (${email})` : email}
              </span>
              <button
                type="button"
                onClick={() => removeGuest(index)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none text-sm font-bold"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>

      {/* Input de Texto */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Escreve o email ou nome do colega..."
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
        />

        {/* Lista de Sugestões Autocomplete */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-fade-in divide-y divide-gray-50">
            {filteredSuggestions.map((user, idx) => (
              <div
                key={user.id}
                onClick={() => addGuest(user.email)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex flex-col ${
                  idx === selectedIndex ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold">{user.name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <p className="text-[10px] text-gray-400 leading-relaxed">
        Podes digitar e carregar em <strong>Enter</strong> ou <strong>vírgula</strong> para adicionar. Clientes externos (verdes) e colaboradores (azuis) são suportados.
      </p>
    </div>
  );
}

export default GuestInput;
