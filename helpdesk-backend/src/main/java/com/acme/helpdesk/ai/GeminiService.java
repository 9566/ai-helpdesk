package com.acme.helpdesk.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    @Value("${gemini.api.embedding-model}")
    private String embeddingModel;

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generateContent(String prompt, String systemInstruction, boolean jsonResponse) {
        try {
            String url = BASE_URL + model + ":generateContent?key=" + apiKey;
            
            String jsonFormat = jsonResponse ? ",\"responseMimeType\": \"application/json\"" : "";
            
            // Simplified JSON payload construction for Gemini API
            String requestBody = String.format("""
                {
                  "systemInstruction": {
                    "parts": [{"text": %s}]
                  },
                  "contents": [
                    {
                      "parts": [{"text": %s}]
                    }
                  ],
                  "generationConfig": {
                    "temperature": 0.2
                    %s
                  }
                }
                """, 
                objectMapper.writeValueAsString(systemInstruction),
                objectMapper.writeValueAsString(prompt),
                jsonFormat
            );

            String response = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
        } catch (Exception e) {
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage(), e);
        }
    }

    public List<Double> generateEmbedding(String text) {
        try {
            String url = BASE_URL + embeddingModel + ":embedContent?key=" + apiKey;
            
            String requestBody = String.format("""
                {
                  "model": "models/%s",
                  "content": {
                    "parts": [{"text": %s}]
                  }
                }
                """, 
                embeddingModel,
                objectMapper.writeValueAsString(text)
            );

            String response = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode valuesNode = root.path("embedding").path("values");
            
            List<Double> embedding = new java.util.ArrayList<>();
            for (JsonNode val : valuesNode) {
                embedding.add(val.asDouble());
            }
            return embedding;
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating embedding: " + e.getMessage(), e);
        }
    }
}
