# AfyaBora Tracker 🩺

## Description
AfyaBora Tracker is a lightweight, responsive HealthTech web application designed to bridge the healthcare gap in East Africa. It allows users to search for specific medical specialists (e.g., Cardiologists, Pediatricians) in their local towns or districts and instantly retrieves the nearest qualified facilities, contacts, and directions.

## Features
* **Dynamic Specialist Routing:** Users can search for specific doctors in their exact location.
* **Single Page Application (SPA):** Seamless UI navigation without page reloads.
* **In-Memory Caching:** Backend optimized with `node-cache` to reduce API calls and improve latency.
* **Daily Health Radar:** A custom, CSS-animated marquee displaying rotating health development news across the EAC.
* **Responsive Design:** Mobile-friendly UI built with modern CSS Grid and Flexbox.

## Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Node.js, Express.js
* **API Integration:** Axios, RapidAPI (Local Business Data API)
* **Performance:** Node-Cache
* **Security:** Dotenv (Environment Variables)

## Local Installation
To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone <your-repository-url>