<template>
  <NavLayout>
    <div class="discover-wrapper">

      <!-- Navigation Buttons -->
          <button 
            class="nav-button left" 
            @click="prevProfile" 
            :disabled="currentIndex === 0 || isFlipped"
          > <i class="fa-solid fa-circle-arrow-left"></i>
          </button>

      <div class="discover-scroll">
        <div class="discover-container" :class="{ flipped: isFlipped }">

          <!-- No Profiles Message -->
          <div v-if="profiles.length === 0" class="no-profiles">
            <p>No profiles available. Please check back later.</p>
          </div>

          <!-- Front Side (Profile Details) -->
          <div class="front" v-if="currentProfile">
            <div class="discover-top">
              <div class="refresh-wrapper">
                <span class="refresh-label">Next Refresh:</span><br />
                <span class="refresh-time">{{ refreshTime }}</span>
              </div>
              <div class="profile-count-wrapper">
                <span class="profile-count">Profiles Viewed: {{ viewedProfiles }}/10</span>
              </div>
            </div>

            <div class="profile-card">
              <h2 class="profile-name">{{ currentProfile.username }}</h2>
              <p class="profile-info">{{ currentProfile.age }} years old, {{ currentProfile.gender }}</p>
              <img :src="getFullPhotoUrl(currentProfile.mixtapes[0]?.photo_url)" class="mixtape-image" />
              <h2 class="mixtape-title-front">{{ currentProfile.mixtapes[0]?.name }}</h2>
              <p class="mixtape-description">{{ currentProfile.mixtapes[0]?.bio }}</p>

              <!-- Unpack Button -->
              <button 
                class="unpack-button" 
                :class="{ unpacked: currentProfile.viewed }" 
                @click="flipCard"
              >
                {{ currentProfile.viewed ? 'Unpacked' : 'Unpack' }}
                <span v-if="currentProfile.favorited" class="heart-indicator">❤️</span>
              </button>
            </div>
          </div>

          <!-- Back Side (Mixtape Details) -->
          <div class="back" v-if="currentProfile">
            <div class="back-button" @click="flipCard">
              <i class="fa-solid fa-arrow-left"></i>
            </div>

            <!-- Show mixtape details if available -->
            <div class="back-mixtape" v-if="currentProfile.mixtapes?.length > 0">
              <img :src="getFullPhotoUrl(currentProfile.mixtapes[0].photo_url)" class="mixtape-image" />
              <h3 class="mixtape-title-back">{{ currentProfile.mixtapes[0].name }}</h3>
              <ul class="song-list">
            <li v-for="(song, index) in currentProfile.mixtapes[0].songs" :key="index" class="song-item">
              <img
                v-if="song.artwork_url"
                :src="song.artwork_url"
                alt="Artwork"
                class="song-artwork"
                style="width: 40px; height: 40px; margin-right: 0.5rem; border-radius: 6px;"
              />

              <button
                v-if="song.preview_url"
                class="mini-audio-btn"
                @click.stop="toggleDiscoverPlay(index)"
                :aria-label="discoverPlayingIndex === index ? 'Pause preview' : 'Play preview'"
                style="margin-right: 0.5rem;"
              >
                <i :class="discoverPlayingIndex === index ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
              </button>

              <span>{{ song.song_name }} by {{ song.artist_name }}</span>

              <audio
                v-if="song.preview_url"
                ref="discoverAudioRefs"
                :src="song.preview_url"
                @ended="onDiscoverAudioEnded"
                style="display: none;"
              ></audio>

              <span v-else class="no-preview" style="margin-left: 0.5rem;">No preview</span>
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

       <!-- Navigation Buttons -->
          <button 
            class="nav-button right" 
            @click="nextProfile" 
            :disabled="currentIndex === profiles.length - 1 || isFlipped"
          > <i class="fa-solid fa-circle-arrow-right"></i>
          </button>

    </div>
  </NavLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import NavLayout from '../layouts/NavLayout.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// Profiles data
const profiles = ref([]);
const currentIndex = ref(0);
const currentProfile = computed(() => profiles.value[currentIndex.value] || null);
const isFlipped = ref(false);

// Current user data
const currentUser = ref(null);

// Timer for profile refresh
const refreshTime = ref('03:00:00');
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
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found.');
      return;
    }

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/current-user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    currentUser.value = response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      alert('Session expired. Please log in again.');
      router.push('/login');
    }
  }
}

