package com.example.demo.Controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Model.QuestionWrapper;
import com.example.demo.Model.Quiz;
import com.example.demo.Model.Response;
import com.example.demo.Service.QuizService;

@RestController

public class QuizController {
	@Autowired
	QuizService quizService;
	@GetMapping("user/quiz/get/{id}")
	public ResponseEntity<List<QuestionWrapper>> getQuizQuestions (@PathVariable int id){
		return quizService.getQuizQuestions(id);
	}
	
	
	@PostMapping("admin/quiz/create")
	public ResponseEntity<String> createQuiz(@RequestParam String category,@RequestParam int numQ, @RequestParam String title ){
		return quizService.createQuize(category,numQ,title);
	}
	
	@PostMapping ("user/quiz/submit/{id}") 
	public ResponseEntity <Integer> submitQuiz(@PathVariable int id, @RequestBody List<Response> responses)  {
		return quizService.calculateResult(id, responses);
	}

	@DeleteMapping("admin/quiz/delete/{id}")
	public ResponseEntity<String> deleteQuiz(@PathVariable int id) {
		return quizService.deleteQuiz(id);
	}
	
	@DeleteMapping("admin/quiz/delete/all")
	public ResponseEntity<String> deleteAllQuizzes() {
		return quizService.deleteAllQuizzes();
	}
	
	@GetMapping("admin/quiz/all")
	public ResponseEntity<List<Quiz>> getAllQuizzes() {
		return quizService.getAllQuizzes();
	}

	
	
	

	
}
