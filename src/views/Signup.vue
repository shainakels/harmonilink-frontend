<template>
  <!-- Background image -->
<<<<<<< HEAD
  <img src="/src/assets/background.png" alt="background" class="background">
=======
>>>>>>> main
  <div class="background"></div>

  <!-- Logo -->
  <div class="logo">
    <img src="/src/assets/logo.png" alt="Harmonilink Logo" />
    <p>armonilink</p>
  </div>

  <!-- Main container -->
  <div class="signup-container">
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

    <!-- CD Background with stars -->
    <div class="cdbg">
      <div class="star1 stars"></div>
      <div class="star2 stars"></div>
      <div class="star3 stars"></div>
      <div class="star4 stars"></div>
<<<<<<< HEAD
=======
      <div class="star5 stars"></div>
      <div class="star6 stars"></div>
      <div class="star7 stars"></div>
      <div class="star8 stars"></div>
      <div class="star9 stars"></div>
      <div class="star10 stars"></div>
>>>>>>> main
      <img src="/src/assets/cd.png" alt="CD" class="cd" />
    </div>
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
  confirmPasswordError.value = '';
  passwordError.value = '';

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
  background: linear-gradient(120deg, #e3b8ff 0%, #dbb4d7 25%, #c697bd 50%, #8a6bb8 75%, #322848 100%);
  background-size: 300% 300%;
  background-position: 0% 50%;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  transform: none;
  animation: gradientMove 12s ease-in-out infinite;
  transition: background-position 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes gradientMove {
  0% {
    background-position: 0% 60%;
  }
  25% {
    background-position: 50% 100%;
  }
  50% {
    background-position: 100% 50%;
  }
  75% {
    background-position: 50% 0%;
  }
  100% {
    background-position: 0% 60%;
  }
}

.logo {
  display: flex;
  align-items: center;
  position: fixed;
  top: 20px;
  left: 20px;
  gap: 5px;
  z-index: 2;
}

.logo img {
  width: 30px;
  height: 30px;
}

.logo p {
  font-size: 18px;
  font-weight: bold;
  color: #322848;
}

.signup {
  width: 550px;
  padding: 20px 50px;
  background: rgba(255, 255, 255, 0.65); 
  text-align: center;
  position: absolute;
  top: 50%;
  left: 40%;
  transform: translate(-50%, -50%);
  color: #322848;
  z-index: 1;
  border-radius: 25px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  height: auto;
  min-height: 580px;
  transition: all 0.3s ease;
}

.signup:hover {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.35);
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.signup-container {
  position: relative;
<<<<<<< HEAD
  width: 100%;
  height: 100vh;

=======
  width: 100vw;
  height: 100vh;
  position: absolute;
>>>>>>> main
  top: 0;
  left: 0;
}

.cdbg {
  position: absolute;
  width: 45%;
  height: 545px;
  background: #322848;
  z-index: 0;
  border-radius: 1px 0 0 1px;
  top: 50%;
  left: 58%; 
  transform: translate(0, -50%);
  overflow: hidden;
}


.cd {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  width: 450px;
  height: 450px;
  animation: rotate 20s linear infinite, glow 2s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 25px rgba(138, 43, 226, 0.6)) 
          drop-shadow(0 0 10px rgba(255, 255, 255, 0.4));
}

