import express from 'express';
import { createTemplate, getAllTemplates, getTemplateById } from '../controllers/template.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create new template
router.post('/', createTemplate);

// Get all templates
router.get('/', getAllTemplates);

// Get template by ID
router.get('/:templateId', getTemplateById);

export default router; 