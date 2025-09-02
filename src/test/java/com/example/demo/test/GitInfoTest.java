package com.example.demo.test;

import com.example.demo.Controller.GitInfoController;

import java.util.Map;

public class GitInfoTest {
    public static void main(String[] args) {
        System.out.println("Testing GitInfoController functionality...");
        
        GitInfoController controller = new GitInfoController();
        
        // Test git info endpoint
        try {
            var gitResponse = controller.getGitInfo();
            System.out.println("Git Info Response Status: " + gitResponse.getStatusCode());
            System.out.println("Git Info Response Body:");
            if (gitResponse.getBody() != null) {
                for (Map.Entry<String, String> entry : gitResponse.getBody().entrySet()) {
                    System.out.println("  " + entry.getKey() + ": " + entry.getValue());
                }
            }
        } catch (Exception e) {
            System.out.println("Error testing git info: " + e.getMessage());
        }
        
        System.out.println();
        
        // Test version info endpoint
        try {
            var versionResponse = controller.getVersionInfo();
            System.out.println("Version Info Response Status: " + versionResponse.getStatusCode());
            System.out.println("Version Info Response Body:");
            if (versionResponse.getBody() != null) {
                for (Map.Entry<String, String> entry : versionResponse.getBody().entrySet()) {
                    System.out.println("  " + entry.getKey() + ": " + entry.getValue());
                }
            }
        } catch (Exception e) {
            System.out.println("Error testing version info: " + e.getMessage());
        }
    }
}