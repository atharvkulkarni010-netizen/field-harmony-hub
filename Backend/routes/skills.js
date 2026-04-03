import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as skillController from '../controllers/skillController.js';

const router = express.Router();

// Get all skills
router.get('/', verifyToken, skillController.getAllSkills);

// Create a new skill
router.post('/', verifyToken, skillController.createSkill);


export default router;
