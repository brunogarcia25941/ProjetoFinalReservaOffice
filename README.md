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

Com o modelo de trabalho híbrido em crescimento, a gestão dos espaços físicos tornou-se um desafio essencial.

O **Reserva Office** é uma plataforma desenhada para garantir que qualquer colaborador consiga visualizar e reservar a sua área de trabalho (secretárias, monitores, salas de reunião) de forma antecipada e intuitiva através de um mapa interativo, evitando colisões de horários.

Este repositório contém exclusivamente a **Interface de Utilizador (Frontend)**, desenhada para consumir a API RESTful do Backend.

---

## Funcionalidades Principais

- **Autenticação Segura & Sessão**
  - Login protegido e controlo de sessão via **JSON Web Tokens (JWT)**.
  - Expiração automática e renovação transparente com Refresh Tokens.
  - Fluxo de alteração obrigatória de palavra-passe no primeiro login.

- **Planta Interativa do Escritório**
  - Renderização 2D do mapa com zoom dinâmico e arrastamento (drag-and-drop para administradores).
  - Desenvolvido em canvas com suporte à colocação de mesas, salas e monitores.
  - Visualização em tempo real do estado de ocupação e manutenção de cada recurso.

- **Dashboard & Calendário**
  - Consulta rápida de recursos disponíveis por data e hora.
  - Visualização de horários ocupados usando FullCalendar.

- **Área Pessoal ("As Minhas Reservas")**
  - Listagem de histórico de reservas ativas e passadas.
  - Cancelamento ágil de reservas programadas.

- **Gestão de Suporte (Tickets)**
  - Criação de pedidos de suporte ou manutenção para secretárias/salas danificadas.

- **Design Responsivo & Moderno**
  - Desenvolvido com Tailwind CSS, perfeitamente adaptado a computadores, tablets e smartphones.

---

## Stack Tecnológico

O projeto foi desenvolvido focando na **performance, simplicidade e escalabilidade**.

### Frontend
- **Framework:** React.js (v19)
- **Routing:** React Router (v7)
- **Renderização Gráfica:** Konva / React-Konva (HTML5 Canvas 2D)
- **Calendário:** FullCalendar
- **Gestão de Cache HTTP:** `@tanstack/react-query`
- **Estilização:** Tailwind CSS
- **HTTP Client:** Axios (configurado com intercetores para gerir tokens JWT)
- **Gestão de Estado:** React Context API

---

## Estrutura do Projeto

A arquitetura foi organizada para permitir fácil manutenção e reutilização de componentes.

```text
src/
├── api/              # Configurações de clientes HTTP (axiosConfig.js)
├── components/       # Componentes reutilizáveis (PlantaEditor, UI, Formulários)
├── context/          # Estados globais (Ex: AuthContext.js para sessão)
├── pages/            # Ecrãs principais da aplicação (Dashboard, Admin, Tickets, etc.)
├── App.js            # Configuração de Rotas e RotaPrivada/RotaAdmin
└── index.css         # Estilos globais e diretivas do Tailwind
```

---

## Configuração do Ambiente Local

### 1. Pré-requisitos
Certifica-te de que tens instalado:
- **Node.js** (versão 18 ou superior)
- **NPM**

### 2. Clonar o Repositório
```bash
git clone https://github.com/brunogarcia25941/ProjetoFinalReservaOffice.git
cd ProjetoFinalReservaOffice
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Ligação à API (Backend)
No diretório `src/`, ajusta o endereço do backend em `config.js` ou nas variáveis de ambiente:
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

Para manter a consistência e qualidade do projeto, são seguidas as seguintes regras:
* Utilizar apenas **componentes funcionais** com Hooks.
* Gestão assíncrona de dados com `@tanstack/react-query` nas listagens para evitar pedidos redundantes à API.
* Estilização exclusiva com **Tailwind CSS**.
* Tratamento centralizado de notificações com `react-toastify`.

**Desenvolvido por:** Bruno Garcia e Bernardo Alves - Projeto Final MVP