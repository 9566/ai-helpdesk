package com.acme.helpdesk.ticket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/activity")
public class ActivityController {

    @Autowired
    private ActivityRepository activityRepository;

    @GetMapping
    public List<ActivityEvent> getActivity(@PathVariable String ticketId) {
        return activityRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }
}
