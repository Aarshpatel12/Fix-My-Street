// Load issues from server
async function loadAdminIssues() {
    // Check Authentication
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = '/login.html';
        return; // Stop execution
    }

    try {
        const response = await fetch('/api/issues');
        const issues = await response.json();
        
        const tableBody = document.getElementById('issuesTableBody');
        tableBody.innerHTML = ''; // Clear table
        
        // Calculate Stats
        const total = issues.length;
        const newIssues = issues.filter(i => i.status === 'New').length;
        const inProgress = issues.filter(i => i.status === 'In Progress').length;
        const fixed = issues.filter(i => i.status === 'Fixed').length;

        document.getElementById('stat-total').innerText = total;
        document.getElementById('stat-new').innerText = newIssues;
        document.getElementById('stat-progress').innerText = inProgress;
        document.getElementById('stat-fixed').innerText = fixed;

        issues.forEach(issue => {
            const tr = document.createElement('tr');
            
            // Format date
            const dateStr = new Date(issue.createdAt).toLocaleDateString();
            
            // Create a small thumbnail if photo exists
            const photoHtml = issue.photoUrl 
                ? `<img src="${issue.photoUrl}" alt="Photo" class="thumbnail" onclick="window.open('${issue.photoUrl}', '_blank')">` 
                : `<span class="text-muted">No photo</span>`;
            
            // Format location with Google Maps link
            const latLngStr = `${issue.lat.toFixed(5)}, ${issue.lng.toFixed(5)}`;
            const mapLink = `https://www.google.com/maps?q=${issue.lat},${issue.lng}`;
            const locationHtml = `
                <div>${latLngStr}</div>
                <a href="${mapLink}" target="_blank" style="font-size: 0.75rem; color: var(--primary); text-decoration: none;">View on Maps</a>
            `;

            // Status badge class
            let statusBadgeClass = 'badge-danger'; // New
            if (issue.status === 'In Progress') statusBadgeClass = 'badge-warning';
            if (issue.status === 'Fixed') statusBadgeClass = 'badge-success';
            
            // Format road info
            const roadNameStr = issue.roadName || 'Unknown';
            const roadAbbrStr = issue.roadAbbr ? `(${issue.roadAbbr})` : '';
            const roadHtml = `<div>${roadNameStr} ${roadAbbrStr}</div>`;
            const roadIdHtml = `<span style="font-family: monospace; font-size: 0.85rem; color: var(--text-muted);">${issue.roadId || 'N/A'}</span>`;

            tr.innerHTML = `
                <td data-label="Date">${dateStr}</td>
                <td data-label="Location">${locationHtml}</td>
                <td data-label="Road">${roadHtml}</td>
                <td data-label="Road ID">${roadIdHtml}</td>
                <td data-label="Type"><strong>${issue.type}</strong></td>
                <td data-label="Description">
                    ${issue.description}
                    <div style="margin-top: 0.5rem; display: flex; justify-content: inherit;">
                        <span style="background: #f0fdf4; color: var(--primary); padding: 0.2rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; font-weight: bold;">
                            👍 ${issue.upvotes || 0} Upvotes
                        </span>
                    </div>
                </td>
                <td data-label="Photo">${photoHtml}</td>
                <td data-label="Status"><span class="badge ${statusBadgeClass}" id="status-badge-${issue._id}">${issue.status}</span></td>
                <td data-label="Action">
                    <div style="display: flex; gap: 0.5rem; align-items: center; justify-content: inherit;">
                        <select class="form-control status-select" onchange="updateStatus('${issue._id}', this.value)">
                            <option value="New" ${issue.status === 'New' ? 'selected' : ''}>New</option>
                            <option value="In Progress" ${issue.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Fixed" ${issue.status === 'Fixed' ? 'selected' : ''}>Fixed</option>
                        </select>
                        <button class="btn-outline" style="color: var(--danger); border-color: var(--danger); padding: 0.5rem; font-size: 0.75rem; cursor: pointer;" onclick="deleteIssue('${issue._id}')">Delete</button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error loading issues for admin:", err);
        alert("Failed to load issues.");
    }
}

// Update issue status
async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`/api/issues/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            // Update the badge in the UI
            const badge = document.getElementById(`status-badge-${id}`);
            badge.textContent = newStatus;
            
            // Update badge class
            badge.className = 'badge';
            if (newStatus === 'New') badge.classList.add('badge-danger');
            if (newStatus === 'In Progress') badge.classList.add('badge-warning');
            if (newStatus === 'Fixed') badge.classList.add('badge-success');
            
            // Use subtle notification instead of alert for better UX
            console.log(`Status updated to ${newStatus}`);
        } else {
            alert('Failed to update status in database.');
        }
    } catch (err) {
        console.error('Error updating status:', err);
        alert('Network error. Please try again.');
    }
}

// Init
document.addEventListener('DOMContentLoaded', loadAdminIssues);

// Delete issue
async function deleteIssue(id) {
    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) return;

    try {
        const response = await fetch(`/api/issues/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('Issue deleted');
            loadAdminIssues(); // Refresh the table
        } else {
            alert('Failed to delete issue from database.');
        }
    } catch (err) {
        console.error('Error deleting issue:', err);
        alert('Network error. Please try again.');
    }
}

// Logout Admin
function logoutAdmin() {
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.href = '/login.html';
}

// Export issues to Excel
function exportExcel() {
    const startDate = document.getElementById('exportStart').value;
    const endDate = document.getElementById('exportEnd').value;

    let url = '/api/issues/export';
    const params = [];

    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);

    if (params.length > 0) {
        url += '?' + params.join('&');
    }

    // Trigger download by opening URL in new tab or setting window location
    window.location.href = url;
}
