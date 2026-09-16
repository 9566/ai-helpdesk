package com.acme.helpdesk.sla;

import com.acme.helpdesk.ticket.ActivityEvent;
import com.acme.helpdesk.ticket.ActivityRepository;
import com.acme.helpdesk.ticket.Ticket;
import com.acme.helpdesk.ticket.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SLAScheduler {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void checkSlaBreaches() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find tickets that are open/in progress, past their deadline, and not yet marked as breached
        List<Ticket> allTickets = ticketRepository.findAll();
        
        for (Ticket t : allTickets) {
            if (("Open".equals(t.getStatus()) || "In Progress".equals(t.getStatus())) 
                && !t.isSlaBreached() 
                && t.getSlaDeadline().isBefore(now)) {
                
                t.setSlaBreached(true);
                ticketRepository.save(t);
                
                ActivityEvent event = new ActivityEvent();
                event.setTicketId(t.getId());
                event.setType("priority_change");
                event.setDescription("SLA Breached — automatically flagged by system");
                event.setUserName("System");
                activityRepository.save(event);
                
                System.out.println("SLA Breach detected for ticket: " + t.getId());
            }
        }
    }
}
