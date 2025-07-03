import useStore from "@/hooks/useStore";
import { useEffect } from "react";
import { useParams } from "react-router-dom"

const Post = () => {
    const { id } = useParams();
    const { currentPost, loading, error, fetchPostById } = useStore(state => state);

    useEffect(() => {
       if (id) fetchPostById(id); //if statement is needed
    }, [id]);

    if (loading) return <p className="text-center">Loading ...</p>
    if (error) return <p className="text-red-500 text-center">An error has occured {error}</p>
    if (!currentPost) return <p className="text-red-500 text-center">Post Not Found</p>

    return (
        <div className="max-w-3x1 mx-auto p-4 bg-white dark:bg-gray-900 shadow">
            <img src={currentPost.imageUrl} alt="Post" className="w-full h-auto mb-4"/>

            <h2 className="text-xl mb-2">{currentPost.caption}</h2>
            <p className="text-sm mb-4">
                {currentPost.comments?.length || 0} Comments
            </p>
        </div>
    )
}

export { Post };