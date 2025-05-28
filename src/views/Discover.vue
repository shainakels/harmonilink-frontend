<template>
  <transition name="fade">
    <NavLayout>
      <div class="animated-background"></div>
      <div class="favorites-wrapper">
        <!-- Removed Discover title and description below -->
        <div class="grid-container">
          <div class="left-column">
            <!-- Navigation Buttons -->
            <button
              class="nav-button"
              @click="prevProfile"
              :disabled="currentIndex === 0 || isFlipped"
            >
              <i class="fa-solid fa-circle-arrow-left"></i>
            </button>
          </div>

          <div class="main-column">
            <div class="discover-container" :class="{ flipped: isFlipped }">
              <!-- No Profiles Message -->
              <div
                v-if="filteredProfiles.length === 0"
                class="no-profiles-centered"
              >
                <p>It's a bit quiet here. New profiles will drop soon!</p>
              </div>
              <!-- Front Side (Profile Details) -->
              <div class="front" v-if="currentProfile">
                <div class="discover-top">
                  <div class="refresh-wrapper">
                    <span class="refresh-label">Next Refresh:</span><br />
                    <span class="refresh-time">{{ refreshTime }}</span>
                  </div>
                  <div class="profile-count-wrapper">
                    <span class="profile-count"
                      >Profiles Viewed: {{ viewedProfiles }}/10</span
                    >
                  </div>
                </div>

                <div class="profile-card">
                  <h2 class="profile-name">{{ currentProfile.username }}</h2>
                  <p class="profile-info">
                    {{ currentProfile.age }} years old,
                    {{ currentProfile.gender }}
                  </p>
                  <img
                    :src="
                      getFullPhotoUrl(currentProfile.mixtapes[0]?.photo_url)
                    "
                    class="mixtape-image"
                  />
                  <h2 class="mixtape-title-front">
                    {{ currentProfile.mixtapes[0]?.name }}
                  </h2>
                  <p class="mixtape-description">
                    {{ currentProfile.mixtapes[0]?.bio }}
                  </p>

                  <!-- Unpack Button -->
                  <button
                    class="unpack-button"
                    :class="{ unpacked: currentProfile.viewed }"
                    @click="flipCard"
                  >
                    {{ currentProfile.viewed ? "Unpacked" : "Unpack" }}
                    <span
                      v-if="currentProfile.favorited"
                      class="heart-indicator"
                      >❤️</span
                    >
                  </button>
                </div>
              </div>

              <!-- Back Side (Mixtape Details) -->
              <div class="back" v-if="currentProfile">
                <div class="back-button" @click="flipCard">
                  <i class="fa-solid fa-arrow-left"></i>
                </div>

                <!-- Show mixtape details if available -->
                <div
                  class="back-mixtape"
                  v-if="currentProfile.mixtapes?.length > 0"
                >
                  <img
                    :src="getFullPhotoUrl(currentProfile.mixtapes[0].photo_url)"
                    class="mixtape-image"
                  />
                  <h3 class="mixtape-title-back">
                    {{ currentProfile.mixtapes[0].name }}
                  </h3>
                  <ul class="song-list">
                    <li
                      v-for="(song, index) in currentProfile.mixtapes[0].songs"
                      :key="index"
                      class="song-item"
                      style="
                        display: flex;
                        align-items: center;
                        cursor: pointer;
                      "
                      @click="song.preview_url && toggleDiscoverPlay(index)"
                      :aria-label="
                        discoverPlayingIndex === index
                          ? 'Pause preview'
                          : 'Play preview'
                      "
                      tabindex="0"
                    >
                      <!-- Animated Soundwave SVG -->
                      <span
                        class="soundwave"
                        :class="{ active: discoverPlayingIndex === index }"
                        v-if="song.preview_url"
                        style="margin-right: 0.7rem"
                      >
                        <svg width="22" height="22" viewBox="0 0 22 22">
                          <rect
                            class="bar bar1"
                            x="2"
                            y="6"
                            width="3"
                            height="10"
                            rx="1.5"
                          />
                          <rect
                            class="bar bar2"
                            x="7"
                            y="3"
                            width="3"
                            height="16"
                            rx="1.5"
                          />
                          <rect
                            class="bar bar3"
                            x="12"
                            y="8"
                            width="3"
                            height="6"
                            rx="1.5"
                          />
                          <rect
                            class="bar bar4"
                            x="17"
                            y="5"
                            width="3"
                            height="12"
                            rx="1.5"
                          />
                        </svg>
                      </span>
                      <span
                        v-else
                        style="width: 22px; margin-right: 0.7rem"
                      ></span>

                      <img
                        v-if="song.artwork_url"
                        :src="song.artwork_url"
                        alt="Artwork"
                        class="song-artwork"
                        style="
                          width: 40px;
                          height: 40px;
                          margin-right: 0.5rem;
                          border-radius: 6px;
                        "
                      />

                      <span style="width: 200px">
                        {{ song.song_name }} by {{ song.artist_name }}
                      </span>

                      <audio
                        v-if="song.preview_url"
                        ref="discoverAudioRefs"
                        :src="song.preview_url"
                        @ended="onDiscoverAudioEnded"
                        style="display: none"
                      ></audio>
                      <span
                        v-else
                        class="no-preview"
                        style="margin-left: 0.5rem"
                        >No preview</span
                      >
                    </li>
                  </ul>
                </div>

                <!-- Fallback message if no mixtapes are available -->
                <div class="no-mixtape-message" v-else>
                  <p>No mixtapes yet. Wanna give them a chance?</p>
                </div>

                <!-- Action Section -->
                <div class="action-section">
                  <div class="buttons">
                    <!-- Heart Button -->
                    <button
                      class="heart-btn"
                      :class="{ clicked: currentProfile.favorited }"
                      @click="animateHeart"
                      title="Add to Favorites"
                    >
                      <i class="fa-solid fa-heart"></i>
                    </button>

                    <!-- Discard Button -->
                    <button
                      class="x-btn"
                      @click="animateX"
                      :disabled="currentProfile.favorited"
                      title="Discard Profile"
                    >
                      <i class="fa-solid fa-x"></i>
                    </button>
                  </div>
                  <p class="action-message">
                    If you both vibe with each other, tap the heart button!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="right-column">
            <!-- Navigation Buttons -->
            <button
              class="nav-button right"
              @click="nextProfile"
              :disabled="currentIndex === profiles.length - 1 || isFlipped"
            >
              <i class="fa-solid fa-circle-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </NavLayout>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import NavLayout from "../layouts/NavLayout.vue";
