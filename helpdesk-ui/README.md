# AI-Powered Enterprise Helpdesk

A fully-functional frontend implementation of the AI-Powered Enterprise Helpdesk. This project is built with React 18, TypeScript, and Vite. It runs entirely on in-memory mock data with simulated asynchronous API latency, meaning **no backend is required** to run or demo the app.

## Features Included
- **Role-based routing** (Employee, Agent, Manager, Admin)
- **Design System** using accessible, CSS token-driven components
- **Core Ticketing Loop**: New ticket, My Tickets, unified Ticket Detail
- **Agent Queue**: SLA-sorted list with breach highlighting and preview drawer
- **AI Assistant**: A mock chat interface simulating grounded generation
- **Manager Dashboards**: SLA metrics and agent workload views
- **Admin Screens**: Knowledge base uploads and user management

## Running the App

1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the local server URL provided in your terminal (usually `http://localhost:5173/`).

## Test Credentials

The app uses simulated JWT authentication. You can log in using any of the following demo accounts to explore the different role-based views.

**Password for all accounts:** `password`

| Role | Email | Use Case |
|---|---|---|
| **Employee** | `alice@corp.com` | Create tickets, view own tickets, use AI assistant |
| **Agent** | `carol@corp.com` | View queue, manage tickets, add internal notes |
| **Manager** | `frank@corp.com` | View SLA dashboards, workload, read-only tickets |
| **Admin** | `grace@corp.com` | Manage users, upload KB documents, configure settings |

## Technical Implementation Notes

- **Real-time updates**: Real-time polling is simulated via TanStack Query's `refetchInterval` to demonstrate data updates (like SLA breaches) without page refreshes.
- **AI Classification**: When submitting a new ticket, a simulated AI classification delay occurs before the ticket is categorized.
- **Accessibility**: Modals trap focus, tables use proper semantic markup, and visual status indicators always combine color + icon + text.
