<template>
  <div class="background"></div>
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

.reset-password-page {
  width: 25rem;
  min-height: 28rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.65);
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

.input-group .icon {
  position: absolute;
  right: 26px;
  top: 50%;
  transform: translateY(-50%);
  color: #322848;
  opacity: 0.6;
  transition: all 0.3s ease;
  cursor: pointer;
}

.input-group input:focus + .icon {
  opacity: 0.8;
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
    padding: 1.5rem;
    min-height: 26rem;
  }
}

@media (max-width: 480px) {
  .reset-password-page {
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
  .reset-password-page {
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
  h2, .quote-text {
    color: #322848;
  }
}
</style>