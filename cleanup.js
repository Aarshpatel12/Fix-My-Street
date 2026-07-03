require('dotenv').config();
const mongoose = require('mongoose');
const Issue = require('./models/Issue');

async function cleanup() {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    // Find all issues
    const issues = await Issue.find({});
    
    let updated = 0;
    for (let issue of issues) {
        // If image is larger than ~100kb, wipe it out
        if (issue.photoUrl && issue.photoUrl.length > 100000) {
            console.log(`Clearing heavy image for issue: ${issue.type}`);
            issue.photoUrl = ''; // Clear heavy image
            await issue.save();
            updated++;
        }
    }
    
    console.log(`Cleanup complete. Removed ${updated} heavy images.`);
    process.exit(0);
}

cleanup();
