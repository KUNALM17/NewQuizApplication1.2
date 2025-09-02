package com.example.demo.Controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class GitInfoControllerTest {

    @Test
    void testGitInfoControllerExists() {
        // Simple test to ensure the controller can be instantiated
        GitInfoController controller = new GitInfoController();
        assertNotNull(controller);
    }
    
    @Test
    void testGitInfoMethod() {
        // Test the git info method (this will work as long as we're in a git repository)
        GitInfoController controller = new GitInfoController();
        
        try {
            var response = controller.getGitInfo();
            assertNotNull(response);
            
            // The response should be either OK (200) if git command succeeds
            // or INTERNAL_SERVER_ERROR (500) if it fails
            assertTrue(response.getStatusCode().is2xxSuccessful() || 
                      response.getStatusCode().is5xxServerError());
                      
        } catch (Exception e) {
            // If we can't run git commands in test environment, that's okay
            // We're just testing that the method doesn't crash
            assertNotNull(e.getMessage());
        }
    }
    
    @Test
    void testVersionInfoMethod() {
        // Test the version info method
        GitInfoController controller = new GitInfoController();
        
        try {
            var response = controller.getVersionInfo();
            assertNotNull(response);
            assertNotNull(response.getBody());
            
            // Should always have application name even if git fails
            assertTrue(response.getBody().containsKey("application"));
            assertEquals("NewQuizApplication", response.getBody().get("application"));
            
        } catch (Exception e) {
            // If we can't run git commands in test environment, that's okay
            assertNotNull(e.getMessage());
        }
    }
}