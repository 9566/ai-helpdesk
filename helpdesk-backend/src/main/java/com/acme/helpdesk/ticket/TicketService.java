package com.acme.helpdesk.ticket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    public List<Ticket> getTicketsForUser(UUID userId, String role) {
        if ("employee".equalsIgnoreCase(role)) {
            return ticketRepository.findByEmployeeId(userId);
        } else if ("agent".equalsIgnoreCase(role)) {
            return ticketRepository.findForAgent(userId);
        } else {
            return ticketRepository.findAll(); // manager, admin
        }
    }

    @Autowired
    private com.acme.helpdesk.ai.ClassificationService classificationService;

    public Ticket createTicket(Ticket ticket) {
        ticket.setId(ticketRepository.getNextTicketId());
        ticket.setStatus("Open");
        
        // Call AI Classification Service
        com.acme.helpdesk.ai.ClassificationService.TriageResult triage = classificationService.classifyTicket(ticket.getTitle(), ticket.getDescription());
        
        if (triage.getConfidence() >= 0.80) {
            ticket.setCategory(triage.getCategory());
            ticket.setPriority(triage.getPriority());
            ticket.setAiClassified(true);
            ticket.setNeedsManualTriage(false);
        } else {
            ticket.setCategory(triage.getCategory()); // Use best guess
            ticket.setPriority(triage.getPriority());
            ticket.setAiClassified(false);
            ticket.setNeedsManualTriage(true);
        }
        
        // SLA calculation
        int hours = switch (ticket.getPriority()) {
            case "Critical" -> 4;
            case "High" -> 8;
            case "Medium" -> 24;
            case "Low" -> 48;
            default -> 24;
        };
        ticket.setSlaDeadline(LocalDateTime.now().plusHours(hours));
        ticket.setSlaBreached(false);

        return ticketRepository.save(ticket);
    }
}
