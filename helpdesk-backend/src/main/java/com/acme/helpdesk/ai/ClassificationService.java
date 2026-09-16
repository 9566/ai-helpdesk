package com.acme.helpdesk.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClassificationService {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ObjectMapper objectMapper;

    public TriageResult classifyTicket(String title, String description) {
        String systemInstruction = """
            You are an IT Helpdesk AI Triage agent.
            Analyze the following IT support ticket and classify its category and priority.
            
            Categories must be strictly one of: Hardware, Software, Network, Security, General IT
            Priorities must be strictly one of: Critical, High, Medium, Low
            
            Guidelines:
            - Broken laptops or physical damage = Hardware / High or Critical
            - Phishing, lost phones, data breach = Security / Critical
            - Can't connect to VPN or Wi-Fi = Network / High
            - Need to install standard app = Software / Low
            - Access requests = Software / Medium
            
            Return ONLY a valid JSON object matching this schema:
            {
              "category": "String",
              "priority": "String",
              "confidence": 0.0 to 1.0
            }
            """;

        String prompt = "Title: " + title + "\nDescription: " + description;

        try {
            String jsonResponse = geminiService.generateContent(prompt, systemInstruction, true);
            JsonNode root = objectMapper.readTree(jsonResponse);
            
            TriageResult result = new TriageResult();
            result.setCategory(root.path("category").asText("General IT"));
            result.setPriority(root.path("priority").asText("Medium"));
            result.setConfidence(root.path("confidence").asDouble(0.5));
            return result;
            
        } catch (Exception e) {
            // Fallback if AI fails
            TriageResult fallback = new TriageResult();
            fallback.setCategory("General IT");
            fallback.setPriority("Medium");
            fallback.setConfidence(0.0);
            return fallback;
        }
    }

    public static class TriageResult {
        private String category;
        private String priority;
        private double confidence;

        // Getters and Setters
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
    }
}