import axios from "axios";
import { useRouter, useRoute } from "vue-router";
import confetti from "canvas-confetti";

const router = useRouter();
const route = useRoute();

// Profiles data
const profiles = ref([]);
const filteredProfiles = ref([]); // <-- move this up!
const currentIndex = ref(0);
const currentProfile = computed(
  () => filteredProfiles.value[currentIndex.value] || null
);
const isFlipped = ref(false);

// Current user data
const currentUser = ref(null);

// Timer for profile refresh
const refreshTime = ref("03:00:00");
let refreshInterval;

// Tracks the number of profiles unpacked
const viewedProfiles = ref(0);

// Audio playback management
const discoverAudioRefs = ref([]);
const discoverPlayingIndex = ref(null);

function toggleDiscoverPlay(index) {
  // Pause all other audios
  discoverAudioRefs.value.forEach((audio, i) => {
    if (audio && i !== index) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  const currentAudio = discoverAudioRefs.value[index];
  if (!currentAudio) return;

  if (discoverPlayingIndex.value === index && !currentAudio.paused) {
    currentAudio.pause();
    discoverPlayingIndex.value = null;
  } else {
    currentAudio.play();
    discoverPlayingIndex.value = index;
  }
}

function onDiscoverAudioEnded() {
  discoverPlayingIndex.value = null;
}

// Reset refs when songs change
watch(
  () => currentProfile.value?.mixtapes?.[0]?.songs,
  () => {
    discoverAudioRefs.value = [];
    discoverPlayingIndex.value = null;
  }
);

// Fetch current user profile
async function fetchCurrentUser() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found.");
      return;
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/auth/current-user`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    currentUser.value = response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      alert("Session expired. Please log in again.");
      router.push("/login");
    }
  }
}

// Fetch profiles from the backend and shuffle them
async function fetchProfiles() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No auth token found.");
    return;
  }

  if (profiles.value.length > 0) {
    console.log("Using saved profiles from localStorage.");
    filterProfiles(); // <-- Always filter after loading
    return;
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/discover`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    profiles.value = response.data.map((profile) => ({
      ...profile,
      viewed: false,
    }));
    currentIndex.value = 0;
    viewedProfiles.value = 0;
    saveStateToLocalStorage();
    filterProfiles(); // <-- Always filter after fetching
  } catch (error) {
    console.error("Error fetching profiles:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      alert("Session expired. Please log in again.");
      router.push("/login");
    }
  }
}

