import React from 'react';

function UserForm({ user, onSubmit, onChange, picklists, isEdit = false }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
        <input 
          type="text" 
          value={user.name} 
          onChange={(e) => onChange({ ...user, name: e.target.value })} 
          className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-blue-500 focus:border-blue-500" 
          required 
          placeholder="Ex: João Silva"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Profissional</label>
        <input 
          type="email" 
          value={user.email} 
          onChange={(e) => onChange({ ...user, email: e.target.value })} 
          className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-blue-500 focus:border-blue-500" 
          required 
          placeholder="Ex: joao.silva@softinsa.pt"
        />
      </div>
      
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe Inicial</label>
          <input 
            type="password" 
            value={user.password} 
            onChange={(e) => onChange({ ...user, password: e.target.value })} 
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-blue-500 focus:border-blue-500" 
            required 
            minLength="8"
            placeholder="Mínimo 8 caracteres (Maiúscula, Minúscula, Número)"
          />
        </div>
      )}

      {isEdit && picklists && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo (Role)</label>
          <select
            value={user.role}
            onChange={(e) => onChange({ ...user, role: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {picklists.roles.map(role => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </div>
      )}

      <button 
        type="submit" 
        className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors mt-4"
      >
        {isEdit ? "Salvar Alterações" : "Criar Conta"}
      </button>
    </form>
  );
}

export default UserForm;
