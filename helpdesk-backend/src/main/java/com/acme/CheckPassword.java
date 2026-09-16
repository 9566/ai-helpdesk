package com.acme;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckPassword {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?prepareThreshold=0";
        String user = "postgres.nuibdcclkdqaavjafbvw";
        String pass = "Nithish123@#";
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT email, password_hash FROM users")) {
            
            while (rs.next()) {
                System.out.println(rs.getString("email") + " -> " + rs.getString("password_hash"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
