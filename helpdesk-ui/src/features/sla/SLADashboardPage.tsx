import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGetSLAMetrics, apiGetTickets } from '../../lib/apiClient';
import { StatCard, SkeletonTable, SLAIndicator, PriorityBadge, CategoryChip } from '../../components';
import '../../features/tickets/TicketListPage.css'; // Re-use table styles
import './SLADashboardPage.css';

export function SLADashboardPage() {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['slaMetrics', timeframe],
    queryFn: () => apiGetSLAMetrics(),
    refetchInterval: 30000,
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets-manager'],
    // fetch all open/progress tickets for the manager to see active SLA risks
    queryFn: async () => {
      const all = await apiGetTickets('manager-1', 'manager');
      return all.filter(t => t.status === 'Open' || t.status === 'In Progress')
                .sort((a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime());
    },
    refetchInterval: 30000,
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">SLA Dashboard</h1>
          <span className="page-subtitle">Service Level Agreement performance</span>
        </div>
        <select
          className="timeframe-select"
          value={timeframe}
          onChange={e => setTimeframe(e.target.value as any)}
          aria-label="Timeframe"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {metricsLoading ? (
        <div className="dashboard-grid">
          <div className="skeleton" style={{ height: '110px' }} />
          <div className="skeleton" style={{ height: '110px' }} />
          <div className="skeleton" style={{ height: '110px' }} />
        </div>
      ) : metrics ? (
        <div className="dashboard-grid">
          <StatCard
            label="Resolution Rate"
            value={`${metrics.onTimePct}%`}
            subLabel="Tickets resolved within SLA"
            variant={metrics.onTimePct >= 95 ? 'success' : metrics.onTimePct >= 90 ? 'warning' : 'error'}
          />
          <StatCard
            label="Average Resolution Time"
            value={`${metrics.avgResolutionHours !== null ? metrics.avgResolutionHours.toFixed(1) : 0}h`}
            subLabel="Across all priorities"
          />
          <StatCard
            label="Active Breaches"
            value={metrics.breachedCount}
            subLabel="Tickets past SLA deadline"
            variant={metrics.breachedCount > 0 ? 'error' : 'success'}
          />
        </div>
      ) : null}

      <div className="dashboard-section">
        <h2 className="dashboard-section__title">At Risk Tickets (Approaching SLA)</h2>
        {ticketsLoading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : tickets && tickets.length > 0 ? (
          <div className="ticket-table-wrap">
            <table className="ticket-table" aria-label="At risk tickets">
              <thead>
                <tr>
                  <th scope="col">SLA</th>
                  <th scope="col">Ticket ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Assignee</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Category</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 10).map(t => (
                  <tr key={t.id} className="ticket-table__row">
                    <td><SLAIndicator deadline={t.slaDeadline} priority={t.priority} showPulse size="sm" /></td>
                    <td className="ticket-id">{t.id}</td>
                    <td className="ticket-title">{t.title}</td>
                    <td>{t.assigneeName || 'Unassigned'}</td>
                    <td><PriorityBadge priority={t.priority} size="sm" /></td>
                    <td><CategoryChip category={t.category} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-secondary">No active tickets at risk.</p>
        )}
      </div>
    </div>
  );
}
