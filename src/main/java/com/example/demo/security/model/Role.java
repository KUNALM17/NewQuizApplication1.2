package com.example.demo.security.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Role {
    @Id
    @Column(name = "role_name")
    private String name;
}
