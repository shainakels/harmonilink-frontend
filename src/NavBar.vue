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
        placeholder="Search"
        class="search-input"
        v-model="searchQuery"
        @input="emitSearchQuery"
      />
    </div>
    <div class="user-menu">
      <i class="fa-solid fa-circle-user user-icon" @click="toggleDropdown"></i>
      <div v-if="showDropdown" class="dropdown-menu">
        <router-link to="/profile" class="dropdown-item">Profile</router-link>
        <button class="dropdown-item logout-button" @click="logout">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const showDropdown = ref(false);
const searchQuery = ref(''); // Tracks the search input
const isListening = ref(false); // Tracks whether speech recognition is active
const router = useRouter();
let recognition = null; // SpeechRecognition instance

// Emit the search query to the parent component
const emit = defineEmits(['search']);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function emitSearchQuery() {
  emit('search', searchQuery.value); // Emit the search query
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('onboardingStep');
  router.push('/login');
}

// Initialize SpeechRecognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US'; // Set the language
  recognition.interimResults = false; // Only return final results
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening.value = true;
  };

  recognition.onend = () => {
    isListening.value = false;
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchQuery.value = transcript; // Update the search query with the recognized text
    emitSearchQuery(); // Emit the updated search query
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    isListening.value = false;
  };
} else {
  console.warn('SpeechRecognition is not supported in this browser.');
}

// Toggle speech recognition
function toggleSpeechRecognition() {
  if (!recognition) {
    alert('Speech recognition is not supported in your browser.');
    return;
  }

  if (isListening.value) {
    recognition.stop(); // Stop listening
  } else {
    recognition.start(); // Start listening
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
  color: red; /* Change color when listening */
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  background-color: #432775;
  border: none;
  border-radius: 40px;
  color: white;
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