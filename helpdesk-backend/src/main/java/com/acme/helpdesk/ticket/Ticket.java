package com.acme.helpdesk.ticket;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {

    @Id
    private String id; // Format: TKT-1234

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String priority;

    @Column(nullable = false)
    private String status = "Open";

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "assignee_id")
    private UUID assigneeId;

    @Column(name = "assignee_name")
    private String assigneeName;

    @Column(name = "sla_deadline", nullable = false)
    private LocalDateTime slaDeadline;

    @Column(name = "sla_breached")
    private boolean slaBreached = false;

    @Column(name = "ai_classified")
    private boolean aiClassified = false;

    @Column(name = "needs_manual_triage")
    private boolean needsManualTriage = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
