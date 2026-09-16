package com.acme.helpdesk.auth;

import com.acme.helpdesk.user.User;
import com.acme.helpdesk.user.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if ("Disabled".equals(user.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Account is disabled"));
            }
            
            if (passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                String token = tokenProvider.generateToken(user.getId().toString(), user.getEmail(), user.getRole());
                return ResponseEntity.ok(new AuthResponse(token, user));
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Incorrect email or password"));
    }

    @Data
    public static class AuthRequest {
        private String email;
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private User user;

        public AuthResponse(String token, User user) {
            this.token = token;
            this.user = user;
            // Never send password hash back
            this.user.setPasswordHash(null);
        }
    }

    @Data
    public static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
    }
}
