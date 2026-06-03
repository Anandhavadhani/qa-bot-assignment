/* Authentication Module */

import { apiClient, showNotification, getStoredToken, setStoredToken, clearStoredToken } from './utils.js';

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');

tabLogin.addEventListener('click', showLoginForm);
tabSignup.addEventListener('click', showSignupForm);
loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);

function showLoginForm() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('signup-form').classList.add('hidden');
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
}

function showSignupForm() {
  document.getElementById('signup-form').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
}

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  try {
    const response = await apiClient.post('/auth/login', { email, password });
    setStoredToken(response.accessToken, response.refreshToken);
    apiClient.setAuthToken(response.accessToken);
    showDashboard();
    showNotification('Login successful!', 'success');
  } catch (error) {
    document.getElementById('login-error').textContent = error.message;
    showNotification('Login failed', 'error');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const username = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  try {
    await apiClient.post('/auth/register', { username, email, password });
    showNotification('Account created! Please login.', 'success');
    showLoginForm();
  } catch (error) {
    document.getElementById('signup-error').textContent = error.message;
    showNotification('Signup failed', 'error');
  }
}

export function showAuthPage() {
  document.getElementById('auth-page').classList.remove('hidden');
  document.getElementById('dashboard-page').classList.add('hidden');
  document.getElementById('chat-page').classList.add('hidden');
}

export function showDashboard() {
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('dashboard-page').classList.remove('hidden');
  document.getElementById('chat-page').classList.add('hidden');
}

export function logout() {
  clearStoredToken();
  apiClient.setAuthToken(null);
  showAuthPage();
  showNotification('Logged out successfully', 'info');
}

document.getElementById('nav-logout').addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

// Check if user is already logged in
window.addEventListener('load', () => {
  const token = getStoredToken();
  if (token) {
    apiClient.setAuthToken(token);
    showDashboard();
  } else {
    showAuthPage();
  }
});