// Utility function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Navigate to the next profile
function nextProfile() {
  pauseAllPreviews();
  if (profiles.value.length === 0) {
    alert("No more profiles available.");
    return;
  }

  if (currentIndex.value < profiles.value.length - 1) {
    currentIndex.value++;
  }
}

// Navigate to the previous profile
function prevProfile() {
  pauseAllPreviews();
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

// Flip the profile card
function flipCard() {
  pauseAllPreviews();
  if (!isFlipped.value) {
    // Mark the profile as viewed
    if (!currentProfile.value.viewed) {
      currentProfile.value.viewed = true;
      viewedProfiles.value++;
      saveStateToLocalStorage();

      // Start the refresh timer when the user unpacks for the first time
      if (viewedProfiles.value === 1) {
        startRefreshTimer();
      }

      // Confetti when unpacking for the first time
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
      });
    }
  }
  isFlipped.value = !isFlipped.value;
}

// Start the refresh timer
function startRefreshTimer() {
  if (!currentUser.value || !currentUser.value.id) {
    console.error("User ID is not available. Cannot start the timer.");
    return;
  }

  const timerKey = `refreshEndTime_${currentUser.value.id}`; // Unique key for each user
  let endTime = localStorage.getItem(timerKey);

  // Set endTime to 3 hours from now when the user unpacks
  if (!endTime || isNaN(parseInt(endTime, 10))) {
    endTime = Date.now() + 3 * 60 * 60 * 1000; // 3 hours in ms
    localStorage.setItem(timerKey, endTime.toString());
  } else {
    endTime = parseInt(endTime, 10);
  }

  function updateTimer() {
    const now = Date.now();
    const timeLeft = Math.max(Math.floor((endTime - now) / 1000), 0);

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    // Ensure the display is always in the format HH:MM:SS
    refreshTime.value = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(refreshInterval);
      refreshInterval = null; // Reset the interval
      localStorage.removeItem(timerKey); // Clear the timer for this user

      // Refresh the profiles
      clearState(); // Clear profiles, index, and viewed count
      fetchProfiles(); // Fetch new profiles
    }
  }

  updateTimer(); // Run immediately
  refreshInterval = setInterval(updateTimer, 1000);
}

// Save state to localStorage
function saveStateToLocalStorage() {
  if (!currentUser.value || !currentUser.value.id) {
    console.error("User ID is not available. Cannot save state.");
    return;
  }

  const stateKey = `discoverState_${currentUser.value.id}`; // Unique key for each user
  const state = {
    profiles: profiles.value.map((profile) => ({
      ...profile,
      favorited: profile.favorited || false,
      viewed: profile.viewed || false,
    })),
    currentIndex: currentIndex.value,
    viewedProfiles: viewedProfiles.value,
  };
  localStorage.setItem(stateKey, JSON.stringify(state));
}

