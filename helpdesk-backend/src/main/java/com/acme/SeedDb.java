package com.acme;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class SeedDb {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?prepareThreshold=0";
        String user = "postgres.nuibdcclkdqaavjafbvw";
        String pass = "Nithish123@#";

        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Connected to DB. Running seed...");

            stmt.execute("DELETE FROM activity_events;");
            stmt.execute("DELETE FROM comments;");
            stmt.execute("DELETE FROM kb_chunks;");
            stmt.execute("DELETE FROM kb_documents;");
            stmt.execute("DELETE FROM tickets;");
            stmt.execute("DELETE FROM users;");

            String users = "INSERT INTO users (id, name, email, password_hash, role, status, avatar_initials, department) VALUES " +
                "('a0000000-0000-0000-0000-000000000001', 'Alice Employee', 'alice@corp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'employee', 'Active', 'AE', 'Marketing')," +
                "('c0000000-0000-0000-0000-000000000002', 'Carol Agent', 'carol@corp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'agent', 'Active', 'CA', 'IT Support')," +
                "('f0000000-0000-0000-0000-000000000003', 'Frank Manager', 'frank@corp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'manager', 'Active', 'FM', 'IT Support')," +
                "('e0000000-0000-0000-0000-000000000004', 'Grace Admin', 'grace@corp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'admin', 'Active', 'GA', 'System Admin');";
            stmt.execute(users);

            System.out.println("Users seeded successfully.");
            
            String ticket = "INSERT INTO tickets (id, title, description, category, priority, status, employee_id, employee_name, sla_deadline, ai_classified, created_at, updated_at) VALUES " +
                "('TKT-1001', 'Cannot connect to VPN from home', 'I am trying to work remotely today but GlobalProtect hangs at Connecting...', 'Network', 'High', 'Open', 'a0000000-0000-0000-0000-000000000001', 'Alice Employee', NOW() + INTERVAL '8 HOURS', TRUE, NOW() - INTERVAL '1 HOUR', NOW() - INTERVAL '1 HOUR');";
            stmt.execute(ticket);

            System.out.println("Ticket seeded successfully.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
