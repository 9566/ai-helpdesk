-- Clear existing data if re-running
DELETE FROM activity_events;
DELETE FROM comments;
DELETE FROM kb_chunks;
DELETE FROM kb_documents;
DELETE FROM tickets;
DELETE FROM users;

-- Seed Users (Password is 'password' for all, hashed with BCrypt)
-- Hash for 'password': $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a

INSERT INTO users (id, name, email, password_hash, role, status, avatar_initials, department) VALUES
('a0000000-0000-0000-0000-000000000001', 'Alice Employee', 'alice@corp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'employee', 'Active', 'AE', 'Marketing'),
('c0000000-0000-0000-0000-000000000002', 'Carol Agent', 'carol@corp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'agent', 'Active', 'CA', 'IT Support'),
('f0000000-0000-0000-0000-000000000003', 'Frank Manager', 'frank@corp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'manager', 'Active', 'FM', 'IT Support'),
('e0000000-0000-0000-0000-000000000004', 'Grace Admin', 'grace@corp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'admin', 'Active', 'GA', 'System Admin');

-- Seed a sample ticket
INSERT INTO tickets (id, title, description, category, priority, status, employee_id, employee_name, sla_deadline, ai_classified, created_at, updated_at) VALUES
('TKT-1001', 'Cannot connect to VPN from home', 'I am trying to work remotely today but GlobalProtect hangs at Connecting...', 'Network', 'High', 'Open', 'a0000000-0000-0000-0000-000000000001', 'Alice Employee', NOW() + INTERVAL '8 HOURS', TRUE, NOW() - INTERVAL '1 HOUR', NOW() - INTERVAL '1 HOUR');

INSERT INTO activity_events (ticket_id, type, description, user_id, user_name, created_at) VALUES
('TKT-1001', 'created', 'Ticket submitted', 'a0000000-0000-0000-0000-000000000001', 'Alice Employee', NOW() - INTERVAL '1 HOUR');
