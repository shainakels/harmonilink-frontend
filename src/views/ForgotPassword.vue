<template>
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
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/forgot-password`, {
      email: email.value,
    });

    if (response.status === 200) {
      message.value = 'A password reset link has been sent to your email.';
    }
  } catch (error) {
    message.value = 'Failed to send reset link. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>