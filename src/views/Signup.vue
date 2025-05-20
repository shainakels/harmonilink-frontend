<template>
  <!-- Background image -->
  <img src="/src/assets/background.png" alt="background" class="background" />

  <!-- Logo -->
  <div class="logo">
    <img src="/src/assets/logo.png" alt="Harmonilink Logo" />
    <p>armonilink</p>
  </div>

  <!-- CD -->
  <div class="cd">
    <img src="/src/assets/cd.png" alt="CD" class="CD" />
    <img src="/src/assets/cdbg.png" alt="CD Background" class="cdbg" />
  </div>

  <!-- Signup form -->
  <div class="signup">
    <h2>SIGN UP</h2>
    <form @submit.prevent="handleSignup">
      <!-- Username -->
      <div class="input-group" :class="{ invalid: usernameError }">
        <input
          type="text"
          v-model="username"
          placeholder="Username"
          required
          autofocus
          autocomplete="off"
        />
        <span class="icon"><i class="fa-solid fa-user"></i></span>
      </div>
      <p v-if="usernameError" class="error-message">{{ usernameError }}</p>

      <!-- Email -->
      <div class="input-group" :class="{ invalid: emailError }">
        <input
          type="email"
          v-model="email"
          placeholder="Email"
          required
          autocomplete="off"
        />
        <span class="icon"><i class="fa-solid fa-envelope"></i></span>
      </div>
      <p v-if="emailError" class="error-message">{{ emailError }}</p>

      <!-- Password -->
      <div class="input-group" :class="{ invalid: passwordError }">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="Password"
          required
          autocomplete="off"
          @focus="showPasswordPopup = true"
          @blur="hidePasswordPopup"
        />
        <span class="icon" @click="togglePasswordVisibility('password')">
          <i :class="showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
        </span>

        <!-- Password Validation Popup -->
        <div v-if="showPasswordPopup" class="password-popup">
          <p v-for="(criteria, index) in passwordCriteria" :key="index" :class="{ met: criteria.met }">
            <i :class="criteria.met ? 'fa-solid fa-check' : 'fa-solid fa-times'"></i>
            {{ criteria.message }}
          </p>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="input-group" :class="{ invalid: confirmPasswordError }">
        <input
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="confirmPassword"
          placeholder="Confirm Password"
          required
          autocomplete="off"
        />
        <span class="icon" @click="togglePasswordVisibility('confirm')">
          <i :class="showConfirmPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
        </span>
      </div>
      <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>

      <!-- Terms checkbox -->
      <div class="checkbox-group">
        <input type="checkbox" id="terms" v-model="termsAccepted" required />
        <label for="terms">
          By checking this box, you are agreeing to our
          <span class="terms" @click="showTermsPopup = true">Terms of Service.</span>
        </label>
      </div>

      <!-- reCAPTCHA -->
      <div class="recaptcha-wrapper">
        <div id="recaptcha-container"></div>
      </div>


      <!-- Signup button -->
       <button type="submit" :disabled="loading">
        {{ loading ? 'Signing up...' : 'Sign Up' }}
      </button>

      <!-- Login redirect -->
      <p class="login-text">
        Already have an account?
        <router-link to="/login" class="signin-link">Sign In</router-link>
      </p>
    </form>
  </div>

  <!-- Terms of Service Popup -->
  <div v-if="showTermsPopup" class="modal-overlay">
    <div class="modal-box">
      <div class="modal-header">
        Terms of Service
        <span class="close" @click="showTermsPopup = false">×</span>
      </div>
      <div class="modal-content">
        <p>
          At <strong>HarmoniLink</strong>, we value your privacy and are fully committed to safeguarding your personal
          information in accordance with the <strong>Data Privacy Act of 2012 (RA 10173)</strong>.
        </p>
        <p>
          By signing up and using our services, you consent to the <strong>collection, use, storage, and processing</strong>
          of your personal data—including, but not limited to, your name, email address, and account credentials. This
          data is collected solely for the purpose of delivering and enhancing the features and functionality of our
          platform.
        </p>
        <ul>
          <li>Your personal information is kept <strong>secure and confidential</strong>.</li>
          <li>Your data will <strong>not be shared with third parties</strong> without your explicit consent, unless required by law.</li>
          <li>You retain the <strong>right to access, correct, update, or withdraw</strong> your personal data at any time.</li>
        </ul>
        <p>
          <br>
          We are committed to using your information responsibly and transparently.
        </p>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const termsAccepted = ref(false);

const usernameError = ref('');
const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const loading = ref(false);

const showTermsPopup = ref(false); 
const showPasswordPopup = ref(false);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateUsername = (name) => {
  if (!name) return 'Username is required!';
  if (/\s/.test(name)) return 'Username cannot contain spaces.';
  if (/[@]/.test(name)) return 'Username cannot contain "@" or email domains.';
  if (name.toLowerCase().includes('@gmail.com')) return 'Username cannot include "@gmail.com".';
  // Optional: restrict to alphanumeric, underscores, dots, and dashes only
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return 'Username can only contain letters, numbers, dots, underscores, or dashes.';
  if (name.length < 3) return 'Username must be at least 3 characters.';
  return '';
};

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

