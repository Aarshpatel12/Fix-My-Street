# 🏙️ Fix My Street

**Fix My Street** is a crowdsourced civic issue reporting platform. It empowers citizens to easily report local infrastructure problems (like potholes, broken streetlights, water leaks, and garbage) directly to city administrators using an interactive, live map.

---

## 🌟 Key Features

### For Citizens
* **Interactive Live Map:** See all reported issues in your city displayed as color-coded pins on a live map.
* **Instant Reporting:** Click anywhere on the map to drop a pin, select the issue type, write a description, and upload a photo of the problem.
* **Smart Image Compression:** Photos are automatically compressed in your browser before uploading, making the app blazing fast even on slow mobile networks.
* **Upvoting System (Me Too!):** Citizens can upvote existing issues to show administrators which problems are affecting the most people.
* **Live Geolocation:** A "Find My Location" button instantly snaps the map to your exact physical location using your phone's GPS.
* **Sleek Filters:** A glassmorphism filter panel allows users to instantly hide or show issues based on their Category (e.g., Potholes) or Status (e.g., Fixed).

### For Administrators
* **Secure Admin Dashboard:** A password-protected portal (`/admin.html`) specifically for city officials.
* **Live Metrics:** A summary grid automatically calculates total issues, new reports, issues currently in progress, and issues successfully fixed.
* **Mobile-Responsive Data Cards:** On phones, the complex data table beautifully transforms into easy-to-read vertical cards, eliminating annoying horizontal scrolling.
* **Status Management:** Admins can quickly change the status of an issue from "New" 🔴 to "In Progress" 🟡 to "Fixed" 🟢.
* **Moderation:** Admins can permanently delete spam or invalid reports from the database.

---

## 💻 Technology Stack (100% Free Tier)

This project was carefully architected to run entirely on free-tier cloud services.

* **Frontend:** Vanilla HTML5, CSS3, and JavaScript. 
* **Map Engine:** [Leaflet.js](https://leafletjs.com/) using OpenStreetMap tiles.
* **Backend API:** Node.js & Express.
* **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas/database) (Cloud NoSQL Database).
* **Hosting / Deployment:** [Netlify](https://www.netlify.com/). The Express backend was custom-configured to run flawlessly on **Netlify Serverless Functions** for instant, globally distributed API responses.

---

## 🚀 How to Run Locally

If you want to run the code on your own computer:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aarshpatel12/Fix-My-Street.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up Environment Variables:**
   Create a `.env` file in the root folder and add your MongoDB connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0...
   ```
4. **Start the server:**
   ```bash
   npm start
   ```
5. **Open in browser:**
   Navigate to `http://localhost:3000`
