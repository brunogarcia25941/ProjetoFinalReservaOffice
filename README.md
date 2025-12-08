# 🏢 Reserva Office - Gestão de Espaços

> **Projeto Final de Licenciatura em Engenharia Informática**
> Desenvolvido em parceria com a **Softinsa**

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)

## 📖 Sobre o Projeto
O **Reserva Office** é uma plataforma Web Full-Stack desenhada para simplificar a gestão de recursos num ambiente de escritório híbrido. O objetivo é permitir que os colaboradores visualizem, reservem e giram espaços (secretárias, monitores) de forma simples e intuitiva, com foco na acessibilidade e experiência de utilização.

---

## 🗺️ Roteiro de Desenvolvimento (Roadmap)

O projeto está a ser desenvolvido por fases (Sprints). Atualmente estamos na **Fase 1**.

### ✅ Fase 1: MVP (Estado Atual)
O foco atual é validar o fluxo principal de reservas ("Core"):
* [ ] Definição da Arquitetura e Base de Dados.
* [ ] Autenticação de Utilizadores (Login/Registo).
* [ ] Listagem de Recursos (Mesas/Salas).
* [ ] Criação e Cancelamento de Reservas.

### 🔜 Fase 2: Funcionalidades Avançadas (Próximo Sprint)
* Mapa Interativo do escritório.
* Painel de Administração para gestão de recursos.
* Validação de disponibilidade em tempo real (Websockets).

### 🔮 Fase 3: Extras e Integrações
* Reservas recorrentes.
* Integração com Google Calendar.
* Estatísticas de ocupação.

---

## 🛠️ Stack Tecnológica
* **Frontend:** React.js
* **Backend:** Node.js (Express)
* **Base de Dados:** MySQL
* **Deploy:** Heroku

---

## 🗄️ Arquitetura de Dados
Estrutura da Base de Dados desenhada para suportar o sistema de reservas:

```mermaid
classDiagram
    direction TB

    class User {
        +int id PK
        +string name
        +string email
        +string password_hash
        +enum role
        +datetime created_at
    }

    class Resource {
        +int id PK
        +string name
        +enum type
        +enum status
    }

    class Booking {
        +int id PK
        +int user_id FK
        +int resource_id FK
        +datetime start_time
        +datetime end_time
        +enum status
        +datetime created_at
    }

    %% Relações:
    %% 1 User tem muitas Reservas (Agregação)
    User "1" o-- "0..*" Booking : faz
    
    %% 1 Recurso tem muitas Reservas (Agregação)
    Resource "1" o-- "0..*" Booking : tem