const togglePasswordVisibility = (type) => {
  if (type === 'password') {
    showPassword.value = !showPassword.value;
  } else if (type === 'confirm') {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
};

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const hidePasswordPopup = () => {
  setTimeout(() => {
    showPasswordPopup.value = false;
  }, 200); 
};

const recaptchaVerified = ref(false);

const verifyRecaptcha = () => {
  const response = grecaptcha.getResponse();
  if (response.length === 0) {
    alert('Please complete the reCAPTCHA.');
    recaptchaVerified.value = false;
  } else {
    recaptchaVerified.value = true;
  }
};

onMounted(() => {
  const renderRecaptcha = () => {
    if (window.grecaptcha) {
      window.grecaptcha.render('recaptcha-container', {
        sitekey: '6LeSaTIrAAAAAKUISWV1I9lpPKEfntCrGP5t3WeH',
      });
    } else {
      setTimeout(renderRecaptcha, 500); 
    }
  };

  renderRecaptcha();
});

const handleSignup = async () => {
  usernameError.value = validateUsername(username.value);
  emailError.value = '';
  confirmPasswordError.value = ''; // All relevant errors go here now
  passwordError.value = ''; // Will no longer be shown visually

  if (!username.value.trim()) usernameError.value = 'Username is required!';
  if (!emailPattern.test(email.value)) emailError.value = 'Invalid email format!';

  const passwordNotStrong = passwordCriteria.value.some((criteria) => !criteria.met);
  const passwordsDoNotMatch = password.value !== confirmPassword.value;

  if (passwordNotStrong) confirmPasswordError.value = 'Password conditions not met.';
  else if (passwordsDoNotMatch) confirmPasswordError.value = 'Passwords do not match!';

  if (!termsAccepted.value) {
    alert('You must accept the Terms of Service to sign up.');
    grecaptcha.reset();
    return;
  }

  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    alert('Please complete the reCAPTCHA.');
    grecaptcha.reset();
    return;
  }

  if (usernameError.value || emailError.value || confirmPasswordError.value) {
    grecaptcha.reset();
    return;
  }

  try {
    loading.value = true;

    await axios.post(`${import.meta.env.VITE_API_URL}/api/signup`, {
      username: username.value,
      email: email.value,
      password: password.value,
      recaptchaResponse,
    });

    router.push({ path: '/login', query: { signup: 'success' } });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

</script>
  
<style scoped>
 
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

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
}

.logo {
  display: flex;
  align-items: center;
  position: absolute;
  top: 30px;
  left: 30px;
  gap: 5px;
}

.logo img {
  width: 40px;
  height: 40px;
}

.logo p {
  font-size: 20px;
  font-weight: bold;
}

.cdbg {
  display: flex;
  align-items: center;
  position: absolute;
  top: 4.5rem;
  right: 0px;
  height: 38rem;
  width: 50rem;
  border-radius: 10px;
}

.CD {
  position: fixed;
  top: 8rem;
  right: 8rem;
  z-index: 10;
  height: 30rem;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.signup {
  width: 30rem;
  height: 33rem;
  padding: 20px;
  background: linear-gradient(to right, #c697bd, #dbb4d7 80%, #1f0d3e);
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: absolute;
  top: 50%;
  left: 610px;
  transform: translate(-50%, -50%);
  color: #322848;
}

h2 {
  margin-bottom: 3rem;
  color: #322848;
  font-size: 40px;
}

.input-group {
  position: relative;
  margin: 1rem 0;
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

.checkbox-group {
  display: flex;
  align-items: center;
  font-size: 10px;
  margin: 10px 0;
  margin-left: 36px;
}

.checkbox-group input {
  margin-right: 8px;
}

.recaptcha-container {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  transform: scale(0.9); 
  transform-origin: top left; 
  color: red;
}

.recaptcha-wrapper {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  transform: scale(0.85); 
  transform-origin: center; 
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
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}

button:hover {
  background: #14092b;
}

.login-text {
  margin-top: 15px;
  font-size: 13px;
}

.signin-link {
  text-decoration: underline;
  color: #322848;
  cursor: pointer;
  font-weight: bold;
}

.terms {
  text-decoration: solid;
  color: #322848;
  cursor: pointer;
  font-weight: bold;
}

.input-group.invalid input {
  border: 2px solid red;
}

.error-message {
  color: red;
  font-size: 11px;
  margin-top: -3px;
  text-align: left;
  margin-left: 30px;
}

.password-popup {
  position: absolute;
  top: 110%;
  left: 0;
  width: 87%;
  margin-left: 27px;
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
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-box {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  font-size: 20px;
  color: #080d2a;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  margin-left: 155px;
}

.modal-header .close {
  cursor: pointer;
  font-size: 30px;
  color: #333;
}

.modal-content {
  font-size: 13px;
  line-height: 1.5;
  color: #080d2a;
}

.modal-content ul {
  margin: 10px 0;
  padding-left: 20px;
  list-style-position: outside;
}

.modal-content ul li {
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .signup {
    width: 90%;
    height: auto;
    padding: 20px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .input-group input {
    width: 100%;
  }

  button {
    width: 100%;
  }
}
</style>

