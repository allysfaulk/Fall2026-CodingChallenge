import { useState } from 'react'

function ImageSearch( {collections, onImageSaved}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [page, setPage] = useState(1)

function searchImages() {
  if (!query.trim()) {
    return
  }

  fetch(
    `http://127.0.0.1:5000/search?q=${encodeURIComponent(query)}&page=1`
  )
    .then((response) => response.json())
    .then((data) => {
      setResults(data)
      setPage(1)
      setHasSearched(true)
    })
}

function loadMore() {
  const nextPage = page + 1

  fetch(
    `http://127.0.0.1:5000/search?q=${encodeURIComponent(query)}&page=${nextPage}`
  )
    .then((response) => response.json())
    .then((data) => {
      setResults([...results, ...data])
      setPage(nextPage)
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
        onImageSaved()
        alert('Image saved!')
    })
}

  return (
  <div className="image-search">
    <h2>Discover Images</h2>
    <p>Search Pixabay and save your favorites to a collection.</p>

    <div className="search-bar">
      <input
        type="text"
        placeholder="Try cats, mountains, architecture..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            searchImages()
          }
        }}
      />

      <button className="primary-button" onClick={searchImages}>
        Search
      </button>
    </div>

    <div className="search-results">
      {results.map((image) => (
        <div className="search-result-card" key={image.id}>
          <img
            src={image.preview}
            alt={image.tags}
          />

          <select
            defaultValue=""
            onChange={(event) => {
              saveImage(image.url, event.target.value)
              event.target.value = ""
            }}
          >
            <option value="" disabled>
              Save to collection...
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

    {results.length > 0 && (
        <div className="load-more-container">
            <button className="load-more-button" onClick={loadMore}>
                load more items ✿
            </button>
        </div>
    )}

    {hasSearched && results.length === 0 && (
        <p className="no-results">
            No images found. Try a different search.
        </p>
    )}
  </div>
)
}

export default ImageSearch