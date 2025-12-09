const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req,res)=>{
  const docs = await Result.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(docs);
});

router.delete('/:id', auth, async (req,res)=>{
  await Result.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.json({ ok: true });
});

module.exports = router;
