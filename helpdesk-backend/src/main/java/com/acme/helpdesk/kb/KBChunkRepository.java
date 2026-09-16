package com.acme.helpdesk.kb;

import com.pgvector.PGvector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface KBChunkRepository extends JpaRepository<KBChunk, UUID> {
    
    void deleteByDocumentId(UUID documentId);

    @Query(value = "SELECT * FROM kb_chunks ORDER BY embedding <-> cast(:vector as vector) LIMIT :limit", nativeQuery = true)
    List<KBChunk> findSimilarChunks(@Param("vector") PGvector vector, @Param("limit") int limit);
}
