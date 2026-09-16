package com.acme.helpdesk.ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<ActivityEvent, UUID> {
    List<ActivityEvent> findByTicketIdOrderByCreatedAtDesc(String ticketId);
}
