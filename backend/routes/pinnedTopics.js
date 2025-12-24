const express = require('express');
const router = express.Router();
const RegisterRequest = require('../models/RegisterRequest');
const auth = require('../middleware/auth');

// GET pinned topics
router.get('/me/pinned-topics', auth(), async (req, res) => {
  try {
    const user = await RegisterRequest
      .findById(req.user.id)
      .populate('pinnedTopics');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      pinnedTopics: user.pinnedTopics.map(t => t._id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PIN / UNPIN
router.post('/me/pinned-topics', auth(), async (req, res) => {
  const { topicId, action } = req.body;

  if (!topicId || !['pin', 'unpin'].includes(action)) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  try {
    const user = await RegisterRequest.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (action === 'pin') {
      if (!user.pinnedTopics.includes(topicId)) {
        user.pinnedTopics.push(topicId);
      }
    } else {
      user.pinnedTopics = user.pinnedTopics.filter(
        id => id.toString() !== topicId
      );
    }

    await user.save();

    res.json({ pinnedTopics: user.pinnedTopics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;