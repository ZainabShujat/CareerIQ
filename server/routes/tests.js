
const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const auth = require('../middleware/authMiddleware');

// list tests
router.get('/', async (req,res)=>{
  const tests = await Test.find({}).lean();
  res.json(tests);
});

// get single test
router.get('/:id', async (req,res)=>{
  const t = await Test.findOne({ id: req.params.id }).lean();
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

// submit answers -> simple scoring, returns score and breakdown
router.post('/:id/submit', auth, async (req,res)=>{
  const { answers } = req.body; // [{questionId, choiceId}, ...]
  const t = await Test.findOne({ id: req.params.id }).lean();
  if (!t) return res.status(404).json({ error: 'Not found' });

  let total = 0;
  const breakdown = [];
  for (const a of answers || []) {
    const q = t.questions.find(q => q.id === a.questionId);
    const choice = q?.choices?.find(c => c.id === a.choiceId);
    const sc = choice?.score || 0;
    total += sc;
    breakdown.push({ questionId: a.questionId, score: sc });
  }

  // Save a result document
  const Result = require('../models/Result');
  const r = await Result.create({
    userId: req.user._id,
    title: `Test: ${t.title}`,
    data: { testId: t.id, score: total, breakdown }
  });

  res.json({ score: total, breakdown, saved: true, resultId: r._id });
});

module.exports = router;
