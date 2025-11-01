import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/ui/toaster';

// Import your existing components
import HomePage from './pages/HomePage';
import CreateProject from './components/CreateProject';
// Add other imports as needed

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-project" element={<CreateProject />} />
            {/* Add other routes as needed */}
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
