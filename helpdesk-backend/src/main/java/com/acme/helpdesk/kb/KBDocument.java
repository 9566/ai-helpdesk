package com.acme.helpdesk.kb;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "kb_documents")
@Data
public class KBDocument {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    private String title;
    private String category;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String status = "Processing";

    @Column(name = "chunk_count")
    private Integer chunkCount;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "uploaded_by")
    private UUID uploadedBy;

    @Column(name = "uploaded_at", insertable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
