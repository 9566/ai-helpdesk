package com.acme;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = "$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a";
        System.out.println("Matches? " + encoder.matches("password", hash));
        System.out.println("New hash: " + encoder.encode("password"));
    }
}
