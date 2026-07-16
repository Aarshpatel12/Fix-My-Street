require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Road = require('../models/Road');

async function importRoads() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing roads if you want to rerun it safely
        await Road.deleteMany({});
        console.log('Cleared existing roads');

        const kmlPath = path.join(__dirname, '..', 'kmz_extracted', 'doc.kml');
        const kmlData = fs.readFileSync(kmlPath, 'utf-8');

        // Simple regex-based parsing to avoid heavy XML libraries for a 41MB file
        const placemarkRegex = /<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g;
        let match;
        const roads = [];

        while ((match = placemarkRegex.exec(kmlData)) !== null) {
            const placemarkContent = match[1];

            const nameMatch = /<name>(.*?)<\/name>/.exec(placemarkContent);
            const coordsMatch = /<coordinates>([\s\S]*?)<\/coordinates>/.exec(placemarkContent);

            if (nameMatch && coordsMatch) {
                const name = nameMatch[1].trim();
                if (name === 'N/A' || name === 'MCL_ROAD' || !name) {
                    continue; // Skip useless names
                }

                const rawCoords = coordsMatch[1].trim().split(/\s+/);
                const coordinates = [];

                for (let i = 0; i < rawCoords.length; i++) {
                    const parts = rawCoords[i].split(',');
                    if (parts.length >= 2) {
                        const lng = parseFloat(parts[0]);
                        const lat = parseFloat(parts[1]);
                        if (!isNaN(lng) && !isNaN(lat)) {
                            coordinates.push([lng, lat]);
                        }
                    }
                }

                if (coordinates.length > 1) { // LineString needs at least 2 points
                    roads.push({
                        name: name,
                        geometry: {
                            type: 'LineString',
                            coordinates: coordinates
                        }
                    });
                }
            }
        }

        console.log(`Found ${roads.length} valid roads. Inserting into DB...`);
        
        // Insert in batches if it's very large, but mongoose can handle a fair amount
        const batchSize = 1000;
        for (let i = 0; i < roads.length; i += batchSize) {
            const batch = roads.slice(i, i + batchSize);
            await Road.insertMany(batch);
            console.log(`Inserted ${i + batch.length} / ${roads.length}`);
        }

        console.log('Import completed successfully!');
    } catch (err) {
        console.error('Error importing roads:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

importRoads();
