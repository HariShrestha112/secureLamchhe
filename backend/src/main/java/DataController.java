package com.example.backend;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class DataController {

    @PostMapping("/send-info")
    public Map<String, String> receiveInfo(@RequestBody Map<String, String> payload) {
        String message = payload.get("info");
        System.out.println("Received from Angular: " + message);

        return Map.of("status", "received", "echo", message);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        Map<String, Object> response = new HashMap<>();
        if (username != null && !username.trim().isEmpty() && password != null && !password.trim().isEmpty()) {
            String trimmedUsername = username.trim();
            Map<String, Object> profile = new HashMap<>();
            profile.put("username", trimmedUsername);
            profile.put("fullName", trimmedUsername);
            profile.put("email", trimmedUsername + "@example.com");
            profile.put("facebook", "https://www.facebook.com/" + trimmedUsername);
            profile.put("address", "123 Secure Street, Kathmandu, Nepal");
            profile.put("contact", "+977-1-2345678");
            profile.put("bio", "SecureLamchhe dashboard access.");

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("profile", profile);
        } else {
            response.put("success", false);
            response.put("message", "Username and password cannot be empty");
        }

        return response;
    }
}
