import { useState, useEffect } from 'react';

const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
    const [commentText, setCommentText] = useState({});
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => { fetchPosts(); }, []);

    const fetchPosts = async () => {
        const res = await fetch('http://localhost:5000/api/forum', {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setPosts(data);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/forum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
            body: JSON.stringify(newPost)
        });
        setNewPost({ title: '', content: '', category: 'General' });
        fetchPosts();
    };

    const handleLike = async (postId) => {
        await fetch(`http://localhost:5000/api/forum/${postId}/like`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        fetchPosts();
    };

    const handleComment = async (postId) => {
        if (!commentText[postId]) return;
        await fetch(`http://localhost:5000/api/forum/${postId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
            body: JSON.stringify({ text: commentText[postId] })
        });
        setCommentText({ ...commentText, [postId]: '' });
        fetchPosts();
    };

    return (
        <div className="min-h-screen bg-gray-50 container mx-auto p-6 max-w-5xl">
            {/* REMOVED: <Navbar /> */}
            <h1 className="text-3xl font-bold mb-6 text-blue-800">💬 Community Forum</h1>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="font-bold text-lg mb-4">Start a Discussion</h2>
                <form onSubmit={handleCreatePost} className="space-y-4">
                    <input type="text" placeholder="Title" className="w-full p-2 border rounded" required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
                    <textarea placeholder="What's on your mind?" className="w-full p-2 border rounded" required value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} />
                    <select className="p-2 border rounded" value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})}>
                        <option>General</option><option>Tips</option><option>Help</option><option>Showcase</option>
                    </select>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Post</button>
                </form>
            </div>
            <div className="space-y-6">
                {posts.map(post => (
                    <div key={post._id} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{post.title}</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{post.category}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Posted by {post.author.name}</p>
                        <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-4 mb-4 border-b pb-4">
                            <button onClick={() => handleLike(post._id)} className="text-red-500 flex items-center gap-1">❤️ {post.likes.length}</button>
                            <span className="text-gray-500">💬 {post.comments.length} comments</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            {post.comments.map((comment, index) => (
                                <div key={index} className="mb-2 text-sm"><span className="font-bold">{comment.userName}: </span>{comment.text}</div>
                            ))}
                            <div className="flex gap-2 mt-3">
                                <input type="text" placeholder="Write a comment..." className="flex-1 p-2 border rounded text-sm" value={commentText[post._id] || ''} onChange={e => setCommentText({...commentText, [post._id]: e.target.value})} />
                                <button onClick={() => handleComment(post._id)} className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">Send</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Forum;