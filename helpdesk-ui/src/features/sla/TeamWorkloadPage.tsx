import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGetWorkload } from '../../lib/apiClient';
import { SkeletonTable, ProgressIndicator } from '../../components';

export function TeamWorkloadPage() {
  const { data: workload, isLoading } = useQuery({
    queryKey: ['workload'],
    queryFn: apiGetWorkload,
    refetchInterval: 30000,
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Workload</h1>
          <span className="page-subtitle">Agent capacity and active assignments</span>
        </div>
      </div>

      <div className="dashboard-section">
        {isLoading ? (
          <SkeletonTable rows={6} cols={4} />
        ) : workload && workload.length > 0 ? (
          <div className="ticket-table-wrap">
            <table className="ticket-table" aria-label="Team workload">
              <thead>
                <tr>
                  <th scope="col">Agent</th>
                  <th scope="col">Status</th>
                  <th scope="col">Active Tickets</th>
                  <th scope="col" style={{ width: '30%' }}>Capacity</th>
                </tr>
              </thead>
              <tbody>
                {workload.map(agent => {
                  const capacityPercent = Math.min(100, Math.round((agent.activeTickets / agent.maxCapacity) * 100));
                  return (
                    <tr key={agent.agentId} className="ticket-table__row">
                      <td style={{ fontWeight: 'var(--fw-medium)' }}>{agent.agentName}</td>
                      <td>
                        <span className={`status-dot status-dot--${agent.status}`} />
                        {agent.status}
                      </td>
                      <td>{agent.activeTickets} / {agent.maxCapacity}</td>
                      <td>
                        <ProgressIndicator value={capacityPercent} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-secondary">No active agents found.</p>
        )}
      </div>
    </div>
  );
}
