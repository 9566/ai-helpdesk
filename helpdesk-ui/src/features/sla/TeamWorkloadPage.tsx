import { useQuery } from '@tanstack/react-query';
import { apiGetWorkload } from '../../lib/apiClient';
import { SkeletonTable } from '../../components';

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
          <SkeletonTable rows={6} cols={5} />
        ) : workload && workload.length > 0 ? (
          <div className="ticket-table-wrap">
            <table className="ticket-table" aria-label="Team workload">
              <thead>
                <tr>
                  <th scope="col">Agent</th>
                  <th scope="col">Open</th>
                  <th scope="col">In Progress</th>
                  <th scope="col">Breached</th>
                  <th scope="col">Avg Resolution</th>
                </tr>
              </thead>
              <tbody>
                {workload.map(agent => (
                  <tr key={agent.agentId} className="ticket-table__row">
                    <td style={{ fontWeight: 'var(--fw-medium)' }}>{agent.agentName}</td>
                    <td>{agent.open}</td>
                    <td>{agent.inProgress}</td>
                    <td>
                      <span className={agent.breached > 0 ? 'text-error' : ''} style={{ fontWeight: agent.breached > 0 ? 600 : 400 }}>
                        {agent.breached}
                      </span>
                    </td>
                    <td>
                      {agent.avgResolutionHours !== null ? `${agent.avgResolutionHours.toFixed(1)} hrs` : 'N/A'}
                    </td>
                  </tr>
                ))}
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
