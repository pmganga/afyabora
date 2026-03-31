// --- PAGE ROUTING & AUTHENTICATION ---

// Global flag to track if the user is logging in via Google/Apple
let isSSOFlow = false; 

window.onload = function() {
    const savedUser = localStorage.getItem('afyabora_user');
    if (savedUser) {
        showPage('user-page');
        document.getElementById('welcome-message').innerText = `Welcome back, ${savedUser}!`;
        document.getElementById('nav-login-btn').classList.add('hidden');
        document.getElementById('nav-logout-btn').classList.remove('hidden');
    } else {
        showPage('home-page');
    }

  // check if user is on an apple device, hide if user is a non-apple user 
    let userAgentString = navigator.userAgent;
    let isAppleDevice = false;
    
    if (userAgentString.includes("Mac") || userAgentString.includes("iPhone") || userAgentString.includes("iPad")) {
        isAppleDevice = true;
    }

    if (isAppleDevice === false) {
        let appleBtn = document.getElementById('apple-btn');
        if (appleBtn) {
            appleBtn.style.display = 'none';
        }
    }
};

function showPage(pageId) {
    document.querySelectorAll('.page-view').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
}

// Function to handle the "Complete Profile" flow for SSO
function socialLogin(provider) {
    isSSOFlow = true; // Set the flag

    // Auto-fill the name we "received" from the provider
    document.getElementById('username').value = `${provider} User`;

    //  Hide the SSO buttons and Password fields to clean up the form
    document.getElementById('sso-container').style.display = 'none';
    document.getElementById('sso-divider').style.display = 'none';
    
    document.getElementById('password').style.display = 'none';
    document.getElementById('label-password').style.display = 'none';
    
    document.getElementById('confirm-password').style.display = 'none';
    document.getElementById('label-confirm').style.display = 'none';

    //  Update the UI to ask for the Country
    const errorElement = document.getElementById('auth-error');
    errorElement.innerText = `✅ Securely linked with ${provider}. Please select your country to finish.`;
    errorElement.classList.remove('hidden');
    errorElement.style.color = '#0056b3'; // Friendly blue color

    //  Update the main button text
    document.getElementById('main-login-btn').innerText = "Complete Profile & Enter";
}

