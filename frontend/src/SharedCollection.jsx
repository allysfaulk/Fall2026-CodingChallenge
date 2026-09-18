import { useEffect, useState } from 'react'

function SharedCollection({ shareId }) {
  const [collection, setCollection] = useState(null)
  const [images, setImages] = useState([])

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/shared/${shareId}`)
      .then((response) => response.json())
      .then((data) => {
        setCollection(data.collection)
        setImages(data.images)
      })
  }, [shareId])

  if (!collection) {
    return <p>Loading collection...</p>
  }

  return (
    <div>
      <h1>{collection.name}</h1>
      <p>Shared Collection</p>

      {images.map((image) => (
        <div key={image.id}>
          <img
            src={image.url}
            alt={image.caption || 'Shared'}
            width="250"
          />

          {image.caption && (
            <p>{image.caption}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default SharedCollection