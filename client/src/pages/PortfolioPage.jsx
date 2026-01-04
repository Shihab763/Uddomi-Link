import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PortfolioPage = () => {
  const [searchParams] = useSearchParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  

  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  
  const user = JSON.parse(localStorage.getItem('user'));
  const urlUserId = searchParams.get('userId'); 

  const targetUserId = urlUserId || user?._id;
  

  const isOwner = user && (user._id === targetUserId);

  const navigate = useNavigate();

  useEffect(() => {
    if (!targetUserId) {
        
        navigate('/login');
        return;
    }
    fetchPortfolio();
  }, [targetUserId]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/portfolios/${targetUserId}`);
      const data = await res.json();
      setPortfolio(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Showcase...</div>;


  
  const EditProfileModal = () => {
    const [formData, setFormData] = useState({
        bio: portfolio?.bio || '',
        experienceYears: portfolio?.experienceYears || 0,
        skills: portfolio?.skills?.join(', ') || '',
        videoIntro: portfolio?.videoIntro || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/portfolios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...formData,
                    skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
                })
            });
            const updated = await res.json();
            setPortfolio({ ...portfolio, ...updated });
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Edit Portfolio Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold">Bio</label>
                        <textarea 
                            className="w-full border p-2 rounded"
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">Years of Experience</label>
                        <input 
                            type="number" 
                            className="w-full border p-2 rounded"
                            value={formData.experienceYears}
                            onChange={e => setFormData({...formData, experienceYears: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">Skills (comma separated)</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded"
                            placeholder="Woodworking, Pottery, Painting"
                            value={formData.skills}
                            onChange={e => setFormData({...formData, skills: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-black text-white rounded">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  const AddProjectModal = () => {
    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        tags: ''
    });

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/portfolios/project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...projectData,
                    tags: projectData.tags.split(',').map(t => t.trim())
                })
            });
            const updated = await res.json();
            setPortfolio(updated);
            setShowProjectModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Add New Project</h2>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold">Project Title</label>
                        <input 
                            className="w-full border p-2 rounded"
                            value={projectData.title}
                            onChange={e => setProjectData({...projectData, title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">Description</label>
                        <textarea 
                            className="w-full border p-2 rounded"
                            value={projectData.description}
                            onChange={e => setProjectData({...projectData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">Image URL</label>
                        <input 
                            className="w-full border p-2 rounded"
                            placeholder="http://..."
                            value={projectData.imageUrl}
                            onChange={e => setProjectData({...projectData, imageUrl: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">Tags (comma separated)</label>
                        <input 
                            className="w-full border p-2 rounded"
                            placeholder="Chair, Restoration, Oak"
                            value={projectData.tags}
                            onChange={e => setProjectData({...projectData, tags: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      {/* --- HERO SECTION --- */}
      <div className="relative h-96 bg-gray-900 text-white">
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-6 h-full flex flex-col justify-center items-center text-center relative z-10">
          
          <img 
            src={portfolio?.userId?.profile?.profilePicture || "https://via.placeholder.com/150"} 
            className="w-32 h-32 rounded-full border-4 border-yellow-500 shadow-xl mb-4 object-cover"
          />
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            {portfolio?.userId?.name}'s Portfolio
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl font-light">
            {portfolio?.bio || "A collection of my finest work and creative journey."}
          </p>

          <div className="mt-6 flex gap-4">
            {portfolio?.experienceYears > 0 && (
                <span className="bg-yellow-500 text-black px-4 py-1 rounded-full font-bold text-sm">
                    {portfolio.experienceYears}+ Years Exp.
                </span>
            )}
            {portfolio?.skills?.map((skill, i) => (
                <span key={i} className="bg-gray-700 px-3 py-1 rounded-full text-sm border border-gray-600">
                    {skill}
                </span>
            ))}
          </div>

          {/* Edit Button for Owner */}
          {isOwner && (
            <button 
                onClick={() => setShowEditModal(true)}
                className="mt-6 bg-white text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2"
            >
              ✏️ Edit Portfolio
            </button>
          )}
        </div>
      </div>

      {/* --- CONTENT TABS --- */}
      <div className="sticky top-0 bg-white shadow-sm z-20">
        <div className="container mx-auto flex justify-center gap-8 py-4">
            <button 
                onClick={() => setActiveTab('projects')}
                className={`text-lg font-bold pb-2 border-b-4 transition ${activeTab === 'projects' ? 'border-yellow-500 text-black' : 'border-transparent text-gray-500'}`}
            >
                🎨 Project Gallery
            </button>
            <button 
                onClick={() => setActiveTab('awards')}
                className={`text-lg font-bold pb-2 border-b-4 transition ${activeTab === 'awards' ? 'border-yellow-500 text-black' : 'border-transparent text-gray-500'}`}
            >
                🏆 Awards & Recognition
            </button>
        </div>
      </div>

      {/* --- MAIN DISPLAY --- */}
      <div className="container mx-auto px-6 py-12">
        
        {/* PROJECTS GRID */}
        {activeTab === 'projects' && (
            <div>
                {isOwner && (
                    <div className="mb-8 text-center">
                        <button 
                            onClick={() => setShowProjectModal(true)}
                            className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 shadow-lg"
                        >
                            + Add New Project
                        </button>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {portfolio?.projects?.length > 0 ? (
                        portfolio.projects.map((project) => (
                            <div key={project._id} className="group relative overflow-hidden rounded-xl shadow-lg bg-gray-50">
                                <div className="h-64 overflow-hidden">
                                    <img 
                                        src={project.imageUrl} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{project.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags?.map(tag => (
                                            <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <p className="text-xl">No projects showcased yet.</p>
                            {isOwner && <p className="mt-2">Click "+ Add New Project" above to start building your gallery!</p>}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* AWARDS SECTION */}
        {activeTab === 'awards' && (
            <div className="max-w-3xl mx-auto space-y-6">
                {portfolio?.awards?.map((award, i) => (
                    <div key={i} className="flex items-center gap-6 bg-white p-6 rounded-lg shadow border border-gray-100">
                        <div className="bg-yellow-100 text-yellow-600 w-16 h-16 rounded-full flex items-center justify-center text-3xl">
                            🏆
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{award.title}</h3>
                            <p className="text-gray-600">{award.issuer} • {award.year}</p>
                        </div>
                    </div>
                ))}
                {(!portfolio?.awards || portfolio.awards.length === 0) && (
                    <p className="text-center text-gray-500 py-10">No awards listed yet.</p>
                )}
            </div>
        )}
      </div>
      
      {/* Call to Action for Visitors */}
      {!isOwner && (
        <div className="bg-yellow-50 py-12 text-center mt-12">
            <h2 className="text-2xl font-bold mb-4">Impressed by {portfolio?.userId?.name}?</h2>
            <div className="flex justify-center gap-4">
                <button 
                    onClick={() => navigate(`/profile/${portfolio?.userId?._id}`)}
                    className="bg-white border border-gray-300 text-gray-800 px-8 py-3 rounded-lg font-bold hover:bg-gray-50"
                >
                    View Profile & Products
                </button>
                <button 
                    onClick={() => navigate(`/create-custom-order?sellerId=${portfolio?.userId?._id}`)}
                    className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 shadow-lg"
                >
                    Request Custom Project
                </button>
            </div>
        </div>
      )}

      {/* RENDER MODALS */}
      {showEditModal && <EditProfileModal />}
      {showProjectModal && <AddProjectModal />}
    </div>
  );
};

export default PortfolioPage;
