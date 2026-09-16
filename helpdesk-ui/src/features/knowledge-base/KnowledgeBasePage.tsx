import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { apiGetKBDocs, apiUploadKBDoc, apiDeleteKBDoc, apiRetryKBDoc } from '../../lib/apiClient';
import { Button, StatusBadge, SkeletonTable, Alert, Modal, Input } from '../../components';

export function KnowledgeBasePage() {
  const queryClient = useQueryClient();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');

  const { data: docs, isLoading, isError } = useQuery({
    queryKey: ['kb-docs'],
    queryFn: apiGetKBDocs,
    refetchInterval: 2000, // Poll frequently to see Processing -> Ready transitions
  });

  const uploadMutation = useMutation({
    mutationFn: (doc: { title: string; category: string; content: string }) => apiUploadKBDoc(doc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-docs'] });
      setUploadModalOpen(false);
      setUploadTitle('');
      setUploadCategory('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteKBDoc(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-docs'] }),
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => apiRetryKBDoc(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-docs'] }),
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;
    uploadMutation.mutate({
      title: uploadTitle,
      category: uploadCategory || 'General',
      content: 'Sample content',
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <span className="page-subtitle">Manage AI assistant grounding documents</span>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setUploadModalOpen(true)}
        >
          Upload Document
        </Button>
      </div>

      {isError && (
        <Alert variant="error" title="Error">Failed to load documents.</Alert>
      )}

      {isLoading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : docs && docs.length > 0 ? (
        <div className="ticket-table-wrap">
          <table className="ticket-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Category</th>
                <th scope="col">Status</th>
                <th scope="col">Last Updated</th>
                <th scope="col" style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} className="ticket-table__row">
                  <td className="ticket-title">{doc.title}</td>
                  <td>{doc.category}</td>
                  <td>
                    {doc.status === 'Ready' && <StatusBadge status="Resolved" size="sm" />}
                    {doc.status === 'Processing' && <StatusBadge status="In Progress" size="sm" />}
                    {doc.status === 'Failed' && <StatusBadge status="Closed" size="sm" />}
                  </td>
                  <td className="text-small text-secondary">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {doc.status === 'Failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<RefreshCw size={14} />}
                          onClick={() => retryMutation.mutate(doc.id)}
                          loading={retryMutation.isPending}
                          title="Retry processing"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={14} className="text-error" />}
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this document?')) {
                            deleteMutation.mutate(doc.id);
                          }
                        }}
                        loading={deleteMutation.isPending}
                        title="Delete document"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-secondary">No documents found. Upload a document to train the AI.</p>
      )}

      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Document"
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Document Title"
            value={uploadTitle}
            onChange={e => setUploadTitle(e.target.value)}
            required
            disabled={uploadMutation.isPending}
          />
          <Input
            label="Category"
            value={uploadCategory}
            onChange={e => setUploadCategory(e.target.value)}
            placeholder="e.g. IT Policies"
            disabled={uploadMutation.isPending}
          />
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setUploadModalOpen(false)} disabled={uploadMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={uploadMutation.isPending}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
