const express = require('express');
const { users } = require('../data/users');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all team members
router.get('/team', auth, (req, res) => {
  try {
    const teamMembers = users
      .filter(user => user.teamId === req.user.teamId)
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position
      }));

    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow access to users in the same team
    if (user.teamId !== req.user.teamId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, (req, res) => {
  try {
    const { name, email } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[userIndex].name = name || users[userIndex].name;
    users[userIndex].email = email || users[userIndex].email;

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role,
        position: users[userIndex].position
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (Admin only)
router.put('/:id', auth, requireRole(['admin']), (req, res) => {
  try {
    const { name, email, role, position } = req.body;
    const userIndex = users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is trying to modify themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot modify your own account through this endpoint' });
    }

    users[userIndex].name = name || users[userIndex].name;
    users[userIndex].email = email || users[userIndex].email;
    users[userIndex].role = role || users[userIndex].role;
    users[userIndex].position = position || users[userIndex].position;

    res.json({
      message: 'User updated successfully',
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role,
        position: users[userIndex].position
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, requireRole(['admin']), (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is trying to delete themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    res.json({
      message: 'User deleted successfully',
      user: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
