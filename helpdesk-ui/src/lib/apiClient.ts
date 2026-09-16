// ============================================================
// API Client — Real REST Backend calls
// Connects to the Spring Boot backend at localhost:8080
// ============================================================

import type {
  Ticket, Comment, ActivityEvent, KBDocument,
  User, AgentWorkload, SLAMetrics, TicketFilters, ChatMessage
} from '../types';

const API_BASE = 'http://localhost:8080/api';

// Helper to get JWT
function getHeaders(): HeadersInit {
  const token = sessionStorage.getItem('hd_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `API Error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────
export async function apiLogin(email: string, password: string): Promise<User> {
  const data = await fetchApi<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  sessionStorage.setItem('hd_token', data.token);
  return data.user;
}

export function apiLogout() {
  sessionStorage.removeItem('hd_token');
}

// ── Tickets ───────────────────────────────────────────────────
export async function apiGetTickets(
  _userId: string,
  _role: string,
  filters?: TicketFilters
): Promise<Ticket[]> {
  const params = new URLSearchParams();
  if (filters?.status?.length) filters.status.forEach(s => params.append('status', s));
  if (filters?.priority?.length) filters.priority.forEach(p => params.append('priority', p));
  if (filters?.category?.length) filters.category.forEach(c => params.append('category', c));
  if (filters?.search) params.append('search', filters.search);

  const qs = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<Ticket[]>(`/tickets${qs}`);
}

export async function apiGetTicket(id: string): Promise<Ticket> {
  return fetchApi<Ticket>(`/tickets/${id}`);
}

export async function apiCreateTicket(data: {
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  attachments?: string[];
}): Promise<{ ticket: Ticket; aiDegraded: boolean }> {
  const ticket = await fetchApi<Ticket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return { ticket, aiDegraded: ticket.needsManualTriage };
}

export async function apiUpdateTicket(
  id: string,
  updates: Partial<Pick<Ticket, 'status' | 'priority' | 'category' | 'assigneeId' | 'assigneeName'>>,
  _userId: string,
  _userName: string
): Promise<Ticket> {
  return fetchApi<Ticket>(`/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

// ── Comments ──────────────────────────────────────────────────
export async function apiGetComments(ticketId: string, _includeInternal: boolean): Promise<Comment[]> {
  return fetchApi<Comment[]>(`/tickets/${ticketId}/comments`);
}

export async function apiAddComment(data: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
  return fetchApi<Comment>(`/tickets/${data.ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ── Activity ──────────────────────────────────────────────────
export async function apiGetActivity(ticketId: string): Promise<ActivityEvent[]> {
  return fetchApi<ActivityEvent[]>(`/tickets/${ticketId}/activity`);
}

// ── Knowledge Base ────────────────────────────────────────────
export async function apiGetKBDocs(): Promise<KBDocument[]> {
  return fetchApi<KBDocument[]>('/kb/documents');
}

export async function apiUploadKBDoc(file: File, _uploadedBy: string): Promise<KBDocument> {
  // Normally we'd use FormData to send file bytes. The backend takes a JSON for now
  // since we haven't wired up MultipartFile in KBController.
  // We'll read the file text and send it.
  const content = await file.text();
  
  return fetchApi<KBDocument>('/kb/documents', {
    method: 'POST',
    body: JSON.stringify({
      fileName: file.name,
      title: file.name.split('.')[0],
      content: content
    })
  });
}

export async function apiDeleteKBDoc(id: string): Promise<void> {
  await fetchApi<void>(`/kb/documents/${id}`, { method: 'DELETE' });
}

export async function apiRetryKBDoc(id: string): Promise<KBDocument> {
  return fetchApi<KBDocument>(`/kb/documents/${id}/retry`, { method: 'POST' });
}

// ── Users ─────────────────────────────────────────────────────
export async function apiGetUsers(): Promise<User[]> {
  return fetchApi<User[]>('/users');
}

export async function apiUpdateUser(id: string, updates: Partial<Pick<User, 'role' | 'status'>>): Promise<User> {
  return fetchApi<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

export async function apiInviteUser(data: Pick<User, 'name' | 'email' | 'role'>): Promise<User> {
  return fetchApi<User>('/users/invite', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ── SLA Metrics ───────────────────────────────────────────────
export async function apiGetSLAMetrics(): Promise<SLAMetrics> {
  return fetchApi<SLAMetrics>('/sla/metrics');
}

// ── Workload ──────────────────────────────────────────────────
export async function apiGetWorkload(): Promise<AgentWorkload[]> {
  return fetchApi<AgentWorkload[]>('/sla/workload');
}

// ── AI Assistant ──────────────────────────────────────────────
export async function apiAskAssistant(question: string): Promise<ChatMessage> {
  return fetchApi<ChatMessage>('/assistant/ask', {
    method: 'POST',
    body: JSON.stringify({ question })
  });
}

// ── Live KB docs getter (for polling) ────────────────────────
export function getLiveKBDocs(): KBDocument[] {
  // In a real app with fetching, polling is handled via react-query,
  // so this synchronous fallback isn't needed or should return cached data.
  // TanStack Query invalidateQueries is cleaner.
  return [];
}
