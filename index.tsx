import React from 'react'; // React is needed for JSX
import ReactDOM from 'react-dom/client'; // For rendering the app
import App from './App'; // Import the App component

// Create a root element from the DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  // Render the App component wrapped in React.StrictMode for highlighting potential issues
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} 