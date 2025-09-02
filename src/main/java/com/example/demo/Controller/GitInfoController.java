package com.example.demo.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/info")
public class GitInfoController {

    @GetMapping("/git")
    public ResponseEntity<Map<String, String>> getGitInfo() {
        try {
            // Execute git log -1 --pretty=%H%n%an%n%ae%n%ad command
            ProcessBuilder processBuilder = new ProcessBuilder("git", "log", "-1", "--pretty=%H%n%an%n%ae%n%ad");
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to execute git command"));
            }
            
            // Parse the output into structured format
            String[] lines = output.toString().trim().split("\n");
            Map<String, String> gitInfo = new HashMap<>();
            
            if (lines.length >= 4) {
                gitInfo.put("commitHash", lines[0]);
                gitInfo.put("authorName", lines[1]);
                gitInfo.put("authorEmail", lines[2]);
                gitInfo.put("authorDate", lines[3]);
            } else {
                gitInfo.put("error", "Unexpected git output format");
            }
            
            return ResponseEntity.ok(gitInfo);
            
        } catch (IOException | InterruptedException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve git information: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/version")
    public ResponseEntity<Map<String, String>> getVersionInfo() {
        try {
            // Get git info and also add application version
            Map<String, String> versionInfo = new HashMap<>();
            
            // Get git commit hash for version
            ProcessBuilder processBuilder = new ProcessBuilder("git", "log", "-1", "--pretty=%H");
            Process process = processBuilder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String commitHash = reader.readLine();
            
            if (commitHash != null && !commitHash.trim().isEmpty()) {
                versionInfo.put("version", commitHash.substring(0, Math.min(8, commitHash.length()))); // Short hash
                versionInfo.put("fullCommitHash", commitHash);
            } else {
                versionInfo.put("version", "unknown");
            }
            
            versionInfo.put("application", "NewQuizApplication");
            
            return ResponseEntity.ok(versionInfo);
            
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve version information: " + e.getMessage());
            errorResponse.put("version", "unknown");
            errorResponse.put("application", "NewQuizApplication");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}