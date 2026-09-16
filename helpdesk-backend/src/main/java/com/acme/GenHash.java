package com.acme;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("password");
        System.out.println("Generated Hash: " + hash);
        System.out.println("Matches? " + encoder.matches("password", hash));
    }
}
