<template>
  <nav class="top-nav">
    <img src="/src/assets/logo2.png" alt="Logo" class="logo" />
    <div class="search-container">
      <i 
        class="fa-solid fa-microphone mic-icon" 
        :class="{ 'listening': isListening }" 
        @click="toggleSpeechRecognition"
      ></i>
      <input
        type="text"
        placeholder="Search for username, mixtape, or song"
        class="search-input"
        v-model="searchQuery"
        @input="fetchSearchResults"
      />
    </div>
    <div class="user-menu">
      <i class="fa-solid fa-circle-user user-icon" @click="toggleDropdown"></i>
      <div v-if="showDropdown" class="dropdown-menu">
        <router-link to="/profile" class="dropdown-item">Profile</router-link>
        <button class="dropdown-item logout-button" @click="logout">Logout</button>
      </div>
    </div>

    <!-- Mic overlay -->
    <div v-if="isListening" class="mic-overlay">
      <i 
        class="fa-solid fa-xmark overlay-close-button" 
        @click="closeMicOverlay"
      ></i>
      <div class="mic-animation-wrapper">
        <div class="mic-animation">
          <i class="fa-solid fa-microphone mic-icon"></i>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
        </div>
        <p class="listening-text">{{ micStatusMessage }}</p>
      </div>
    </div>

    <div class="search-results" v-if="searchResults.length > 0">
      <div v-for="(result, index) in searchResults" :key="result.type + '-' + index" class="search-result-item">
        <template v-if="result.type === 'user'">
          <p>User: {{ result.username }}</p>
        </template>
        <template v-else-if="result.type === 'song'">
          <p>Song: {{ result.name }}</p>
        </template>
        <template v-else-if="result.type === 'mixtape'">
          <p>Mixtape: {{ result.name }}</p>
        </template>
      </div>
    </div>

  </nav>
</template> 

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const showDropdown = ref(false);
const searchQuery = ref('');
const isListening = ref(false);
const micStatusMessage = ref('');
const emit = defineEmits(['search']);
const router = useRouter();

let recognition = null;

const searchResults = ref([]); 

async function fetchSearchResults() {
  try {
    const response = await axios.get(`/api/search?q=${searchQuery.value}`);
    searchResults.value = response.data; 
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
}

// Emits search input
function emitSearch() {
  emit('search', searchQuery.value);
}

// Close mic overlay
function closeMicOverlay() {
  if (recognition && isListening.value) {
    recognition.stop();
  }
  isListening.value = false;
  micStatusMessage.value = '';
}

// Toggle dropdown menu
function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

// Logout
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('onboardingStep');
  router.push('/login');
}

// Toggle mic (moved outside of 'if' block)
function toggleSpeechRecognition() {
  if (!recognition) {
    alert('Speech recognition is not supported in your browser.');
    return;
  }

  micStatusMessage.value = 'Speak now';
  isListening.value = true;

  setTimeout(() => {
    micStatusMessage.value = 'Listening...';
    recognition.start();
  }, 800);
}

// Initialize SpeechRecognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening.value = true;
  };if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let gotSpeechResult = false;

  recognition.onstart = () => {
    gotSpeechResult = false;
    isListening.value = true;
    micStatusMessage.value = 'Listening...';
  };

  recognition.onresult = (event) => {
    gotSpeechResult = true;
    const transcript = event.results[0][0].transcript;
    searchQuery.value = transcript;
    emitSearchQuery();
    isListening.value = false;
    micStatusMessage.value = '';
  };

  recognition.onend = () => {
    if (!gotSpeechResult) {
      micStatusMessage.value = "Didn't get that.";
      setTimeout(() => {
        isListening.value = false;
        micStatusMessage.value = '';
      }, 2000);
    } else {
      isListening.value = false;
    }
  };
}
}

</script>

<style scoped>
.user-menu {
  position: relative;
}

.user-icon {
  color: white;
  font-size: 35px;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: #080d2a;
  border: 1px solid #432775;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 150px;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 10px 15px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.3s, color 0.3s;
}

.dropdown-item:hover {
  background-color: #432775;
  color: #ffffff;
}

.logout-button {
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.mic-icon {
  position: absolute;
  left: 10px;
  color: white;
  z-index: 1;
  cursor: pointer;
  transition: color 0.3s ease;
}

.mic-icon.listening {
  color: red; 
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  background-color: #432775;
  border: none;
  border-radius: 40px;
  color: white;
}

/* Mic overlay styles */
.mic-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.83);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  z-index: 2000;
}

.mic-animation-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mic-animation {
  position: relative;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -3rem;
}

.mic-animation .mic-icon {
  font-size: 3.5rem;
  color: red;
  z-index: 2;
  position: relative;
  margin-right: 1rem;
}

.mic-animation .circle {
  position: absolute;
  width: 90px;
  height: 90px;
  border: 2px solid white;
  border-radius: 50%;
  animation: echo 1.5s infinite ease-out;
  opacity: 0.7;
}

.mic-animation .circle:nth-child(2) {
  animation-delay: 0.5s;
}

.mic-animation .circle:nth-child(3) {
  animation-delay: 1s;
}

.listening-text {
  font-size: 1.5rem;
  color: white;
  margin-top: 10rem;
}

.overlay-close-button {
  position:fixed;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 24px;
  color: white;
  cursor: pointer;
  z-index: 2001;
}

.search-results {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #080d2a;
  border: 1px solid #432775;
  border-radius: 8px;
  width: 30rem;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  padding: 1rem;
  color: white;
}

.search-result-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #432775;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #432775;
  cursor: pointer;
}

@keyframes echo {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}
</style>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

  * {
    font-family: 'Fira Code', monospace;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    background-color: #dbb4d7;
    overflow: hidden;
  }

  .top-nav {
    background-color: #080d2a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2.5rem 2rem;
    height: 60px;
    position: relative;
  }

  .logo {
    height: 40px;
  }

  .search-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    width: 30rem;
  }
</style>