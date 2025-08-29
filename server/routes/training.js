const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { trainingModules } = require('../data/users');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for training content uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/training'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'training-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|mp4|avi|mov|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, MP4, AVI, MOV, JPG, JPEG, PNG files are allowed'));
    }
  }
});

// Get all training modules for the team
router.get('/', auth, (req, res) => {
  try {
    const teamModules = trainingModules
      .filter(module => module.teamId === req.user.teamId)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    res.json(teamModules);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new training module (Admin only)
router.post('/', auth, requireRole(['admin']), upload.array('files', 5), (req, res) => {
  try {
    const { title, description, productName, campaignName, content, teachBackRequired } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const uploadedFiles = req.files ? req.files.map(file => ({
      fileName: file.filename,
      originalName: file.originalname,
      filePath: `/uploads/training/${file.filename}`,
      fileType: path.extname(file.originalname).toLowerCase()
    })) : [];

    const newModule = {
      id: uuidv4(),
      title: title.trim(),
      description: description || '',
      productName: productName || '',
      campaignName: campaignName || '',
      content: content,
      teachBackRequired: teachBackRequired === 'true',
      files: uploadedFiles,
      createdBy: req.user.id,
      creatorName: req.user.name,
      teamId: req.user.teamId,
      createdDate: new Date().toISOString(),
      isActive: true
    };

    trainingModules.push(newModule);

    res.status(201).json({
      message: 'Training module created successfully',
      data: newModule
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific training module
router.get('/:id', auth, (req, res) => {
  try {
    const module = trainingModules.find(m => m.id === req.params.id);

    if (!module) {
      return res.status(404).json({ message: 'Training module not found' });
    }

    if (module.teamId !== req.user.teamId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(module);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a training module (Admin only)
router.put('/:id', auth, requireRole(['admin']), (req, res) => {
  try {
    const { title, description, content, teachBackRequired, isActive } = req.body;
    const moduleIndex = trainingModules.findIndex(m => m.id === req.params.id);

    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Training module not found' });
    }

    const module = trainingModules[moduleIndex];

    // Check if user can update this module
    if (module.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this module' });
    }

    trainingModules[moduleIndex] = {
      ...module,
      title: title || module.title,
      description: description || module.description,
      content: content || module.content,
      teachBackRequired: teachBackRequired !== undefined ? teachBackRequired : module.teachBackRequired,
      isActive: isActive !== undefined ? isActive : module.isActive
    };

    res.json({
      message: 'Training module updated successfully',
      data: trainingModules[moduleIndex]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a training module (Admin only)
router.delete('/:id', auth, requireRole(['admin']), (req, res) => {
  try {
    const moduleIndex = trainingModules.findIndex(m => m.id === req.params.id);

    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Training module not found' });
    }

    const module = trainingModules[moduleIndex];

    // Check if user can delete this module
    if (module.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this module' });
    }

    trainingModules.splice(moduleIndex, 1);

    res.json({ message: 'Training module deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit teach-back (for reps)
router.post('/:id/teachback', auth, (req, res) => {
  try {
    const { teachBackContent } = req.body;
    const module = trainingModules.find(m => m.id === req.params.id);

    if (!module) {
      return res.status(404).json({ message: 'Training module not found' });
    }

    if (!module.teachBackRequired) {
      return res.status(400).json({ message: 'This module does not require a teach-back' });
    }

    // In a real app, you'd store teach-backs in a separate collection
    // For now, we'll just return success
    res.json({
      message: 'Teach-back submitted successfully',
      data: {
        moduleId: module.id,
        moduleTitle: module.title,
        teachBackContent,
        submittedBy: req.user.id,
        submittedByName: req.user.name,
        submittedDate: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
