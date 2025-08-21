package com.example.demo.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Model.Question;
import com.example.demo.Service.QuestionService;

@RestController 
@RequestMapping("admin/question")
public class QuestionController {
	@Autowired 
	QuestionService service;
	@Autowired
	com.example.demo.Dao.QuestionDao questionDao;
	@GetMapping("/allQuestions")
	public ResponseEntity<List<Question>> getAllQuestions(){
		return service.getAllQuestions();
	}

	// Endpoint to get all distinct categories
	@GetMapping("/categories")
	public List<String> getCategories() {
		return service.getAllCategories();
	}
	
	@GetMapping("/category/{category}")
	public List<Question> getByCategory(@PathVariable String category){
		return service.getByCategory(category);
	}
	@GetMapping("/id/{id}")
	public Optional<Question> getById(@PathVariable int id){
		return service.getById(id);
	}
	@PostMapping("/addQuestions")
	public ResponseEntity<String> addQuestion (@RequestBody Question question){
		return service.addQuestion(question);
	}

	// Add these two endpoints to your QuestionController.java file

@DeleteMapping("/delete/{id}")
public ResponseEntity<String> deleteQuestion(@PathVariable int id) {
    return service.deleteQuestion(id);
}

@PutMapping("/update/{id}")
public ResponseEntity<String> updateQuestion(@PathVariable int id, @RequestBody Question question) {
    return service.updateQuestion(id, question);
}
}
