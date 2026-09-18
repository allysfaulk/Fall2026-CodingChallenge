import { useEffect, useState } from 'react'

function ImageList({ collectionId, refresh }) {
  const [images, setImages] = useState([])

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/collections/${collectionId}/images`)
      .then((response) => response.json())
      .then((data) => {
        setImages(data)
      })
  }, [collectionId, refresh])

  function addImage() {
    const url = prompt('Paste an image URL:')

    if (!url) {
      return
    }

    fetch(`http://127.0.0.1:5000/collections/${collectionId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url })
    })
      .then((response) => response.json())
      .then((newImage) => {
        setImages([...images, newImage])
      })
  }

  function deleteImage(id) {
    const confirmed = window.confirm(
        'Delete this image?'
    )

    if (!confirmed) {
        return
}
  
    fetch(`http://127.0.0.1:5000/images/${id}`, {
    method: 'DELETE'
  })
    .then(() => {
      setImages(
        images.filter((image) => image.id !== id)
      )
    })
}

function editCaption(image) {
  const caption = prompt(
    'Enter a caption:',
    image.caption || ''
  )

  if (caption === null) {
    return
  }

  fetch(`http://127.0.0.1:5000/images/${image.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ caption: caption })
  })
    .then((response) => response.json())
    .then(() => {
      setImages(
        images.map((currentImage) =>
          currentImage.id === image.id
            ? { ...currentImage, caption: caption }
            : currentImage
        )
      )
    })
}

  return (
  <div className="image-list">
    <button className="add-image-button" onClick={addImage}>
      + Add Image
    </button>

    <div className="saved-images-grid">
      {images.map((image) => (
        <div className="saved-image-card" key={image.id}>
          <img
            src={image.url}
            alt={image.caption || 'Saved'}
          />

          <div className="image-info">
            {image.caption && (
              <p>{image.caption}</p>
            )}

            <div className="image-actions">
              <button onClick={() => editCaption(image)}>
                Edit Caption
              </button>

              <button onClick={() => deleteImage(image.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)
}

export default ImageList