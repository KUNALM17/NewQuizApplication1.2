package com.example.demo.security.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.security.model.Role;

public interface RoleRepository extends JpaRepository<Role, String> {}
