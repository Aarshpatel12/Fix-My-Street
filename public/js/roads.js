let allRoads = [];

async function loadRoads() {
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/roads');
        allRoads = await response.json();
        renderTable(allRoads);
    } catch (err) {
        console.error("Error loading roads:", err);
        alert("Failed to load roads directory.");
    }
}

function renderTable(roadsToRender) {
    const tableBody = document.getElementById('roadsTableBody');
    tableBody.innerHTML = ''; 

    roadsToRender.forEach(road => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Road Name"><strong>${road.name}</strong></td>
            <td data-label="Abbreviation">${road.abbr}</td>
            <td data-label="Unique Road ID"><span class="road-id-badge">${road.shortId}</span></td>
            <td data-label="Internal Database ID"><span style="font-size: 0.75rem; color: #888;">${road._id}</span></td>
        `;
        tableBody.appendChild(tr);
    });
}

document.getElementById('searchInput').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const filtered = allRoads.filter(r => 
        r.name.toLowerCase().includes(term) || 
        r.shortId.toLowerCase().includes(term)
    );
    renderTable(filtered);
});

document.addEventListener('DOMContentLoaded', loadRoads);
