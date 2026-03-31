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

    // OS Check: Hide the Apple button if the user is NOT on an Apple device
    const isAppleDevice = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    if (!isAppleDevice) {
        const appleBtn = document.getElementById('apple-btn');
        if (appleBtn) appleBtn.style.display = 'none';
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

    // 1. Auto-fill the name we "received" from the provider
    document.getElementById('username').value = `${provider} User`;

    // 2. Hide the SSO buttons and Password fields to clean up the form
    document.getElementById('sso-container').style.display = 'none';
    document.getElementById('sso-divider').style.display = 'none';
    
    document.getElementById('password').style.display = 'none';
    document.getElementById('label-password').style.display = 'none';
    
    document.getElementById('confirm-password').style.display = 'none';
    document.getElementById('label-confirm').style.display = 'none';

    // 3. Update the UI to ask for the Country
    const errorElement = document.getElementById('auth-error');
    errorElement.innerText = `✅ Securely linked with ${provider}. Please select your country to finish.`;
    errorElement.classList.remove('hidden');
    errorElement.style.color = '#0056b3'; // Friendly blue color

    // 4. Update the main button text
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

// =========================================================================
// EVERYTHING BELOW THIS LINE SHOULD BE YOUR EXISTING CODE (findDoctors, etc)
// =========================================================================
// Function to handle Log Out
function logout() {
    // 1. Clear the user data from the browser's memory
    localStorage.removeItem('afyabora_user');
    localStorage.removeItem('afyabora_country');

    // 2. Reset the SSO flag just in case
    isSSOFlow = false;

    // 3. Update the Navigation Bar UI
    document.getElementById('nav-logout-btn').classList.add('hidden');
    document.getElementById('nav-login-btn').classList.remove('hidden');
    
    // 4. Send them back to the Home Page
    showPage('home-page');
}

// ... (Keep your existing findDoctors() and displayResults() functions down here) ...
// This function runs when the user clicks the "Search" button
async function findDoctors() {
    // 1. Grab the values from the HTML inputs
    const specialist = document.getElementById('symptom').value;
    const location = document.getElementById('location').value;
    const resultsDiv = document.getElementById('results');
    const searchBtn = document.getElementById('searchBtn');

    // 2. Form Validation: Ensure input is a valid city
    if (!location) {
        resultsDiv.innerHTML = '<p class="error-text">⚠️ Please enter a city or location.</p>';
        return;
    }

    // 3. Show a loading state
    resultsDiv.innerHTML = '<p style="text-align:center;">⏳ Searching medical databases...</p>';
    searchBtn.disabled = true; // Prevent double-clicking

    try {
        // 4. Fetch the data from OUR backend (RapidAPI calls)
        const response = await fetch(`/api/find-doctors?specialist=${specialist}&location=${location}`);
        const apiData = await response.json();

        // If our backend sent an error back, throw it so the catch block handles it
        if (apiData.error) throw new Error(apiData.error);

        // 5. Send the data array to our helper function to draw it on the screen
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
        // Using optional chaining (?) and OR (||) to handle missing data gracefully
        const name = doc.name || 'Unnamed Clinic';
        const address = doc.full_address || doc.address || 'Address not listed';
        const phone = doc.phone_number || 'No phone provided';
        
        // Check if the API provided a Google Maps link or Website
        const linkHTML = doc.place_link ? `<a href="${doc.place_link}" target="_blank">🗺️ View on Map</a>` : '';

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
// --- HEALTH RADAR DAILY ROTATION ENGINE ---

const eacHealthNews = [
    { country: "Kenya", title: "Kiambu Level 5 Receives New MRI Suite", snippet: "The county government has successfully installed state-of-the-art imaging equipment, reducing wait times." },
    { country: "Rwanda", title: "Kigali Rolls Out Digital Health Records", snippet: "A new initiative aims to digitize patient history across all public clinics for better continuity of care." },
    { country: "Tanzania", title: "New Oncology Wing in Dar es Salaam", snippet: "A major health consortium has opened a 50-bed specialized cancer treatment center." },
    { country: "Uganda", title: "Mulago Hospital Upgrades Trauma Center", snippet: "The national referral hospital has doubled its ICU capacity and upgraded its emergency response fleet." },
    { country: "Kenya", title: "Eldoret Launches Drone Blood Delivery", snippet: "A new drone network is now delivering emergency blood supplies to remote clinics in the Rift Valley." },
    { country: "Burundi", title: "Bujumbura Opens Modern Maternity Ward", snippet: "International partners have funded a new wing dedicated to reducing infant mortality rates." }
];

function loadDailyNews() {
    const track = document.getElementById('news-track');
    
    // 1. Calculate the current day of the year (1 - 365) to use as a "rotation" index
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // 2. Select 3 specific stories based on the day of the year (simulating a daily refresh)
    const startIndex = dayOfYear % eacHealthNews.length;
    let selectedNews = [];
    
    for (let i = 0; i < 4; i++) {
        // Loop back to the start of the array if we hit the end
        const index = (startIndex + i) % eacHealthNews.length;
        selectedNews.push(eacHealthNews[index]);
    }

    // 3. To make an infinite CSS marquee work flawlessly, we must duplicate the selected cards
    // so there is no "blank space" when the animation resets.
    const displayNews = [...selectedNews, ...selectedNews];

    // 4. Inject the HTML into the track
    track.innerHTML = '';
    displayNews.forEach(news => {
        track.innerHTML += `
            <div class="news-card">
                <span class="news-tag">${news.country}</span>
                <h4>${news.title}</h4>
                <p>${news.snippet}</p>
            </div>
        `;
    });
}

// Ensure the news loads immediately when the script runs
loadDailyNews();