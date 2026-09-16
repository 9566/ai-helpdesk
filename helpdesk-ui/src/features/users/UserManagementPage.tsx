import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Edit } from 'lucide-react';
import { apiGetUsers, apiInviteUser, apiUpdateUser } from '../../lib/apiClient';
import { Button, SkeletonTable, Alert, Modal, Input, Select } from '../../components';
import type { Role, User } from '../../types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'agent', label: 'Agent' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

export function UserManagementPage() {
  const queryClient = useQueryClient();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('employee');

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: apiGetUsers,
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; name: string; role: Role }) => apiInviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setInviteModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<User> }) => apiUpdateUser(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditModalOpen(false);
      setSelectedUser(null);
    },
  });

  const resetForm = () => {
    setEmail('');
    setName('');
    setRole('employee');
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    inviteMutation.mutate({ email, name, role });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateMutation.mutate({ id: selectedUser.id, updates: { role } });
  };

  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setRole(u.role);
    setEditModalOpen(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <span className="page-subtitle">Manage system access and roles</span>
        </div>
        <Button
          variant="primary"
          icon={<UserPlus size={16} />}
          onClick={() => { resetForm(); setInviteModalOpen(true); }}
        >
          Invite User
        </Button>
      </div>

      {isError && (
        <Alert variant="error" title="Error">Failed to load users.</Alert>
      )}

      {isLoading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : users && users.length > 0 ? (
        <div className="ticket-table-wrap">
          <table className="ticket-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Department</th>
                <th scope="col" style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="ticket-table__row">
                  <td style={{ fontWeight: 'var(--fw-medium)' }}>{u.name}</td>
                  <td className="text-secondary">{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td className="text-secondary">{u.department || '—'}</td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit size={14} />}
                      onClick={() => openEditModal(u)}
                      title="Edit role"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-secondary">No users found.</p>
      )}

      {/* Invite Modal */}
      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite User"
      >
        <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={inviteMutation.isPending}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={inviteMutation.isPending}
          />
          <Select
            label="Role"
            value={role}
            onChange={e => setRole(e.target.value as Role)}
            options={ROLE_OPTIONS}
            disabled={inviteMutation.isPending}
          />
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setInviteModalOpen(false)} disabled={inviteMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={inviteMutation.isPending}>
              Invite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit User Role"
      >
        {selectedUser && (
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0 }}>Changing role for <strong>{selectedUser.name}</strong> ({selectedUser.email}).</p>
            <Select
              label="Role"
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              options={ROLE_OPTIONS}
              disabled={updateMutation.isPending}
            />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
