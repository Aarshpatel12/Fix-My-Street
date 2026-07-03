// Initialize Map
// Using London coordinates as default if geolocation is not available
const defaultLat = 51.505;
const defaultLng = -0.09;
const map = L.map('map').setView([defaultLat, defaultLng], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Try to get user's actual location and watch it in real-time
let userMarker = null;
let userCircle = null;

if ("geolocation" in navigator) {
    // Initial centering
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        map.setView([lat, lng], 15);
    });

    // Real-time tracking
    navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            if (userMarker) {
                map.removeLayer(userMarker);
            }
            if (userCircle) {
                map.removeLayer(userCircle);
            }

            // Add a pulse/accuracy circle around it
            userCircle = L.circle([lat, lng], {
                radius: accuracy,
                fillColor: "#3b82f6",
                color: "#3b82f6",
                weight: 1,
                opacity: 0.3,
                fillOpacity: 0.15
            }).addTo(map);

            // Create a distinct blue circle marker for the user
            userMarker = L.circleMarker([lat, lng], {
                radius: 8,
                fillColor: "#3b82f6",
                color: "#ffffff",
                weight: 2,
                opacity: 1,
                fillOpacity: 1
            }).addTo(map);

            userMarker.bindPopup("<b>Your Live Location</b>");
        },
        (error) => {
            console.error("Error getting live location:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        }
    );
}

// Marker Icons for different statuses
const iconBaseConfig = {
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
};

const redIcon = new L.Icon({
    ...iconBaseConfig,
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
});

const yellowIcon = new L.Icon({
    ...iconBaseConfig,
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png'
});

const greenIcon = new L.Icon({
    ...iconBaseConfig,
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
});

function getIconByStatus(status) {
    switch(status) {
        case 'New': return redIcon;
        case 'In Progress': return yellowIcon;
        case 'Fixed': return greenIcon;
        default: return redIcon;
    }
}

// Load existing issues from Database
async function loadIssues() {
    try {
        const response = await fetch('/api/issues');
        const issues = await response.json();
        
        issues.forEach(issue => {
            const marker = L.marker([issue.lat, issue.lng], {
                icon: getIconByStatus(issue.status)
            }).addTo(map);
            
            const photoHtml = issue.photoUrl ? `<img src="${issue.photoUrl}" alt="Issue Photo">` : '';

            const popupContent = `
                <div class="popup-container">
                    <div class="popup-header" style="background: ${issue.status === 'New' ? 'var(--danger)' : issue.status === 'In Progress' ? 'var(--warning)' : 'var(--success)'}">
                        <h3>${issue.type}</h3>
                    </div>
                    <div class="popup-body">
                        ${photoHtml}
                        <p><strong>Description:</strong> ${issue.description}</p>
                        <p><strong>Status:</strong> ${issue.status}</p>
                        <p><strong>Reported:</strong> ${new Date(issue.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent, {
                minWidth: 250,
                maxWidth: 300,
            });
        });
    } catch (err) {
        console.error("Error loading issues:", err);
    }
}

// Call on load
loadIssues();

// Variable to store the temporary marker when user clicks
let tempMarker = null;

// Map click event
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Remove existing temp marker if it exists
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }

    // Create a new marker at the clicked location (use default blue icon for temp)
    tempMarker = L.marker([lat, lng]).addTo(map);

    // Create the popup content (Form)
    const popupContent = `
        <div class="popup-container">
            <div class="popup-header">
                <h3>Report an Issue</h3>
            </div>
            <div class="popup-body">
                <form id="issueForm" onsubmit="submitIssue(event, ${lat}, ${lng})">
                    <div class="form-group">
                        <label for="issueType">Type of Issue</label>
                        <select id="issueType" class="form-control" required>
                            <option value="" disabled selected>Select an issue...</option>
                            <option value="Pothole">Pothole</option>
                            <option value="Broken Street Light">Broken Street Light</option>
                            <option value="Water Leak">Water Leak</option>
                            <option value="Garbage Dump">Garbage Dump</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="description">Brief Description</label>
                        <textarea id="description" class="form-control" placeholder="Describe the problem here..." required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Photo (Optional)</label>
                        <div class="file-upload-wrapper">
                            <div class="btn-upload">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <span>Upload Image</span>
                            </div>
                            <input type="file" id="photoInput" accept="image/*" onchange="previewImage(event)">
                        </div>
                        <img id="imagePreview" class="image-preview" alt="Preview">
                        <input type="hidden" id="photoBase64" value="">
                    </div>

                    <!-- Hidden status field -->
                    <input type="hidden" id="status" value="New">
                    
                    <button type="submit" class="btn-primary">Submit Report</button>
                </form>
            </div>
        </div>
    `;

    // Bind popup to marker and open it
    tempMarker.bindPopup(popupContent, {
        closeButton: true,
        minWidth: 300,
        maxWidth: 300,
        offset: [0, -10]
    }).openPopup();
});

// Remove temp marker when popup is closed
map.on('popupclose', function(e) {
    if (tempMarker && e.popup._source === tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
});

// Handle image preview and base64 conversion with compression
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Compress image using canvas
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400; // Resize to a max width of 400px
                
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get compressed base64 string (JPEG, 70% quality)
                const base64String = canvas.toDataURL('image/jpeg', 0.7);
                
                document.getElementById('imagePreview').src = base64String;
                document.getElementById('imagePreview').style.display = 'block';
                document.getElementById('photoBase64').value = base64String;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Handle form submission and POST to backend
async function submitIssue(event, lat, lng) {
    event.preventDefault();
    
    const type = document.getElementById('issueType').value;
    const description = document.getElementById('description').value;
    const status = document.getElementById('status').value;
    const photoUrl = document.getElementById('photoBase64').value; // Get the base64 string

    const issueData = {
        lat: lat,
        lng: lng,
        type: type,
        description: description,
        status: status,
        photoUrl: photoUrl
    };

    try {
        const response = await fetch('/api/issues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(issueData)
        });

        if (response.ok) {
            const newIssue = await response.json();
            
            // Create permanent marker for the new issue
            const marker = L.marker([newIssue.lat, newIssue.lng], {
                icon: getIconByStatus(newIssue.status)
            }).addTo(map);
            
            const photoHtml = newIssue.photoUrl ? `<img src="${newIssue.photoUrl}" alt="Issue Photo">` : '';

            const savedPopupContent = `
                <div class="popup-container">
                    <div class="popup-header" style="background: var(--danger)">
                        <h3>${newIssue.type}</h3>
                    </div>
                    <div class="popup-body">
                        ${photoHtml}
                        <p><strong>Description:</strong> ${newIssue.description}</p>
                        <p><strong>Status:</strong> ${newIssue.status}</p>
                        <p><strong>Reported:</strong> ${new Date(newIssue.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
            
            marker.bindPopup(savedPopupContent, {
                minWidth: 250,
                maxWidth: 300,
            });

            // Close form popup (this removes tempMarker)
            map.closePopup();
            
            alert(`Thank you! Your ${type} report has been successfully saved to the database.`);
        } else {
            alert('Error saving issue to the database.');
        }
    } catch (err) {
        console.error('Error submitting issue:', err);
        alert('Network error. Please try again.');
    }
}
