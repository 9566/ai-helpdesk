package com.acme.helpdesk.kb;

import com.acme.helpdesk.ai.EmbeddingService;
import com.pgvector.PGvector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class KBService {

    @Autowired
    private KBDocumentRepository documentRepository;

    @Autowired
    private KBChunkRepository chunkRepository;

    @Autowired
    private EmbeddingService embeddingService;

    @Transactional
    public KBDocument processNewDocument(KBDocument doc) {
        doc.setStatus("Processing");
        doc = documentRepository.save(doc);

        try {
            // Simple chunking strategy: split by paragraphs, then ensure < 1000 chars per chunk
            List<String> chunks = chunkText(doc.getContent(), 1000, 200);
            
            for (int i = 0; i < chunks.size(); i++) {
                String text = chunks.get(i);
                PGvector embedding = embeddingService.embedText(text);
                
                KBChunk chunk = new KBChunk();
                chunk.setDocumentId(doc.getId());
                chunk.setChunkIndex(i);
                chunk.setContent(text);
                chunk.setEmbedding(embedding);
                chunkRepository.save(chunk);
            }

            doc.setStatus("Ready");
            doc.setChunkCount(chunks.size());
            doc.setFailureReason(null);
            
        } catch (Exception e) {
            doc.setStatus("Failed");
            doc.setFailureReason(e.getMessage());
        }

        return documentRepository.save(doc);
    }

    private List<String> chunkText(String text, int maxChunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) return chunks;

        // Extremely naive chunking for demonstration purposes
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + maxChunkSize, text.length());
            chunks.add(text.substring(start, end));
            start += maxChunkSize - overlap; // Move forward, but keep overlap
        }
        return chunks;
    }
}
