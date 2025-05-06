<template>
  <img src="/src/assets/background.png" alt="background" class="background" />
  <div class="forgot-password-page">
    <h2>Forgot Password</h2>
    <p>Enter your email address to reset your password.</p>
    <form @submit.prevent="handleForgotPassword">
      <div class="input-group">
        <input
          type="email"
          v-model="email"
          placeholder="Email"
          required
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send Reset Link' }}
      </button>
      <p v-if="message" class="message">{{ message }}</p>
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
const message = ref('');

const handleForgotPassword = async () => {
  loading.value = true;
  message.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
      email: email.value,
    });

    if (response.status === 200) {
      message.value = 'A password reset link has been sent to your email.';
    }
  } catch (error) {
    if (error.response?.status === 404) {
      message.value = 'Email not found. Please check and try again.';
    } else {
      message.value = 'Failed to send reset link. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transform: rotate(180deg);
    z-index: -1;
  }

.forgot-password-page {
  max-width: 400px;
  margin: 50px auto;
  padding: 25px;
  background-color: #dbb4d7;
  color: #1f0d3e;
  border-radius: 8px;
  box-shadow: 0 7px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 25px;
  color: #333;
}

p {
  margin-bottom: 25px;
  color: #666;
}

.input-group input {
  width: 94%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background: #1f0d3e;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.message {
  margin-top: 20px;
  font-size:13px;
  color: green;
}

.back-to-login {
  margin-top: 20px;
}

.back-to-login a {
  color: #1f0d3e;
  text-decoration: underline;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}

.back-to-login a:hover {
  color: #333;
}
</style>