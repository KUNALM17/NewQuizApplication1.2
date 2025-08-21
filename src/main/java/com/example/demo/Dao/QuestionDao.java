package com.example.demo.Dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.Model.Question;

@Repository
public interface QuestionDao extends JpaRepository<Question, Integer> {
	List<Question> findByCategory(String category);
	
	@Query(value = "SELECT * FROM question q WHERE q.category = ?1 ORDER BY RANDOM() LIMIT ?2", nativeQuery = true)
	List<Question> findRandomQuestionsByCategory(String category, int numQ);
	
	@Query(value = "SELECT DISTINCT category FROM question", nativeQuery = true)
	List<String> findDistinctCategories();

}
