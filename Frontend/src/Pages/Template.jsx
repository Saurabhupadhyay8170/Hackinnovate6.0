import React, { useState, useEffect } from 'react';
import templates from '../utils/StoryTemp.json';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Search, Loader, X, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Template() {
  const navigate = useNavigate();
  const [searchPrompt, setSearchPrompt] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await api.get(`${import.meta.env.VITE_API_URL}/api/templates`);
        setTemplates(response.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTemplates(templates);
      return;
    }

    const filtered = templates.filter(template => 
      template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTemplates(filtered);
  }, [searchTerm, templates]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Generate a story template for the following idea: ${searchPrompt}
      Return a valid JSON object with this structure (no additional text or formatting):
      {
        "templateName": "string",
        "genre": "string",
        "description": "string",
        "structure": {
          "title": "string",
          "chapters": [
            {
              "chapterTitle": "string",
              "scenes": ["string"]
            }
          ]
        }
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      try {
        // Clean up markdown code blocks and trailing commas
        const cleanJson = text.includes('```') 
          ? text.replace(/```json\n|\n```|```/g, '').trim()
          : text;
        
        // Remove trailing commas from arrays
        const noTrailingCommas = cleanJson.replace(/,(\s*[}\]])/g, '$1');
        
        const template = JSON.parse(noTrailingCommas);
        console.log(template);
        await handleUseTemplate(template);
      } catch (parseError) {
        console.error('JSON Parse Error:', text);
        throw new Error('Invalid template format received');
      }
    } catch (error) {
      console.error('Error generating template:', error);
      alert('Failed to generate template. Please try again.');
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      // First save the template
      const templateResponse = await api.post(`${import.meta.env.VITE_API_URL}/api/templates`, {
        templateName: template.templateName,
        genre: template.genre,
        description: template.description,
        structure: template.structure
      });

      if (!templateResponse.data.templateId) {
        throw new Error('Failed to save template');
      }

      // Then create a document from the template
      const formattedContent = `
        <div class="prose max-w-none">
          <h1 class="text-3xl font-bold mb-4">${template.structure.title}</h1>
          
          <div class="mb-6">
            <p class="text-gray-600"><strong>Genre:</strong> ${template.genre}</p>
            <p class="text-gray-600 mb-4">${template.description}</p>
          </div>

          ${template.structure.chapters.map(chapter => `
            <div class="mb-8">
              <h2 class="text-2xl font-bold mb-4">${chapter.chapterTitle}</h2>
              ${chapter.scenes.map(scene => `
                <div class="mb-4">
                  <h3 class="text-xl font-semibold mb-2">${scene}</h3>
                  <div class="p-4 border border-dashed border-gray-300 rounded-lg">
                    <p class="text-gray-500 italic">Start writing your scene here...</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `;

      const docResponse = await api.post(`${import.meta.env.VITE_API_URL}/api/documents`, {
        title: template.structure.title,
        content: formattedContent,
        templateId: templateResponse.data.templateId,
        metadata: {
          genre: template.genre,
          description: template.description,
          isTemplate: true
        }
      });

      if (docResponse.data && docResponse.data.documentId) {
        navigate('/document/d/' + docResponse.data.documentId);
      } else {
        throw new Error('No document ID received');
      }
    } catch (error) {
      console.error('Error creating document from template:', error);
      alert('Failed to create document. Please try again.');
    }
  };

  const handleCopyContent = (template) => {
    // Implement the copy content logic here
    console.log('Copying content:', template);
    setCopied(true);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Enhanced Search Section */}
      {/* <div className="mb-12 space-y-6"> */}
        <div className="max-w-2xl mx-auto">
          

          {/* Template Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates by name, genre, or description..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
        </div>
      </div>

      {/* Templates Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.templateId || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-3 text-gray-800">
                {template.templateName}
              </h3>
              <span className="inline-block bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-sm font-medium mb-3">
                {template.genre}
              </span>
              <p className="text-gray-600 mb-6 line-clamp-3">
                {template.description}
              </p>
              <button 
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowViewModal(true);
                }}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Template
              </button>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* No Results Message */}
      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">
            No templates found matching your search.
          </p>
        </motion.div>
      )}

      {/* View Template Modal */}
      <AnimatePresence>
        {showViewModal && selectedTemplate && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
              onClick={() => setShowViewModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-[25%] top-[0%] translate-x-[0%] translate-y-[0%] w-[90%] max-w-4xl bg-white rounded-xl shadow-2xl z-[1001] p-6"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start sticky top-0 bg-white pt-2 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedTemplate.templateName}
                  </h2>
                  <p className="text-gray-600 mt-2">{selectedTemplate.description}</p>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] my-4">
                <div className="prose max-w-none">
                  <div className="bg-gray-50 rounded-lg p-6">
                    {selectedTemplate.structure.chapters.map((chapter, idx) => (
                      <div key={idx} className="mb-8">
                        <h3 className="text-xl font-bold mb-4">{chapter.chapterTitle}</h3>
                        {chapter.scenes.map((scene, sceneIdx) => (
                          <div key={sceneIdx} className="mb-4 pl-4 border-l-2 border-purple-200">
                            <h4 className="text-lg font-medium mb-2">{scene}</h4>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end sticky bottom-0 bg-white pt-4 border-t">
                <button
                  onClick={() => handleCopyContent(selectedTemplate)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copy Template
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Template;
