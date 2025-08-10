package com.example.demo.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.Dao.QuestionDao;
import com.example.demo.Dao.QuizDao;
import com.example.demo.Model.Question;
import com.example.demo.Model.QuestionWrapper;
import com.example.demo.Model.Quiz;
import com.example.demo.Model.Response;
@Service
public class QuizService {
	
	@Autowired
	QuizDao quizDao;
	@Autowired 
	QuestionDao repo;


	public ResponseEntity<String> createQuize(String category, int numQ, String title) {
	    try {
	        List<Question> questions = repo.findRandomQuestionsByCategory(category, numQ);

	        if (questions == null || questions.isEmpty()) {
	            return new ResponseEntity<>("❌ No questions found for category: " + category, HttpStatus.BAD_REQUEST);
	        }

	        Quiz quiz = new Quiz();
	        quiz.setTitle(title);
	        quiz.setQuestions(questions);

	        quizDao.save(quiz);

	        return new ResponseEntity<>("✅ Quiz created successfully", HttpStatus.CREATED);
	    } catch (Exception e) {
	        e.printStackTrace();  // 📌 This prints actual error in terminal
	        return new ResponseEntity<>("❌ Server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
	    }
	}
	public ResponseEntity<Integer> calculateResult(int id, List<Response> responses) {
		Quiz quiz = quizDao.findById(id).get();		
	    List<Question> questions = quiz.getQuestions();
	    int right = 0;
	    int i =0;
		for(Response response: responses) {
			if(response.getResponse().equals(questions.get(i).getRight_answer()))
				right++;
			 i++;
		
		}
		return new ResponseEntity<>(right, HttpStatus.OK);
	}


	public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(int id) {
		// TODO Auto-generated method stub
		Optional<Quiz> quiz = quizDao.findById(id);
		List<Question> questionFromDb = quiz.get().getQuestions();
		List<QuestionWrapper> questionForUser = new ArrayList<>();
		for(Question q: questionFromDb) {
			QuestionWrapper qw = new QuestionWrapper(q.getId(),q.getQuestion_title(),q.getOption1(),q.getOption2(),q.getOption3(),q.getOption4());
			questionForUser.add(qw);
		}
		return new ResponseEntity<>(questionForUser, HttpStatus.OK);
	}

	public ResponseEntity<String> deleteQuiz(int id) {
		try {
			Optional<Quiz> quiz = quizDao.findById(id);
			if (quiz.isPresent()) {
				quizDao.deleteById(id);
				return new ResponseEntity<>("✅ Quiz deleted successfully", HttpStatus.OK);
			} else {
				return new ResponseEntity<>("❌ Quiz not found with id: " + id, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("❌ Error deleting quiz: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ResponseEntity<String> deleteAllQuizzes() {
		try {
			long count = quizDao.count();
			if (count > 0) {
				quizDao.deleteAll();
				return new ResponseEntity<>("✅ All " + count + " quizzes deleted successfully", HttpStatus.OK);
			} else {
				return new ResponseEntity<>("ℹ️ No quizzes found to delete", HttpStatus.OK);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("❌ Error deleting all quizzes: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ResponseEntity<List<Quiz>> getAllQuizzes() {
		try {
			List<Quiz> quizzes = quizDao.findAll();
			if (quizzes.isEmpty()) {
				return new ResponseEntity<>(new ArrayList<>(), HttpStatus.OK);
			}
			return new ResponseEntity<>(quizzes, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
