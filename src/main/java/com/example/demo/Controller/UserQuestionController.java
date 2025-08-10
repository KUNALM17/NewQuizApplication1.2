package com.example.demo.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Model.Question;
import com.example.demo.Service.QuestionService;

@RestController 
@RequestMapping("user/question")
public class UserQuestionController {
	@Autowired 
	QuestionService service;
	
	@GetMapping("/allQuestions")
	public ResponseEntity<List<Question>> getAllQuestions(){
		return service.getAllQuestions();
	}
	
	@GetMapping("/category/{category}")
	public List<Question> getByCategory(@PathVariable String category){
		return service.getByCategory(category);
	}
	
	@GetMapping("/id/{id}")
	public Optional<Question> getById(@PathVariable int id){
		return service.getById(id);
	}
}
