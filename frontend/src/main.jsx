import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SharedCollection from './SharedCollection.jsx'
import CollectionPage from './CollectionPage.jsx'

const path = window.location.pathname

const shareMatch = path.match(/^\/share\/(.+)$/)
const collectionMatch = path.match(/^\/collection\/(\d+)$/)

let page

if (shareMatch) {
  page = <SharedCollection shareId={shareMatch[1]} />
} else if (collectionMatch) {
  page = <CollectionPage collectionId={collectionMatch[1]} />
} else {
  page = <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
