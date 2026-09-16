import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiGetTicket, apiGetTickets, apiGetComments } from '../../lib/apiClient';
import {
  StatusBadge, PriorityBadge, CategoryChip, SLAIndicator,
  FilterBar, SkeletonTable, EmptyState, Alert, Drawer,
  Button
} from '../../components';
import type { TicketStatus, Priority } from '../../types';
import '../../features/tickets/TicketListPage.css';
import './QueuePage.css';

const STATUS_OPTIONS: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

function TicketPreview({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const { data: ticket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => apiGetTicket(ticketId),
  });
  const { data: comments } = useQuery({
    queryKey: ['comments', ticketId, false],
    queryFn: () => apiGetComments(ticketId, false),
    enabled: !!ticketId,
  });
  const navigate = useNavigate();

  if (!ticket) return <p>Loading…</p>;

  return (
    <div className="ticket-preview">
      <div className="ticket-preview__meta">
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
        <SLAIndicator deadline={ticket.slaDeadline} priority={ticket.priority} />
      </div>
      <h3 className="ticket-preview__title">{ticket.title}</h3>
      <p className="ticket-preview__desc">{ticket.description}</p>
      <p className="ticket-preview__employee">From: {ticket.employeeName}</p>
      <CategoryChip category={ticket.category} />
      {comments && comments.length > 0 && (
        <div className="ticket-preview__comments">
          <p className="ticket-preview__comments-label">{comments.length} replies</p>
        </div>
      )}
      <Button
        variant="primary"
        size="sm"
        onClick={() => { onClose(); navigate(`/tickets/${ticketId}`); }}
        style={{ marginTop: '1rem' }}
      >
        Open full ticket
      </Button>
    </div>
  );
}

export function QueuePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TicketStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data: tickets, isLoading, isError, refetch } = useQuery({
    queryKey: ['queue', user?.id],
    queryFn: () => apiGetTickets(user!.id, 'agent'),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const filtered = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter(t => {
      if (statusFilter.length && !statusFilter.includes(t.status)) return false;
      if (priorityFilter.length && !priorityFilter.includes(t.priority)) return false;
      return true;
    });
  }, [tickets, statusFilter, priorityFilter]);

  const breachCount = tickets?.filter(t => t.slaBreached).length ?? 0;
  const hasFilter   = statusFilter.length > 0 || priorityFilter.length > 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            My Queue
            {breachCount > 0 && (
              <span className="breach-counter" aria-label={`${breachCount} tickets have breached SLA`}>
                {breachCount}
              </span>
            )}
          </h1>
          <span className="page-subtitle">Sorted by SLA urgency</span>
        </div>
      </div>

      <FilterBar
        groups={[
          {
            label: 'Status',
            chips: STATUS_OPTIONS.map(s => ({ key: s, label: s, active: statusFilter.includes(s) })),
            onToggle: s => setStatusFilter(f => {
              const st = s as TicketStatus;
              return f.includes(st) ? f.filter(x => x !== st) : [...f, st];
            }),
          },
          {
            label: 'Priority',
            chips: PRIORITY_OPTIONS.map(p => ({ key: p, label: p, active: priorityFilter.includes(p) })),
            onToggle: p => setPriorityFilter(f => {
              const pr = p as Priority;
              return f.includes(pr) ? f.filter(x => x !== pr) : [...f, pr];
            }),
          },
        ]}
        hasActive={hasFilter}
        onClear={() => { setStatusFilter([]); setPriorityFilter([]); }}
      />

      {isLoading && <SkeletonTable rows={8} cols={7} />}

      {isError && (
        <Alert variant="error" title="Could not load queue">
          <button className="inline-link" onClick={() => refetch()}>Try again</button>
        </Alert>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={hasFilter ? 'No tickets match your filters' : 'Queue clear — nice work'}
          description={hasFilter ? 'Try clearing your filters.' : 'No tickets assigned or awaiting in your department.'}
          action={hasFilter
            ? <Button variant="ghost" onClick={() => { setStatusFilter([]); setPriorityFilter([]); }}>Clear filters</Button>
            : undefined
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="ticket-table-wrap">
            <table className="ticket-table" aria-label="Agent queue">
              <thead>
                <tr>
                  <th scope="col">SLA</th>
                  <th scope="col">Ticket ID</th>
                  <th scope="col">Title</th>
                  <th scope="col" className="hide-tablet">Employee</th>
                  <th scope="col">Category</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Status</th>
                  <th scope="col" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr
                    key={t.id}
                    className={`ticket-table__row ${t.slaBreached ? 'ticket-table__row--breach queue-row--breach' : ''}`}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/tickets/${t.id}`)}
                  >
                    <td><SLAIndicator deadline={t.slaDeadline} priority={t.priority} showPulse size="sm" /></td>
                    <td className="ticket-id">{t.id}</td>
                    <td className="ticket-title">{t.title}</td>
                    <td className="hide-tablet text-secondary text-small">{t.employeeName}</td>
                    <td><CategoryChip category={t.category} size="sm" /></td>
                    <td><PriorityBadge priority={t.priority} size="sm" /></td>
                    <td><StatusBadge status={t.status} size="sm" /></td>
                    <td>
                      <button
                        className="queue-preview-btn"
                        onClick={e => { e.stopPropagation(); setPreviewId(t.id); }}
                        aria-label={`Quick preview ticket ${t.id}`}
                        title="Quick preview"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="ticket-cards">
            {filtered.map(t => (
              <div
                key={t.id}
                className={`ticket-card ${t.slaBreached ? 'ticket-card--breach' : ''}`}
                onClick={() => navigate(`/tickets/${t.id}`)}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/tickets/${t.id}`)}
                role="button"
              >
                <div className="ticket-card__top">
                  <SLAIndicator deadline={t.slaDeadline} priority={t.priority} showPulse size="sm" />
                  <span className="ticket-id">{t.id}</span>
                </div>
                <p className="ticket-card__title">{t.title}</p>
                <div className="ticket-card__meta">
                  <CategoryChip category={t.category} size="sm" />
                  <PriorityBadge priority={t.priority} size="sm" />
                  <StatusBadge status={t.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick preview drawer */}
      <Drawer
        open={!!previewId}
        onClose={() => setPreviewId(null)}
        title={previewId ?? ''}
      >
        {previewId && <TicketPreview ticketId={previewId} onClose={() => setPreviewId(null)} />}
      </Drawer>
    </div>
  );
}
