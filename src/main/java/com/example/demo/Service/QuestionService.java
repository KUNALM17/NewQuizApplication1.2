package com.example.demo.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.Dao.QuestionDao;
import com.example.demo.Model.Question;

@Service
public class QuestionService {
	@Autowired
	QuestionDao repo;

	public ResponseEntity< List<Question>> getAllQuestions() {
		try {
		return new ResponseEntity<>(repo.findAll(), HttpStatus.OK);
		}
		catch(Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity<>(new ArrayList<>(), HttpStatus.NOT_FOUND);
	}

	public List<Question> getByCategory(String category) {
		// TODO Auto-generated method stub
		return repo.findByCategory(category);
	}

	public ResponseEntity<String> addQuestion(Question question) {
		// TODO Auto-generated method stub
		try {
		 repo.save(question);
		 return new ResponseEntity<>("Question Added Successfully",HttpStatus.CREATED);
		}
		catch(Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity<>("Can't be CREATED",HttpStatus.FORBIDDEN);
	}

	public Optional<Question> getById(int id) {
		// TODO Auto-generated method stub
		return repo.findById(id);
	}
	

}
