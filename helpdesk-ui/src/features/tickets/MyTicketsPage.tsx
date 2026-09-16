import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Ticket as TicketIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { apiGetTickets } from '../../lib/apiClient';
import {
  StatusBadge, PriorityBadge, CategoryChip, SLAIndicator,
  FilterBar, SkeletonTable, EmptyState, Alert, Button
} from '../../components';
import type { TicketStatus, Priority } from '../../types';
import './TicketListPage.css';

const STATUS_OPTIONS: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

export function MyTicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TicketStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);

  const { data: tickets, isLoading, isError, refetch } = useQuery({
    queryKey: ['tickets', 'employee', user?.id],
    queryFn: () => apiGetTickets(user!.id, 'employee'),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const filtered = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter(t => {
      if (statusFilter.length && !statusFilter.includes(t.status)) return false;
      if (priorityFilter.length && !priorityFilter.includes(t.priority)) return false;
      return true;
    });
  }, [tickets, statusFilter, priorityFilter]);

  const toggleStatus = (s: string) => {
    const st = s as TicketStatus;
    setStatusFilter(f => f.includes(st) ? f.filter(x => x !== st) : [...f, st]);
  };
  const togglePriority = (p: string) => {
    const pr = p as Priority;
    setPriorityFilter(f => f.includes(pr) ? f.filter(x => x !== pr) : [...f, pr]);
  };

  const hasFilter = statusFilter.length > 0 || priorityFilter.length > 0;
  const openCount = tickets?.filter(t => t.status === 'Open' || t.status === 'In Progress').length ?? 0;

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tickets</h1>
          {openCount > 0 && (
            <span className="page-subtitle">{openCount} open</span>
          )}
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/tickets/new')}
        >
          New ticket
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        groups={[
          {
            label: 'Status',
            chips: STATUS_OPTIONS.map(s => ({ key: s, label: s, active: statusFilter.includes(s) })),
            onToggle: toggleStatus,
          },
          {
            label: 'Priority',
            chips: PRIORITY_OPTIONS.map(p => ({ key: p, label: p, active: priorityFilter.includes(p) })),
            onToggle: togglePriority,
          },
        ]}
        hasActive={hasFilter}
        onClear={() => { setStatusFilter([]); setPriorityFilter([]); }}
      />

      {/* Content */}
      {isLoading && <SkeletonTable rows={6} cols={6} />}

      {isError && (
        <Alert variant="error" title="Could not load tickets">
          <span>There was an error loading your tickets. </span>
          <button className="inline-link" onClick={() => refetch()}>Try again</button>
        </Alert>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={<TicketIcon size={40} />}
          title={hasFilter ? 'No tickets match your filters' : 'No tickets yet'}
          description={hasFilter ? 'Try clearing your filters to see all tickets.' : 'Need help with something? Submit a ticket and our team will assist you.'}
          action={
            !hasFilter
              ? <Button variant="primary" icon={<Plus size={16} />} onClick={() => navigate('/tickets/new')}>New ticket</Button>
              : <Button variant="ghost" onClick={() => { setStatusFilter([]); setPriorityFilter([]); }}>Clear filters</Button>
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="ticket-table-wrap">
            <table className="ticket-table" aria-label="My tickets">
              <thead>
                <tr>
                  <th scope="col">Ticket ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Category</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Status</th>
                  <th scope="col">SLA</th>
                  <th scope="col" className="hide-tablet">Last updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr
                    key={t.id}
                    className={`ticket-table__row ${t.slaBreached ? 'ticket-table__row--breach' : ''}`}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/tickets/${t.id}`)}
                    aria-label={`Ticket ${t.id}: ${t.title}`}
                  >
                    <td className="ticket-id">{t.id}</td>
                    <td className="ticket-title">{t.title}</td>
                    <td><CategoryChip category={t.category} size="sm" /></td>
                    <td><PriorityBadge priority={t.priority} size="sm" /></td>
                    <td><StatusBadge status={t.status} size="sm" /></td>
                    <td>
                      <SLAIndicator
                        deadline={t.slaDeadline}
                        priority={t.priority}
                        showPulse
                        size="sm"
                      />
                    </td>
                    <td className="hide-tablet text-secondary text-small">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="ticket-cards">
            {filtered.map(t => (
              <Link key={t.id} to={`/tickets/${t.id}`} className={`ticket-card ${t.slaBreached ? 'ticket-card--breach' : ''}`}>
                <div className="ticket-card__top">
                  <span className="ticket-id">{t.id}</span>
                  <SLAIndicator deadline={t.slaDeadline} priority={t.priority} showPulse size="sm" />
                </div>
                <p className="ticket-card__title">{t.title}</p>
                <div className="ticket-card__meta">
                  <CategoryChip category={t.category} size="sm" />
                  <PriorityBadge priority={t.priority} size="sm" />
                  <StatusBadge status={t.status} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
