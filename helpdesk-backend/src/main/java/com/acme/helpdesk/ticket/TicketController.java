package com.acme.helpdesk.ticket;

import com.acme.helpdesk.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private TicketRepository ticketRepository;

    @GetMapping
    public List<Ticket> getTickets(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) List<String> priority,
            @RequestParam(required = false) List<String> category,
            @RequestParam(required = false) String search) {

        List<Ticket> tickets = ticketService.getTicketsForUser(user.getId(), user.getRole());

        // Apply filters
        if (status != null && !status.isEmpty()) {
            tickets = tickets.stream().filter(t -> status.contains(t.getStatus())).collect(Collectors.toList());
        }
        if (priority != null && !priority.isEmpty()) {
            tickets = tickets.stream().filter(t -> priority.contains(t.getPriority())).collect(Collectors.toList());
        }
        if (category != null && !category.isEmpty()) {
            tickets = tickets.stream().filter(t -> category.contains(t.getCategory())).collect(Collectors.toList());
        }
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            tickets = tickets.stream().filter(t -> 
                t.getTitle().toLowerCase().contains(q) || t.getId().toLowerCase().contains(q)
            ).collect(Collectors.toList());
        }

        // Sort by SLA
        tickets.sort((a, b) -> {
            if (a.isSlaBreached() != b.isSlaBreached()) return a.isSlaBreached() ? -1 : 1;
            return a.getSlaDeadline().compareTo(b.getSlaDeadline());
        });

        return tickets;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable String id) {
        return ticketRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket, @AuthenticationPrincipal User user) {
        ticket.setEmployeeId(user.getId());
        ticket.setEmployeeName(user.getName());
        return ticketService.createTicket(ticket);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable String id, @RequestBody Ticket updates) {
        return ticketRepository.findById(id).map(ticket -> {
            if (updates.getStatus() != null) ticket.setStatus(updates.getStatus());
            if (updates.getPriority() != null) ticket.setPriority(updates.getPriority());
            if (updates.getCategory() != null) ticket.setCategory(updates.getCategory());
            if (updates.getAssigneeId() != null) {
                ticket.setAssigneeId(updates.getAssigneeId());
                ticket.setAssigneeName(updates.getAssigneeName());
            }
            return ResponseEntity.ok(ticketRepository.save(ticket));
        }).orElse(ResponseEntity.notFound().build());
    }
}
