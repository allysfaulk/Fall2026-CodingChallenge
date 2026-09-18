import { useEffect, useState } from 'react'
import ImageSearch from './ImageSearch'
import './App.css'
import CollectionCard from './CollectionCard'

function App() {
  const [collections, setCollections] = useState([])
  const [imageRefresh, setImageRefresh] = useState(0)

  useEffect(() => {
    fetch('http://127.0.0.1:5000/collections')
      .then((response) => response.json())
      .then((data) => {
        setCollections(data)
      })
  }, [])

  function createCollection() {
  const name = prompt('Enter a collection name:')

  if (!name) {
    return
  }

  fetch('http://127.0.0.1:5000/collections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: name })
  })
    .then((response) => response.json())
    .then((newCollection) => {
      setCollections([...collections, newCollection])
    })
}

function deleteCollection(id) {
  fetch(`http://127.0.0.1:5000/collections/${id}`, {
    method: 'DELETE'
  })
    .then(() => {
      setCollections(
        collections.filter((collection) => collection.id !== id)
      )
    })
}

function shareCollection(id) {
  fetch(`http://127.0.0.1:5000/collections/${id}/share`, {
    method: 'POST'
  })
    .then((response) => response.json())
    .then((data) => {
      const shareUrl =
        `${window.location.origin}/share/${data.share_id}`

      prompt('Copy this share link:', shareUrl)
    })
}

  return (
  <div className="app">
    <header className="header">
      <div>
        <h1>My Image Collections</h1>
        <p>Discover, save, and organize images you love.</p>
      </div>

      <button className="primary-button" onClick={createCollection}>
        + New Collection
      </button>
    </header>

    <main>
      <section className="search-section">
        <ImageSearch
          collections={collections}
          onImageSaved={() => setImageRefresh(imageRefresh + 1)}
        />
      </section>

      <section className="collections-section">
        <h2>Your Collections</h2>

        <div className="collections-grid">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onShare={shareCollection}
              onDelete={deleteCollection}
            />
          ))}
        </div>
      </section>
    </main>
  </div>
)
}

export default App