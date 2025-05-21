<template>
  <img src="/src/assets/background.png" alt="background" class="background"/>
  <div class="reset-password-page">
    <h2>Reset Password</h2>
    <img src="/src/assets/logo.png" alt="Harmonilink Logo" class="logo-img">
    <p class="quote-text">Make sure your new password is strong. Use a combination of letters, numbers, and symbols.</p>
    <form @submit.prevent="handleResetPassword">
      <!-- Password -->
      <div class="input-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="New Password"
          required
          autocomplete="off"
          @focus="showPasswordPopup = true"
          @blur="hidePasswordPopup"
        />
        <span class="icon" @click="togglePasswordVisibility">
          <i :class="showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
        </span>
        <!-- Password Validation Popup -->
        <div v-if="showPasswordPopup" class="password-popup">
          <p v-for="(criteria, index) in passwordCriteria" :key="index" :class="{ met: criteria.met }">
            <i :class="criteria.met ? 'fa-solid fa-check' : 'fa-solid fa-times'"></i>
            {{ criteria.message }}
          </p>
        </div>
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
      </div>
      <!-- Confirm Password -->
      <div class="input-group">
        <input
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="confirmPassword"
          placeholder="Confirm New Password"
          required
          autocomplete="off"
        />
        <span class="icon" @click="toggleConfirmPasswordVisibility">
          <i :class="showConfirmPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
        </span>
        <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Resetting...' : 'Reset Password' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const showPasswordPopup = ref(false);

const passwordCriteria = computed(() => {
  const val = password.value;

  return [
    { message: 'At least 8 characters', met: val.length >= 8 },
    { message: 'At least one uppercase letter', met: /[A-Z]/.test(val) },
    { message: 'At least one lowercase letter', met: /[a-z]/.test(val) },
    { message: 'At least one number', met: /[0-9]/.test(val) },
    { message: 'At least one special character', met: /[^A-Za-z0-9]/.test(val) },
  ];
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const hidePasswordPopup = () => {
  setTimeout(() => {
    showPasswordPopup.value = false;
  }, 200);
};

const handleResetPassword = async () => {
  passwordError.value = '';
  confirmPasswordError.value = '';
  errorMessage.value = '';

  if (passwordCriteria.value.some((criteria) => !criteria.met)) {
    passwordError.value = 'Password must meet all criteria.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;

  try {
    const token = route.query.token; 
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/reset-password`, {
      token,
      password: password.value,
    });

    if (response.status === 200) {
      alert('Password reset successful! You can now log in with your new password.');
      router.push('/login');
    }
  } catch (error) {
    if (error.response?.status === 400) {
      errorMessage.value = 'Invalid or expired token.';
    } else {
      errorMessage.value = 'Failed to reset password. Please try again.';
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

.reset-password-page {
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

.logo-img {
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

.input-group .icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  cursor: pointer;
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

.error-message {
  color: #f44336;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.password-popup {
  position: absolute;
  top: 110%;
  margin-left: 15px;
  left: 0;
  width: 91%;
  background: rgba(255, 255, 255, 0.9); 
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  font-size: 12px;
  color: #333;
}

.password-popup p {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-popup p.met {
  color: green;
}

.password-popup p:not(.met) {
  color: red;
}

.password-popup i {
  font-size: 12px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .reset-password-page {
    width: 90%;
    max-width: 25rem;
  }
}

@media (max-width: 480px) {
  .reset-password-page {
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
  .reset-password-page {
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
  h2, .quote-text {
    color: #ebebeb;
  }
}
</style>