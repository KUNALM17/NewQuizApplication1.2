package com.example.demo.security.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.example.demo.security.model.Role;
import com.example.demo.security.repo.RoleRepository;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Only ensure required roles exist (no automatic user creation)
        initializeRoles();
    }
    
    private void initializeRoles() {
        // Create ADMIN role if not exists
        if (roleRepository.findById("ADMIN").isEmpty()) {
            roleRepository.save(new Role("ADMIN"));
            System.out.println("✅ ADMIN role created");
        }
        
        // Create USER role if not exists
        if (roleRepository.findById("USER").isEmpty()) {
            roleRepository.save(new Role("USER"));
            System.out.println("✅ USER role created");
        }
        
        System.out.println("🔧 Roles initialization complete - no automatic users created");
    }
}
