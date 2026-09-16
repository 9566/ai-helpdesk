import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { RequireAuth } from './RequireAuth';
import { useAuth, getRoleHome } from '../hooks/useAuth';

// Lazy-loaded page components
import { LoginPage }              from '../features/auth/LoginPage';
import { MyTicketsPage }          from '../features/tickets/MyTicketsPage';
import { NewTicketPage }          from '../features/tickets/NewTicketPage';
import { TicketDetailPage }       from '../features/tickets/TicketDetailPage';
import { AssistantPage }          from '../features/assistant/AssistantPage';
import { QueuePage }              from '../features/queue/QueuePage';
import { SLADashboardPage }       from '../features/sla/SLADashboardPage';
import { TeamWorkloadPage }       from '../features/sla/TeamWorkloadPage';
import { KnowledgeBasePage }      from '../features/knowledge-base/KnowledgeBasePage';
import { UserManagementPage }     from '../features/users/UserManagementPage';
import { SystemSettingsPage }     from '../features/settings/SystemSettingsPage';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHome(user.role)} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    // Authenticated shell
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <RoleRedirect /> },

          // Employee
          {
            element: <RequireAuth allowedRoles={['employee']} />,
            children: [
              { path: '/my-tickets',   element: <MyTicketsPage /> },
              { path: '/tickets/new',  element: <NewTicketPage /> },
              { path: '/assistant',    element: <AssistantPage /> },
            ],
          },

          // Agent
          {
            element: <RequireAuth allowedRoles={['agent']} />,
            children: [
              { path: '/queue', element: <QueuePage /> },
            ],
          },

          // Manager
          {
            element: <RequireAuth allowedRoles={['manager']} />,
            children: [
              { path: '/sla-dashboard',  element: <SLADashboardPage /> },
              { path: '/team-workload',  element: <TeamWorkloadPage /> },
            ],
          },

          // Admin
          {
            element: <RequireAuth allowedRoles={['admin']} />,
            children: [
              { path: '/knowledge-base', element: <KnowledgeBasePage /> },
              { path: '/users',          element: <UserManagementPage /> },
              { path: '/settings',       element: <SystemSettingsPage /> },
            ],
          },

          // Shared — ticket detail accessible by employee (own), agent, manager, admin
          {
            element: <RequireAuth allowedRoles={['employee', 'agent', 'manager', 'admin']} />,
            children: [
              { path: '/tickets/:id', element: <TicketDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
