import { useEffect, useState } from 'react'

function App() {
  const [collections, setCollections] = useState([])

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

  return (
    <div>
      <h1>My Image Collections</h1>
      <p>Save and organize your favorite images.</p>

      <button onClick={createCollection}>
        Create Collection
      </button>

      {collections.map((collection) => (
        <div key={collection.id}>
          <h2>{collection.name}</h2>
        </div>
      ))}
    </div>
  )
}

export default App