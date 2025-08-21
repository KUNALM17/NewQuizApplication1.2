import React, { useState, useEffect, useCallback } from 'react';

// --- Main App Component ---
export default function App() {
  // State Management
  const [page, setPage] = useState('login');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- API Configuration ---
  const API_BASE_URL = 'http://localhost:8080';

  // --- Helper Functions ---
  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  }, []);

  const parseJwt = (tkn) => {
    try {
      const base64Url = tkn.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  };

  const extractRoles = (decoded) => {
    if (!decoded) return [];
    if (Array.isArray(decoded.roles)) return decoded.roles;
    if (Array.isArray(decoded.authorities)) return decoded.authorities;
    if (typeof decoded.scope === 'string') return decoded.scope.split(' ');
    return [];
  };

  // --- MODIFIED FUNCTION ---
  // Centralized fetch with auth + error handling
  const apiFetch = useCallback(async (path, { method = 'GET', body, headers = {} } = {}) => {
    if (!path.startsWith('http')) path = `${API_BASE_URL}${path}`;
    const currentToken = localStorage.getItem('quiz_app_token'); // Always get the latest token
    const init = {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const res = await fetch(path, init);
    
    // First, get the raw text of the response body.
    const responseText = await res.text().catch(() => '');

    if (!res.ok) {
      // If the response is not OK, use the response text for a more detailed error.
      const errMsg = responseText || `Request failed (${res.status})`;
      throw new Error(errMsg);
    }
    
    // If the request was successful, but the response body is empty, return null.
    if (!responseText) {
      return null;
    }

    // Try to parse the response as JSON.
    try {
      return JSON.parse(responseText);
    } catch (e) {
      // If parsing fails, it means the backend sent a non-JSON success response (e.g., a simple string).
      // For the parts of this app that don't use the response body (like quiz creation), returning null is safe.
      console.warn("API response was not valid JSON:", responseText);
      return null;
    }
  }, []);
  // --- END OF MODIFICATION ---

  // --- Authentication ---
  useEffect(() => {
    const storedToken = localStorage.getItem('quiz_app_token');
    if (storedToken) {
      const decodedToken = parseJwt(storedToken);
      if (decodedToken?.exp && decodedToken.exp * 1000 <= Date.now()) {
        localStorage.removeItem('quiz_app_token');
        return;
      }
      setToken(storedToken);
      const roles = extractRoles(decodedToken);
      setUser({
        username: decodedToken?.sub || decodedToken?.username || 'user',
        roles,
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (user.roles.includes('ROLE_ADMIN')) setPage('admin_dashboard');
      else setPage('user_dashboard');
    } else {
      setPage('login');
    }
  }, [user]);

  const handleLogin = async (username, password) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      if (!data?.token) throw new Error('No token in login response.');

      localStorage.setItem('quiz_app_token', data.token);
      setToken(data.token);
      const decoded = parseJwt(data.token);
      const roles = extractRoles(decoded);
      setUser({ username: decoded?.sub || decoded?.username || username, roles, });
      showMessage('Login successful!', 'success');
    } catch (error) {
      showMessage(error.message || 'Login failed. Check credentials.', 'error');
    }
  };

  const handleRegister = async (username, password, email) => {
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: { username, password, email },
      });
      showMessage('Registration successful! Please log in.', 'success');
      setPage('login');
    } catch (error) {
      showMessage(error.message || 'Registration failed.', 'error');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('quiz_app_token');
    setPage('login');
    showMessage('You have been logged out.', 'success');
  };

  // --- Navigation ---
  const navigateTo = (newPage) => setPage(newPage);
  const startQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setPage('quiz');
  };
  const editQuestion = (question) => {
    setSelectedQuestion(question);
    setPage('update_question');
  };

  // --- Component Rendering Logic ---
  const renderPage = () => {
    switch (page) {
      case 'register':
        return <Register onRegister={handleRegister} navigateTo={navigateTo} />;
      case 'user_dashboard':
        return <UserDashboard startQuiz={startQuiz} apiFetch={apiFetch} showMessage={showMessage} />;
      case 'admin_dashboard':
        return <AdminDashboard navigateTo={navigateTo} />;
      case 'create_admin':
        return <CreateAdminUser navigateTo={navigateTo} apiFetch={apiFetch} showMessage={showMessage} />;
      case 'manage_quizzes':
        return <ManageQuizzes navigateTo={navigateTo} apiFetch={apiFetch} showMessage={showMessage} />;
      case 'manage_questions':
        return <ManageQuestions navigateTo={navigateTo} editQuestion={editQuestion} apiFetch={apiFetch} showMessage={showMessage} />;
      case 'quiz':
        return <Quiz quizId={selectedQuizId} navigateTo={navigateTo} apiFetch={apiFetch} showMessage={showMessage} />;
      case 'add_question':
        return <AddQuestion navigateTo={navigateTo} apiFetch={apiFetch} showMessage={showMessage} />;
      case 'update_question':
        return <UpdateQuestion question={selectedQuestion} navigateTo={navigateTo} apiFetch={apiFetch} showMessage={showMessage} />;
      case 'create_quiz':
        return <CreateQuiz navigateTo={navigateTo} apiFetch={apiFetch} showMessage={showMessage} />;
      case 'login':
      default:
        return <Login onLogin={handleLogin} navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-indigo-600"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v9l-4-4h-2a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2Z" /></svg>
            QuizMaster Pro
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, <span className="font-semibold text-indigo-600">{user.username}</span></span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Logout</button>
            </div>
          )}
        </nav>
      </header>
      <main className="container mx-auto p-6">
        {message.text && <Message text={message.text} type={message.type} />}
        {renderPage()}
      </main>
    </div>
  );
}

