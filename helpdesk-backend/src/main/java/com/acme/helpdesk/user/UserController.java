package com.acme.helpdesk.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody User updates) {
        return userRepository.findById(id).map(user -> {
            if (updates.getRole() != null) user.setRole(updates.getRole());
            if (updates.getStatus() != null) user.setStatus(updates.getStatus());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/invite")
    public User inviteUser(@RequestBody User invite) {
        invite.setPasswordHash(passwordEncoder.encode("password")); // Default temp password
        String initials = "";
        if (invite.getName() != null) {
            String[] parts = invite.getName().split(" ");
            for (String part : parts) {
                if (!part.isEmpty()) initials += part.charAt(0);
            }
        }
        invite.setAvatarInitials(initials.length() > 2 ? initials.substring(0, 2).toUpperCase() : initials.toUpperCase());
        invite.setStatus("Active");
        return userRepository.save(invite);
    }
}
