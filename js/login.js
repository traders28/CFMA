import { auth, signInWithEmailAndPassword, signInWithPopup, googleProvider } from './firebase-init.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'dashboard.html';
  } catch (error) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Error: Invalid email or password.';
  }
});

document.getElementById('googleLogin').addEventListener('click', async () => {
  const errorMessage = document.getElementById('errorMessage');
  try {
    await signInWithPopup(auth, googleProvider);
    window.location.href = 'dashboard.html';
  } catch (error) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Error: Google login failed.';
  }
});