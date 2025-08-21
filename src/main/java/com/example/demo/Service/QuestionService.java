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
	com.example.demo.Dao.QuestionDao questionDao;

	public List<String> getAllCategories() {
		return questionDao.findDistinctCategories();
	}
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
		return repo.findByCategory(category);
	}

	public ResponseEntity<String> addQuestion(Question question) {
		
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
	
		return repo.findById(id);
	}

	//New features 

public ResponseEntity<String> deleteQuestion(int id) {
    try {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return new ResponseEntity<>("Question deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Question not found", HttpStatus.NOT_FOUND);
        }
    } catch (Exception e) {
        e.printStackTrace();
        return new ResponseEntity<>("Error deleting question", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

public ResponseEntity<String> updateQuestion(int id, Question question) {
    try {
        if (repo.existsById(id)) {
            // Ensure the ID from the path is set on the object before saving
            question.setId(id);
            repo.save(question);
            return new ResponseEntity<>("Question updated successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Question not found", HttpStatus.NOT_FOUND);
        }
    } catch (Exception e) {
        e.printStackTrace();
        return new ResponseEntity<>("Error updating question", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
	

}
