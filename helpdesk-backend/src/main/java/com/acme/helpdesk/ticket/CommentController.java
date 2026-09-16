package com.acme.helpdesk.ticket;

import com.acme.helpdesk.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public List<Comment> getComments(@PathVariable String ticketId, @AuthenticationPrincipal User user) {
        List<Comment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        if ("employee".equalsIgnoreCase(user.getRole())) {
            // Employees cannot see internal notes
            return comments.stream().filter(c -> !c.isInternal()).collect(Collectors.toList());
        }
        return comments;
    }

    @PostMapping
    public Comment addComment(@PathVariable String ticketId, @RequestBody Comment comment, @AuthenticationPrincipal User user) {
        comment.setTicketId(ticketId);
        comment.setAuthorId(user.getId());
        comment.setAuthorName(user.getName());
        comment.setAuthorRole(user.getRole());
        
        // Employees cannot make internal notes
        if ("employee".equalsIgnoreCase(user.getRole())) {
            comment.setInternal(false);
        }
        
        return commentRepository.save(comment);
    }
}
