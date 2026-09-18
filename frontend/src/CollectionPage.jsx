import { useEffect, useState } from 'react'
import ImageList from './ImageList'

function CollectionPage({ collectionId }) {
    const [collection, setCollection] = useState(null)

    useEffect(() => {
        fetch('http://127.0.0.1:5000/collections')
            .then((response) => response.json())
            .then((collections) => {

                // find the collection matching the ID encoded in the current URL
                const foundCollection = collections.find(
                    (collection) => collection.id === Number(collectionId)
                )

                setCollection(foundCollection)
            })
    }, [collectionId])

    if (!collection) {
        return <p>Loading collection...</p>
    }

    return (
        <div className="app">
            <a className="back-link" href="/">
                ← back to my collections ✿
            </a>

            <div className="collection-page-header">
                <div>
                    <h1>{collection.name}</h1>
                    <p>Your saved images</p>
                </div>
            </div>

            <ImageList collectionId={collection.id} />
        </div>
    )
}

export default CollectionPage