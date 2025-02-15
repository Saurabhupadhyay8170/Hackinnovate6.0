import React, { useState } from 'react';
import templates from '../utils/StoryTemp.json';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Template() {
  const navigate = useNavigate();
  const [searchPrompt, setSearchPrompt] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    // TODO: Implement RAG + LLM search functionality
    console.log('Searching for:', searchPrompt);
  };

  const handleUseTemplate = async (template) => {
    try {
      // Create a new document with the template content
      const formattedContent = `
        <h1>${template.structure.title}</h1>
        ${template.structure.chapters.map(chapter => `
          <h2>${chapter.chapterTitle}</h2>
          ${chapter.scenes.map(scene => `
            <h3>${scene}</h3>
            <p></p>
          `).join('')}
        `).join('')}
      `;

      const response = await api.post('/api/documents', {
        title: template.structure.title,
        content: formattedContent,
        template: template.templateName
      });

      // Navigate to the text editor with the new document ID
      navigate(`/document/d/${response.data._id}`);
    } catch (error) {
      console.error('Error creating document from template:', error);
      // Handle error (you might want to show a notification)
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

      {/* Premade Templates Grid */}
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
