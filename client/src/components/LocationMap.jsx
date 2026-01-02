import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

const LocationMap = () => {
    const [users, setUsers] = useState([]);
    const [myLocation, setMyLocation] = useState({ lat: 23.8103, lng: 90.4125 }); // Default: Dhaka
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setMyLocation({ lat: latitude, lng: longitude });
                fetchNearbyUsers(latitude, longitude);
            },
            (error) => {
                console.error("Error getting location:", error);
                
                fetchNearbyUsers(23.8103, 90.4125);
            }
        );
    }, []);

    const fetchNearbyUsers = async (lat, lng) => {
        try {
        
            const res = await fetch(`http://localhost:5000/api/locationMap?lat=${lat}&lng=${lng}&dist=5000`);
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Failed to fetch map data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 relative z-0">
            {loading && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[1000]">
                    <p className="text-gray-500 animate-pulse">Locating nearby talent...</p>
                </div>
            )}
            
            <MapContainer center={[myLocation.lat, myLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={[myLocation.lat, myLocation.lng]} />
                
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

            
                <Marker position={[myLocation.lat, myLocation.lng]}>
                    <Popup>
                        <div className="font-bold">You are here</div>
                    </Popup>
                </Marker>

                
                {users.map((user) => (
                    user.location && user.location.coordinates && (
                        <Marker 
                            key={user._id} 
                            position={[user.location.coordinates[1], user.location.coordinates[0]]} // [Lat, Lng]
                        >
                            <Popup>
                                <div className="min-w-[150px]">
                                    <h3 className="font-bold text-green-700">{user.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase">{user.roles[0]}</p>
                                    <p className="text-sm my-1">{user.businessInfo?.type || 'Creative'}</p>
                                    <a href={`/profile/${user._id}`} className="text-blue-500 text-xs hover:underline">
                                        View Profile
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default LocationMap;