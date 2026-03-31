# AfyaBora Tracker 

## About This Project
AfyaBora Tracker is a web application I built to help people in East Africa easily find medical specialists near them. You just type in what kind of doctor you need (like a Dentist or Cardiologist) and your town, and the app fetches the closest clinics along with their contact info and map links.

## Features
* **Location Search:** Find specific doctors based on the city or district you are in.
* **Single Page Application:** The app updates the UI seamlessly without needing to reload the page.
* **API Caching:**I used `node-cache` on the backend to save recent searches. This makes the app much faster and prevents me from hitting the RapidAPI rate limits.
* **Daily Health News:** A scrolling banner at the top that shows recent health news from across the region.
* **Mobile Friendly:** The layout adjusts to work on phones and desktop screens using CSS Flexbox and Grid.

## Tech Stack
* **Frontend:** HTML, CSS, Vanilla JavaScript
* **Backend:** Node.js, Express
* **Data:** Axios, RapidAPI (Local Business Data API)
* **Other Tools:** Node-Cache for performance, Dotenv for hiding API keys.

## How to Run Locally
If you want to run this app on your own computer, follow these steps:

1. Clone the repository to your machine:
   ```bash
   git clone <your-repository-url>
   cd afyabora
Install the required Node modules:

Bash
npm install
Set up your environment variables. Create a file named .env in the main folder and add your API key (make sure this file is in your .gitignore!):

Code snippet
API_KEY=your_rapidapi_key_here
PORT=3000
Start the server:

Bash
npm start
Open your browser and go to http://localhost:3000.

Cloud Servers & Deployment
I deployed this application across three different Ubuntu Linux servers to make sure it handles traffic well.

Web01 & Web02 (Application Servers): These are two separate servers running my Node.js application. I used PM2 to keep the app running in the background. I also had to configure the UFW firewall on both servers to allow traffic on port 3000.

Lb01 (Load Balancer): This server sits in front of the web servers and runs Nginx. It takes incoming user traffic on Port 80 and splits it evenly between Web01 and Web02.

Live Site: You can test the live application by visiting the load balancer's IP address: http://54.173.41.85

Challenges I Faced
Building and deploying this wasn't easy. Here are a few bugs I had to fix along the way:

Old Node.js Version: When I first tried to run the app on the Ubuntu web servers, the default package manager installed Node.js version 10. This crashed my app because my code uses modern JavaScript. I had to manually fetch and install Node version 20 to get it working.

Port 80 Blocked: When setting up my Nginx load balancer, it crashed with a "bad gateway" and "address already in use" error. I found out a default program called HAProxy was hogging Port 80. I had to use the ss network command to find the process ID, kill it, and then start Nginx.

Firewall Blocking: At first, the load balancer couldn't talk to Web01 or Web02. I realized the default Ubuntu firewall was blocking the connection, so I had to SSH into both web servers and run sudo ufw allow 3000/tcp to fix it.

API Credits
The live data for the medical facilities is fetched using the Local Business Data API on RapidAPI.
