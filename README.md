# iSpora - Diaspora Community Platform

A comprehensive platform connecting diaspora communities through mentorship, collaboration, and shared initiatives.

## 🚀 Features

- **User Authentication & Profiles**
- **Mentorship Programs**
- **Project Management**
- **Community Networking**
- **Real-time Collaboration**
- **Resource Sharing**

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🚀 Deployment

This project is automatically deployed to Namecheap hosting via GitHub Actions when changes are pushed to the main branch.

### Deployment Process:
1. Push changes to GitHub
2. GitHub Actions builds the application
3. Built files are automatically deployed to Namecheap hosting
4. Website is live at [ispora.app](https://ispora.app)

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url_here
```

## 📁 Project Structure

```
iSpora-frontend/
├── components/          # React components
├── public/             # Static assets
├── styles/            # Global styles
├── utils/             # Utility functions
├── .github/           # GitHub Actions
└── dist/             # Production build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.