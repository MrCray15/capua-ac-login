const API_URL = "http://localhost:5000";

const welcomeGreeting = document.getElementById('welcomeGreeting');
const welcomeName = document.getElementById('welcomeName');
const welcomeQuote = document.getElementById('welcomeQuote');
const welcomeEyebrow = document.getElementById('welcomeEyebrow');
const dashAllegiance = document.getElementById('dashAllegiance');
const dashRank = document.getElementById('dashRank');
const signOut = document.getElementById('signOut');
const homeButton = document.getElementById('homeButton');

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'ACLogin.html';
}

const copy = {
  assassin: {
    eyebrow: 'The Creed recognizes you',
    greeting: 'Welcome, Hidden One',
    quote: '"Where other men blindly follow the truth, remember — nothing is true. Where other men are limited by morality or law, remember — everything is permitted. We work in the dark to serve the light."',
    rank: 'Novice'
  },
  templar: {
    eyebrow: 'The Order recognizes you',
    greeting: 'Rise, Knight of the Order',
    quote: '"Where the Creed sees chaos, we see the promise of order. Peace through submission, purpose through discipline — the Father of Understanding guides every blade we raise."',
    rank: 'Initiate'
  }
};

async function loadProfile() {
  try {
    const res = await fetch(`${API_URL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      sessionStorage.clear();
      window.location.href = 'ACLogin.html';
      return;
    }

    const result = await res.json();
    // Backend returns: { message, user: { userId, username, allegiance } }
    const name = result.user.username;
    const allegiance = result.user.allegiance || 'assassin';
    const c = copy[allegiance] || copy.assassin;

    welcomeName.textContent = `, ${name}`;
    welcomeGreeting.textContent = c.greeting;
    welcomeQuote.textContent = c.quote;
    welcomeEyebrow.textContent = c.eyebrow;
    dashAllegiance.textContent = allegiance === 'templar' ? 'Templar' : 'Assassin';
    dashRank.textContent = c.rank;

    // Keep sessionStorage fresh in case the token was from an older session
    sessionStorage.setItem('acName', name);
    sessionStorage.setItem('acAllegiance', allegiance);
  } catch (err) {
    console.error('Profile fetch failed:', err);
    // Optional fallback: use sessionStorage if backend is unreachable
    const fallbackName = sessionStorage.getItem('acName');
    const fallbackAllegiance = sessionStorage.getItem('acAllegiance') || 'assassin';
    if (!fallbackName) {
      window.location.href = 'ACLogin.html';
      return;
    }
    const c = copy[fallbackAllegiance] || copy.assassin;
    welcomeName.textContent = `, ${fallbackName}`;
    welcomeGreeting.textContent = c.greeting;
    welcomeQuote.textContent = c.quote;
    welcomeEyebrow.textContent = c.eyebrow;
    dashAllegiance.textContent = fallbackAllegiance === 'templar' ? 'Templar' : 'Assassin';
    dashRank.textContent = c.rank;
  }
}

loadProfile();

homeButton.addEventListener('click', () => {
  window.location.href = 'creators.html';
});

signOut.addEventListener('click', () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('acName');
  sessionStorage.removeItem('acAllegiance');
  window.location.href = 'ACLogin.html';
});