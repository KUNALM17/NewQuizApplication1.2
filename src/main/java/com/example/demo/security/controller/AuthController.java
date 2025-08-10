package com.example.demo.security.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.demo.security.repo.UserRepository;
import com.example.demo.security.repo.RoleRepository;
import com.example.demo.security.model.User;
import com.example.demo.security.model.Role;
import com.example.demo.security.jwt.JwtUtil;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.demo.security.service.CustomUserDetailsService;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private CustomUserDetailsService userDetailsService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            // Check if username already exists
            if(userRepository.findByUsername(req.username()).isPresent()) {
                return ResponseEntity.badRequest().body("username exists");
            }
            
            // Always create USER role (no admin registration allowed)
            Role r = roleRepository.findById("USER")
                .orElseGet(() -> roleRepository.save(new Role("USER")));
            
            // Create new user
            User u = new User();
            u.setUsername(req.username());
            u.setPassword(passwordEncoder.encode(req.password()));
            u.setEmail(req.email()); // Set email (can be null)
            u.setRoles(Set.of(r));
            
            // Save user
            userRepository.save(u);
            
            return ResponseEntity.ok("User registered successfully with USER role");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/admin/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegisterRequest req) {
        try {
            // Check if username already exists
            if(userRepository.findByUsername(req.username()).isPresent()) {
                return ResponseEntity.badRequest().body("username exists");
            }
            
            // Create role (USER or ADMIN)
            Role r = roleRepository.findById(req.role())
                .orElseGet(() -> roleRepository.save(new Role(req.role())));
            
            // Create new user
            User u = new User();
            u.setUsername(req.username());
            u.setPassword(passwordEncoder.encode(req.password()));
            u.setEmail(req.email());
            u.setRoles(Set.of(r));
            
            // Save user
            userRepository.save(u);
            
            return ResponseEntity.ok("User registered successfully with " + req.role() + " role");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        UserDetails ud = userDetailsService.loadUserByUsername(req.username());
        String jwt = jwtUtil.generateToken(ud);
        return ResponseEntity.ok(new AuthResponse(jwt));
    }

    // DTOs (create as static classes or separate files)
    public static record RegisterRequest(String username, String password, String email) {} // Removed role since only USER allowed
    public static record AdminRegisterRequest(String username, String password, String role, String email) {} // For admin use only
    public static record AuthRequest(String username, String password) {}
    public static record AuthResponse(String token) {}
}
