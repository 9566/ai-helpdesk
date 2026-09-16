package com.acme.helpdesk.assistant;

import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    @Autowired
    private AssistantService assistantService;

    @PostMapping("/ask")
    public ChatMessage askQuestion(@RequestBody AskRequest request) {
        AssistantService.AssistantResponse aiResponse = assistantService.askAssistant(request.getQuestion());

        ChatMessage msg = new ChatMessage();
        msg.setId("m" + System.currentTimeMillis());
        msg.setRole("assistant");
        msg.setTimestamp(LocalDateTime.now().toString());
        msg.setContent(aiResponse.getAnswer());
        msg.setCitation(aiResponse.getCitation());
        msg.setNoMatch(aiResponse.isNoMatch());
        
        return msg;
    }

    @Data
    public static class AskRequest {
        private String question;
    }

    @Data
    public static class ChatMessage {
        private String id;
        private String role;
        private String content;
        private String citation;
        private String timestamp;
        private boolean noMatch;
    }
}
