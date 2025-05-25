<template>
  <nav class="top-nav">
    <img src="/src/assets/logo2.png" alt="Logo" class="logo" />
    <div class="search-container" v-if="showSearchBar">
      <i
        class="fa-solid fa-microphone mic-icon"
        :class="{ listening: isListening }"
        @click="toggleSpeechRecognition"
      ></i>
      <input
        type="text"
        placeholder="Search for username, mixtape, or song"
        class="search-input"
        v-model="searchQuery"
        @input="fetchSearchResults"
      />
      <button
        v-if="searchQuery"
        class="clear-btn"
        @click="clearSearch"
        style="margin-left: 8px"
      >
        ✕
      </button>
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

    <div
      class="search-results"
      v-if="showSearchResults && searchResults.length > 0"
    >
      <div
        v-for="(result, index) in searchResults"
        :key="result.user_id + '-' + index"
        class="search-result-item"
        @click="
          goToUser(
            result.user_id,
            result.mixtape?.name,
            result.mixtape?.songs?.[0]
          )
        "
      >
        <template v-if="result.type === 'user'">
          <p>
            <strong>{{ result.username }}</strong>
            <span v-if="result.mixtape && result.mixtape.name"
              >— Mixtape: {{ result.mixtape.name }}</span
            >
          </p>
          <div v-if="result.mixtape && result.mixtape.songs.length">
            <small>Songs: {{ result.mixtape.songs.join(", ") }}</small>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const showDropdown = ref(false);
const searchQuery = ref("");
const isListening = ref(false);
const micStatusMessage = ref("");
const emit = defineEmits(["search"]);
const router = useRouter();
const route = useRoute();

let recognition = null;

const searchResults = ref([]);

async function fetchSearchResults() {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    showSearchResults.value = false;
    return;
  }
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(
        searchQuery.value
      )}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    searchResults.value = response.data;
    showSearchResults.value = true;
  } catch (error) {
    console.error("Error fetching search results:", error);
    showSearchResults.value = false;
  }
}

// Emits search input
function emitSearch() {
  emit("search", searchQuery.value);
}

// Close mic overlay
function closeMicOverlay() {
  if (recognition && isListening.value) {
    recognition.stop();
  }
  isListening.value = false;
  micStatusMessage.value = "";
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
    alert("Speech recognition is not supported in your browser.");
    return;
  }

  micStatusMessage.value = "Speak now";
  isListening.value = true;

  setTimeout(() => {
    micStatusMessage.value = "Listening...";
    recognition.start();
  }, 800);
}

// Initialize SpeechRecognition
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening.value = true;
  };
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let gotSpeechResult = false;

    recognition.onstart = () => {
      gotSpeechResult = false;
      isListening.value = true;
      micStatusMessage.value = "Listening...";
    };

    recognition.onresult = (event) => {
      gotSpeechResult = true;
      const transcript = event.results[0][0].transcript;
      searchQuery.value = transcript;
      fetchSearchResults(); // <-- FIXED: call fetchSearchResults, not emitSearchQuery
      isListening.value = false;
      micStatusMessage.value = "";
    };

    recognition.onend = () => {
      if (!gotSpeechResult) {
        micStatusMessage.value = "Didn't get that.";
        setTimeout(() => {
          isListening.value = false;
          micStatusMessage.value = "";
        }, 2000);
      } else {
        isListening.value = false;
      }
    };
  }
}

//Addition para maayos yung sa search bar
import { onMounted, onBeforeUnmount, watch } from "vue";

const showSearchResults = ref(false);

function handleClickOutside(event) {
  const searchEl = document.querySelector(".search-container");
  const resultsEl = document.querySelector(".search-results");
  if (
    searchEl &&
    !searchEl.contains(event.target) &&
    resultsEl &&
    !resultsEl.contains(event.target)
  ) {
    showSearchResults.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

watch(searchQuery, (newVal) => {
  if (newVal.trim() === "") {
    searchResults.value = [];
    showSearchResults.value = false;
  } else {
    showSearchResults.value = true;
  }
});

function goToUser(userId) {
  // Pass the search query as a route query parameter
  router.push({ path: "/discover", query: { search: searchQuery.value } });
  showSearchResults.value = false;
}

function clearSearch() {
  searchQuery.value = "";
  showSearchResults.value = false;
  // Remove the search query from the URL
  router.push({ path: "/discover" });
}

const showSearchBar = computed(() => {
  // Hide on /feed, /favorites, /profile, /profile/:id
  const path = route.path;
  return !(
    path.startsWith("/feed") ||
    path.startsWith("/favorites") ||
    path === "/profile" ||
    /^\/profile\/[^/]+$/.test(path)
  );
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

* {
  font-family: "Fira Code", monospace;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #dbb4d7;
  overflow-x: hidden;
}

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: #080d2a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  z-index: 10;
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
  width: 100%; /* Full width on smaller screens */
  max-width: 600px; /* Limit width on larger screens */
  margin: 0 auto;
}

.clear-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  outline: none;
}
</style>

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
  position: fixed;
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

/* Responsive styles */
@media (max-width: 768px) {
  .top-nav {
    padding: 1rem; /* Adjust padding */
    justify-content: space-between; /* Keep logo and user icon in place */
  }

  .search-container {
    width: 60%; /* Full width on smaller screens */
    max-width: 400px; /* Limit width on larger screens */
    margin: 0 auto; /* Center the search container */
    transition: max-width 0.5s ease, width 0.5s ease; /* Smooth transition for width */
  }

  .search-input {
    width: 100%; /* Full width for the input */
    padding: 0.5rem 1rem 0.5rem 2.5rem; /* Adjust padding */
    transition: width 0.5s ease, padding 0.5s ease; /* Smooth transition for input width and padding */
  }
}

@media (max-width: 480px) {
  .user-icon {
    font-size: 30px; /* Smaller icon size */
  }

  .search-input {
    padding: 0.5rem; /* Adjust padding for smaller screens */
    transition: padding 0.5s ease; /* Smooth transition for padding */
  }
}

@media (max-width: 380px) {
  .search-container {
    max-width: 300px; /* Further limit width on very small screens */
  }

  .search-input {
    padding: 0.5rem;
  }
}
</style>
