const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Issue = require('../models/Issue');
const Road = require('../models/Road');

// GET export issues to Excel
router.get('/issues/export', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const issues = await Issue.find(query).sort({ createdAt: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Issues');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Location (Lat, Lng)', key: 'location', width: 30 },
            { header: 'Road Name', key: 'roadName', width: 30 },
            { header: 'Road Abbr', key: 'roadAbbr', width: 15 },
            { header: 'Type', key: 'type', width: 20 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Upvotes', key: 'upvotes', width: 10 }
        ];

        issues.forEach(issue => {
            worksheet.addRow({
                date: new Date(issue.createdAt).toLocaleString(),
                location: `${issue.lat}, ${issue.lng}`,
                roadName: issue.roadName || 'Unknown',
                roadAbbr: issue.roadAbbr || 'UR',
                type: issue.type,
                description: issue.description,
                status: issue.status,
                upvotes: issue.upvotes || 0
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'issues_export.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Export error:", err);
        res.status(500).json({ message: 'Failed to export data' });
    }
});

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
    let roadName = null;
    let roadAbbr = null;
    
    try {
        const nearestRoad = await Road.findOne({
            geometry: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [req.body.lng, req.body.lat]
                    },
                    $maxDistance: 500
                }
            }
        });

        if (nearestRoad) {
            roadName = nearestRoad.name;
            roadAbbr = roadName.split(' ').map(w => w[0].toUpperCase()).join('');
        }
    } catch (err) {
        console.error("Error finding nearest road:", err);
    }

    const issue = new Issue({
        lat: req.body.lat,
        lng: req.body.lng,
        type: req.body.type,
        description: req.body.description,
        status: req.body.status || 'New',
        photoUrl: req.body.photoUrl || '',
        roadName: roadName,
        roadAbbr: roadAbbr
    });

    try {
        const newIssue = await issue.save();
        res.status(201).json(newIssue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH (Update) an issue status
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

// PATCH upvote an issue
router.patch('/issues/:id/upvote', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });
        
        issue.upvotes = (issue.upvotes || 0) + 1;
        const updatedIssue = await issue.save();
        res.json(updatedIssue);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
