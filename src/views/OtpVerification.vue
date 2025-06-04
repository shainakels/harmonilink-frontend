<template>
  <div class="background"></div>
  
  <div class="otp-verification">
    <h2>VERIFY EMAIL</h2>
    <img src="/src/assets/logo.png" alt="Harmonilink Logo">
    <p class="quote-text">Enter the verification code sent to your email</p>
    <p class="email-info">{{ email }}</p>
    
    <form @submit.prevent="handleVerifyOtp">
      <div class="otp-input-group">
        <input
          v-for="(digit, index) in otpDigits"
          :key="index"
          :ref="el => otpInputs[index] = el"
          type="text"
          maxlength="1"
          v-model="otpDigits[index]"
          @input="handleOtpInput(index)"
          @keydown="handleKeyDown(index, $event)"
          @paste="handlePaste"
          class="otp-input"
          autocomplete="off"
        />
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <button type="submit" :disabled="loading || !isOtpComplete">
        {{ loading ? 'Verifying...' : 'Verify Code' }}
      </button>

      <div class="resend-section">
        <p v-if="!canResend" class="timer-text">
          Resend code in {{ timeLeft }}s
        </p>
        <button 
          v-else 
          type="button" 
          @click="handleResendOtp" 
          :disabled="resendLoading"
          class="resend-btn"
        >
          {{ resendLoading ? 'Sending...' : 'Resend Code' }}
        </button>
      </div>

      <p class="login-text">
        Remember your password? 
        <router-link to="/login" class="signin-link">Sign In</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();

const email = ref(route.query.email || '');
const otpDigits = reactive(['', '', '', '', '', '']);
const otpInputs = ref([]);
const loading = ref(false);
const resendLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Timer for resend functionality
const timeLeft = ref(60);
const canResend = ref(false);
let timer = null;

const isOtpComplete = computed(() => {
  return otpDigits.every(digit => digit !== '');
});

const otpCode = computed(() => {
  return otpDigits.join('');
});

// Start countdown timer
const startTimer = () => {
  timeLeft.value = 60;
  canResend.value = false;
  timer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      canResend.value = true;
      clearInterval(timer);
    }
  }, 1000);
};

const handleOtpInput = (index) => {
  const value = otpDigits[index];
  
  // Only allow numbers
  if (!/^\d*$/.test(value)) {
    otpDigits[index] = '';
    return;
  }

  // Move to next input if current is filled
  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
};

const handleKeyDown = (index, event) => {
  // Handle backspace
  if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
  
  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
  if (event.key === 'ArrowRight' && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData.getData('text');
  
  if (/^\d{6}$/.test(pastedData)) {
    for (let i = 0; i < 6; i++) {
      otpDigits[i] = pastedData[i];
    }
    otpInputs.value[5]?.focus();
  }
};

const handleVerifyOtp = async () => {
  if (!isOtpComplete.value) {
    errorMessage.value = 'Please enter the complete verification code.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-otp`, {
      email: email.value,
      otp: otpCode.value,
    });

    if (response.status === 200) {
      successMessage.value = 'Email verified successfully!';
      setTimeout(() => {
        router.push({ path: '/login', query: { verified: 'success' } });
      }, 1500);
    }
  } catch (error) {
    if (error.response?.status === 400) {
      errorMessage.value = 'Invalid or expired verification code.';
    } else {
      errorMessage.value = 'Something went wrong. Please try again.';
    }
    
    // Clear OTP inputs on error
    otpDigits.fill('');
    otpInputs.value[0]?.focus();
  } finally {
    loading.value = false;
  }
};

const handleResendOtp = async () => {
  resendLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/resend-otp`, {
      email: email.value,
    });

    if (response.status === 200) {
      successMessage.value = 'New verification code sent!';
      startTimer();
      // Clear current OTP
      otpDigits.fill('');
      otpInputs.value[0]?.focus();
    }
  } catch (error) {
    if (error.response?.status === 404) {
      errorMessage.value = 'User not found or already verified.';
    } else {
      errorMessage.value = 'Failed to resend code. Please try again.';
    }
  } finally {
    resendLoading.value = false;
  }
};

onMounted(() => {
  // Check if email is provided
  if (!email.value) {
    router.push('/signup');
    return;
  }
  
  // Focus first input
  otpInputs.value[0]?.focus();
  
  // Start initial timer
  startTimer();
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
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

.otp-verification {
  width: 25rem;
  min-height: 32rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.755); 
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

.otp-verification img {
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
  margin: 0.9rem 0 1rem;
  color: #322848;
}

.email-info {
  font-size: 0.75rem;
  color: #322848;
  margin-bottom: 2rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.45);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.otp-input-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 2rem 0;
}

.otp-input {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.45);
  color: #322848;
  transition: all 0.3s ease;
}

.otp-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
}

.otp-input::placeholder {
  color: rgba(50, 40, 72, 0.6);
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

button:hover:not(:disabled) {
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
  transform: none;
  box-shadow: none;
}

.resend-section {
  margin: 1.5rem 0;
}

.resend-btn {
  background: transparent;
  color: #322848;
  border: 2px solid #322848;
  font-size: 14px;
  height: 40px;
  margin-top: 0;
  width: auto;
  padding: 0 1rem;
}

.resend-btn:hover:not(:disabled) {
  background: #322848;
  color: white;
  box-shadow: 0 0 10px #8a6bb8, 0 0 20px #c697bd, 0 0 30px #dbb4d7;
  transform: translateY(-1px);
}

.timer-text {
  font-size: 14px;
  color: #322848;
  margin: 0;
}

.login-text {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #322848;
}

.signin-link {
  color: #322848;
  text-decoration: none;
  font-weight: 600;
}

.success-message {
  color: green;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(76, 175, 76, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(76, 175, 76, 0.2);
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

/* Responsive Design */
@media (max-width: 768px) {
  .otp-verification {
    width: 90%;
    max-width: 25rem;
    padding: 1.5rem;
    min-height: 30rem;
  }

  .otp-input {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .otp-verification {
    padding: 1rem;
    min-height: 26rem;
  }

  h2 {
    font-size: 1.75rem;
  }

  .otp-input-group {
    gap: 0.3rem;
  }

  .otp-input {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .otp-verification {
    background: rgba(255,255,255,0.12);
    color: #322848;
  }
  
  .otp-input {
    background: rgba(255,255,255,0.25);
    border: none;
    color: #322848;
  }
  
  .otp-input:focus {
    background: rgba(255,255,255,0.25);
  }
  
  .email-info {
    background: rgba(255,255,255,0.25);
    border: none;
  }
  
  h2, .quote-text, .login-text, .signin-link, .timer-text {
    color: #322848;
  }
  
  .resend-btn {
    color: #322848;
    border-color: #322848;
  }
  
  .success-message {
    color: green;
    background: rgba(129, 199, 132, 0.1);
    border-color: rgba(129, 199, 132, 0.2);
  }

  .error-message {
    color: #f44336;
    background: rgba(229, 115, 115, 0.1);
    border-color: rgba(229, 115, 115, 0.2);
  }
}
</style>