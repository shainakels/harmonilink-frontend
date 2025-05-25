<template>
  <div class="forgot-password-page">
    <h2>Forgot Password</h2>
    <img src="/src/assets/logo.png" alt="Harmonilink Logo">
    <p class="quote-text">Enter your email address to reset your password.</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <form @submit.prevent="handleForgotPassword">
      <div class="input-group">
        <input
          type="email"
          v-model="email"
          placeholder="Email"
          required
          autocomplete="off"
        />
        <span v-if="!email.includes('@')" class="email-domain">@gmail.com</span>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send Reset Link' }}
      </button>
    </form>
    
    <p class="back-to-login">
      <router-link to="/login">Back to Login</router-link>
    </p>
  </div>
  <div class="background"></div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleForgotPassword = async () => {
  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
      email: email.value,
    });

    if (response.status === 200) {
      successMessage.value = 'A password reset link has been sent to your email.';
      email.value = ''; 
    }
  } catch (error) {
    if (error.response?.status === 404) {
      errorMessage.value = 'Email not found. Please check and try again.';
    } else {
      errorMessage.value = 'Failed to send reset link. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Fira Code', monospace;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(120deg, #e3b8ff 0%, #dbb4d7 25%, #c697bd 50%, #8a6bb8 75%, #322848 100%);
  background-size: 300% 300%;
  background-position: 0% 50%;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  animation: gradientMove var(--gradient-speed, 12s) ease-in-out infinite;
  transition: --gradient-speed 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes gradientMove {
  0% { background-position: 0% 60%; }
  25% { background-position: 50% 100%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 0%; }
  100% { background-position: 0% 60%; }
}

.forgot-password-page {
  width: 25rem;
  min-height: 28rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.755); 
  border-radius: 25px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #322848;
  z-index: 1;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.forgot-password-page img {
  width: 4rem;
  margin-bottom: 0.5rem;
}

h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #322848;
  font-size: 2rem;
  font-weight: 600;
}

.quote-text {
  font-size: 0.75rem;
  margin: 0.9rem 0 2rem;
  color: #322848;
}

.input-group {
  position: relative;
  margin: 1rem 0;
}

.input-group input {
  width: 95%;
  height: 42px;
  padding: 10px 40px 10px 15px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  font-size: 15px;
  color: #322848;
  transition: all 0.3s ease;
}

.input-group input::placeholder {
  color: rgba(50, 40, 72, 0.6);
}

.input-group input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
}

.email-domain {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #322848;
  pointer-events: none;
}

button {
  width: 90%;
  height: 45px;
  padding: 10px;
  background: #322848;
  color: #fff;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  margin-top: 12px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  outline: none; 
}

button:hover {
  background: #322848;
  transform: translateY(-1px);
  box-shadow: 0 0 10px #8a6bb8, 0 0 20px #c697bd, 0 0 30px #dbb4d7;
}

button:focus {
  outline: none;
}

button:disabled {
  background: #888;
  cursor: not-allowed;
}

.back-to-login {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #322848;
}

.back-to-login a {
  color: #322848;
  text-decoration: none;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .forgot-password-page {
    width: 90%;
    max-width: 25rem;
    padding: 1.5rem;
    min-height: 26rem;
  }
}

@media (max-width: 480px) {
  .forgot-password-page {
    padding: 1rem;
    min-height: 22rem;
  }
  h2 {
    font-size: 1.75rem;
  }
  .input-group input {
    font-size: 0.85rem;
  }
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .forgot-password-page {
    background: rgba(255,255,255,0.12);
    color: #322848;
  }
  .input-group input {
    background: rgba(255,255,255,0.25);
    border: none;
    color: #322848;
  }
  .input-group input:focus {
    background: rgba(255,255,255,0.25);
  }
  h2, .quote-text, .back-to-login, .back-to-login a {
    color: #322848;
  }
}

.success-message {
  color: #38883b;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.error-message {
  color: #f44336;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

@media (prefers-color-scheme: dark) {
  .success-message {
    color: #81c784;
    background: rgba(129, 199, 132, 0.1);
    border-color: rgba(129, 199, 132, 0.2);
  }

  .error-message {
    color: #e57373;
    background: rgba(229, 115, 115, 0.1);
    border-color: rgba(229, 115, 115, 0.2);
  }
}
</style>