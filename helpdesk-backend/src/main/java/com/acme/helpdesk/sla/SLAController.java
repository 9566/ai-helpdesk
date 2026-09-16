package com.acme.helpdesk.sla;

import com.acme.helpdesk.ticket.Ticket;
import com.acme.helpdesk.ticket.TicketRepository;
import com.acme.helpdesk.user.User;
import com.acme.helpdesk.user.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/sla")
public class SLAController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/metrics")
    public SLAMetrics getMetrics() {
        List<Ticket> all = ticketRepository.findAll();
        
        long resolvedCount = all.stream().filter(t -> "Resolved".equals(t.getStatus()) || "Closed".equals(t.getStatus())).count();
        long onTimeCount = all.stream().filter(t -> ("Resolved".equals(t.getStatus()) || "Closed".equals(t.getStatus())) && !t.isSlaBreached()).count();
        long breachedCount = all.stream().filter(Ticket::isSlaBreached).count();
        long openCount = all.stream().filter(t -> "Open".equals(t.getStatus()) || "In Progress".equals(t.getStatus())).count();
        
        int pct = resolvedCount > 0 ? (int) ((onTimeCount * 100) / resolvedCount) : 0;

        SLAMetrics metrics = new SLAMetrics();
        metrics.setOnTimeCount((int) onTimeCount);
        metrics.setBreachedCount((int) breachedCount);
        metrics.setOpenCount((int) openCount);
        metrics.setOnTimePct(pct);
        metrics.setAvgResolutionHours(6.4); // Mocked for now

        return metrics;
    }

    @GetMapping("/workload")
    public List<AgentWorkload> getWorkload() {
        List<User> agents = userRepository.findAll().stream().filter(u -> "agent".equals(u.getRole())).toList();
        List<Ticket> allTickets = ticketRepository.findAll();
        
        List<AgentWorkload> workloads = new ArrayList<>();
        
        for (User agent : agents) {
            long open = allTickets.stream().filter(t -> t.getAssigneeId() != null && t.getAssigneeId().equals(agent.getId()) && "Open".equals(t.getStatus())).count();
            long inProgress = allTickets.stream().filter(t -> t.getAssigneeId() != null && t.getAssigneeId().equals(agent.getId()) && "In Progress".equals(t.getStatus())).count();
            long breached = allTickets.stream().filter(t -> t.getAssigneeId() != null && t.getAssigneeId().equals(agent.getId()) && t.isSlaBreached() && !"Resolved".equals(t.getStatus()) && !"Closed".equals(t.getStatus())).count();
            
            AgentWorkload wl = new AgentWorkload();
            wl.setAgentId(agent.getId().toString());
            wl.setAgentName(agent.getName());
            wl.setOpen((int) open);
            wl.setInProgress((int) inProgress);
            wl.setBreached((int) breached);
            wl.setAvgResolutionHours(3.2); // mock
            
            workloads.add(wl);
        }
        
        return workloads;
    }

    @Data
    public static class SLAMetrics {
        private int onTimeCount;
        private int breachedCount;
        private int openCount;
        private double avgResolutionHours;
        private int onTimePct;
    }

    @Data
    public static class AgentWorkload {
        private String agentId;
        private String agentName;
        private int open;
        private int inProgress;
        private int breached;
        private double avgResolutionHours;
    }
}
