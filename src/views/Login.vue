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
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
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
          <label for="keep">Remember me</label>
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const keepLoggedIn = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Show success message if ?signup=success exists in URL
onMounted(() => {
  if (route.query.signup === 'success') {
    successMessage.value = 'Account created successfully. You can now log in.';

    // Remove the query parameter after 5 seconds
    setTimeout(() => {
      router.replace({ query: {} });
    }, 5000);
  }
});

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
      const { token, user_id, onboarding_completed } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('token', response.data.token);

      if (!onboarding_completed) {
        localStorage.setItem('onboardingStep', 'pfcustom');
        router.push('/pfcustom');
      } else {
        localStorage.setItem('onboardingStep', 'discover');
        router.push('/discover');
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
  transform: none;
}

.CD {
  position: fixed;
  top: 50%;
  right: 50%;
  height: 28rem;
  transform: translate(90%, -50%);
  z-index: 0;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: translate(90%, -50%) rotate(0deg);
  }
  to {
    transform: translate(90%, -50%) rotate(360deg);
  }
}

.login {
  width: 25rem;
  height: auto;
  min-height: 32rem;
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

.login img {
  width: 5rem;
  margin-bottom: 0.5rem;
}

h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #322848;
  font-size: 36px;
  font-weight: 700;
}

.quote-text {
  font-size: 10.5px;
  margin: 0.5rem 0 2rem;
  color: #322848;
}

.input-group {
  position: relative;
  margin: 1rem 0;
}

.input-group input {
  width: 100%;
  height: 42px;
  padding: 10px 40px 10px 15px;
  background: rgba(255, 255, 255, 0.35);
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
  box-shadow: 0 4px 12px rgba(31, 13, 62, 0.08);
}

.input-group .icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  cursor: pointer;
}

.email-domain {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #888;
  pointer-events: none; 
}

.checkbox-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 0.7rem;
  margin: 1rem 0;
  color: #ebebeb;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  color: #ebebeb;
  text-decoration: none;
  font-weight: 500;
}

button {
  width: 90%;
  height: 2.75rem;
  padding: 0.5rem;
  background: #322848;
  color: #fff;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  margin: 1.5rem 0;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

button:hover {
  background: #1f1a2e;
  transform: translateY(-1px);
}

button:disabled {
  background: #888;
  cursor: not-allowed;
}

.error-message {
  color: red;
  font-size: 11px;
  margin-top: -3px;
  text-align: left;
}
.login-text {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #ebebeb;
}

.signin-link {
  color: #ebebeb;
  text-decoration: none;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .CD {
    animation: rotate-1200 20s linear infinite;
  }
  
  @keyframes rotate-1200 {
    from {
      transform: translate(80%, -50%) rotate(0deg);
    }
    to {
      transform: translate(80%, -50%) rotate(360deg);
    }
  }
}

@media (max-width: 992px) {
  .CD {
    animation: rotate-992 20s linear infinite;
  }
  
  @keyframes rotate-992 {
    from {
      transform: translate(70%, -50%) rotate(0deg);
    }
    to {
      transform: translate(70%, -50%) rotate(360deg);
    }
  }
}

@media (max-width: 768px) {
  .CD {
    display: none;
  }
  
  .login {
    width: 90%;
    max-width: 25rem;
  }
}

@media (max-width: 480px) {
  .login {
    padding: 1.5rem;
    min-height: 30rem;
  }
  
  h2 {
    font-size: 36px;
  }
  
  .input-group input {
    font-size: 0.85rem;
  }
  
  .checkbox-container {
    font-size: 0.75rem;
  }
}

.success-message {
  color: #4CAF50;
  font-size: 12px;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}


/* Remove dark mode since we're using specific gradients */
@media (prefers-color-scheme: dark) {
  .login {
    background: linear-gradient(to bottom, #c697bd, #dbb4d7 50%, #1f0d3e);
  }
  
  .input-group input {
    background: rgba(235, 235, 235, 0.4);
    border: none;
  }
  
  .input-group input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.45);
    box-shadow: 0 4px 12px rgba(31, 13, 62, 0.08);
  }
  
  h2, .quote-text {
    color: #322848
  }

  .checkbox-container, .forgot-password a, .login-text, .signin-link {
    color: #ebebeb;
  }
}
</style>
