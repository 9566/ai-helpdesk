package com.acme.helpdesk.assistant;

import com.acme.helpdesk.ai.EmbeddingService;
import com.acme.helpdesk.ai.GeminiService;
import com.acme.helpdesk.kb.KBChunk;
import com.acme.helpdesk.kb.KBChunkRepository;
import com.acme.helpdesk.kb.KBDocument;
import com.acme.helpdesk.kb.KBDocumentRepository;
import com.pgvector.PGvector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssistantService {

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private KBChunkRepository chunkRepository;

    @Autowired
    private KBDocumentRepository documentRepository;

    @Autowired
    private GeminiService geminiService;

    public AssistantResponse askAssistant(String question) {
        AssistantResponse response = new AssistantResponse();
        
        try {
            // 1. Embed user question
            PGvector questionVector = embeddingService.embedText(question);

            // 2. Search for top 3 similar chunks in the DB
            List<KBChunk> similarChunks = chunkRepository.findSimilarChunks(questionVector, 3);

            if (similarChunks.isEmpty()) {
                response.setNoMatch(true);
                return response;
            }

            // 3. Construct prompt with context
            String contextText = similarChunks.stream()
                    .map(KBChunk::getContent)
                    .collect(Collectors.joining("\n\n---\n\n"));

            String systemInstruction = """
                You are an IT Helpdesk Assistant. You must answer the user's question STRICTLY based on the provided context documents.
                If the answer cannot be found in the context, you must reply exactly with: "I don't know the answer to that based on the available documentation."
                Do not hallucinate. Provide clear, step-by-step instructions if available.
                """;

            String prompt = "Context Documents:\n" + contextText + "\n\nUser Question: " + question;

            // 4. Generate answer
            String answer = geminiService.generateContent(prompt, systemInstruction, false);

            if (answer.contains("I don't know the answer to that")) {
                response.setNoMatch(true);
                return response;
            }

            // 5. Get citation (just use the first chunk's document title/filename)
            KBDocument doc = documentRepository.findById(similarChunks.get(0).getDocumentId()).orElse(null);
            if (doc != null) {
                response.setCitation(doc.getTitle() != null ? doc.getTitle() : doc.getFileName());
            }

            response.setNoMatch(false);
            response.setAnswer(answer);

        } catch (Exception e) {
            response.setNoMatch(true);
        }

        return response;
    }

    public static class AssistantResponse {
        private String answer;
        private String citation;
        private boolean noMatch;

        // Getters and Setters
        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
        public String getCitation() { return citation; }
        public void setCitation(String citation) { this.citation = citation; }
        public boolean isNoMatch() { return noMatch; }
        public void setNoMatch(boolean noMatch) { this.noMatch = noMatch; }
    }
}
