import { useEffect, useState } from 'react'

function SharedCollection({ shareId }) {
    const [collection, setCollection] = useState(null)
    const [images, setImages] = useState([])
    const [error, setError] = useState('')

    // load a collection by its public share ID rather than its internal database ID
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/shared/${shareId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Collection not found')
                }
                return response.json()
            })
            .then((data) => {
                setCollection(data.collection)
                setImages(data.images)
            })
            .catch(() => {
                setError('This shared collection could not be found.')
            })
    }, [shareId])

    // invalid or revoked share links get a friendly error page instead of hanging    
    if (error) {
        return (
            <div className="app">
                <div className="not-found-note">
                    <h1>Collection not found</h1>
                    <p>{error}</p>
                    <a className="button-link" href="/">
                        Back Home
                    </a>
                </div>
            </div>
        )
    }

    if (!collection) {
        return <p>Loading collection...</p>
    }

    return (
        <div className="app">
            <header className="shared-header">
                <div>
                    <p className="shared-label">Shared Collection</p>
                    <h1>{collection.name}</h1>
                    <p className="shared-description">
                        A collection of saved images shared with you.
                    </p>
                </div>

                <a className="button-link" href="/">
                    View My Collections
                </a>
            </header>

            {images.length === 0 ? (
                <div className="empty-state">
                    <h2>No images yet</h2>
                    <p>This collection doesn't contain any images.</p>
                </div>
            ) : (
                <div className="shared-images-grid">
                    {images.map((image) => (
                        <div className="shared-image-card" key={image.id}>
                            <img
                                src={image.url}
                                alt={image.caption || 'Shared'}
                            />

                            {image.caption && (
                                <div className="shared-image-info">
                                    <p>{image.caption}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SharedCollection