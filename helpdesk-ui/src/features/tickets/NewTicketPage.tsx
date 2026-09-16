import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { apiCreateTicket } from '../../lib/apiClient';
import {
  Button, Input, Textarea, Alert,
  PriorityBadge, CategoryChip
} from '../../components';
import './NewTicketPage.css';

export function NewTicketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Pre-fill from AI assistant handoff
  const prefillDescription = (location.state as any)?.prefillDescription ?? '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(prefillDescription);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [classified, setClassified] = useState<{ category: string; priority: string } | null>(null);
  const [aiDegraded, setAiDegraded] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => apiCreateTicket({
      title,
      description,
      employeeId: user!.id,
      employeeName: user!.name,
    }),
    onSuccess: ({ ticket, aiDegraded: degraded }) => {
      setAiDegraded(degraded);
      setClassified({ category: ticket.category, priority: ticket.priority });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      // Brief confirmation then redirect
      setTimeout(() => navigate(`/tickets/${ticket.id}`, { replace: true }), 2500);
    },
  });

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = 'Title is required — describe the issue briefly.';
    if (!description.trim()) e.description = 'Description is required — add more detail so we can help.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutate();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate('/my-tickets')}>
            <ArrowLeft size={16} /> My Tickets
          </button>
          <h1 className="page-title">New ticket</h1>
        </div>
      </div>

      <div className="new-ticket-form-wrap">
        {/* Classification success state */}
        {classified && (
          <Alert variant="info" title="Ticket submitted — AI has classified it">
            <div className="new-ticket-classified">
              <span>Category: <CategoryChip category={classified.category as any} size="sm" /></span>
              <span>Priority: <PriorityBadge priority={classified.priority as any} size="sm" /></span>
              <span>Redirecting to your ticket…</span>
              {aiDegraded && (
                <div className="new-ticket-classified__degraded">
                  Note: AI classification was unavailable — default values applied. An agent will review and re-triage shortly.
                </div>
              )}
            </div>
          </Alert>
        )}

        {!classified && (
          <form onSubmit={handleSubmit} noValidate className="new-ticket-form">
            <Input
              label="Title"
              required
              placeholder="Brief summary of the issue"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(ex => ({ ...ex, title: undefined })); }}
              error={errors.title}
              disabled={isPending}
            />

            <Textarea
              label="Description"
              required
              placeholder="Describe the issue in detail — steps to reproduce, error messages, what you've tried…"
              value={description}
              onChange={e => { setDescription(e.target.value); setErrors(ex => ({ ...ex, description: undefined })); }}
              error={errors.description}
              minRows={6}
              disabled={isPending}
            />

            <div className="new-ticket-form__attach">
              <Paperclip size={14} aria-hidden />
              <span>Attachments: optional — drag and drop or click to browse</span>
              <input type="file" className="new-ticket-form__file" aria-label="Attach a file (optional)" multiple />
            </div>

            {isPending && (
              <Alert variant="info">
                <strong>Classifying your ticket…</strong> Our AI is determining the category and priority. This takes a few seconds.
              </Alert>
            )}

            <div className="new-ticket-form__actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/my-tickets')}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isPending}
              >
                {isPending ? 'Classifying…' : 'Submit ticket'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
