package com.acme.helpdesk.ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, String> {
    
    List<Ticket> findByEmployeeId(UUID employeeId);
    
    @Query("SELECT t FROM Ticket t WHERE t.assigneeId = :agentId OR t.status = 'Open'")
    List<Ticket> findForAgent(@Param("agentId") UUID agentId);
    
    @Query(value = "SELECT 'TKT-' || LPAD(CAST(COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 1000) + 1 AS VARCHAR), 4, '0') FROM tickets", nativeQuery = true)
    String getNextTicketId();
}
