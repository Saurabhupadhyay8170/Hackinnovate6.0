import React, { useState, useEffect } from 'react';
import templates from '../utils/StoryTemp.json';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { GoogleGenerativeAI } from '@google/generative-ai';

function Template() {
  const navigate = useNavigate();
  const [searchPrompt, setSearchPrompt] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="container mx-auto p-6">
      {/* Search Section */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchPrompt}
            onChange={(e) => setSearchPrompt(e.target.value)}
            placeholder="Enter your story idea..."
            className="flex-1 p-2 border rounded"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Generate Template
          </button>
        </form>
      </div>

      {/* Generated Templates */}
      {templates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Saved Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div 
                key={template.templateId}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold mb-2">{template.templateName}</h3>
                <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm mb-2">
                  {template.genre}
                </span>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <button 
                  onClick={() => handleUseTemplate(template)}
                  className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 transition-colors"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premade Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template, index) => (
          <div 
            key={index}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">{template.templateName}</h3>
            <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm mb-2">
              {template.genre}
            </span>
            <p className="text-gray-600 mb-4">{template.description}</p>
            <button 
              onClick={() => handleUseTemplate(template)}
              className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 transition-colors"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Template
