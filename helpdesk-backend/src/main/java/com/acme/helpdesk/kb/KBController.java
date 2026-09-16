package com.acme.helpdesk.kb;

import com.acme.helpdesk.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/kb/documents")
public class KBController {

    @Autowired
    private KBDocumentRepository documentRepository;

    @Autowired
    private KBChunkRepository chunkRepository;

    @Autowired
    private KBService kbService;

    @GetMapping
    public List<KBDocument> getAllDocuments() {
        return documentRepository.findAll();
    }

    @PostMapping
    public KBDocument uploadDocument(@RequestBody KBDocument request, @AuthenticationPrincipal User user) {
        request.setUploadedBy(user.getId());
        return kbService.processNewDocument(request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable UUID id) {
        return documentRepository.findById(id).map(doc -> {
            chunkRepository.deleteByDocumentId(id); // Cascades in DB anyway, but good to be explicit
            documentRepository.delete(doc);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<KBDocument> retryDocument(@PathVariable UUID id) {
        return documentRepository.findById(id).map(doc -> {
            chunkRepository.deleteByDocumentId(id);
            return ResponseEntity.ok(kbService.processNewDocument(doc));
        }).orElse(ResponseEntity.notFound().build());
    }
}
