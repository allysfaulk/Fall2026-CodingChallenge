import { useState } from 'react'

function ImageSearch( {collections}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  function searchImages() {
    if (!query) {
      return
    }

    fetch(`http://127.0.0.1:5000/search?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        setResults(data)
      })
  }

  function saveImage(imageUrl, collectionId) {
  if (!collectionId) {
    return
  }

  fetch(`http://127.0.0.1:5000/collections/${collectionId}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: imageUrl })
  })
    .then((response) => response.json())
    .then(() => {
      alert('Image saved!')
    })
}

  return (
    <div>
      <h2>Search Images</h2>

      <input
        type="text"
        placeholder="Search for images..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <button onClick={searchImages}>
        Search
      </button>

      <div>
        {results.map((image) => (
  <div key={image.id}>
    <img
      src={image.preview}
      alt={image.tags}
      width="150"
    />

    <select
      defaultValue=""
      onChange={(event) => {
        saveImage(image.url, event.target.value)
        event.target.value = ""
      }}
    >
      <option value="" disabled>
        Save to...
      </option>

      {collections.map((collection) => (
        <option
          key={collection.id}
          value={collection.id}
        >
          {collection.name}
        </option>
      ))}
    </select>
  </div>
))}
      </div>
    </div>
  )
}

export default ImageSearch