// Fetch profiles from the backend and shuffle them
async function fetchProfiles() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('No auth token found.');
    return;
  }

  if (profiles.value.length > 0) {
    console.log('Using saved profiles from localStorage.');
    return; // Use the saved profiles
  }

  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/discover`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    profiles.value = response.data.map(profile => ({
      ...profile,
      viewed: false, // Add a viewed property to each profile
    }));
    currentIndex.value = 0; // Reset to the first profile
    viewedProfiles.value = 0; // Reset the viewed profiles count

    saveStateToLocalStorage(); // Save the fetched profiles to localStorage
  } catch (error) {
    console.error('Error fetching profiles:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      alert('Session expired. Please log in again.');
      router.push('/login');
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
    alert('No more profiles available.');
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
      currentProfile.value.viewed = true; // Mark the profile as viewed
      viewedProfiles.value++;

      saveStateToLocalStorage(); // Save the updated state

      // Start the refresh timer if it hasn't started yet
      if (!refreshInterval) {
        startRefreshTimer();
      }
    }
  }
  isFlipped.value = !isFlipped.value;
}

// Start the refresh timer
function startRefreshTimer() {
  if (!currentUser.value || !currentUser.value.id) {
    console.error('User ID is not available. Cannot start the timer.');
    return;
  }

  const timerKey = `refreshEndTime_${currentUser.value.id}`; // Unique key for each user
  let endTime = localStorage.getItem(timerKey);

  if (!endTime || isNaN(parseInt(endTime, 10))) {
    // Set endTime to 3 hours from now
    endTime = Date.now() + 60 * 1000; // 3 hours in ms
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

    refreshTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(refreshInterval);
      refreshInterval = null; // Reset the interval
      localStorage.removeItem(timerKey); // Clear the timer for this user

      // Clear cached profiles and fetch new ones
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
    console.error('User ID is not available. Cannot save state.');
    return;
  }

  const stateKey = `discoverState_${currentUser.value.id}`; // Unique key for each user
  const state = {
    profiles: profiles.value.map(profile => ({
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
    console.error('User ID is not available. Cannot load state.');
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
  discoverAudioRefs.value.forEach(audio => {
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('You must be logged in to add favorites.');
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
      alert('Profile added to favorites!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Failed to add to favorites. Please try again.');
    }
  }
};

// Animate X button
const animateX = async () => {
  pauseAllPreviews();
  const discardedProfile = currentProfile.value;

  if (discardedProfile) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to discard profiles.');
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
      alert('Profile discarded.');
    } catch (error) {
      console.error('Error discarding profile:', error); // Log the error
      alert('Failed to discard profile. Please try again.');
    }
  }
};

// Utility function to get full photo URL
function getFullPhotoUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Always ensure exactly one slash between base and path
  return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/${url.replace(/^\/?/, '')}`;
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
.discover-wrapper {
  margin-top: 80px;
  margin-left: 270px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 80px); 
  width: calc(100% - 270px);
}

.discover-container {
  background-color: rgba(8, 13, 42, 0.85);
  border-radius: 12px;
  padding-top: 3rem;
  width: 900px;
  height: 550px;
  position: relative;
  user-select: none;
  z-index: 0;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
}

.nav-button {
  top: 50%;
  transform: translateY(-20%);
  background: none;
  border: none;
  font-size: 2.5rem;
  color: #080d2a;
  cursor: pointer;
  z-index: 1;
  flex-direction: column; 
  gap: 1rem; 
}

.nav-button {
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
.front, .back {
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
  padding: 3rem;
  box-sizing: border-box;
}

.front {
  background-color: rgba(8, 13, 42, 0.85);
  color: #fff;
  z-index: 2;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.back {
  background-color: rgba(8, 13, 42, 0.85);
  color: white;
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
  z-index: 1;
}

.discover-container.flipped .back {
  transform: rotateY(0deg);
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
}

.refresh-time {
  font-size: 0.9rem;
}

.profile-count {
  background-color: #1c1b2e;
  padding: 0.3rem 0.7rem;
  border-radius: 30px;
  font-size: 0.8rem;
  display: inline-block;
}

.profile-card {
  background-color: rgba(108, 119, 178, 0.35);
  padding: 1.5rem;
  border-radius: 10px;
  width: 390px;
  height: 440px;
  text-align: center;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: -60px;
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
  background-color: #080d2a;
  color: white;
  width: 10rem;
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
  background-color: #5c5e78;
  color: #ffffff;
  cursor: default;
}

.unpack-button:hover {
  background-color: #dbb4d7;
  color: #1f0d3e;
}

.heart-indicator {
  margin-left: 0.5rem;
  font-size: 1.2rem;
  color: red;
}

.back-button{
  position: absolute;
  top: 30px;
  left: 30px;
  color: white;
}

.back-button:hover {
  color: #dbb4d7;
}

.back-mixtape {
  background-color: rgba(108, 119, 178, 0.35);
  position: relative;
  padding: 1.5rem;
  border-radius: 10px;
  width: 31rem;
  height: 380px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: left;
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
  margin-top: 3rem;
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
  max-height: 250px;
  overflow-y: auto;
  margin: 5rem auto 0; 
  padding: 0 1.5rem; 
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  width: 90%;
  flex: 1;
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
  color: #dbb4d7;
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
  padding: 0.8rem;
  background-color: #5c5e78;
  border: 2px solid #a7a5a5c2;
  border-radius: 10px;
  text-align: center;
  width: 31rem;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 7rem;
  margin-bottom: 0.5rem;
}

.heart-btn, .x-btn {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
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
}

.heart-btn.clicked {
  border-color: white;
  background: radial-gradient(circle, #ff0045, #ffffff);
  transform: scale(1.2);
}

.x-btn {
  background: radial-gradient(circle, #0075ff, #ffffff);
}

.x-btn:disabled {
  background: #ccc; /* Gray background for disabled state */
  cursor: not-allowed; /* Change cursor to indicate it's disabled */
  opacity: 0.6; /* Reduce opacity */
}

.action-message {
  font-size: 14px;
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
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

</style>