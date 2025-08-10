# NewQuizApplication

A Spring Boot-based Quiz Application with JWT authentication and role-based access control.

## Features

- User registration and login (JWT-based)
- Admin registration (by existing admins)
- Quiz creation, deletion, and listing (admin only)
- Users can view quizzes, submit answers, and get results
- Question management by category and ID
- PostgreSQL database integration

## Technologies

- Java 21
- Spring Boot 3.5
- Spring Security (JWT)
- Spring Data JPA
- PostgreSQL
- Lombok

## Getting Started

### Prerequisites

- Java 21+
- Maven
- PostgreSQL

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/NewQuizApplication1.2.git
   cd NewQuizApplication
   ```

2. Configure your database in [`src/main/resources/application.properties`](src/main/resources/application.properties).

3. Build and run:
   ```sh
   ./mvnw spring-boot:run
   ```

### API Endpoints

#### Auth

- `POST /auth/register` — Register user
- `POST /auth/login` — Login and get JWT
- `POST /auth/admin/register` — Register admin (admin only)

#### Quiz

- `POST /admin/quiz/create` — Create quiz (admin)
- `DELETE /admin/quiz/delete/{id}` — Delete quiz (admin)
- `GET /admin/quiz/all` — List all quizzes (admin)
- `GET /user/quiz/get/{id}` — Get quiz questions (user)
- `POST /user/quiz/submit/{id}` — Submit quiz answers (user)

#### Question

- `POST /admin/question/addQuestions` — Add question (admin)
- `GET /admin/question/allQuestions` — List all questions (admin)
- `GET /admin/question/category/{category}` — Get questions by category (admin)
- `GET /admin/question/id/{id}` — Get question by ID (admin)

## License

This project is licensed