// --- Reusable UI Components ---
const Card = ({ children, className = '' }) => <div className={`bg-white rounded-xl shadow-lg p-6 md:p-8 ${className}`}>{children}</div>;
const Button = ({ children, onClick, className = '', type = 'button', disabled = false }) => <button type={type} onClick={onClick} disabled={disabled} className={`w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>{children}</button>;
const Input = ({ id, type = 'text', placeholder, value, onChange, required = false }) => <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />;
const Select = ({ id, value, onChange, children, required = false, className = '' }) => <select id={id} value={value} onChange={onChange} required={required} className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${className}`}>{children}</select>;
const Message = ({ text, type }) => <div className={`p-4 rounded-lg mb-6 text-center ${type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}><p className="font-bold">{type === 'success' ? 'Success' : 'Error'}</p><p>{text}</p></div>;
const Spinner = () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div></div>;

// --- Authentication Pages ---
function Login({ onLogin, navigateTo }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label htmlFor="username">Username</label><Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
          <div><label htmlFor="password">Password</label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <Button type="submit">Login</Button>
        </form>
        <p className="text-center mt-6">Don't have an account? <button onClick={() => navigateTo('register')} className="font-semibold text-indigo-600 hover:text-indigo-500">Register</button></p>
      </Card>
    </div>
  );
}

function Register({ onRegister, navigateTo }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(username, password, email);
  };
  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label htmlFor="username-reg">Username</label><Input id="username-reg" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
          <div><label htmlFor="email-reg">Email (Optional)</label><Input id="email-reg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label htmlFor="password-reg">Password</label><Input id="password-reg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <Button type="submit">Register</Button>
        </form>
        <p className="text-center mt-6">Already have an account? <button onClick={() => navigateTo('login')} className="font-semibold text-indigo-600 hover:text-indigo-500">Login</button></p>
      </Card>
    </div>
  );
}

// --- User Pages ---
function UserDashboard({ startQuiz, apiFetch, showMessage }) {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await apiFetch('/user/quiz/all');
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (error) {
        showMessage(error.message || 'Failed to fetch quizzes.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes();
  }, [apiFetch, showMessage]);

  if (isLoading) return <Spinner />;

  return (
    <Card>
      <h2 className="text-3xl font-bold mb-6">Available Quizzes</h2>
      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-gray-50 p-6 rounded-lg border flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold">{quiz.title}</h3>
                <p className="text-gray-500 mt-2">{Array.isArray(quiz.questions) ? quiz.questions.length : 0} Questions</p>
              </div>
              <button onClick={() => startQuiz(quiz.id)} className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Start Quiz</button>
            </div>
          ))}
        </div>
      ) : <p className="text-center text-gray-500">No quizzes available.</p>}
    </Card>
  );
}

function Quiz({ quizId, navigateTo, apiFetch, showMessage }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!quizId) return;
      try {
        const data = await apiFetch(`/user/quiz/get/${quizId}`);
        setQuestions(Array.isArray(data) ? data : []);
      } catch (error) {
        showMessage(error.message || 'Failed to load quiz questions.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId, apiFetch, showMessage]);

  const handleSelect = (qId, option) => setAnswers((prev) => ({ ...prev, [qId]: option }));

  const handleSubmit = async () => {
    const responses = questions.map((q) => ({ id: q.id, response: answers[q.id] || '' }));
    try {
      const data = await apiFetch(`/user/quiz/submit/${quizId}`, { method: 'POST', body: responses });
      const score = typeof data === 'number' ? data : data?.score;
      setResult(score ?? 0);
      showMessage('Quiz submitted!', 'success');
    } catch (error) {
      showMessage(error.message || 'Failed to submit quiz.', 'error');
    }
  };

  if (isLoading) return <Spinner />;
  if (result !== null) {
    return (
      <Card className="text-center">
        <h2 className="text-3xl font-bold">Quiz Complete!</h2>
        <p className="text-xl my-4">Your score is:</p>
        <p className="text-6xl font-bold text-indigo-600">{result} / {questions.length}</p>
        <Button onClick={() => navigateTo('user_dashboard')} className="mt-8">Back to Dashboard</Button>
      </Card>
    );
  }
  const q = questions[currentIndex];
  if (!q) return <p>No questions found.</p>;
  const options = [q.option1, q.option2, q.option3, q.option4].filter(Boolean);

  return (
    <Card>
      <p className="text-sm text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
      <h2 className="text-2xl font-semibold mt-2">{q.question_title}</h2>
      <div className="space-y-4 mt-6">
        {options.map((opt, i) => <button key={i} onClick={() => handleSelect(q.id, opt)} className={`w-full text-left p-4 rounded-lg border-2 ${answers[q.id] === opt ? 'bg-indigo-100 border-indigo-500' : 'bg-white hover:border-indigo-400'}`}>{opt}</button>)}
      </div>
      <div className="mt-8 flex justify-between">
        <Button onClick={() => setCurrentIndex((i) => i - 1)} disabled={currentIndex === 0} className="w-auto bg-gray-300 text-gray-700 hover:bg-gray-400">Previous</Button>
        {currentIndex === questions.length - 1 ? <Button onClick={handleSubmit} className="w-auto bg-green-500 hover:bg-green-600">Submit</Button> : <Button onClick={() => setCurrentIndex((i) => i + 1)} className="w-auto">Next</Button>}
      </div>
    </Card>
  );
}

// --- Admin Pages ---
function AdminDashboard({ navigateTo }) {
  return (
    <Card>
      <h2 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div onClick={() => navigateTo('manage_quizzes')} className="p-8 bg-blue-500 text-white rounded-lg text-center cursor-pointer hover:bg-blue-600 transition-colors">
          <h3 className="text-2xl font-bold">Manage Quizzes</h3>
          <p className="mt-2">View, create, and delete quizzes.</p>
        </div>
        <div onClick={() => navigateTo('manage_questions')} className="p-8 bg-green-500 text-white rounded-lg text-center cursor-pointer hover:bg-green-600 transition-colors">
          <h3 className="text-2xl font-bold">Manage Questions</h3>
          <p className="mt-2">View, create, update, and delete questions.</p>
        </div>
        <div onClick={() => navigateTo('create_admin')} className="p-8 bg-purple-500 text-white rounded-lg text-center cursor-pointer hover:bg-purple-600 transition-colors">
            <h3 className="text-2xl font-bold">Create User</h3>
            <p className="mt-2">Register a new user with a specific role.</p>
        </div>
      </div>
    </Card>
  );
}

function CreateAdminUser({ navigateTo, apiFetch, showMessage }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('ADMIN');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiFetch('/auth/admin/register', {
                method: 'POST',
                body: { username, password, email, role },
            });
            showMessage(`User '${username}' registered successfully with role ${role}!`, 'success');
            navigateTo('admin_dashboard');
        } catch (error) {
            showMessage(error.message || 'Registration failed.', 'error');
        }
    };

    return (
        <Card>
            <h2 className="text-3xl font-bold text-center mb-6">Create New User</h2>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                <div>
                    <label htmlFor="username-admin-reg" className="block text-sm font-medium text-gray-700">Username</label>
                    <Input id="username-admin-reg" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="email-admin-reg" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                    <Input id="email-admin-reg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="password-admin-reg" className="block text-sm font-medium text-gray-700">Password</label>
                    <Input id="password-admin-reg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="role-select" className="block text-sm font-medium text-gray-700">Role</label>
                     <Select id="role-select" value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                    </Select>
                </div>
                <div className="flex space-x-4 pt-4">
                    <Button type="button" onClick={() => navigateTo('admin_dashboard')} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
                    <Button type="submit">Create User</Button>
                </div>
            </form>
        </Card>
    );
}

function ManageQuizzes({ navigateTo, apiFetch, showMessage }) {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/user/quiz/all');
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch quizzes', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, showMessage]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const deleteQuiz = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await apiFetch(`/admin/quiz/delete/${id}`, { method: 'DELETE' });
        showMessage('Quiz deleted successfully.', 'success');
        fetchQuizzes();
      } catch (error) {
        showMessage(error.message || 'Failed to delete quiz.', 'error');
      }
    }
  };

  if (isLoading) return <Spinner />;
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Quizzes ({quizzes.length})</h2>
        <div className="flex space-x-4">
          <Button onClick={() => navigateTo('create_quiz')} className="w-auto bg-green-500 hover:bg-green-600">Create Quiz</Button>
          <Button onClick={() => navigateTo('admin_dashboard')} className="w-auto bg-gray-500 hover:bg-gray-600">Back</Button>
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border">
              <div><p className="font-semibold">{quiz.title}</p><p className="text-sm text-gray-500">{Array.isArray(quiz.questions) ? quiz.questions.length : 0} questions</p></div>
              <button onClick={() => deleteQuiz(quiz.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Delete</button>
            </div>
          ))
        ) : <p className="text-gray-500">No quizzes created yet.</p>}
      </div>
    </Card>
  );
}

function ManageQuestions({ navigateTo, editQuestion, apiFetch, showMessage }) {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [qs, cats] = await Promise.all([
        apiFetch('/admin/question/allQuestions'),
        apiFetch('/admin/question/categories'),
      ]);
      setQuestions(Array.isArray(qs) ? qs : []);
      setCategories(['All', ...(Array.isArray(cats) ? cats : [])]);
    } catch (error) {
      showMessage(error.message || 'Failed to fetch data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, showMessage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await apiFetch(`/admin/question/delete/${id}`, { method: 'DELETE' });
        showMessage('Question deleted successfully.', 'success');
        fetchData();
      } catch (error) {
        showMessage(error.message || 'Failed to delete question.', 'error');
      }
    }
  };

  const filteredQuestions = filter === 'All' ? questions : questions.filter((q) => q.category === filter);

  if (isLoading) return <Spinner />;
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Questions ({filteredQuestions.length})</h2>
        <div className="flex space-x-4">
          <Button onClick={() => navigateTo('add_question')} className="w-auto bg-blue-500 hover:bg-blue-600">Add Question</Button>
          <Button onClick={() => navigateTo('admin_dashboard')} className="w-auto bg-gray-500 hover:bg-gray-600">Back</Button>
        </div>
      </div>
      <div className="flex justify-end items-center mb-4">
        <label htmlFor="category-filter" className="mr-2">Filter by Category:</label>
        <Select id="category-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-48">
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </Select>
      </div>
      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <div key={q.id} className="bg-gray-50 p-3 rounded-lg border">
              <p className="font-semibold">{q.question_title}</p>
              <p className="text-sm text-gray-500">Category: {q.category}</p>
              <div className="mt-2 flex space-x-2">
                <button onClick={() => editQuestion(q)} className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600">Update</button>
                <button onClick={() => deleteQuestion(q.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))
        ) : <p className="text-gray-500">No questions found for this category.</p>}
      </div>
    </Card>
  );
}

function AddQuestion({ navigateTo, apiFetch, showMessage }) {
  const [formData, setFormData] = useState({ question_title: '', option1: '', option2: '', option3: '', option4: '', right_answer: '', difficultylevel: '', category: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/question/addQuestions', { method: 'POST', body: formData });
      showMessage('Question added!', 'success');
      navigateTo('manage_questions');
    } catch (error) {
      showMessage(error.message || 'Failed to add question.', 'error');
    }
  };
  return (
    <Card>
      <h2 className="text-3xl font-bold mb-6">Add New Question</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="question_title" placeholder="Question Title" value={formData.question_title} onChange={handleChange} required />
        <Input id="option1" placeholder="Option 1" value={formData.option1} onChange={handleChange} required />
        <Input id="option2" placeholder="Option 2" value={formData.option2} onChange={handleChange} required />
        <Input id="option3" placeholder="Option 3" value={formData.option3} onChange={handleChange} required />
        <Input id="option4" placeholder="Option 4" value={formData.option4} onChange={handleChange} required />
        <Input id="right_answer" placeholder="Right Answer" value={formData.right_answer} onChange={handleChange} required />
        <Input id="difficultylevel" placeholder="Difficulty Level" value={formData.difficultylevel} onChange={handleChange} required />
        <Input id="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
        <div className="flex space-x-4 pt-4">
          <Button type="button" onClick={() => navigateTo('manage_questions')} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
          <Button type="submit">Add Question</Button>
        </div>
      </form>
    </Card>
  );
}

function UpdateQuestion({ question, navigateTo, apiFetch, showMessage }) {
  const [formData, setFormData] = useState(question || {});
  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/admin/question/update/${question.id}`, { method: 'PUT', body: formData });
      showMessage('Question updated!', 'success');
      navigateTo('manage_questions');
    } catch (error) {
      showMessage(error.message || 'Failed to update question.', 'error');
    }
  };

  if (!question) return <Card>No question selected.</Card>;
  return (
    <Card>
      <h2 className="text-3xl font-bold mb-6">Update Question</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="question_title" placeholder="Question Title" value={formData.question_title || ''} onChange={handleChange} required />
        <Input id="option1" placeholder="Option 1" value={formData.option1 || ''} onChange={handleChange} required />
        <Input id="option2" placeholder="Option 2" value={formData.option2 || ''} onChange={handleChange} required />
        <Input id="option3" placeholder="Option 3" value={formData.option3 || ''} onChange={handleChange} required />
        <Input id="option4" placeholder="Option 4" value={formData.option4 || ''} onChange={handleChange} required />
        <Input id="right_answer" placeholder="Right Answer" value={formData.right_answer || ''} onChange={handleChange} required />
        <Input id="difficultylevel" placeholder="Difficulty Level" value={formData.difficultylevel || ''} onChange={handleChange} required />
        <Input id="category" placeholder="Category" value={formData.category || ''} onChange={handleChange} required />
        <div className="flex space-x-4 pt-4">
          <Button type="button" onClick={() => navigateTo('manage_questions')} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
          <Button type="submit">Update Question</Button>
        </div>
      </form>
    </Card>
  );
}

function CreateQuiz({ navigateTo, apiFetch, showMessage }) {
  const [category, setCategory] = useState('');
  const [numQ, setNumQ] = useState('');
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch('/admin/question/categories');
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        showMessage(error.message || 'Failed to fetch categories.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [apiFetch, showMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ category, numQ, title });
    try {
      await apiFetch(`/admin/quiz/create?${params.toString()}`, { method: 'POST' });
      showMessage('Quiz created successfully!', 'success');
      navigateTo('manage_quizzes');
    } catch (error) {
      showMessage(error.message || 'Failed to create quiz.', 'error');
    }
  };
  if (isLoading) return <Spinner />;
  return (
    <Card>
      <h2 className="text-3xl font-bold mb-6">Create New Quiz</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="title" placeholder="Quiz Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="" disabled>Select a Category</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </Select>
        <Input id="numQ" type="number" placeholder="Number of Questions" value={numQ} onChange={(e) => setNumQ(e.target.value)} required />
        <div className="flex space-x-4 pt-4">
          <Button type="button" onClick={() => navigateTo('manage_quizzes')} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
          <Button type="submit">Create Quiz</Button>
        </div>
      </form>
    </Card>
  );
}