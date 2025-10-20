import express from 'express';
import fs from 'fs';
import path from 'path';
import { campusDBs } from '../db'; // or '../ds' if that’s your file
import { env } from '../env';

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../../data/earlySubscriptions.json');

function loadSubscriptions() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveSubscriptions(subs: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2));
}

// GET page
router.get('/early-projects', (req, res) => {
  const campusName = Object.keys(env.campuses)[0] as keyof typeof env.campuses;
  const projects = campusDBs[campusName]?.projects || [];
  const subscriptions = loadSubscriptions();
  res.render('early-projects', { projects, subscriptions });
});

// POST form
router.post('/early-projects/add', express.urlencoded({ extended: true }), (req, res) => {
  const { username, project } = req.body;
  const subs = loadSubscriptions();

  if (!subs[project]) subs[project] = [];
  if (!subs[project].includes(username)) subs[project].push(username);

  saveSubscriptions(subs);
  res.redirect('/early-projects');
});

export default router;
