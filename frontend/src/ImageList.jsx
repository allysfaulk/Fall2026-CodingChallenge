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
  fetch(`http://127.0.0.1:5000/images/${id}`, {
    method: 'DELETE'
  })
    .then(() => {
      setImages(
        images.filter((image) => image.id !== id)
      )
    })
}

  return (
    <div>
      <button onClick={addImage}>
        Add Image
      </button>

      {images.map((image) => (
        <div key={image.id}>
          <img
            src={image.url}
            alt="Saved"
            width="200"
          />

          <button onClick={() => deleteImage(image.id)}>
            Delete Image
        </button>

        </div>
     ))}
    </div>
  )
}

export default ImageList