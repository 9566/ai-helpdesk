import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Ticket, MessageSquare, LayoutDashboard, Users, BookOpen,
  Settings, Menu, X, LogOut, Bot, BarChart3, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';
import './AppShell.css';

const NAV_ITEMS: Record<Role, { to: string; icon: React.ReactNode; label: string }[]> = {
  employee: [
    { to: '/my-tickets',  icon: <Ticket size={18} />,       label: 'My Tickets' },
    { to: '/assistant',   icon: <Bot size={18} />,           label: 'AI Assistant' },
  ],
  agent: [
    { to: '/queue',       icon: <LayoutDashboard size={18} />, label: 'My Queue' },
  ],
  manager: [
    { to: '/sla-dashboard',  icon: <BarChart3 size={18} />, label: 'SLA Dashboard' },
    { to: '/team-workload',  icon: <Users size={18} />,     label: 'Team Workload' },
  ],
  admin: [
    { to: '/knowledge-base', icon: <BookOpen size={18} />,  label: 'Knowledge Base' },
    { to: '/users',          icon: <Users size={18} />,     label: 'Users' },
    { to: '/settings',       icon: <Settings size={18} />,  label: 'Settings' },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  employee: 'Employee',
  agent:    'Support Agent',
  manager:  'Manager',
  admin:    'Administrator',
};

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role] ?? [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Logo / Product name */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">
          <Ticket size={18} />
        </div>
        <span className="sidebar__brand-name">HelpDesk AI</span>
      </div>

      {/* Nav items */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <span className="sidebar__link-icon" aria-hidden>{item.icon}</span>
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer: user info + logout */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar" aria-hidden>{user.avatarInitials}</div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user.name}</span>
            <span className="sidebar__user-role">{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
        <button
          className="sidebar__logout"
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      {/* Desktop / tablet sidebar */}
      <aside className="sidebar" aria-label="Application sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="sidebar__mobile-backdrop" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="sidebar sidebar--mobile" aria-label="Application sidebar">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="app-shell__main">
        {/* Top bar */}
        <header className="topbar">
          <button
            className="topbar__menu-btn"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="topbar__brand-mobile">HelpDesk AI</span>
          <div className="topbar__spacer" />
          {user.role === 'employee' && (
            <NavLink to="/assistant" className="topbar__assistant-link">
              <Bot size={16} />
              <span>AI Assistant</span>
            </NavLink>
          )}
          <div className="topbar__account">
            <div className="topbar__avatar" aria-label={`Signed in as ${user.name}`}>{user.avatarInitials}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="app-shell__content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
