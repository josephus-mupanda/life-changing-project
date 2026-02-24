import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// Import CSS globally if possible, or rely on index.html to load them? 
// Since we are moving to React, it's better to import them if they are standard CSS.
// However, the existing index.html has them as links. 
// If we replace the body of index.html with <div id="root"></div>, the links in <head> usually remain valid!

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
