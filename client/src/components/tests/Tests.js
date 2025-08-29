import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Add,
  Quiz,
  PlayArrow,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  Person,
  CalendarToday,
  Timer,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Tests = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [takeTestDialogOpen, setTakeTestDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }],
    passingScore: 70,
    timeLimit: 30,
    assignmentType: 'everyone',
    assignedUsers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [testReviewDialogOpen, setTestReviewDialogOpen] = useState(false);
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchTests();
    fetchTestResults();
    fetchTeamMembers();
  }, [user]);

  const fetchTests = async () => {
    try {
      const response = await axios.get('/api/tests');
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchTestResults = async () => {
    try {
      const response = await axios.get('/api/tests/user/history');
      setTestResults(response.data);
    } catch (error) {
      console.error('Error fetching test results:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/api/users/team');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleCreateTest = () => {
    setTestData({
      title: '',
      description: '',
      questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }],
      passingScore: 70,
      timeLimit: 30,
      assignmentType: 'everyone',
      assignedUsers: []
    });
    setCreateDialogOpen(true);
  };

  const handleAddQuestion = () => {
    setTestData({
      ...testData,
      questions: [...testData.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = testData.questions.filter((_, i) => i !== index);
    setTestData({ ...testData, questions: newQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...testData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setTestData({ ...testData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...testData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setTestData({ ...testData, questions: newQuestions });
  };

  const handleSubmitTest = async () => {
    try {
      setLoading(true);
      setError('');

      if (!testData.title.trim()) {
        setError('Test title is required');
        return;
      }

      if (testData.questions.some(q => !q.text.trim())) {
        setError('All questions must have text');
        return;
      }

      if (testData.questions.some(q => q.options.some(opt => !opt.trim()))) {
        setError('All question options must be filled');
        return;
      }

      const testPayload = {
        ...testData,
        assignedUsers: testData.assignmentType === 'specific' ? testData.assignedUsers : []
      };

      await axios.post('/api/tests', testPayload);
      setCreateDialogOpen(false);
      fetchTests();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating test');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeTest = (test) => {
    setSelectedTest(test);
    setCurrentQuestion(0);
    setAnswers(new Array(test.questions.length).fill(null));
    setTimeLeft(test.timeLimit * 60);
    setTakeTestDialogOpen(true);
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitAnswers = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/tests/${selectedTest.id}/submit`, {
        answers: answers,
        timeSpent: selectedTest.timeLimit * 60 - timeLeft
      });
      setTakeTestDialogOpen(false);
      fetchTestResults();
      setResultsDialogOpen(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting test');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTestReview = (testResult) => {
    setSelectedTestResult(testResult);
    setTestReviewDialogOpen(true);
  };

  const handleRetakeTest = async (testResult) => {
    try {
      const test = tests.find(t => t.id === testResult.testId);
      if (test) {
        handleTakeTest(test);
      }
    } catch (error) {
      setError('Error retaking test');
    }
  };

  const getPendingTests = () => {
    const completedTestIds = testResults.map(result => result.testId);
    return tests.filter(test => !completedTestIds.includes(test.id));
  };

  const getCompletedTests = () => {
    return testResults.filter(result => result.passed);
  };

  const getFailedTests = () => {
    return testResults.filter(result => !result.passed);
  };

  const getTestStatus = (test) => {
    const result = testResults.find(r => r.testId === test.id);
    if (!result) return 'pending';
    return result.passed ? 'completed' : 'failed';
  };

  const renderTestCards = () => {
    let testsToShow = [];
    
    if (user?.role === 'admin') {
      testsToShow = tests;
    } else {
      switch (activeTab) {
        case 0: // All Tests
          testsToShow = tests;
          break;
        case 1: // Pending
          testsToShow = getPendingTests();
          break;
        case 2: // Completed
          testsToShow = getCompletedTests();
          break;
        case 3: // Failed
          testsToShow = getFailedTests();
          break;
        default:
          testsToShow = tests;
      }
    }

    return testsToShow.map((test) => {
      const isTestResult = test.hasOwnProperty('score');
      const status = isTestResult ? (test.passed ? 'completed' : 'failed') : getTestStatus(test);
      
      return (
        <Card key={test.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Typography variant="h6" gutterBottom>
                  {isTestResult ? test.testTitle : test.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {isTestResult ? test.testDescription : test.description}
                </Typography>
                {isTestResult && (
                  <Box mt={1}>
                    <Typography variant="body2">
                      Score: {test.score}% | Time: {Math.floor(test.timeSpent / 60)}m {test.timeSpent % 60}s
                    </Typography>
                    <Typography variant="body2">
                      Submitted: {new Date(test.submittedDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                {!isTestResult && (
                  <Box mt={1}>
                    <Typography variant="body2">
                      Questions: {test.questions.length} | Time Limit: {test.timeLimit} minutes
                    </Typography>
                    <Typography variant="body2">
                      Passing Score: {test.passingScore}%
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                <Chip
                  label={status}
                  color={status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'warning'}
                  size="small"
                />
                {user?.role !== 'admin' && (
                  <Box display="flex" gap={1}>
                    {isTestResult && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewTestReview(test)}
                      >
                        View Review
                      </Button>
                    )}
                    {isTestResult && !test.passed && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleRetakeTest(test)}
                      >
                        Retake Test
                      </Button>
                    )}
                    {!isTestResult && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => handleTakeTest(test)}
                      >
                        Take Test
                      </Button>
                    )}
                  </Box>
                )}
                {user?.role === 'admin' && !isTestResult && (
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTest(test.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      );
    });
  };

  const handleDeleteTest = async (testId) => {
    try {
      await axios.delete(`/api/tests/${testId}`);
      fetchTests();
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting test');
    }
  };

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Knowledge Tests
        </Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateTest}
          >
            Create Test
          </Button>
        )}
      </Box>

      {user?.role !== 'admin' && (
        <Box mb={3}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Tests" />
            <Tab label="Pending" />
            <Tab label="Completed" />
            <Tab label="Failed" />
          </Tabs>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box>
        {renderTestCards()}
      </Box>

      {/* Create Test Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            height: '80vh'
          }
        }}
      >
        <DialogTitle>Create Knowledge Test</DialogTitle>
        <DialogContent sx={{ 
          overflowY: 'auto', 
          pb: 2,
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
            '&:hover': {
              background: '#555'
            }
          }
        }}>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Test Title"
              value={testData.title}
              onChange={(e) => setTestData({ ...testData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={testData.description}
              onChange={(e) => setTestData({ ...testData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                label="Passing Score (%)"
                type="number"
                value={testData.passingScore}
                onChange={(e) => setTestData({ ...testData, passingScore: parseInt(e.target.value) })}
                sx={{ width: '50%' }}
              />
              <TextField
                label="Time Limit (minutes)"
                type="number"
                value={testData.timeLimit}
                onChange={(e) => setTestData({ ...testData, timeLimit: parseInt(e.target.value) })}
                sx={{ width: '50%' }}
              />
            </Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Assignment Type</InputLabel>
              <Select
                value={testData.assignmentType}
                onChange={(e) => setTestData({ ...testData, assignmentType: e.target.value })}
              >
                <MenuItem value="everyone">Everyone</MenuItem>
                <MenuItem value="specific">Specific Users</MenuItem>
              </Select>
            </FormControl>
            {testData.assignmentType === 'specific' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Users</InputLabel>
                <Select
                  multiple
                  value={testData.assignedUsers}
                  onChange={(e) => setTestData({ ...testData, assignedUsers: e.target.value })}
                >
                  {teamMembers.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Questions
            </Typography>
            <Box sx={{ 
              maxHeight: '300px', 
              overflowY: 'auto', 
              mb: 2,
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555'
                }
              }
            }}>
              {testData.questions.map((question, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">Question {index + 1}</Typography>
                    {testData.questions.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveQuestion(index)}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                  <TextField
                    fullWidth
                    label="Question Text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="subtitle2" gutterBottom>
                    Options:
                  </Typography>
                  {question.options.map((option, optionIndex) => (
                    <Box key={optionIndex} display="flex" alignItems="center" mb={1}>
                      <Radio
                        checked={question.correctAnswer === optionIndex}
                        onChange={() => handleQuestionChange(index, 'correctAnswer', optionIndex)}
                      />
                      <TextField
                        fullWidth
                        label={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                        size="small"
                      />
                    </Box>
                  ))}
                </Card>
              ))}
            </Box>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddQuestion}
              sx={{ mt: 2 }}
            >
              Add Question
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitTest} variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create Test'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Take Test Dialog */}
      <Dialog open={takeTestDialogOpen} onClose={() => setTakeTestDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTest?.title}
          <Typography variant="body2" color="text.secondary">
            Question {currentQuestion + 1} of {selectedTest?.questions.length}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedTest && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {selectedTest.questions[currentQuestion].text}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((currentQuestion + 1) / selectedTest.questions.length) * 100}
                sx={{ mb: 2 }}
              />
              <RadioGroup
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerSelect(parseInt(e.target.value))}
              >
                {selectedTest.questions[currentQuestion].options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion < (selectedTest?.questions.length || 0) - 1 ? (
            <Button onClick={handleNextQuestion} variant="contained">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmitAnswers} variant="contained" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Test'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Test Review Dialog */}
      <Dialog open={testReviewDialogOpen} onClose={() => setTestReviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Test Review</DialogTitle>
        <DialogContent>
          {selectedTestResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTestResult.testTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Score: {selectedTestResult.score}% | Status: {selectedTestResult.passed ? 'Passed' : 'Failed'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Submitted: {new Date(selectedTestResult.submittedDate).toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Question Review:
              </Typography>
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {selectedTestResult.questions.map((question, index) => {
                  const userAnswer = selectedTestResult.answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <Card key={index} sx={{ mb: 2, p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Question {index + 1}: {question.text}
                      </Typography>
                      <Box ml={2}>
                        {question.options.map((option, optionIndex) => (
                          <Box key={optionIndex} display="flex" alignItems="center" mb={1}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: optionIndex === question.correctAnswer ? 'success.main' : 
                                       optionIndex === userAnswer && !isCorrect ? 'error.main' : 'text.primary',
                                fontWeight: optionIndex === question.correctAnswer ? 'bold' : 'normal'
                              }}
                            >
                              {optionIndex + 1}. {option}
                              {optionIndex === question.correctAnswer && ' (Correct)'}
                              {optionIndex === userAnswer && !isCorrect && ' (Your Answer)'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestReviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tests;
