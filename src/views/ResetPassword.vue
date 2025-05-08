<template>
  <img src="/src/assets/background.png" alt="background" class="background"/>
  <div class="reset-password-page">
    <h2>Reset Password</h2>
    <p>Make sure your new password is strong. Use a combination of letters, numbers, and symbols.</p>
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
  margin-bottom: 18px;
  color: #333;
}

p {
  margin-bottom: 16px;
  font-size: 14px;
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
</style>