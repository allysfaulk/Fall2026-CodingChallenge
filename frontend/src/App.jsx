import { useEffect, useState } from 'react'
import ImageList from './ImageList'
import ImageSearch from './ImageSearch'
import './App.css'

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
            <div className="collection-card" key={collection.id}>
              <div className="collection-header">
                <h3>{collection.name}</h3>

                <div className="collection-actions">
                  <a
                    className="button-link"
                    href={`/collection/${collection.id}`}
                  >
                    Open
                  </a>  

                  <button onClick={() => shareCollection(collection.id)}>
                    Share
                  </button>

                  <button onClick={() => deleteCollection(collection.id)}>
                    Delete
                  </button>
                </div>
              </div>

              <ImageList
                collectionId={collection.id}
                refresh={imageRefresh}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  </div>
)
}

export default App