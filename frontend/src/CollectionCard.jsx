import { useEffect, useState } from 'react'

function CollectionCard({ collection, onShare, onDelete }) {
  const [images, setImages] = useState([])

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/collections/${collection.id}/images`)
      .then((response) => response.json())
      .then((data) => {
        setImages(data)
      })
  }, [collection.id])

  const previewImage = images[0]

  return (
    <div className="collection-preview-card">
      <a
        className="collection-preview-image"
        href={`/collection/${collection.id}`}
      >
        {previewImage ? (
          <img
            src={previewImage.url}
            alt={previewImage.caption || collection.name}
          />
        ) : (
          <div className="no-preview">
            No images yet
          </div>
        )}
      </a>

      <div className="collection-preview-info">
        <div>
          <h3>{collection.name}</h3>
          <p>
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </p>
        </div>

        <div className="collection-actions">
          <a
            className="button-link"
            href={`/collection/${collection.id}`}
          >
            Open
          </a>

          <button onClick={() => onShare(collection.id)}>
            Share
          </button>

          <button onClick={() => onDelete(collection.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default CollectionCard