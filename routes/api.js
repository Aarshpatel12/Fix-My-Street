const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

// GET all issues
router.get('/issues', async (req, res) => {
    try {
        const issues = await Issue.find().sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new issue
router.post('/issues', async (req, res) => {
    const issue = new Issue({
        lat: req.body.lat,
        lng: req.body.lng,
        type: req.body.type,
        description: req.body.description,
        status: req.body.status || 'New',
        photoUrl: req.body.photoUrl || ''
    });

    try {
        const newIssue = await issue.save();
        res.status(201).json(newIssue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH (Update) an issue status (For Phase 4, but we can set it up now)
router.patch('/issues/:id', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (req.body.status != null) {
            issue.status = req.body.status;
        }
        const updatedIssue = await issue.save();
        res.json(updatedIssue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE an issue
router.delete('/issues/:id', async (req, res) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.json({ message: 'Issue deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
