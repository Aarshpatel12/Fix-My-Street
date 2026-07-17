require('dotenv').config();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Road = require('../models/Road');

async function updateIssues() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const issues = await Issue.find({ roadId: { $exists: false } });
        console.log(`Found ${issues.length} issues without roadId.`);

        let updatedCount = 0;

        for (const issue of issues) {
            // Find nearest road within 500 meters
            const nearestRoad = await Road.findOne({
                geometry: {
                    $nearSphere: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [issue.lng, issue.lat]
                        },
                        $maxDistance: 500 // meters
                    }
                }
            });

            if (nearestRoad) {
                issue.roadName = nearestRoad.name;
                issue.roadAbbr = nearestRoad.name.split(' ').map(w => w[0].toUpperCase()).join('');
                issue.roadId = nearestRoad._id.toString();
                await issue.save();
                updatedCount++;
                console.log(`Updated issue ${issue._id} with road: ${issue.roadName} (${issue.roadAbbr})`);
            } else {
                console.log(`No road found within 500m for issue ${issue._id} at ${issue.lat}, ${issue.lng}`);
                // Try with a larger distance, e.g. 2000m just in case
                const fallbackRoad = await Road.findOne({
                    geometry: {
                        $nearSphere: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [issue.lng, issue.lat]
                            },
                            $maxDistance: 2000 // meters
                        }
                    }
                });
                
                if (fallbackRoad) {
                    issue.roadName = fallbackRoad.name;
                    issue.roadAbbr = fallbackRoad.name.split(' ').map(w => w[0].toUpperCase()).join('');
                    issue.roadId = fallbackRoad._id.toString();
                    await issue.save();
                    updatedCount++;
                    console.log(`Updated issue ${issue._id} with road (2000m fallback): ${issue.roadName} (${issue.roadAbbr})`);
                } else {
                    issue.roadName = 'Unknown Road';
                    issue.roadAbbr = 'UR';
                    await issue.save();
                    console.log(`Still no road found for issue ${issue._id}. Set as Unknown Road.`);
                }
            }
        }

        console.log(`Finished updating ${updatedCount} issues.`);
    } catch (err) {
        console.error('Error updating issues:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateIssues();
