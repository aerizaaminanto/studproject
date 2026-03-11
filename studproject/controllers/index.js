import express from 'express';
const router = express.Router();

import Scholar from '../models/scholar.js';
import LegalIssue from '../models/legalIssue.js';
import Madzhab from '../models/madzhab.js';
import OpinionCore from "../models/opinionCore.js";

router.get('/', (req, res) => {
  res.send('API Running');
});


/* =========================
   CREATE
========================= */
router.post('/scholars', async (req, res) => {
  try {
    const scholar = await Scholar.create(req.body);
    res.status(201).json(scholar);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/* =========================
   READ ALL
========================= */
router.get('/scholars', async (req, res) => {
  try {
    const scholars = await Scholar.find();
    res.json(scholars);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

/* =========================
   READ BY ID
========================= */
router.get('/scholars/:id', async (req, res) => {
  try {
    const scholar = await Scholar.findById(req.params.id);
    if (!scholar) {
      return res.status(404).json({ message: 'Scholar not found' });
    }
    res.json(scholar);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/* =========================
   UPDATE
========================= */
router.put('/scholars/:id', async (req, res) => {
  try {
    const scholar = await Scholar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true,
        runValidators: true
       }
    );

    if (!scholar) {
      return res.status(404).json({ message: 'Scholar not found' });
    }

    res.json(scholar);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/* =========================
   DELETE
========================= */
router.delete('/scholars/:id', async (req, res) => {
  try {
    const scholar = await Scholar.findByIdAndDelete(req.params.id);

    if (!scholar) {
      return res.status(404).json({ message: 'Scholar not found' });
    }

    res.json({ message: 'Scholar deleted successfully' });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/* =========================
   CREATE LegalIssue
========================= */
router.post('/issues', async (req, res) => {
  try {
    const issue = await LegalIssue.create(req.body);
    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/* =========================
   GET ALL LegalIssue
========================= */
router.get('/issues', async (req, res) => {
  try {
    const issues = await LegalIssue.find();
    res.json(issues);
  } catch (error) {
    res.status(500).json(error.message);
  }
});


/* =========================
   UPDATE LegalIssue
========================= */
router.patch('/issues/:id', async (req, res) => {
  try {
    const issue = await LegalIssue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!issue) {
      return res.status(404).json({ message: 'LegalIssue not found' });
    }

    res.json(issue);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/* =========================
   DELETE LegalIssue
========================= */
router.delete('/issues/:id', async (req, res) => {
  try {
    const issue = await LegalIssue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'LegalIssue not found' });
    }

    res.json({ message: 'LegalIssue deleted successfully' });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/* =========================
   CREATE Madzhab
========================= */
router.post('/madzhabs', async (req, res) => {
  try {
    const madzhab = await Madzhab.create(req.body);
    res.status(201).json(madzhab);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/* =========================
   GET ALL Madzhab
========================= */
router.get('/madzhabs', async (req, res) => {
  try {
    const madzhabs = await Madzhab.find().populate('founder');
    res.json(madzhabs);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

/* =========================
   CREATE Opinion
========================= */
router.post("/opinions", async (req, res) => {
  try {
    const opinion = await OpinionCore.create(req.body);
    res.status(201).json(opinion);
  } catch (error) {
    res.status(400).json(error.message);
  }
});


/* =========================
   GET ALL Opinion for a LegalIssue
========================= */
router.get("/issues/:issueId/opinions", async (req, res) => {
  try {

    const opinions = await OpinionCore.find({
      legalIssueId: req.params.issueId
    })
    .populate("scholarId")
    .populate("legalIssueId");

    res.json(opinions);

  } catch (error) {
    res.status(500).json(error.message);
  }
});

/* =========================
   SEARCHengine LegalIssue
========================= */
router.get("/issues/search", async (req, res) => {
  try {

    const keyword = req.query.q;

    const issues = await LegalIssue.find(
      { $text: { $search: keyword } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json(issues);

  } catch (error) {
    res.status(500).json(error.message);
  }
});


/* =========================
   GET LegalIssue BY ID
========================= */
router.get('/issues/:id', async (req, res) => {
  try {
    const issue = await LegalIssue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'LegalIssue not found' });
    }

    res.json(issue);
  } catch (error) {
    res.status(400).json(error.message);
  }
});


export default router;