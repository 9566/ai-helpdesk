// ============================================================
// Mock Data — rich, realistic data for all four roles
// ============================================================
import type {
  User, Ticket, Comment, ActivityEvent,
  KBDocument, AgentWorkload, ChatMessage
} from '../types';

// ── Users ────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson',   email: 'alice@corp.com',   role: 'employee', status: 'Active',   avatarInitials: 'AJ' },
  { id: 'u2', name: 'Bob Martinez',    email: 'bob@corp.com',     role: 'employee', status: 'Active',   avatarInitials: 'BM' },
  { id: 'u3', name: 'Carol Smith',     email: 'carol@corp.com',   role: 'agent',    status: 'Active',   avatarInitials: 'CS' },
  { id: 'u4', name: 'David Lee',       email: 'david@corp.com',   role: 'agent',    status: 'Active',   avatarInitials: 'DL' },
  { id: 'u5', name: 'Eva Nguyen',      email: 'eva@corp.com',     role: 'agent',    status: 'Active',   avatarInitials: 'EN' },
  { id: 'u6', name: 'Frank Wilson',    email: 'frank@corp.com',   role: 'manager',  status: 'Active',   avatarInitials: 'FW' },
  { id: 'u7', name: 'Grace Kim',       email: 'grace@corp.com',   role: 'admin',    status: 'Active',   avatarInitials: 'GK' },
  { id: 'u8', name: 'Henry Brown',     email: 'henry@corp.com',   role: 'employee', status: 'Disabled', avatarInitials: 'HB' },
];

// Test credentials:
// employee: alice@corp.com / password
// agent:    carol@corp.com / password
// manager:  frank@corp.com / password
// admin:    grace@corp.com / password

// ── Helper: compute SLA deadline from created + priority ─────
function slaDeadline(createdAt: string, hoursOffset: number): string {
  const d = new Date(createdAt);
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString();
}

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

