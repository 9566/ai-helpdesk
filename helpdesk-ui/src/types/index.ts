// ============================================================
// Shared TypeScript types — AI-Powered Enterprise Helpdesk
// ============================================================

export type Role = 'employee' | 'agent' | 'manager' | 'admin';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type Category = 'Hardware' | 'Software' | 'Network' | 'Security' | 'General IT';

export const SLA_HOURS: Record<Priority, number> = {
  Critical: 4,
  High:     8,
  Medium:   24,
  Low:      48,
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Disabled';
  avatarInitials: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  employeeId: string;
  employeeName: string;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;      // ISO 8601
  updatedAt: string;
  slaDeadline: string;    // ISO 8601
  slaBreached: boolean;
  aiClassified: boolean;
  needsManualTriage: boolean;
  attachments?: string[];
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  isInternal: boolean;    // true = agent-only internal note
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  ticketId: string;
  type: 'status_change' | 'assignment' | 'priority_change' | 'category_change' | 'created';
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface KBDocument {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: 'Processing' | 'Ready' | 'Failed';
  chunkCount: number | null;
  failureReason?: string;
  uploadedBy: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citation?: string;        // source document name
  timestamp: string;
  noMatch?: boolean;        // assistant couldn't find relevant doc
}

export interface AgentWorkload {
  agentId: string;
  agentName: string;
  open: number;
  inProgress: number;
  breached: number;
  avgResolutionHours: number | null;
}

export interface SLAMetrics {
  onTimeCount: number;
  breachedCount: number;
  openCount: number;
  avgResolutionHours: number | null;
  onTimePct: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface TicketFilters {
  status?: TicketStatus[];
  priority?: Priority[];
  category?: Category[];
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
