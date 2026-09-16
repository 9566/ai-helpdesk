import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Ticket } from '../../types';
import { ArrowLeft, Send, Lock, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { apiGetTicket, apiGetComments, apiGetActivity, apiAddComment, apiUpdateTicket } from '../../lib/apiClient';
import {
  StatusBadge, PriorityBadge, CategoryChip, SLAIndicator,
  Tabs, Alert, Button, Textarea, Select, useToast
} from '../../components';
import type { TicketStatus, Priority, Category } from '../../types';
import './TicketDetailPage.css';

const STATUS_OPTIONS: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
const CATEGORY_OPTIONS: Category[] = ['Hardware', 'Software', 'Network', 'Security', 'General IT'];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const canEditTicket   = user?.role === 'agent' || user?.role === 'admin';
  const canSeeInternal  = user?.role === 'agent' || user?.role === 'manager' || user?.role === 'admin';
  const isReadOnly      = user?.role === 'manager';

  const [replyText, setReplyText] = useState('');
  const [internalText, setInternalText] = useState('');

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => apiGetTicket(id!),
    enabled: !!id,
    refetchInterval: 15000,
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', id, canSeeInternal],
    queryFn: () => apiGetComments(id!, canSeeInternal),
    enabled: !!id,
    refetchInterval: 10000,
  });

  const { data: activityLog } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => apiGetActivity(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Pick<Ticket, 'status' | 'priority' | 'category' | 'assigneeId' | 'assigneeName'>>) =>
      apiUpdateTicket(id!, updates, user!.id, user!.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      addToast('Ticket updated successfully');
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ content, isInternal }: { content: string; isInternal: boolean }) =>
      apiAddComment({
        ticketId: id!,
        authorId: user!.id,
        authorName: user!.name,
        authorRole: user!.role,
        content,
        isInternal,
      }),
    onSuccess: (_, { isInternal }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      if (isInternal) setInternalText('');
      else setReplyText('');
      addToast(isInternal ? 'Internal note added' : 'Reply posted');
    },
  });

  if (isLoading) {
    return (
      <div className="page">
        <div className="ticket-detail-skeleton">
          <div className="skeleton skeleton--title" />
          <div className="ticket-detail-layout">
            <div className="skeleton skeleton--panel" />
            <div className="skeleton skeleton--main" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="page">
        <Alert variant="error" title="Ticket not found">
          <span>This ticket doesn't exist or you don't have access to it. </span>
          <Link to={user?.role === 'employee' ? '/my-tickets' : '/queue'} className="inline-link">Go back</Link>
        </Alert>
      </div>
    );
  }

  // Employee can only see their own tickets
  if (user?.role === 'employee' && ticket.employeeId !== user.id) {
    return (
      <div className="page">
        <Alert variant="error" title="Access denied">
          You don't have access to this ticket. <Link to="/my-tickets" className="inline-link">View your tickets</Link>
        </Alert>
      </div>
    );
  }

  const conversationComments = (comments ?? []).filter(c => !c.isInternal);
  const internalComments     = (comments ?? []).filter(c => c.isInternal);

  const tabs = [
    {
      key: 'conversation',
      label: `Conversation (${conversationComments.length})`,
      content: (
        <div className="comment-thread">
          {conversationComments.length === 0 && (
            <p className="comment-thread__empty">No replies yet — be the first to comment.</p>
          )}
          {conversationComments.map(c => (
            <div key={c.id} className={`comment ${c.authorRole !== 'employee' ? 'comment--agent' : ''}`}>
              <div className="comment__header">
                <span className="comment__author">{c.authorName}</span>
                <span className="comment__role">{c.authorRole}</span>
                <span className="comment__time">{formatDateTime(c.createdAt)}</span>
              </div>
              <p className="comment__body">{c.content}</p>
            </div>
          ))}
          {/* Reply composer — available to all except read-only manager */}
          {!isReadOnly && (
            <div className="reply-composer">
              <Textarea
                placeholder="Add a reply visible to the employee…"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                minRows={3}
                disabled={commentMutation.isPending}
              />
              <div className="reply-composer__actions">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Send size={14} />}
                  loading={commentMutation.isPending}
                  disabled={!replyText.trim()}
                  onClick={() => commentMutation.mutate({ content: replyText, isInternal: false })}
                >
                  Send reply
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
    },
    ...(canSeeInternal ? [{
      key: 'internal',
      label: `Internal Notes (${internalComments.length})`,
      content: (
        <div className="comment-thread">
          <div className="comment-thread__internal-banner">
            <Lock size={13} /> Internal notes are only visible to agents and managers — not to the employee.
          </div>
          {internalComments.length === 0 && (
            <p className="comment-thread__empty">No internal notes yet.</p>
          )}
          {internalComments.map(c => (
            <div key={c.id} className="comment comment--internal">
              <div className="comment__header">
                <span className="comment__author">{c.authorName}</span>
                <Lock size={11} aria-label="Internal note" />
                <span className="comment__time">{formatDateTime(c.createdAt)}</span>
              </div>
              <p className="comment__body">{c.content}</p>
            </div>
          ))}
          {canEditTicket && (
            <div className="reply-composer reply-composer--internal">
              <Textarea
                placeholder="Add an internal note for your team…"
                value={internalText}
                onChange={e => setInternalText(e.target.value)}
                minRows={3}
                disabled={commentMutation.isPending}
              />
              <div className="reply-composer__actions">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Lock size={13} />}
                  loading={commentMutation.isPending}
                  disabled={!internalText.trim()}
                  onClick={() => commentMutation.mutate({ content: internalText, isInternal: true })}
                >
                  Add internal note
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
    }] : []),
    {
      key: 'activity',
      label: 'Activity Log',
      content: (
        <div className="activity-log">
          {(activityLog ?? []).map(ev => (
            <div key={ev.id} className="activity-event">
              <div className="activity-event__dot" />
              <div className="activity-event__body">
                <span>{ev.description}</span>
                <span className="activity-event__time">{formatDateTime(ev.createdAt)}</span>
              </div>
            </div>
          ))}
          {(!activityLog || activityLog.length === 0) && (
            <p className="comment-thread__empty">No activity recorded yet.</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      {/* Breadcrumb */}
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Page heading */}
      <div className="ticket-detail-heading">
        <div className="ticket-detail-heading__left">
          <span className="ticket-id">{ticket.id}</span>
          {ticket.needsManualTriage && (
            <span className="triage-flag">
              <AlertTriangle size={12} /> Needs manual triage
            </span>
          )}
        </div>
        <div className="ticket-detail-heading__badges">
          <StatusBadge status={ticket.status} />
          <SLAIndicator deadline={ticket.slaDeadline} priority={ticket.priority} size="md" />
        </div>
      </div>
      <h1 className="page-title">{ticket.title}</h1>

      {/* Two-column layout */}
      <div className="ticket-detail-layout">
        {/* Left: meta panel */}
        <aside className="ticket-meta-panel">
          <div className="ticket-meta-panel__section">
            <h3 className="ticket-meta-panel__label">Status</h3>
            {canEditTicket ? (
              <Select
                options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                value={ticket.status}
                onChange={e => updateMutation.mutate({ status: e.target.value as TicketStatus })}
                aria-label="Change status"
              />
            ) : (
              <StatusBadge status={ticket.status} />
            )}
          </div>

          <div className="ticket-meta-panel__section">
            <h3 className="ticket-meta-panel__label">Priority</h3>
            {canEditTicket ? (
              <Select
                options={PRIORITY_OPTIONS.map(p => ({ value: p, label: p }))}
                value={ticket.priority}
                onChange={e => updateMutation.mutate({ priority: e.target.value as Priority })}
                aria-label="Change priority"
              />
            ) : (
              <PriorityBadge priority={ticket.priority} />
            )}
          </div>

          <div className="ticket-meta-panel__section">
            <h3 className="ticket-meta-panel__label">Category</h3>
            {canEditTicket ? (
              <Select
                options={CATEGORY_OPTIONS.map(c => ({ value: c, label: c }))}
                value={ticket.category}
                onChange={e => updateMutation.mutate({ category: e.target.value as Category })}
                aria-label="Change category"
              />
            ) : (
              <CategoryChip category={ticket.category} />
            )}
          </div>

          <div className="ticket-meta-panel__section">
            <h3 className="ticket-meta-panel__label">SLA Deadline</h3>
            <SLAIndicator deadline={ticket.slaDeadline} priority={ticket.priority} />
          </div>

          <div className="ticket-meta-panel__section">
            <h3 className="ticket-meta-panel__label">Submitted by</h3>
            <span className="ticket-meta-panel__value">{ticket.employeeName}</span>
          </div>

          {ticket.assigneeName && (
            <div className="ticket-meta-panel__section">
              <h3 className="ticket-meta-panel__label">Assigned to</h3>
              <span className="ticket-meta-panel__value">{ticket.assigneeName}</span>
            </div>
          )}

          <div className="ticket-meta-panel__section">
            <h3 className="ticket-meta-panel__label">Opened</h3>
            <span className="ticket-meta-panel__value text-small">{formatDateTime(ticket.createdAt)}</span>
          </div>

          {ticket.aiClassified && (
            <div className="ticket-meta-panel__ai-badge">AI-classified</div>
          )}
        </aside>

        {/* Right: tabs */}
        <div className="ticket-detail-main">
          {/* Original description */}
          <div className="ticket-description">
            <h3 className="ticket-description__label">Description</h3>
            <p className="ticket-description__body">{ticket.description}</p>
          </div>

          <Tabs tabs={tabs} defaultTab="conversation" />
        </div>
      </div>
    </div>
  );
}
