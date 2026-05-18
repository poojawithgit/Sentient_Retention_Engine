import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './router';

function App() {
  return (
    <Router>
      <div className="app-container">
        <AppRouter />
      </div>
    </Router>
  );
}

export default App;