function hoursFromNow(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

// ── Tickets ──────────────────────────────────────────────────
export const MOCK_TICKETS: Ticket[] = [
  // Alice's tickets (employee u1)
  {
    id: 'TKT-0042',
    title: 'Laptop won\'t connect to VPN after Windows update',
    description: 'After the latest Windows update yesterday, my laptop can no longer connect to the corporate VPN. I get error code 800. I\'ve tried restarting several times.',
    category: 'Network',
    priority: 'High',
    status: 'In Progress',
    employeeId: 'u1',
    employeeName: 'Alice Johnson',
    assigneeId: 'u3',
    assigneeName: 'Carol Smith',
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(2),
    slaDeadline: hoursFromNow(2),   // < 25% left → Warning
    slaBreached: false,
    aiClassified: true,
    needsManualTriage: false,
  },
  {
    id: 'TKT-0039',
    title: 'Adobe Acrobat license expired',
    description: 'Adobe Acrobat Pro is showing a license expired message. I need it for PDF editing today for the Q3 report.',
    category: 'Software',
    priority: 'Medium',
    status: 'Open',
    employeeId: 'u1',
    employeeName: 'Alice Johnson',
    assigneeId: null,
    assigneeName: null,
    createdAt: hoursAgo(10),
    updatedAt: hoursAgo(10),
    slaDeadline: hoursFromNow(14),
    slaBreached: false,
    aiClassified: true,
    needsManualTriage: false,
  },
  {
    id: 'TKT-0031',
    title: 'Second monitor not detected after desk move',
    description: 'After moving desks last week, my second monitor is no longer detected. The cable looks connected.',
    category: 'Hardware',
    priority: 'Low',
    status: 'Resolved',
    employeeId: 'u1',
    employeeName: 'Alice Johnson',
    assigneeId: 'u4',
    assigneeName: 'David Lee',
    createdAt: hoursAgo(72),
    updatedAt: hoursAgo(24),
    slaDeadline: slaDeadline(hoursAgo(72), 48),
    slaBreached: false,
    aiClassified: true,
    needsManualTriage: false,
  },
  // Bob's tickets (employee u2) — shown in agent queue
  {
    id: 'TKT-0043',
    title: 'Suspicious login alert on my account',
    description: 'I received an email saying there was a login to my account from an unknown location. I did not initiate this.',
    category: 'Security',
    priority: 'Critical',
    status: 'Open',
    employeeId: 'u2',
    employeeName: 'Bob Martinez',
    assigneeId: 'u3',
    assigneeName: 'Carol Smith',
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
    slaDeadline: hoursFromNow(3),
    slaBreached: false,
    aiClassified: true,
    needsManualTriage: false,
  },
  {
    id: 'TKT-0038',
    title: 'Printer on 3rd floor offline',
    description: 'The shared HP printer on the 3rd floor has been showing offline since this morning. Multiple users affected.',
    category: 'Hardware',
    priority: 'Medium',
    status: 'Open',
    employeeId: 'u2',
    employeeName: 'Bob Martinez',
    assigneeId: 'u4',
    assigneeName: 'David Lee',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    slaDeadline: hoursFromNow(19),
    slaBreached: false,
    aiClassified: true,
    needsManualTriage: false,
  },
  {
    id: 'TKT-0035',
    title: 'Outlook keeps crashing on startup',
    description: 'Outlook crashes immediately on launch every morning. I have to force-quit and try 3-4 times before it opens.',
    category: 'Software',
    priority: 'High',
    status: 'In Progress',
    employeeId: 'u2',
    employeeName: 'Bob Martinez',
    assigneeId: 'u5',
    assigneeName: 'Eva Nguyen',
    createdAt: hoursAgo(10),
    updatedAt: hoursAgo(3),
    slaDeadline: hoursAgo(2),    // BREACHED
    slaBreached: true,
    aiClassified: true,
    needsManualTriage: false,
  },
  {
    id: 'TKT-0029',
    title: 'Password reset not working',
    description: 'I followed the self-service password reset but the link in the email expired before I could click it.',
    category: 'General IT',
    priority: 'Medium',
    status: 'Resolved',
    employeeId: 'u2',
    employeeName: 'Bob Martinez',
    assigneeId: 'u3',
    assigneeName: 'Carol Smith',
    createdAt: hoursAgo(96),
    updatedAt: hoursAgo(84),
    slaDeadline: slaDeadline(hoursAgo(96), 24),
    slaBreached: false,
    aiClassified: true,
    needsManualTriage: false,
  },
  {
    id: 'TKT-0044',
    title: 'Wi-Fi dropping every 30 minutes in Meeting Room B',
    description: 'The Wi-Fi disconnects every 30 minutes in Meeting Room B. It has been disruptive for video calls.',
    category: 'Network',
    priority: 'High',
    status: 'Open',
    employeeId: 'u8',
    employeeName: 'Henry Brown',
    assigneeId: null,
    assigneeName: null,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
    slaDeadline: hoursFromNow(5),
    slaBreached: false,
    aiClassified: false,
    needsManualTriage: true,   // AI classification failed for this one
  },
];

// ── Comments ──────────────────────────────────────────────────
export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    ticketId: 'TKT-0042',
    authorId: 'u3',
    authorName: 'Carol Smith',
    authorRole: 'agent',
    content: 'Hi Alice, I\'ve started investigating this. Could you confirm which version of the VPN client you\'re using? You can find it in the VPN app → About.',
    isInternal: false,
    createdAt: hoursAgo(4),
  },
  {
    id: 'c2',
    ticketId: 'TKT-0042',
    authorId: 'u1',
    authorName: 'Alice Johnson',
    authorRole: 'employee',
    content: 'It shows version 5.0.04032. I also noticed the error appears right after the authentication step.',
    isInternal: false,
    createdAt: hoursAgo(3),
  },
  {
    id: 'c3',
    ticketId: 'TKT-0042',
    authorId: 'u3',
    authorName: 'Carol Smith',
    authorRole: 'agent',
    content: 'Internal note: This is the same issue as TKT-0040. Known regression from KB article KB-112. Patch available — will push silently.',
    isInternal: true,
    createdAt: hoursAgo(2),
  },
  {
    id: 'c4',
    ticketId: 'TKT-0042',
    authorId: 'u3',
    authorName: 'Carol Smith',
    authorRole: 'agent',
    content: 'Thanks Alice! I\'m pushing a silent patch fix now. You should see a VPN client update notification in the next few minutes. Please restart the VPN client after it updates.',
    isInternal: false,
    createdAt: hoursAgo(2),
  },
  {
    id: 'c5',
    ticketId: 'TKT-0043',
    authorId: 'u3',
    authorName: 'Carol Smith',
    authorRole: 'agent',
    content: 'Bob, I\'ve flagged this as Critical. Initiating account security review now. Please do NOT log in until we confirm it is safe — I\'ll update you within the hour.',
    isInternal: false,
    createdAt: hoursAgo(0.5),
  },
  {
    id: 'c6',
    ticketId: 'TKT-0043',
    authorId: 'u3',
    authorName: 'Carol Smith',
    authorRole: 'agent',
    content: 'Internal: Login origin: Eastern Europe IP. Likely credential stuffing. Forcing password reset and enabling MFA override. Escalate to security team if no resolution in 2h.',
    isInternal: true,
    createdAt: hoursAgo(0.4),
  },
];

