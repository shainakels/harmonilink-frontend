<template>
  <img src="/src/assets/background.png" alt="background" class="background" />
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
      email.value = ''; // Clear the email input on success
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
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  transform: none;
}

.forgot-password-page {
  width: 25rem;
  height: auto;
  min-height: 28rem;
  padding: 2rem;
  background: linear-gradient(to bottom, #c697bd, #dbb4d7 50%, #1f0d3e);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #322848;
  z-index: 1;
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
  margin: 0.5rem 0 2rem;
  color: #666;
}

.input-group {
  position: relative;
  margin: 1rem 0;
}

.input-group input {
  width: 100%;
  height: 2.5rem;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  background: rgba(235, 235, 235, 0.8);
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  color: #333;
}

.input-group input:focus {
  border-color: #322848;
  outline: none;
  background: rgba(255, 255, 255, 0.95);
}

.email-domain {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  color: #888;
  pointer-events: none;
}

button {
  width: 100%;
  height: 2.75rem;
  padding: 0.5rem;
  background: #322848;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 1.5rem 0;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;
}

button:hover {
  background: #1f1a2e;
}

button:disabled {
  background: #888;
  cursor: not-allowed;
}

.back-to-login {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #ebebeb;
}

.back-to-login a {
  color: #ebebeb;
  text-decoration: none;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .forgot-password-page {
    width: 90%;
    max-width: 25rem;
  }
}

@media (max-width: 480px) {
  .forgot-password-page {
    padding: 1.5rem;
    min-height: 26rem;
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
    background: linear-gradient(to bottom, #c697bd, #dbb4d7 50%, #1f0d3e);
  }
  
  .input-group input {
    background: rgba(235, 235, 235, 0.4);
    border: none;
  }
  
  .input-group input:focus {
    border: 2px solid #1f0d3e;
    background: rgba(235, 235, 235, 0.4);
  }
  
  h2, .quote-text, .back-to-login, .back-to-login a {
    color: #ebebeb;
  }
}

.success-message {
  color: #4CAF50;
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

/* Dark mode styles for messages */
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