@keyframes glow {
  from {
    filter: drop-shadow(0 0 15px rgba(138, 43, 226, 0.4))
            drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
  }
  to {
    filter: drop-shadow(0 0 30px rgba(138, 43, 226, 0.6))
            drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.stars {
  position: absolute;
  width: 3px;
  height: 3px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 4px #fff;
  z-index: 2;
  animation: twinkle 2s infinite ease-in-out, float 4s infinite ease-in-out;
}

.star1 { top: 10%; right: 30%; width: 2px; height: 2px; }
.star2 { top: 20%; right: 10%; width: 4px; height: 4px; }
.star3 { bottom: 15%; right: 25%; width: 3px; height: 3px; }
.star4 { bottom: 25%; right: 15%; width: 5px; height: 5px; }
.star5 { top: 35%; right: 40%; width: 2.5px; height: 2.5px; }
.star6 { top: 50%; left: 20%; width: 3.5px; height: 3.5px; }
.star7 { top: 30%; left: 35%; width: 2px; height: 2px; }
.star8 { top: 60%; left: 5%; width: 4px; height: 4px; }
.star9 { bottom: 10%; left: 45%; width: 3px; left: 3px; }
.star10 { top: 15%; left: 50%; width: 2.5px; left: 2.5px; }


@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

h2 {
  margin-bottom: 1.5rem;
  color: #322848;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 2px;
}

.input-group {
  position: relative;
  margin: 0.90rem 0;
  width: 100%;
}

.input-group input {
  width: 95%;
  height: 42px;
  padding: 10px 40px 10px 15px;
  background: rgba(255, 255, 255, 0.495);
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

.checkbox-group {
  margin: 10px 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: rgba(50, 40, 72, 0.8);
  font-size: 10px;
}

.checkbox-group input[type="checkbox"] {
  margin-top: 3px;
  margin-left: 18px;
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


.login-text {
  margin-top: 13px;
  font-size: 0.85rem;
  color: #322848;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.signin-link {
  text-decoration: none;
  color: #322848;
  font-weight: 600;
}

.terms {
  color: inherit;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin: 0.5rem 0 0.5rem 1rem;
  padding: 0.5rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(244, 67, 54, 0.2);
  width: 94%;
}

.input-group.invalid input {
  background: rgba(255, 235, 235, 0.4);
}

.input-group.invalid .icon {
  color: #ff3b3b;
  opacity: 0.8;
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
  box-shadow: 0 10px 25px 5px rgba(50, 40, 72, 0.3); 
}

.modal-header {
  font-size: 20px;
  color: #080d2a;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  margin-left: 121px;
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

@media (max-width: 1400px) {
<<<<<<< HEAD
  .signup {
    left: 37%;
  }
}

@media (max-width: 1200px) {
  .signup {
    left: 45%;
  }

}

@media (max-width: 768px) {
  .cdbg {
    display: none;
  }

  .cd {
    display: none;
  }

  .signup {
    border-radius: 25px;
    left: 50%;
    width: 90%;
=======
  .signup {
    left: 37%;
  }
}

@media (max-width: 1200px) {
  .signup {
    left: 45%;
  }
  
  .cdbg {
    margin-left: -100px;
  }
}

@media (max-width: 992px) {
  .signup {
    width: 90%;
    max-width: 550px;
    left: 50%;
    padding: 25px 40px;
    border-radius: 25px;
  }
  
  .cdbg {
    width: 100%;
    height: 100%;
    opacity: 0.8;
    border-radius: 15px;
    margin-left: 0;
  }
  
  .cd {
    right: 50%;
    transform: translate(50%, -50%);
    width: 300px;
    height: 300px;
    opacity: 0.7;
  }
  
  .input-group {
    margin: 1.5rem 0;
  }
  
  .input-group input {
    height: 42px;
  }
}

@media (max-width: 768px) {
  .cdbg {
    display: none;
  }

  .cd {
    display: none;
  }

  .signup {
    border-radius: 25px;
    left: 50%;
>>>>>>> main
  }

  .modal-box {
    width: 90%;
    margin: 0 1rem;
  }

  .modal-header {
    margin-left: 0;
    justify-content: center;
  }

  .modal-header .close {
    position: absolute;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .signup {
    padding: 25px 40px;
<<<<<<< HEAD
    width: 90%;
=======
>>>>>>> main
  }

  h2 {
    font-size: 32px;
    margin-bottom: 2rem;
  }

  .input-group input {
    height: 40px;
    font-size: 14px;
  }

  .checkbox-group {
    font-size: 11px;
  }

  button {
    height: 42px;
    font-size: 15px;
<<<<<<< HEAD
  }

  .password-validation {
    font-size: 11px;
    padding: 12px;
  }

  .password-validation p {
    margin: 6px 0;
=======
>>>>>>> main
  }

  .password-validation {
    font-size: 11px;
    padding: 12px;
  }

  .password-validation p {
    margin: 6px 0;
  }
}

@media (max-height: 700px) {
  .signup {
    transform: translate(-50%, -50%) scale(0.95);
  }
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

.recaptcha-wrapper {
  display: flex;
  justify-content: center;
  margin: 0.75rem 0;
  transform: scale(0.85);
  transform-origin: center;
}

@media (max-height: 700px) {
  .signup {
    transform: translate(-50%, -50%) scale(0.95);
  }
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

.recaptcha-wrapper {
  display: flex;
  justify-content: center;
  margin: 0.75rem 0;
  transform: scale(0.85);
  transform-origin: center;
}
</style>
