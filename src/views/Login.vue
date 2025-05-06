<template>
  <!-- Background image -->
  <img src="/src/assets/background.png" alt="background" class="background">
  <div class="cd">
    <img src="/src/assets/cd.png" alt="CD" class="CD">
  </div>
   <!-- Login form -->
  <div class="login">
    <h2>LOG IN</h2>
    <img src="/src/assets/logo.png" alt="Harmonilink Logo">
    <p class="quote-text">Bringing people together through the power of music.</p>
    <form @submit.prevent="handleLogin">
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
      <div class="input-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="Password"
          required
          autocomplete="off"
        />
        <span
          class="icon"
          @click="togglePasswordVisibility"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          role="button"
          tabindex="0"
          title="Toggle password visibility"
        >
          <i :class="showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
        </span>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <!--Keep Me Logged In checkbox-->
      <div class="checkbox-container">
        <div class="checkbox-group">
          <input type="checkbox" id="keep" v-model="keepLoggedIn">
          <label for="keep">Keep me logged in</label>
        </div>
        <!--Forget Password-->
        <p class="forgot-password">
          <router-link to="/forgot-password">Forgot password?</router-link>
        </p>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Log In' }}
      </button>

      <p class="login-text">
        Don't have an account? 
        <router-link to="/signup" class="signin-link">Sign Up</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const keepLoggedIn = ref(false); 
const loading = ref(false);
const errorMessage = ref('');

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
      email: email.value,
      password: password.value,
    });

    if (response.status === 200) {
      const { user_id, onboarding_completed } = response.data;
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('user_id', user_id);

      if (!onboarding_completed) {      
        localStorage.setItem('onboardingStep', 'pfcustom');
        router.push('/pfcustom');
      } else {
        localStorage.setItem('onboardingStep', 'home');
        router.push('/home');
      }
    }
  } catch (error) {
    if (error.response?.status === 422) {
      errorMessage.value = 'Email and password are required.';
    } else if (error.response?.status === 404) {
      errorMessage.value = 'User not registered. Please sign up first.';
    } else if (error.response?.status === 400) {
      errorMessage.value = 'Invalid email or password.';
    } else {
      errorMessage.value = 'Something went wrong. Please try again later.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

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
  transform: rotate(180deg);
}

.CD {
  position: fixed;
  top: 8.5rem;
  right: 26rem;
  height: 32rem;
  transform: rotate(120deg);
  animation: moveRight 1s ease-out;
}

@keyframes moveRight {
  from {
    right: 30rem;
    opacity: 0;
  }
  to {
    right: 26rem;
    opacity: 1;
  }
}

.login {
  width: 29em;
  height: 38rem;
  padding: 20px;
  background: linear-gradient(to bottom, #c697bd, #dbb4d7 50%, #1f0d3e);
  border-radius: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: absolute;
  top: 50%;
  left: 750px;
  transform: translate(-50%, -50%);
  color: #322848;
}

.login img {
  width: 8rem;
}

h2 {
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  color: #322848;
  font-size: 40px;
}

.quote-text {
  font-size: 12px;
  margin-top: 3rem;
  color: #333;
}

.input-group {
  position: relative;
  margin: 1rem 0;
  top: 1rem;
}

.input-group input {
  width: 24rem;
  height: 1.5rem;
  padding: 8px;
  padding-right: 40px;
  background: rgba(235, 235, 235, 0.4);
  border: none;
  border-radius: 5px;
  font-size: 15px;
  color: #333;
}

.input-group input:focus {
  border: 2px solid #1f0d3e;
  outline: none;
}

.input-group .icon {
  position: absolute;
  right: 2.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: #080d2a;
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

.checkbox-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 89%;
  font-size: 11px;
  margin-top: 14px;
  margin-left: 1.5rem;
  color: #ebebeb;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input {
  margin-right: 8px;
}

.forgot-password {
  cursor: pointer;
  text-decoration: underline;
  color: #ebebeb;
}

.forgot-password a {
  color: #ffffff;
  text-decoration: underline;
}

button {
  width: 20rem;
  height: 2.5rem;
  padding: 10px;
  background: #1f0d3e;
  color: #ebebeb;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  margin-top: 15px;
  font-size: 18px;
  font-weight: bold;
}

button:hover {
  background: #14092b;
}

button:disabled {
  background: #888;
  cursor: not-allowed;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 24px;
}

.login-text {
  margin-top: 13px;
  font-size: 13px;
  color: #ebebeb;
}

.signin-link {
  text-decoration: underline;
  color: #ebebeb;
  cursor: pointer;
  font-weight: bold;
}
</style>
