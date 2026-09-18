import { useEffect, useState } from 'react'

function CollectionCard({ collection, onShare, onUnshare, onDelete, refresh }) {
    const [images, setImages] = useState([])

    // reload the preview whenever this collection changes or another image is saved
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/collections/${collection.id}/images`)
            .then((response) => response.json())
            .then((data) => {
                setImages(data)
            })
    }, [collection.id, refresh])

    // use the first saved image as the collection's cover preview
    const previewImage = images[0]
    // a collection is public whenever it has an active share ID
    const isPublic = Boolean(collection.share_id)

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
                        {' · '}
                        <span className={isPublic ? 'badge-public' : 'badge-private'}>
                            {isPublic ? 'Public' : 'Private'}
                        </span>
                    </p>
                </div>

                <div className="collection-actions">
                    <a
                        className="button-link"
                        href={`/collection/${collection.id}`}
                    >
                        Open
                    </a>

                    {isPublic ? (
                        <button onClick={() => onUnshare(collection.id)}>
                            Make Private
                        </button>
                    ) : (
                        <button onClick={() => onShare(collection.id)}>
                            Share
                        </button>
                    )}

                    <button onClick={() => onDelete(collection.id)}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CollectionCard