// Load state from localStorage
function loadStateFromLocalStorage() {
  if (!currentUser.value || !currentUser.value.id) {
    console.error("User ID is not available. Cannot load state.");
    return;
  }

  const stateKey = `discoverState_${currentUser.value.id}`; // Unique key for each user
  const savedState = localStorage.getItem(stateKey);
  if (savedState) {
    const state = JSON.parse(savedState);
    profiles.value = state.profiles || [];
    currentIndex.value = state.currentIndex || 0;
    viewedProfiles.value = state.viewedProfiles || 0;
  }
}

// Clear state
function clearState() {
  profiles.value = [];
  currentIndex.value = 0;
  viewedProfiles.value = 0;
  isFlipped.value = false;

  if (currentUser.value && currentUser.value.id) {
    const stateKey = `discoverState_${currentUser.value.id}`;
    localStorage.removeItem(stateKey); // Clear saved state for the user
  }
}

// Pause all audio previews
function pauseAllPreviews() {
  discoverAudioRefs.value.forEach((audio) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
  discoverPlayingIndex.value = null;
}

// Animate heart button
const animateHeart = async () => {
  pauseAllPreviews();
  const favoriteProfile = currentProfile.value;

  if (favoriteProfile) {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("You must be logged in to add favorites.");
        return;
      }

      // Send the profile to the backend to store in the favorites table
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/favorites`,
        { user_id: favoriteProfile.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mark the profile as favorited
      favoriteProfile.favorited = true;

      saveStateToLocalStorage(); // Save the updated state
      alert("Profile added to favorites!");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert("Failed to add to favorites. Please try again.");
    }
  }
};

// Animate X button
const animateX = async () => {
  pauseAllPreviews();
  const discardedProfile = currentProfile.value;

  if (discardedProfile) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to discard profiles.");
        return;
      }

      // Send the profile to the backend to store in the discarded table
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/discard`,
        { discarded_user_id: discardedProfile.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the discarded profile from the profiles list
      profiles.value.splice(currentIndex.value, 1);

      // Adjust the current index if necessary
      if (currentIndex.value >= profiles.value.length) {
        currentIndex.value = profiles.value.length - 1;
      }

      // Reset the flipped state to ensure the next profile is shown on the front
      isFlipped.value = false;

      saveStateToLocalStorage(); // Save the updated state
      alert("Profile discarded.");
    } catch (error) {
      console.error("Error discarding profile:", error); // Log the error
      alert("Failed to discard profile. Please try again.");
    }
  }
};

// Search filter
const searchFilter = ref("");

watch(
  () => route.query.search,
  (newVal) => {
    searchFilter.value = newVal || "";
    filterProfiles();
    currentIndex.value = 0;
  },
  { immediate: true }
);

function filterProfiles() {
  if (!searchFilter.value) {
    filteredProfiles.value = profiles.value;
    return;
  }
  const q = searchFilter.value.toLowerCase();
  filteredProfiles.value = profiles.value.filter((profile) => {
    // Match username
    if (profile.username && profile.username.toLowerCase().includes(q))
      return true;
    // Match mixtape name
    if (
      profile.mixtapes &&
      profile.mixtapes.some(
        (mix) => mix.name && mix.name.toLowerCase().includes(q)
      )
    )
      return true;
    // Match song name
    if (
      profile.mixtapes &&
      profile.mixtapes.some(
        (mix) =>
          mix.songs &&
          mix.songs.some(
            (song) => song.song_name && song.song_name.toLowerCase().includes(q)
          )
      )
    )
      return true;
    return false;
  });
}

