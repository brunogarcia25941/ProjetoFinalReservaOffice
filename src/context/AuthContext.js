import React, { createContext, useState, useEffect } from 'react';

// 1. Criamos o contexto. Isto vai atuar como um "estado global" para os dados do utilizador.
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Estado que guarda a informação do utilizador atual (nome, email, cargo/role)
    const [user, setUser] = useState(null);

    // 2. useEffect: Executa-se apenas uma vez quando o utilizador abre a página.
    // O seu objetivo é verificar se já tínhamos feito login antes (persistência de sessão).
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // Se houver um token e dados do utilizador guardados no browser, carregamo-los para o estado
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // 3. Função de Login: É chamada a partir da página Login.js quando a API responde com sucesso.
    // Guarda o token de segurança no browser (localStorage) para pedidos futuros.
    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // 4. Função de Logout: Apaga o rasto do utilizador do browser e termina a sessão.
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Fornecemos os dados e as funções a qualquer componente "filho" que esteja dentro do Provider
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};