import express from 'express';
import './configurations/mongoConnection.js';
const app = express();
const port = 3000;
import router from './controllers/index.js';
app.use(express.json());

import cors from 'cors';
app.use(cors());

import LegalIssue from './models/legalIssue.js';

router.get('/', (req, res) => {
    res.send('Alhamdulillah, MongoDB Connected');
});

app.use('/', router);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});