// Utility function to get full photo URL
function getFullPhotoUrl(photoUrl) {
  if (!photoUrl) return "/src/assets/noimage.jpg";
  if (photoUrl.startsWith("http")) return photoUrl;
  // Always use backend API URL for uploads
  const baseUrl = import.meta.env.VITE_API_URL;
  return `${baseUrl}/${photoUrl}`;
}

// Lifecycle hook
onMounted(async () => {
  await fetchCurrentUser(); // Fetch the current user
  loadStateFromLocalStorage(); // Load saved state for the current user
  await fetchProfiles(); // Fetch profiles if not already loaded

  // Start the timer only if the user is logged in and profiles are viewed
  if (currentUser.value && currentUser.value.id && viewedProfiles.value > 0) {
    startRefreshTimer();
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* This hides all scrollbars */
}

button {
  padding: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease-in-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.discover-wrapper {
  /* margin-top: 100px; */
  /* margin-left: 270px; */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  /* height: calc(100% - 80px); 
  width: calc(100% - 270px); */
  width: 100%;
}

.discover-container {
  background: transparent;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  backdrop-filter: brightness(1.05);
  -webkit-backdrop-filter: brightness(1.05);
  border-radius: 12px;
  /* padding-top: 3rem; */
  transition: opacity 0.5s ease; /* Smooth transition for opacity */
  opacity: 1;
  width: 100%;
  height: 75vh;
  position: relative;
  user-select: none;
  z-index: 0;
}

.nav-button {
  background: none;
  border: none;
  font-size: 2.5rem;
  color: #322848;
  cursor: pointer;
  z-index: 1;
  outline: none;
  box-shadow: none;
}

.nav-button:focus {
  outline: none;
  box-shadow: none;
}

.nav-button:active {
  outline: none;
  box-shadow: none;
}

/* front and back container */
.front,
.back {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  overflow: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-left: 3rem;
  padding-right: 3rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  box-sizing: border-box;
  transition: transform 0.5s ease;
  color: #322848;
}

/* Make sure all text elements inside the card also use #322848 */
.profile-name,
.profile-info,
.mixtape-title-front,
.mixtape-description,
.mixtape-title-back,
.song-list,
.song-item,
.no-mixtape-message {
  color: #fff !important;
}

.front {
  background: #32284879;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  color: #322848;
  z-index: 2;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.front:hover {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.35);
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
}

.back {
  background: #32284879;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  color: #322848;
  transform: rotateY(180deg);
  text-align: center;
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Ensures the action section goes to the bottom */
  padding: 1rem;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  user-select: none;
  height: 100%; /* Ensure it takes full height */
}

.discover-container.flipped .front {
  transform: rotateY(180deg);
  transition: transform 1s ease;
  z-index: 1;
}

.discover-container.flipped .back {
  transform: rotateY(0deg);
  transition: transform 1s ease;
  z-index: 2;
}

/* Keep original styles inside front unchanged */
.discover-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #ffffff;
  flex-grow: 0;
}

.refresh-label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #ffffff !important;
}

.refresh-time {
  font-size: 0.9rem;
  color: #ffffff !important;
}

.profile-count {
  background-color: #28203ad2;
  padding: 0.3rem 0.7rem;
  border-radius: 30px;
  font-size: 0.8rem;
  display: inline-block;
}

.profile-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0)
  );
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); /* stronger shadow for depth */
  backdrop-filter: blur(12px) brightness(1.05);
  -webkit-backdrop-filter: blur(12px) brightness(1.05);
  border: 1px solid rgba(255, 255, 255, 0.2); /* soft border */
  padding: 1.5rem;
  border-radius: 16px;
  width: 80%;
  height: 450px;
  text-align: center;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.profile-name {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.profile-info {
  font-size: 0.9rem;
  color: white;
  margin-bottom: 1rem;
}

.profile-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin: 0 auto 1rem auto;
}

