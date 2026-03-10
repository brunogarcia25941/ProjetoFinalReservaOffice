# Reserva Office - Sistema de Gestão de Espaços (Frontend)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

> **Portal do Colaborador** | Uma Single Page Application (SPA) moderna, desenvolvida em React para simplificar a reserva de mesas e equipamentos de escritório, garantindo a otimização do espaço híbrido da **Softinsa**.

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração do Ambiente Local](#configuração-do-ambiente-local)
- [Gestão de Estado e Autenticação](#gestão-de-estado-e-autenticação)
- [Convenções de Código](#convenções-de-código)

---

## Sobre o Projeto

Com o modelo de trabalho híbrido em crescimento, a gestão dos espaços físicos tornou-se um desafio.

O **Reserva Office** é uma plataforma desenhada para garantir que qualquer colaborador consiga visualizar e reservar a sua área de trabalho (secretárias, monitores, salas) de forma antecipada, evitando colisões de horários.

Este repositório contém exclusivamente a **Interface de Utilizador (Frontend)**, desenhada para consumir a API RESTful do Backend.

---

## Funcionalidades Principais

- **Autenticação Segura**
  - Login protegido via **JSON Web Tokens (JWT)**.
  - Persistência de sessão através de `localStorage`.

- **Painel Interativo (Dashboard)**
  - Visualização em tempo real do estado de cada recurso.
  - Recursos podem estar **Disponíveis** ou **Em Manutenção**.

- **Gestão Pessoal**
  - Página **"As Minhas Reservas"**.
  - Consulta de histórico.
  - Cancelamento de reservas ativas.

- **Design Responsivo**
  - Interface adaptada a **computadores, tablets e telemóveis**.
  - Desenvolvido com **Tailwind CSS**.

- **Rotas Privadas**
  - Apenas utilizadores autenticados podem aceder às páginas internas.
  - Implementação com **PrivateRoute**.

---

## Stack Tecnológico

O projeto foi desenvolvido focando na **performance, simplicidade e escalabilidade**.

### Frontend
- **Framework:** React.js (v18)
- **Routing:** React Router DOM (v6)
- **Estilização:** Tailwind CSS
- **HTTP Client:** Axios
- **Gestão de Estado:** React Context API

---

## Estrutura do Projeto

A arquitetura foi organizada para permitir fácil manutenção e escalabilidade.

```text
src/
├── context/          # Estados globais (Ex: AuthContext.js para sessão)
├── pages/            # Ecrãs principais da aplicação
│   ├── Login.js      # Autenticação
│   ├── Dashboard.js  # Grelha de mesas e salas
│   └── MyBookings.js # Histórico pessoal do utilizador
├── App.js            # Configuração de Rotas e Proteção (Private Routes)
└── index.css         # Configurações globais do Tailwind
```

## Configuração do Ambiente Local

Se quiseres executar o projeto localmente, segue os passos abaixo.

### 1. Pré-requisitos
Certifica-te de que tens instalado:
- **Node.js** (versão 16 ou superior)
- **NPM** ou **Yarn**

### 2. Clonar o Repositório
```bash
git clone [https://github.com/brunogarcia25941/ProjetoFinalReservaOffice.git](https://github.com/brunogarcia25941/ProjetoFinalReservaOffice.git)
cd ProjetoFinalReservaOffice

```

### 3. Instalar Dependências

```bash
npm install

```

### 4. Ligação à API (Backend)

Por defeito, a aplicação fará os pedidos para:

```text
http://localhost:5000/api

```

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm start

```

A aplicação ficará disponível em `http://localhost:3000`.

---

## Gestão de Estado e Autenticação

A lógica de autenticação está centralizada em `src/context/AuthContext.js`.

**Exemplo de utilização:**

```javascript
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function MeuComponente() {
  const { user, token, logout } = useContext(AuthContext);

  return <div>Bem-vindo {user.name}</div>;
}

```

---

## Convenções de Código

Para manter consistência no projeto, devem ser seguidas as seguintes regras:

### Componentes

* Utilizar apenas **componentes funcionais**.
* Utilizar **React Hooks** (`useState`, `useEffect`, etc.).

### Estilização

* Usar exclusivamente **Tailwind CSS**.

### Chamadas à API

* Utilizar **Axios**.
* Implementar blocos `try/catch` para tratamento de erros.

**Exemplo:**

```javascript
try {
  const response = await axios.get("/api/bookings");
} catch (error) {
  console.error("Erro ao carregar reservas", error);
}

```

**Desenvolvido por:** Bruno Garcia e Bernardo Alves - Projeto Final MVP