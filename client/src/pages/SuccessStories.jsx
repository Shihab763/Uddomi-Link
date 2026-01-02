import { useState, useEffect } from 'react';

const SuccessStories = () => {
    const [stories, setStories] = useState([]);
    const [newStory, setNewStory] = useState({ 
        title: '', summary: '', content: '', featuredUser: '', image: '' 
    });
    
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.roles?.includes('admin');

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/stories', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setStories(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Helper to convert Drive links to Direct Links
    const formatImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
        
        if (url.includes('drive.google.com')) {
            try {
                // Extract ID from /d/ID/ or id=ID
                let id = '';
                const parts = url.split(/\/d\/|id=/);
                if (parts.length > 1) {
                    id = parts[1].split('/')[0];
                }
                
                if (id) {
                    return `https://drive.google.com/uc?export=view&id=${id}`;
                }
            } catch (e) {
                return url;
            }
        }
        return url;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/stories', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}` 
                },
                body: JSON.stringify(newStory)
            });
            
            if (res.ok) {
                alert('Story Created!');
                setNewStory({ title: '', summary: '', content: '', featuredUser: '', image: '' });
                fetchStories();
            } else {
                alert('Failed to create story');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this story?")) return;
        try {
            await fetch(`http://localhost:5000/api/stories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            fetchStories();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 container mx-auto p-6 max-w-6xl">
            <h1 className="text-4xl font-bold text-center mb-2 text-green-800">🌟 Success Stories</h1>
            <p className="text-center text-gray-600 mb-10">Inspiring journeys from our community.</p>

            {isAdmin && (
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-10">
                    <h3 className="font-bold text-red-800 mb-4">🔐 Admin Panel: Add Story</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            className="p-2 border rounded" placeholder="Title" required 
                            value={newStory.title} onChange={e => setNewStory({...newStory, title: e.target.value})}
                        />
                        <input 
                            className="p-2 border rounded" placeholder="Featured Person Name" required 
                            value={newStory.featuredUser} onChange={e => setNewStory({...newStory, featuredUser: e.target.value})}
                        />
                        <input 
                            className="p-2 border rounded" placeholder="Image URL (Drive Link or Direct URL)" required 
                            value={newStory.image} onChange={e => setNewStory({...newStory, image: e.target.value})}
                        />
                        <input 
                            className="p-2 border rounded" placeholder="Short Summary" required 
                            value={newStory.summary} onChange={e => setNewStory({...newStory, summary: e.target.value})}
                        />
                        <textarea 
                            className="p-2 border rounded md:col-span-2" placeholder="Full Content..." required 
                            value={newStory.content} onChange={e => setNewStory({...newStory, content: e.target.value})}
                        />
                        <button type="submit" className="bg-red-700 text-white font-bold py-2 rounded md:col-span-2">
                            Publish Story
                        </button>
                    </form>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {stories.map(story => (
                    <div key={story._id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row relative group">
                        <img 
                            src={formatImageUrl(story.image)} 
                            alt={story.title} 
                            // --- FIX: This attribute helps load Drive images ---
                            referrerPolicy="no-referrer"
                            className="w-full md:w-1/3 object-cover h-48 md:h-auto" 
                            onError={(e) => {e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error'}}
                        />
                        
                        <div className="p-6 flex flex-col justify-center w-full">
                            <h3 className="text-xl font-bold mb-2">{story.title}</h3>
                            <p className="text-sm text-green-700 font-bold mb-3">Feat. {story.featuredUser}</p>
                            <p className="text-gray-600 italic mb-2">"{story.summary}"</p>
                            <div className="text-sm text-gray-500 line-clamp-3">
                                {story.content}
                            </div>
                            
                            {isAdmin && (
                                <button 
                                    onClick={() => handleDelete(story._id)}
                                    className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuccessStories;