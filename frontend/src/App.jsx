import { useEffect, useState } from 'react'
import ImageList from './ImageList'
import ImageSearch from './ImageSearch'

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

  return (
    <div>
      <h1>My Image Collections</h1>
      <p>Save and organize your favorite images.</p>

      <ImageSearch
        collections={collections}
        onImageSaved={() => setImageRefresh(imageRefresh + 1)}
      />

      <button onClick={createCollection}>
        Create Collection
      </button>

{collections.map((collection) => (
  <div key={collection.id}>
    <h2>{collection.name}</h2>

    <button onClick={() => deleteCollection(collection.id)}>
      Delete
    </button>

    <ImageList
      collectionId={collection.id}
      refresh={imageRefresh}
    />

  </div>

))}
    </div>
  )
}

export default App