.profile-bio {
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.unpack-button {
  background-color: #322848;
  color: white;
  width: 60%;
  padding: 0.3rem;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: auto;
  margin-left: auto;
  margin-right: auto;
  display: block;
  user-select: none;
  position: relative;
}

.unpack-button.unpacked {
  background-color: #28203a;
  color: #ffffff;
  cursor: default;
}

.unpack-button:hover {
  background: #28203a;
}

.unpack-button:focus {
  outline: none;
  box-shadow: none;
}

.heart-indicator {
  margin-left: 0.5rem;
  font-size: 1.2rem;
  color: red;
}

.back-button {
  position: absolute;
  top: 30px;
  left: 30px;
  color: #28203a;
  z-index: 1;
}

.back-button:hover {
  color: #28203a;
}

.back-mixtape {
  background-color: #32284889;
  position: relative;
  border-radius: 10px;
  width: 60%;
  height: 380px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: left;
  z-index: 0;
}

.mixtape-image {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 8px;
  margin: 0 auto;
  margin-top: 1rem;
}

.mixtape-title-front {
  margin-top: 1rem;
  text-align: center;
}

.mixtape-description {
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
}

.mixtape-title-back {
  position: absolute;
  top: 175px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.song-list {
  list-style: none;
  text-align: left;
  font-size: 0.9rem;
  line-height: 1.4;
  height: 100px;
  margin: 5rem auto 0;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  width: 90%;
  border: 1px solid #ffffff;
  padding: 10px;
  border-radius: 10px;
  scrollbar-width: thin;
  scrollbar-color: #28203a #f5f5fa;
}

/* Chrome, Edge, Safari */
.song-list {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #28203a transparent; /* thumb color, track transparent */
}

/* Chrome, Edge, Safari */
.song-list::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}

.song-list::-webkit-scrollbar-thumb {
  background: #28203a;
  border-radius: 8px;
  min-height: 30px;
  box-shadow: 0 2px 8px rgba(122, 82, 155, 0.15);
}

.song-list::-webkit-scrollbar-thumb:hover {
  background: #28203a; /* stays the same on hover */
}

.mini-audio-btn {
  background: transparent;
  border: none;
  box-shadow: none;
  outline: none;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.mini-audio-btn:hover {
  color: #ffffff;
}

.no-mixtape-message {
  background-color: rgba(108, 119, 178, 0.35);
  position: relative;
  padding: 9rem;
  border-radius: 10px;
  width: 31rem;
  height: 380px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: left;
  text-align: center;
  font-size: 1.2rem;
}

.action-section {
  margin-top: 1rem;
  padding: 8px;
  background: #32284889;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  backdrop-filter: brightness(1.05);
  -webkit-backdrop-filter: brightness(1.05);
  border-radius: 10px;
  text-align: center;
  width: 60%;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 5rem;
  margin-bottom: 0.5rem;
}

.heart-btn,
.x-btn {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-btn:hover,
.x-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 12px 4px rgba(255, 0, 69, 0.6); /* glowing red for heart */
}

.heart-btn {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 2px solid transparent;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  background: radial-gradient(circle, #ff0045, #ffffff);
  border: 2px solid transparent;
  animation: gradientMove 12s ease-in-out infinite;
}

.heart-btn.clicked {
  border-color: white;
  background: radial-gradient(circle, #ff0045, #ffffff);
  transform: scale(1.2);
}

.x-btn {
  background: radial-gradient(circle, #0075ff, #ffffff);
}

.x-btn:hover {
  box-shadow: 0 0 12px 4px rgba(0, 117, 255, 0.6); /* glowing blue for x */
}

.x-btn:disabled {
  background: #ccc; /* Gray background for disabled state */
  cursor: not-allowed; /* Change cursor to indicate it's disabled */
  opacity: 0.6; /* Reduce opacity */
}

.action-message {
  font-size: 14px;
  color: #fff;
  font-family: "Courier New", Courier, monospace;
}

.arrow {
  margin-left: 0.5rem;
}

.no-profiles {
  text-align: center;
  color: #fff;
  font-size: 1.2rem;
  margin-top: 2rem;
}

.song-artwork {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.soundwave {
  display: inline-flex;
  align-items: center;
  user-select: none;
  transition: opacity 0.2s;
  opacity: 0.7;
}
.soundwave.active {
  opacity: 1;
}
.soundwave svg .bar {
  fill: #fff;
  opacity: 0.7;
  transition: height 0.2s;
}
.soundwave.active svg .bar1 {
  animation: bar1Anim 1s infinite;
}
.soundwave.active svg .bar2 {
  animation: bar2Anim 1s infinite;
}
.soundwave.active svg .bar3 {
  animation: bar3Anim 1s infinite;
}
.soundwave.active svg .bar4 {
  animation: bar4Anim 1s infinite;
}
@keyframes bar1Anim {
  0%,
  100% {
    height: 10px;
    y: 6;
  }
  50% {
    height: 18px;
    y: 2;
  }
}
@keyframes bar2Anim {
  0%,
  100% {
    height: 16px;
    y: 3;
  }
  50% {
    height: 8px;
    y: 7;
  }
}
@keyframes bar3Anim {
  0%,
  100% {
    height: 6px;
    y: 8;
  }
  50% {
    height: 14px;
    y: 4;
  }
}
@keyframes bar4Anim {
  0%,
  100% {
    height: 12px;
    y: 5;
  }
  50% {
    height: 20px;
    y: 1;
  }
}
</style>

<!-- Style from Favorites -->
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease-in-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.favorites-wrapper {
  padding: 2rem;
  background: transparent;
  background-size: 300% 300%;
  min-height: 90vh; /* Use viewport height instead */
  color: black;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.favorites-title {
  font-size: 2rem;
  font-weight: bold;
  color: black;
  text-align: left;
  width: 80%;
  margin: auto;
}

.favorites-description {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}
.grid-container {
  display: grid;
  grid-template-columns: 10% 80% 10%; /* 10-80-10 ratio */
  height: auto; /* Full viewport height */
  gap: 10px;
}

.left-column,
.right-column {
  display: flex; /* Enables flex centering */
  flex-direction: column; /* Stacks children vertically */
  justify-content: center; /* Centers vertically */
  align-items: center; /* Centers horizontally */
  padding: 15px;
  height: 75vh;
}

.main-column {
  padding: 20px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .profile-card {
    width: 98%;
  }
  .front {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .discover-top {
    padding: 15px;
  }
  .action-section {
    width: 100%;
  }
  .unpack-button {
    width:80%;
  }
}
/* Additional styles for very small screens */
@media (max-width: 480px) {
  .profile-card {
    width: 100%;
  }
  .front {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .discover-top {
    padding: 15px;
  }
  .action-section {
    width: 100%;
  }
  .unpack-button {
    width:100%;
  }
}

/* Base white background */
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
  background-color: #ffffff;
  z-index: -2;
  pointer-events: none;
}

/* Animated vibrant gradient overlay */
.animated-background::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(204, 159, 255, 0.911),
    rgba(122, 82, 155, 0.4),
    rgba(238, 67, 141, 0.3),
    rgba(143, 74, 203, 0.4)
  );
  background-size: 200% 200%;
  animation: gradientDance 20s ease-in-out infinite;
  z-index: -1;
  pointer-events: none;
}

@keyframes gradientDance {
  0% {
    background-position: 0% 50%;
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
    background-position: 0% 50%;
  }
}
.animated-background::before {
  content: "";
  position: absolute;
  inset: 0;
  backdrop-filter: blur(5px);
  pointer-events: none;
}

.no-profiles-centered {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
  color: #322848df;
  font-size: 1rem;
  font-weight: 500;
  z-index: 10;
  pointer-events: none;
}

</style>