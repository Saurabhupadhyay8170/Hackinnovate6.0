# StoryMosaic - Collaborative Storytelling Platform

<div align="center">
<!--   <img src="./favicon.ico" alt="StoryMosaic Logo" width="200"/> -->
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.1.0-646cff.svg)](https://vitejs.dev/)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101.svg)](https://socket.io/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8.svg)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-7.8.6-4db33d.svg)](https://www.mongodb.com/)
</div>

## 🎯 Overview

StoryMosaic is a cutting-edge collaborative storytelling platform that combines real-time collaboration with AI-powered writing assistance. Create, collaborate, and bring your stories to life with an intuitive interface and powerful features.

## 🌟 Features

### Real-time Collaboration
- **Live Editing**: Multiple users can edit documents simultaneously
- **Cursor Tracking**: See where others are writing in real-time
- **Presence Indicators**: Know who's currently working on the document
- **Collaborative Rooms**: Create dedicated spaces for different projects

### AI-Powered Writing Assistant
- **Smart Completion**: Get context-aware sentence suggestions
- **Style Matching**: AI adapts to your writing style
- **Template Generation**: Create story outlines instantly
- **Writing Prompts**: Get AI-generated creative prompts

### Rich Text Editing
- **Formatting Tools**: Bold, italic, underline, and more
- **Text Alignment**: Left, center, right, and justify options
- **Lists & Headers**: Organize your content effectively

### Document Management
- **Access Control**: Set specific permissions for editors and viewers
- **Export Options**: Download your stories in PDF format
- **Template Library**: Start with pre-designed templates
- **Auto-Save**: Never lose your work

## 🚀 Tech Stack

### Frontend
- React 19.0.0
- Vite 6.1.0
- TipTap Editor
- Framer Motion
- Tailwind CSS
- Socket.IO Client
- Google Generative AI

### Backend
- Node.js
- Express
- MongoDB
- Socket.IO
- JWT Authentication
- Google's Gemini AI API

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/storymosaic.git
   cd storymosaic
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd Frontend
   npm install

   # Backend
   cd ../Backend
   npm install
   ```

3. **Environment Setup**

   Create `.env` files in both Frontend and Backend directories:

   Frontend `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

   Backend `.env`:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start Development Servers**
   ```bash
   # Backend
   cd Backend
   npm run dev

   # Frontend
   cd Frontend
   npm run dev
   ```

## 📱 Usage

1. **Create an Account**
   - Sign up using Google Authentication
   - Set up your writer profile

2. **Create a Document**
   - Click "Create New Document"
   - Choose a template or start from scratch
   - Set document permissions

3. **Collaborate**
   - Share document link with collaborators
   - See real-time changes
   - Use AI assistance for suggestions

4. **Export**
   - Download as PDF
   - Share with specific access levels

## 🔒 Security Features

- JWT-based authentication
- Secure socket connections
- Role-based access control
- Google OAuth integration

## 🎨 UI/UX Features

- Responsive design for all devices
- Dark/Light mode support
- Smooth animations with Framer Motion
- Intuitive document management
- Real-time collaboration indicators

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 📝 Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add appropriate comments
- Update documentation as needed
- Test thoroughly before submitting PRs

## 🐛 Bug Reports

Please use the GitHub Issues tab to report bugs. Include:
- Detailed description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for AI capabilities
- [Google Cloud Console](https://console.cloud.google.com/) for google authentication
- [Socket.IO](https://socket.io/) for real-time features
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 👨‍💻 Creators

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/vishv0407">
          <img src="https://avatars.githubusercontent.com/u/126045993?v=4" width="100px;" alt="Vishv Boda"/>
          <br />
          <sub><b>Vishv Boda</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/DataWizard1631">
          <img src=https://avatars.githubusercontent.com/u/143613914?v=4" width="100px;" alt="Deep Patel"/>
          <br />
          <sub><b>Deep Patel</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/CodexKnight-ai">
          <img src="https://avatars.githubusercontent.com/u/148789243?v=4" width="100px;" alt="Subrat Jain"/>
          <br />
          <sub><b>Subrat Jain</b></sub>
        </a>
      </td>
    </tr>
  </table>
</div>

---

<div align="center">
  Made with ❤️ by the CodePirates at Hackathon at IIT Gandhinagar
</div>
