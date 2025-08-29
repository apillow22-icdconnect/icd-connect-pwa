const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { tests, testResults, testTemplates } = require('../data/users');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all tests for the team
router.get('/', auth, (req, res) => {
  try {
    let teamTests = tests
      .filter(test => test.teamId === req.user.teamId)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    // Filter tests based on assignment
    if (req.user.role === 'rep') {
      teamTests = teamTests.filter(test => {
        if (test.assignmentType === 'everyone') {
          return true;
        }
        return test.assignedUsers && test.assignedUsers.includes(req.user.id);
      });
    }

    res.json(teamTests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new test (Admin and Team Leaders only)
router.post('/', auth, requireRole(['admin', 'team_leader']), (req, res) => {
  try {
    const { title, description, questions, passingScore, timeLimit, isActive, assignmentType, assignedUsers } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title and questions are required' });
    }

    // Validate questions structure
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text || !question.options || !Array.isArray(question.options) || question.options.length < 2) {
        return res.status(400).json({ message: `Question ${i + 1} must have text and at least 2 options` });
      }
      if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        return res.status(400).json({ message: `Question ${i + 1} must have a valid correct answer index` });
      }
    }

    const newTest = {
      id: uuidv4(),
      title: title.trim(),
      description: description || '',
      questions: questions,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 30, // minutes
      isActive: isActive !== undefined ? isActive : true,
      assignmentType: assignmentType || 'everyone',
      assignedUsers: assignedUsers || [],
      createdBy: req.user.id,
      creatorName: req.user.name,
      teamId: req.user.teamId,
      createdDate: new Date().toISOString()
    };

    tests.push(newTest);

    res.status(201).json({
      message: 'Test created successfully',
      data: newTest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific test
router.get('/:id', auth, (req, res) => {
  try {
    const test = tests.find(t => t.id === req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (test.teamId !== req.user.teamId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // For test takers, don't include correct answers
    if (req.user.role === 'rep') {
      const testForTaker = {
        ...test,
        questions: test.questions.map(q => ({
          text: q.text,
          options: q.options
        }))
      };
      res.json(testForTaker);
    } else {
      res.json(test);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit test answers
router.post('/:id/submit', auth, (req, res) => {
  try {
    const { answers } = req.body;
    const test = tests.find(t => t.id === req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (!test.isActive) {
      return res.status(400).json({ message: 'This test is not active' });
    }

    if (!answers || !Array.isArray(answers) || answers.length !== test.questions.length) {
      return res.status(400).json({ message: 'All questions must be answered' });
    }

    // Calculate score
    let correctAnswers = 0;
    const questionResults = [];

    for (let i = 0; i < test.questions.length; i++) {
      const question = test.questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }

      questionResults.push({
        questionIndex: i,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      });
    }

    const score = Math.round((correctAnswers / test.questions.length) * 100);
    const passed = score >= test.passingScore;

    const testResult = {
      id: uuidv4(),
      testId: test.id,
      testTitle: test.title,
      userId: req.user.id,
      userName: req.user.name,
      answers,
      questionResults,
      score,
      passed,
      submittedDate: new Date().toISOString(),
      test: {
        questions: test.questions
      }
    };

    testResults.push(testResult);

    res.json({
      message: 'Test submitted successfully',
      data: {
        score,
        passed,
        totalQuestions: test.questions.length,
        correctAnswers,
        passingScore: test.passingScore
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get test results (Admin and Team Leaders can see all, Reps can only see their own)
router.get('/:id/results', auth, (req, res) => {
  try {
    const test = tests.find(t => t.id === req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    let results;
    if (req.user.role === 'rep') {
      results = testResults.filter(r => r.testId === req.params.id && r.userId === req.user.id);
    } else {
      results = testResults.filter(r => r.testId === req.params.id);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a test (Admin and creator only)
router.put('/:id', auth, requireRole(['admin', 'team_leader']), (req, res) => {
  try {
    const { title, description, questions, passingScore, timeLimit, isActive } = req.body;
    const testIndex = tests.findIndex(t => t.id === req.params.id);

    if (testIndex === -1) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const test = tests[testIndex];

    // Check if user can update this test
    if (test.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this test' });
    }

    tests[testIndex] = {
      ...test,
      title: title || test.title,
      description: description || test.description,
      questions: questions || test.questions,
      passingScore: passingScore || test.passingScore,
      timeLimit: timeLimit || test.timeLimit,
      isActive: isActive !== undefined ? isActive : test.isActive
    };

    res.json({
      message: 'Test updated successfully',
      data: tests[testIndex]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a test (Admin and creator only)
router.delete('/:id', auth, requireRole(['admin', 'team_leader']), (req, res) => {
  try {
    const testIndex = tests.findIndex(t => t.id === req.params.id);

    if (testIndex === -1) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const test = tests[testIndex];

    // Check if user can delete this test
    if (test.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this test' });
    }

    tests.splice(testIndex, 1);

    // Also delete related test results
    const resultIndices = testResults
      .map((result, index) => result.testId === req.params.id ? index : -1)
      .filter(index => index !== -1)
      .reverse();

    resultIndices.forEach(index => {
      testResults.splice(index, 1);
    });

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's test history
router.get('/user/history', auth, (req, res) => {
  try {
    const userResults = testResults
      .filter(result => result.userId === req.user.id)
      .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));

    res.json(userResults);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all test templates (Admin and Team Leaders only)
router.get('/templates/all', auth, requireRole(['admin', 'team_leader']), (req, res) => {
  try {
    const teamTemplates = testTemplates
      .filter(template => template.teamId === req.user.teamId)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    res.json(teamTemplates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save test as template (Admin and Team Leaders only)
router.post('/templates/save', auth, requireRole(['admin', 'team_leader']), (req, res) => {
  try {
    const { testId, templateName, description } = req.body;

    if (!templateName) {
      return res.status(400).json({ message: 'Template name is required' });
    }

    const test = tests.find(t => t.id === testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user can save this test as template
    if (test.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to save this test as template' });
    }

    const newTemplate = {
      id: uuidv4(),
      templateName: templateName.trim(),
      description: description || '',
      questions: test.questions,
      passingScore: test.passingScore,
      timeLimit: test.timeLimit,
      createdBy: req.user.id,
      creatorName: req.user.name,
      teamId: req.user.teamId,
      createdDate: new Date().toISOString()
    };

    testTemplates.push(newTemplate);

    res.status(201).json({
      message: 'Test template saved successfully',
      data: newTemplate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create test from template (Admin and Team Leaders only)
router.post('/templates/:templateId/create', auth, requireRole(['admin', 'team_leader']), (req, res) => {
  try {
    const { assignmentType, assignedUsers } = req.body;
    const template = testTemplates.find(t => t.id === req.params.templateId);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (template.teamId !== req.user.teamId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const newTest = {
      id: uuidv4(),
      title: `${template.templateName} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      questions: template.questions,
      passingScore: template.passingScore,
      timeLimit: template.timeLimit,
      isActive: true,
      assignmentType: assignmentType || 'everyone',
      assignedUsers: assignedUsers || [],
      createdBy: req.user.id,
      creatorName: req.user.name,
      teamId: req.user.teamId,
      createdDate: new Date().toISOString(),
      createdFromTemplate: template.id
    };

    tests.push(newTest);

    res.status(201).json({
      message: 'Test created from template successfully',
      data: newTest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete test template (Admin and creator only)
router.delete('/templates/:templateId', auth, requireRole(['admin', 'team_leader']), (req, res) => {
  try {
    const templateIndex = testTemplates.findIndex(t => t.id === req.params.templateId);

    if (templateIndex === -1) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const template = testTemplates[templateIndex];

    // Check if user can delete this template
    if (template.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this template' });
    }

    testTemplates.splice(templateIndex, 1);

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
