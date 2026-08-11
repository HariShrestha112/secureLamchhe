package com.example.backend;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class DataController {

    private static String sewingStatus = "processing";
    private static double sewingAmountDue = 1200.00;
    private static Map<String, Object> currentProfile = createDefaultProfile();

    private static Map<String, Object> createDefaultProfile() {
        Map<String, Object> profile = new HashMap<>();
        profile.put("username", "guest");
        profile.put("fullName", "Guest User");
        profile.put("email", "guest@example.com");
        profile.put("facebook", "https://www.facebook.com/guest");
        profile.put("address", "No address available");
        profile.put("contact", "N/A");
        profile.put("bio", "Backend profile is not yet loaded.");
        return profile;
    }

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
            currentProfile = profile;

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("profile", profile);
            System.out.println("User logged in: " + trimmedUsername);
        } else {
            response.put("success", false);
            response.put("message", "Username and password cannot be empty");
        }

        return response;
    }

    @GetMapping("/user-profile")
    public Map<String, Object> getUserProfile() {
        return currentProfile;
    }

    @GetMapping("/sewing-status")
    public Map<String, Object> getSewingStatus() {
        System.out.println("Fetching sewing status");
        return Map.of(
                "status", sewingStatus,
                "amountDue", sewingAmountDue
        );
    }

    @GetMapping("/processingDress")
    public Map<String, Object> getProcessingDress() {
        return Map.of(
                "dressName", "Summer Bridal Gown",
                "comment", "Cutting finished, ready for final stitching."
        );
    }

    @GetMapping("/getListofUnstichDress")
    public Map<String, Object> getListofUnstichDress() {
        return Map.of(
                "unstitchDresses", List.of(
                        Map.of("dressName", "Bridal Saree"),
                        Map.of("dressName", "Evening Gown"),
                        Map.of("dressName", "Summer Kurti")
                )
        );
    }

    @GetMapping("/completedDresses")
    public Map<String, Object> getCompletedDresses() {
        return Map.of(
                "dressName", "Completed Party Wear Dress"
        );
    }

    @PostMapping("/set-processing")
    public Map<String, Object> setProcessing(@RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String amountDueString = payload.get("amountDue");
        Map<String, Object> response = new HashMap<>();

        if (status != null) {
            String normalized = status.trim().toLowerCase();
            if (normalized.equals("about to process") || normalized.equals("processing") || normalized.equals("done")) {
                sewingStatus = normalized.equals("done") ? "done" : normalized.equals("processing") ? "processing" : "about to process";
            } else {
                response.put("success", false);
                response.put("message", "Invalid processing status");
                return response;
            }
        }

        if (amountDueString != null && !amountDueString.trim().isEmpty()) {
            try {
                sewingAmountDue = Double.parseDouble(amountDueString.trim());
            } catch (NumberFormatException e) {
                response.put("success", false);
                response.put("message", "Invalid amount due value");
                return response;
            }
        }

        response.put("success", true);
        response.put("status", sewingStatus);
        response.put("amountDue", sewingAmountDue);
        response.put("message", "Sewing processing settings updated");
        return response;
    }
}
