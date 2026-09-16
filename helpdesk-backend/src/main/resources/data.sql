-- Insert users, and UPDATE password hash if user already exists (fixes wrong hash from old seed)
INSERT INTO users (id, name, email, password_hash, role, status, avatar_initials, department)
VALUES
('a0000000-0000-0000-0000-000000000001', 'Alice Employee', 'alice@corp.com', '$2b$10$CO9YPQV4rnJoT47ciVNkNe3QrtpoLS2auOefrs0QVsfb9eP3eCS5G', 'employee', 'Active', 'AE', 'Marketing'),
('c0000000-0000-0000-0000-000000000002', 'Carol Agent',    'carol@corp.com', '$2b$10$CO9YPQV4rnJoT47ciVNkNe3QrtpoLS2auOefrs0QVsfb9eP3eCS5G', 'agent',    'Active', 'CA', 'IT Support'),
('f0000000-0000-0000-0000-000000000003', 'Frank Manager',  'frank@corp.com', '$2b$10$CO9YPQV4rnJoT47ciVNkNe3QrtpoLS2auOefrs0QVsfb9eP3eCS5G', 'manager',  'Active', 'FM', 'IT Support'),
('e0000000-0000-0000-0000-000000000004', 'Grace Admin',    'grace@corp.com', '$2b$10$CO9YPQV4rnJoT47ciVNkNe3QrtpoLS2auOefrs0QVsfb9eP3eCS5G', 'admin',    'Active', 'GA', 'System Admin')
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Seed a sample ticket (only if not already present)
INSERT INTO tickets (id, title, description, category, priority, status, employee_id, employee_name, sla_deadline, ai_classified, created_at, updated_at)
VALUES (
  'TKT-1001',
  'Cannot connect to VPN from home',
  'I am trying to work remotely today but GlobalProtect hangs at Connecting...',
  'Network', 'High', 'Open',
  'a0000000-0000-0000-0000-000000000001', 'Alice Employee',
  NOW() + INTERVAL '8 HOURS', TRUE, NOW() - INTERVAL '1 HOUR', NOW() - INTERVAL '1 HOUR'
) ON CONFLICT (id) DO NOTHING;
