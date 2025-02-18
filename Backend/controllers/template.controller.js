import Template from '../models/Template.js';
import { nanoid } from 'nanoid';

export const createTemplate = async (req, res) => {
  try {
    const { templateName, genre, description, structure } = req.body;
    
    const templateId = nanoid(16);
    let author = null;

    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        author = user._id;
      }
    } catch (err) {
      console.log('No valid auth token');
    }

    const template = new Template({
      templateId,
      templateName,
      genre,
      description,
      structure,
      author
    });

    const savedTemplate = await template.save();

    res.status(201).json({
      templateId: savedTemplate.templateId,
      message: 'Template saved successfully'
    });
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({ 
      error: 'Failed to save template',
      details: error.message
    });
  }
};

export const getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name email');

    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch templates',
      details: error.message
    });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findOne({ templateId: req.params.templateId })
      .populate('author', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ 
      error: 'Failed to fetch template',
      details: error.message
    });
  }
}; 