// ── Activity Events ───────────────────────────────────────────
export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: 'a1', ticketId: 'TKT-0042', type: 'created',
    description: 'Ticket created by Alice Johnson',
    userId: 'u1', userName: 'Alice Johnson', createdAt: hoursAgo(6),
  },
  {
    id: 'a2', ticketId: 'TKT-0042', type: 'assignment',
    description: 'Assigned to Carol Smith',
    userId: 'u6', userName: 'System', createdAt: hoursAgo(6),
  },
  {
    id: 'a3', ticketId: 'TKT-0042', type: 'status_change',
    description: 'Status changed from Open to In Progress',
    userId: 'u3', userName: 'Carol Smith', createdAt: hoursAgo(4),
  },
];

// ── KB Documents ──────────────────────────────────────────────
export const MOCK_KB_DOCS: KBDocument[] = [
  { id: 'd1', fileName: 'IT_Policy_2026.pdf',           uploadedAt: hoursAgo(240), status: 'Ready',      chunkCount: 142, uploadedBy: 'Grace Kim' },
  { id: 'd2', fileName: 'VPN_Setup_Guide.pdf',          uploadedAt: hoursAgo(168), status: 'Ready',      chunkCount: 38,  uploadedBy: 'Grace Kim' },
  { id: 'd3', fileName: 'Hardware_Request_Process.pdf', uploadedAt: hoursAgo(120), status: 'Ready',      chunkCount: 25,  uploadedBy: 'Grace Kim' },
  { id: 'd4', fileName: 'Software_Approved_List.txt',   uploadedAt: hoursAgo(72),  status: 'Ready',      chunkCount: 17,  uploadedBy: 'Grace Kim' },
  { id: 'd5', fileName: 'Security_Incident_SOP.pdf',    uploadedAt: hoursAgo(12),  status: 'Processing', chunkCount: null, uploadedBy: 'Grace Kim' },
  { id: 'd6', fileName: 'corrupted_export.pdf',         uploadedAt: hoursAgo(6),   status: 'Failed',     chunkCount: null, failureReason: 'PDF appears corrupted or password-protected.', uploadedBy: 'Grace Kim' },
];

// ── Agent Workload ────────────────────────────────────────────
export const MOCK_WORKLOAD: AgentWorkload[] = [
  { agentId: 'u3', agentName: 'Carol Smith', open: 8,  inProgress: 5, breached: 2, avgResolutionHours: 5.2 },
  { agentId: 'u4', agentName: 'David Lee',   open: 4,  inProgress: 2, breached: 0, avgResolutionHours: 7.8 },
  { agentId: 'u5', agentName: 'Eva Nguyen',  open: 11, inProgress: 6, breached: 3, avgResolutionHours: 4.1 },
];

// ── Example chat messages for AI Assistant ────────────────────
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'user',
    content: 'How do I connect to the VPN from home?',
    timestamp: hoursAgo(0.1),
  },
  {
    id: 'm2',
    role: 'assistant',
    content: 'To connect to the corporate VPN from home:\n\n1. Download the GlobalProtect VPN client from the IT portal at it.corp.com/vpn\n2. Install and launch GlobalProtect\n3. Enter the gateway address: vpn.corp.com\n4. Use your corporate email and Active Directory password\n5. Complete the MFA prompt on your phone\n\nIf you encounter error code 800, ensure your system date/time is correct and try restarting the VPN client.',
    citation: 'VPN_Setup_Guide.pdf',
    timestamp: hoursAgo(0.09),
  },
];

// ── Sample starter prompts for empty AI assistant ─────────────
export const ASSISTANT_STARTER_PROMPTS = [
  'How do I connect to the VPN from home?',
  'What is the process for requesting new hardware?',
  'Which software am I allowed to install myself?',
  'How do I reset my Active Directory password?',
  'What is the security incident reporting procedure?',
];
