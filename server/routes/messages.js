const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { messages, users } = require('../data/users');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all messages for the team
router.get('/', auth, (req, res) => {
  try {
    const { box = 'inbox' } = req.query;
    
    let filteredMessages;
    
    if (box === 'sent') {
      // Get messages sent by the current user
      filteredMessages = messages
        .filter(msg => msg.senderId === req.user.id && msg.teamId === req.user.teamId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
      // Get messages received by the current user (inbox)
      filteredMessages = messages
        .filter(msg => 
          msg.teamId === req.user.teamId && 
          (msg.isGroupMessage || msg.recipientId === req.user.id || msg.senderId === req.user.id)
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    res.json(filteredMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/', auth, (req, res) => {
  try {
    const { content, recipientId, isGroupMessage = true } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const sender = users.find(u => u.id === req.user.id);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    const newMessage = {
      id: uuidv4(),
      content: content.trim(),
      senderId: req.user.id,
      senderName: sender.name,
      recipientId: isGroupMessage ? null : recipientId,
      isGroupMessage,
      teamId: req.user.teamId,
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users (for private messages)
router.get('/private/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;
    
    const privateMessages = messages.filter(msg => 
      msg.teamId === req.user.teamId &&
      !msg.isGroupMessage &&
      ((msg.senderId === req.user.id && msg.recipientId === userId) ||
       (msg.senderId === userId && msg.recipientId === req.user.id))
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(privateMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message (only sender or admin can delete)
router.delete('/:messageId', auth, (req, res) => {
  try {
    const { messageId } = req.params;
    const messageIndex = messages.findIndex(msg => msg.id === messageId);

    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const message = messages[messageIndex];

    // Check if user can delete this message
    if (message.senderId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    messages.splice(messageIndex, 1);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
