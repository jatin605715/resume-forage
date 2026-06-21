const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDb } = require('../database');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all resume routes
router.use(authMiddleware);

// GET ALL RESUMES FOR USER
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const resumes = await db.all(
      'SELECT id, title, template, createdAt, updatedAt FROM resumes WHERE userId = ? ORDER BY updatedAt DESC',
      [req.user.id]
    );
    
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes.' });
  }
});

// GET SINGLE RESUME
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = getDb();
    const resume = await db.get(
      'SELECT * FROM resumes WHERE id = ? AND userId = ?',
      [id, req.user.id]
    );

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    // Parse the JSON data string back to object
    resume.data = JSON.parse(resume.data);
    res.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume details.' });
  }
});

// CREATE NEW RESUME
router.post('/', async (req, res) => {
  const { title, template, data } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Resume title is required.' });
  }

  try {
    const db = getDb();
    const resumeId = crypto.randomUUID();
    const resumeTemplate = template || 'classic';
    const resumeData = JSON.stringify(data || {});

    await db.run(
      'INSERT INTO resumes (id, userId, title, template, data) VALUES (?, ?, ?, ?, ?)',
      [resumeId, req.user.id, title, resumeTemplate, resumeData]
    );

    res.status(201).json({
      id: resumeId,
      userId: req.user.id,
      title,
      template: resumeTemplate,
      data: data || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ error: 'Failed to create resume.' });
  }
});

// UPDATE RESUME
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, template, data } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Resume title is required.' });
  }

  try {
    const db = getDb();
    
    // Check ownership
    const existing = await db.get('SELECT id FROM resumes WHERE id = ? AND userId = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    const resumeTemplate = template || 'classic';
    const resumeData = JSON.stringify(data || {});
    const now = new Date().toISOString();

    await db.run(
      'UPDATE resumes SET title = ?, template = ?, data = ?, updatedAt = ? WHERE id = ? AND userId = ?',
      [title, resumeTemplate, resumeData, now, id, req.user.id]
    );

    res.json({
      id,
      userId: req.user.id,
      title,
      template: resumeTemplate,
      data: data || {},
      updatedAt: now
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: 'Failed to update resume.' });
  }
});

// DELETE RESUME
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = getDb();
    
    // Check ownership
    const existing = await db.get('SELECT id FROM resumes WHERE id = ? AND userId = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    await db.run('DELETE FROM resumes WHERE id = ? AND userId = ?', [id, req.user.id]);
    
    res.json({ message: 'Resume deleted successfully.' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume.' });
  }
});

module.exports = router;
