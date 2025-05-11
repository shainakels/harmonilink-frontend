<template>
  <NavLayout>
    <div class="discover-wrapper">
      <div class="discover-scroll">
        <div class="discover-container" :class="{ flipped: isFlipped }">
          <!-- Navigation Buttons -->
          <button 
            class="nav-button left" 
            @click="prevProfile" 
            :disabled="currentIndex === 0 || isFlipped"
          >
            ←
          </button>
          <button 
            class="nav-button right" 
            @click="nextProfile" 
            :disabled="currentIndex === profiles.length - 1 || isFlipped"
          >
            →
          </button>

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
              <img :src="currentProfile.mixtapes[0]?.photo_url" class="mixtape-image" />
              <h2 class="mixtape-title-front">{{ currentProfile.mixtapes[0]?.name }}</h2>
              <p class="mixtape-description">{{ currentProfile.mixtapes[0]?.bio }}</p>
              <button class="unpack-button" @click="flipCard">
                Unpack <span class="arrow">▶</span>
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
              <img :src="currentProfile.mixtapes[0].photo_url" class="mixtape-image" />
              <h3 class="mixtape-title-back">{{ currentProfile.mixtapes[0].name }}</h3>
              <ol class="song-list">
                <li v-for="(song, index) in currentProfile.mixtapes[0].songs" :key="index">
                  {{ song.song_name }} by {{ song.artist_name }}
                </li>
              </ol>
            </div>

            <!-- Fallback message if no mixtapes are available -->
            <div class="no-mixtape-message" v-else>
              <p>No mixtapes yet. Wanna give them a chance?</p>
            </div>

            <!-- Action Section -->
            <div class="action-section">
              <div class="buttons">
                <button class="heart-btn" @click="animateHeart">
                  <i class="fa-solid fa-heart"></i>
                </button>
                <button class="x-btn" @click="animateX">
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
    </div>
  </NavLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found.');
      return;
    }

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/discover`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Assign profiles from the backend and shuffle them
    profiles.value = shuffleArray(response.data).map(profile => ({
      ...profile,
      viewed: false, // Add a viewed property to each profile
    }));
    currentIndex.value = 0; // Reset to the first profile
    viewedProfiles.value = 0; // Reset the viewed profiles count

    console.log('Fetched profiles:', JSON.stringify(profiles.value, null, 2)); // Debugging

    if (profiles.value.length === 0) {
      console.warn('No profiles found in the database.');
    }
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
  if (currentIndex.value < profiles.value.length - 1) {
    currentIndex.value++;
  }
}

// Navigate to the previous profile
function prevProfile() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

// Flip the profile card
function flipCard() {
  if (!isFlipped.value) {
    // Increment viewedProfiles only if the profile is being unpacked for the first time
    if (!currentProfile.value.viewed) {
      currentProfile.value.viewed = true; // Mark the profile as viewed
      viewedProfiles.value++;
    }
  }
  isFlipped.value = !isFlipped.value;
}

// Start the refresh timer
function startRefreshTimer() {
  const savedEndTime = localStorage.getItem('refreshEndTime');
  let timeLeft;

  if (savedEndTime) {
    // Calculate the remaining time based on the saved end time
    const endTime = new Date(parseInt(savedEndTime, 10));
    const now = new Date();
    timeLeft = Math.max(Math.floor((endTime - now) / 1000), 0);
  } else {
    // Default to 3 hours in seconds if no saved end time exists
    timeLeft = 10800;
    const endTime = new Date(Date.now() + timeLeft * 1000);
    localStorage.setItem('refreshEndTime', endTime.getTime());
  }

  refreshInterval = setInterval(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    refreshTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (timeLeft === 0) {
      clearInterval(refreshInterval);
      localStorage.removeItem('refreshEndTime'); // Clear saved end time when timer ends
      fetchProfiles(); // Fetch a new set of profiles from the database
      startRefreshTimer(); // Restart the timer
    }

    timeLeft--;
  }, 1000);
}

// Animate heart button
const animateHeart = async () => {
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
        { mixtape_id: favoriteProfile.mixtapes[0]?.mixtape_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Profile added to favorites!');
      nextProfile(); // Move to the next profile
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Failed to add to favorites. Please try again.');
    }
  }
};

// Animate X button
const animateX = async () => {
  const discardedProfile = currentProfile.value;

  if (discardedProfile) {
    try {
      const token = localStorage.getItem('authToken');
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

      alert('Profile discarded.');
      nextProfile(); // Move to the next profile
    } catch (error) {
      console.error('Error discarding profile:', error);
      alert('Failed to discard profile. Please try again.');
    }
  }
};

// Lifecycle hook
onMounted(() => {
  fetchCurrentUser();
  fetchProfiles();
  startRefreshTimer();
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.discover-wrapper {
  background-color: #ddb0d7;
  height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 2rem 1rem;
}

.discover-scroll {
  display: flex;
  justify-content: center;
}

.discover-container {
  background-color: rgba(8, 13, 42, 0.85);
  border-radius: 12px;
  padding: 3rem;
  width: 900px;
  height: 550px;
  position: relative;
  perspective: 1500px;
  user-select: none;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  border: 2px solid #080d2a;
  color: #080d2a;
  font-size: 2rem;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  z-index: 100;
  user-select: none;
}

.nav-button.left {
  left: -70px;
  z-index: 100;
}

.nav-button.right {
  right: 10px;
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
}

.unpack-button:hover {
  background-color: #dbb4d7;
  color: #1f0d3e;
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
  text-align: left;
  font-size: 0.9rem;
  line-height: 1.4;
  max-height: 250px;
  overflow-y: auto;
  margin: 5rem auto 0; 
  padding: 0 1.5rem; 
  list-style-type: decimal; 
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  width: 90%;
  flex: 1;
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
  background: radial-gradient(circle, #ff0045, #ffffff);
}

.x-btn {
  background: radial-gradient(circle, #0075ff, #ffffff);
}

.heart-btn.clicked, .x-btn.clicked {
  transform: scale(1.2);
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
</style>