function loginUser() {
    const name = document.getElementById('username').value;
    const country = document.getElementById('country').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('auth-error');

    // Reset errors
    errorElement.classList.add('hidden');
    errorElement.innerText = '';
    errorElement.style.color = '#d9534f'; // Reset to error red

    if (!name) {
        showError(errorElement, "Please enter your name.");
        return;
    }

    // ONLY check passwords if they are doing a traditional email sign up
    if (!isSSOFlow) {
        if (password.length < 8) {
            showError(errorElement, "For your security, passwords must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            showError(errorElement, "Passwords do not match. Please try again.");
            return;
        }
    }

    // Save the user data and route to the app
    localStorage.setItem('afyabora_user', name);
    localStorage.setItem('afyabora_country', country);

    document.getElementById('password').value = '';
    document.getElementById('confirm-password').value = '';

    document.getElementById('welcome-message').innerText = `Hello, ${name} from ${country}!`;
    document.getElementById('nav-login-btn').classList.add('hidden');
    document.getElementById('nav-logout-btn').classList.remove('hidden');
    
    showPage('user-page');
}

function showError(element, message) {
    element.innerText = `⚠️ ${message}`;
    element.classList.remove('hidden');
}


// Function to handle Log Out
function logout() {
    // Clear the user data from the browser's memory
    localStorage.removeItem('afyabora_user');
    localStorage.removeItem('afyabora_country');


    isSSOFlow = false;

    // Update the Navigation Bar UI
    document.getElementById('nav-logout-btn').classList.add('hidden');
    document.getElementById('nav-login-btn').classList.remove('hidden');
    
    //  Send them back to the Home Page
    showPage('home-page');
}


// User clicks the "Search" button
async function findDoctors() {
    //  Grab the values from the HTML inputs
    const specialist = document.getElementById('symptom').value;
    const location = document.getElementById('location').value;
    const resultsDiv = document.getElementById('results');
    const searchBtn = document.getElementById('searchBtn');

    //  Form Validation: Ensure input is a valid city
    if (!location) {
        resultsDiv.innerHTML = '<p class="error-text">⚠️ Please enter a city or location.</p>';
        return;
    }

    //  Show a loading state
    resultsDiv.innerHTML = '<p style="text-align:center;">⏳ Searching medical databases...</p>';
    searchBtn.disabled = true; // Prevent double-clicking

    try {
        //  Fetch the data from OUR backend (RapidAPI calls)
        const response = await fetch(`/api/find-doctors?specialist=${specialist}&location=${location}`);
        const apiData = await response.json();

        // If our backend sent an error back, throw it so the catch block handles it
        if (apiData.error) throw new Error(apiData.error);

        //  Send the data array to our helper function to draw it on the screen
        displayResults(apiData.data, specialist);

    } catch (error) {
        // If anything fails, show a friendly error
        resultsDiv.innerHTML = `<p class="error-text">⚠️ ${error.message}</p>`;
    } finally {
        // Re-enable the button whether it succeeded or failed
        searchBtn.disabled = false; 
    }
}

// Helper function to turn the JSON array into HTML Doctor Cards
function displayResults(doctorsArray, specialist) {
    const resultsDiv = document.getElementById('results');
    
    // Clear the loading text
    resultsDiv.innerHTML = `<h3>Recommended ${specialist}s:</h3>`;

    // Check if the API returned an empty array (no doctors found)
    if (!doctorsArray || doctorsArray.length === 0) {
        resultsDiv.innerHTML += '<p>No specialists found in this area. Try a nearby city.</p>';
        return;
    }

    // Loop through each doctor/clinic and create an HTML card for them
    doctorsArray.forEach(doc => {

        const name = doc.name || 'Unnamed Clinic';
        const address = doc.full_address || doc.address || 'Address not listed';
        const phone = doc.phone_number || 'No phone provided';
        
// Check if the API provided a Google Maps link
        let linkHTML = "";
        if (doc.place_link) {
            linkHTML = `<a href="${doc.place_link}" target="_blank">🗺️ View on Map</a>`;
        }

        // Add this card to the screen
        resultsDiv.innerHTML += `
            <div class="doctor-card">
                <h4>${name}</h4>
                <p>📍 ${address}</p>
                <p>📞 ${phone}</p>
                <p>${linkHTML}</p>
            </div>
        `;
    });
}
// Health Radar Daily Rotation Engine 

const eacHealthNews = [
    { country: "Kenya", title: "Kiambu Level 5 Receives New MRI Suite", snippet: "The county government has successfully installed state-of-the-art imaging equipment, reducing wait times." },
    { country: "Rwanda", title: "Kigali Rolls Out Digital Health Records", snippet: "A new initiative aims to digitize patient history across all public clinics for better continuity of care." },
    { country: "Tanzania", title: "New Oncology Wing in Dar es Salaam", snippet: "A major health consortium has opened a 50-bed specialized cancer treatment center." },
    { country: "Uganda", title: "Mulago Hospital Upgrades Trauma Center", snippet: "The national referral hospital has doubled its ICU capacity and upgraded its emergency response fleet." },
    { country: "Kenya", title: "Eldoret Launches Drone Blood Delivery", snippet: "A new drone network is now delivering emergency blood supplies to remote clinics in the Rift Valley." },
    { country: "Burundi", title: "Bujumbura Opens Modern Maternity Ward", snippet: "International partners have funded a new wing dedicated to reducing infant mortality rates." }
];

function loadDailyNews() {
    let track = document.getElementById('news-track');
    
    // get the current day of the week (0 - 6) to rotate the news
    let todayDate = new Date();
    let dayOfWeek = todayDate.getDay(); 

    let selectedNews = [];
    
    // grab 4 news items using a basic loop
    for (let i = 0; i < 4; i++) {
        let arrayIndex = (dayOfWeek + i) % eacHealthNews.length;
        selectedNews.push(eacHealthNews[arrayIndex]);
    }

    // copy the items a second time so the CSS infinite scroll animation looks smooth
    let displayNews = [];
    for (let i = 0; i < selectedNews.length; i++) {
        displayNews.push(selectedNews[i]);
    }
    for (let i = 0; i < selectedNews.length; i++) {
        displayNews.push(selectedNews[i]);
    }

    // put the html on the screen
    track.innerHTML = '';
    for (let i = 0; i < displayNews.length; i++) {
        let news = displayNews[i];
        track.innerHTML += `
            <div class="news-card">
                <span class="news-tag">${news.country}</span>
                <h4>${news.title}</h4>
                <p>${news.snippet}</p>
            </div>
        `;
    }
}
// Ensure the news loads immediately when the script runs
loadDailyNews();