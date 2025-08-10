package com.example.demo.Dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.Model.Quiz;

@Repository
public interface QuizDao extends JpaRepository<Quiz,Integer> {

}
