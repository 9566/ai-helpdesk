package com.acme;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class UpdatePassword {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?prepareThreshold=0";
        String user = "postgres.nuibdcclkdqaavjafbvw";
        String pass = "Nithish123@#";
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
            
            String hash = "$2a$10$CO9YPQV4rnJoT47ciVNkNe3QrtpoLS2auOefrs0QVsfb9eP3eCS5G";
            stmt.executeUpdate("UPDATE users SET password_hash = '" + hash + "'");
            System.out.println("Passwords updated!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
