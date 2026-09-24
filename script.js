const API_URL = "http://localhost:5000";

const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const formSub = document.getElementById('formSub');
const gateError = document.getElementById('gateError');

function showTab(which) {
  gateError.textContent = '';
  const isLogin = which === 'login';
  tabLogin.classList.toggle('tab--active', isLogin);
  tabRegister.classList.toggle('tab--active', !isLogin);
  tabLogin.setAttribute('aria-selected', isLogin);
  tabRegister.setAttribute('aria-selected', !isLogin);
  loginForm.classList.toggle('form--active', isLogin);
  registerForm.classList.toggle('form--active', !isLogin);
  formSub.textContent = isLogin
    ? 'Nothing is true. Everything is permitted.'
    : 'Choose the path your blade will walk.';
}

tabLogin.addEventListener('click', () => showTab('login'));
tabRegister.addEventListener('click', () => showTab('register'));

// ---- LOGIN ----
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  gateError.textContent = '';

  const data = new FormData(loginForm);
  const username = data.get('username').trim();
  const password = data.get('password');

  if (!username || !password) {
    gateError.textContent = 'The Brotherhood does not recognize an empty word.';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();

    if (!res.ok) {
      gateError.textContent = result.message || 'The gate remains closed.';
      return;
    }

    // Backend returns: { message, token, user: { username, allegiance } }
    localStorage.setItem('token', result.token);
    sessionStorage.setItem('acName', result.user.username);
    sessionStorage.setItem('acAllegiance', result.user.allegiance);

    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    gateError.textContent = 'The connection to the Brotherhood was severed.';
  }
});

// ---- REGISTER ----
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  gateError.textContent = '';

  const data = new FormData(registerForm);
  const username = data.get('username').trim();
  const password = data.get('password');
  const allegiance = data.get('allegiance');

  if (!username || !password) {
    gateError.textContent = 'The Brotherhood does not recognize an empty word.';
    return;
  }
  if (!allegiance) {
    gateError.textContent = 'You must choose a side before you may enter.';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, allegiance })
    });

    const result = await res.json();

    if (!res.ok) {
      gateError.textContent = result.message || 'The initiation failed.';
      return;
    }

    // Register endpoint only returns a message — auto-login after registration
    const loginRes = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const loginResult = await loginRes.json();

    if (!loginRes.ok) {
      gateError.textContent = 'Oath sworn, but the gate would not open. Please log in.';
      showTab('login');
      return;
    }

    localStorage.setItem('token', loginResult.token);
    sessionStorage.setItem('acName', loginResult.user.username);
    sessionStorage.setItem('acAllegiance', loginResult.user.allegiance);

    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    gateError.textContent = 'The connection to the Brotherhood was severed.';
  }
});