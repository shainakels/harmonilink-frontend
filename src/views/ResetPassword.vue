<template>
  <img src="/src/assets/background.png" alt="background" class="background"/>
  <div class="reset-password-page">
    <h2>Reset Password</h2>
    <p>Make sure your new password is strong. Use a combination of letters, numbers, and symbols.</p>
    <form @submit.prevent="handleResetPassword">
      <div class="input-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="New Password"
          required
          autocomplete="off"
        />
        <span class="icon" @click="togglePasswordVisibility"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          role="button" tabindex="0" title="Toggle password visibility">
          <i :class="showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
        </span>
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        <p v-if="passwordStrength.message !== 'Strong password'" :style="{ color: passwordStrength.color, fontSize: '12px', margin: '5px 0' }">
          {{ passwordStrength.message }}
        </p>
      </div>

      <div class="input-group">
        <input
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="confirmPassword"
          placeholder="Confirm New Password"
          required
          autocomplete="off"
        />
        <span class="icon" @click="toggleConfirmPasswordVisibility"
          :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
          role="button" tabindex="0" title="Toggle password visibility">
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

const passwordStrength = computed(() => {
  const val = password.value;
  if (!val) return { message: '', color: '' };

  const hasUpper = /[A-Z]/.test(val);
  const hasLower = /[a-z]/.test(val);
  const hasNumber = /[0-9]/.test(val);
  const hasSymbol = /[^A-Za-z0-9]/.test(val);
  const isLong = val.length >= 8;

  const score = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  if (!isLong || score < 3) return { message: 'Too weak', color: 'red' };
  if (score === 3) return { message: 'Could be stronger', color: 'orange' };
  return { message: 'Strong password', color: 'green' };
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const handleResetPassword = async () => {
  passwordError.value = '';
  confirmPasswordError.value = '';
  errorMessage.value = '';

  if (passwordStrength.value.message !== 'Strong password') {
    passwordError.value = 'Password must be strong.';
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
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
}

.reset-password-page {
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

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-group input {
  width: 90%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input-group .icon {
  position: absolute;
  right: 23px;
  top: 46%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
}

button {
  width: 96%;
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

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 5px;
  text-align: left;
}
</style>