<template>
  <transition name="fade">
    <NavLayout>
      <div class="animated-background"></div>
      <div class="favorites-wrapper">
        <h1 class="favorites-title">Favorites</h1>
        <p class="favorites-count">{{ profiles.length }} Favorited {{ profiles.length === 1 ? 'User' : 'Users' }}</p>

        <!-- No Favorites Message -->
        <div v-if="profiles.length === 0" class="no-favorites">
          <p>Your favorited users will appear here! Favorite some to see their hidden mixtapes.</p>
        </div>

        <!-- Existing Favorites Grid -->
        <div v-else class="favorites-grid">
          <div class="favorite-box" v-for="(profile, index) in profiles" :key="index">
            <button class="heart-btn" @click="confirmRemove(index)">
              <i class="fa-solid fa-heart"></i>
            </button>

            <div class="profile-header">
              <img
                :src="profile.image && profile.image.trim() !== '' ? profile.image : '/src/assets/default-profile.jpg'"
                alt="Profile Image"
                class="profile-pic"
              />
              <div class="profile-info">
                <h2>{{ profile.name }}</h2>
                <p>{{ profile.age }}, {{ profile.gender }}</p>
              </div>
            </div>

            <hr class="separator" />
            
            <div class="mixtape-scroll">
              <button
                class="mixtape clickable-mixtape"
                v-for="(mixtape, mIndex) in profile.mixtapes"
                :key="mIndex"
                @click="handleMixtapeClick(profile, mixtape)"
              >
                <img :src="mixtape.image" alt="Mixtape Image" class="mixtape-image" />
                <div class="mixtape-details">
                  <h3>{{ mixtape.name }}</h3>
                  <p>{{ mixtape.description }}</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div v-if="showConfirmIndex !== null">
          <div class="modal-overlay" @click="showConfirmIndex = null"></div>
          <div class="confirm-popup">
            <p>Are you sure you want to remove this user from your Favorites?</p>
            <div class="confirm-buttons">
              <button @click="removeFavorite(showConfirmIndex)">Confirm</button>
              <button @click="showConfirmIndex = null">Decline</button>
            </div>
          </div>
        </div>

        <!-- Mixtape Popup -->
        <div v-if="selectedMixtape" class="modal-overlay" @click="closeMixtapePopup"></div>
        <div v-if="selectedMixtape" class="mixtape-popup">
          <button class="exit-button" @click="closeMixtapePopup">✕</button>
          <div class="back-mixtape">
            <img :src="selectedMixtape.image" alt="Mixtape Image" class="mixtape-image" />
            <h3 class="mixtape-title-back">{{ selectedMixtape.name }}</h3>
            <p class="mixtape-description">{{ selectedMixtape.description }}</p>
            <ul class="song-list">
              <li
                v-for="(song, index) in selectedMixtape.songs"
                :key="index"
                class="song-item"
                style="display: flex; align-items: center; cursor: pointer;"
                @click="song.preview_url && togglePlay(index)"
                :aria-label="playingIndex === index ? 'Pause preview' : 'Play preview'"
                tabindex="0"
              >
                <!-- Animated Soundwave SVG -->
                <span
                  class="soundwave"
                  :class="{ active: playingIndex === index }"
                  v-if="song.preview_url"
                  style="margin-right: 0.7rem"
                >
                  <svg width="22" height="22" viewBox="0 0 22 22">
                    <rect class="bar bar1" x="2" y="6" width="3" height="10" rx="1.5"/>
                    <rect class="bar bar2" x="7" y="3" width="3" height="16" rx="1.5"/>
                    <rect class="bar bar3" x="12" y="8" width="3" height="6" rx="1.5"/>
                    <rect class="bar bar4" x="17" y="5" width="3" height="12" rx="1.5"/>
                  </svg>
                </span>
                <span v-else style="width: 22px; margin-right: 0.7rem"></span>

                <img
                  v-if="song.artwork_url"
                  :src="song.artwork_url"
                  alt="Artwork"
                  class="song-artwork"
                  style="width: 40px; height: 40px; margin-right: 0.5rem; border-radius: 6px;"
                />
                
                <span style="width: 200px">
                  {{ song.title }} by {{ song.artist }}
                </span>

                <audio
                  v-if="song.preview_url"
                  ref="audioRefs"
                  :src="song.preview_url"
                  @ended="onAudioEnded"
                  style="display: none"
                ></audio>
                <span v-else class="no-preview" style="margin-left: 0.5rem">No preview</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </NavLayout>
  </transition>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import NavLayout from '../layouts/NavLayout.vue'
import axios from 'axios';

const profiles = ref([]);
const showConfirmIndex = ref(null);
const selectedMixtape = ref(null);
const selectedProfile = ref(null);
const audioRefs = ref([]);
const playingIndex = ref(null);

onMounted(fetchFavorites);

async function fetchFavorites() {
  console.log('fetchFavorites called');
  const token = localStorage.getItem('token');
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/favorites`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Favorites API returned:', data);
    profiles.value = data;
  } catch (e) {
    console.error('Favorites API error:', e);
    profiles.value = [];
  }
}

function confirmRemove(index) {
  showConfirmIndex.value = index
}

async function removeFavorite(index) {
  const profile = profiles.value[index];
  showConfirmIndex.value = null;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/favorites/${profile.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    profiles.value.splice(index, 1);
  } catch (e) {
    console.error('Failed to remove favorite:', e);
  }
}

function handleMixtapeClick(profile, mixtape) {
  selectedProfile.value = profile
  selectedMixtape.value = mixtape
}

function closeMixtapePopup() {
  selectedProfile.value = null
  selectedMixtape.value = null
}

function togglePlay(index) {
  // Pause all other audios
  audioRefs.value.forEach((audio, i) => {
    if (audio && i !== index) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  const currentAudio = audioRefs.value[index];
  if (!currentAudio) return;

  if (playingIndex.value === index && !currentAudio.paused) {
    currentAudio.pause();
    playingIndex.value = null;
  } else {
    currentAudio.play();
    playingIndex.value = index;
  }
}

function onAudioEnded() {
  playingIndex.value = null;
}

// Reset refs when songs change
watch(
  () => selectedMixtape.value?.songs,
  () => {
    audioRefs.value = [];
    playingIndex.value = null;
  }
);
</script>

<style scoped>

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease-in-out; 
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.favorites-wrapper {
  padding: 2rem;
  background-size: 300% 300%;
  min-height: 90vh; /* Use viewport height instead */
  color: black;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  position: fixed;
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
  }
}

.favorites-title {
  font-size: 2rem;
  font-weight: bold;
  color: black;
  text-align: left;
}

.favorites-description {
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: left;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.favorite-box {
  background: #32284879;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: left;
}

.favorite-box:hover {
  box-shadow: 0 8px 30px 0 rgba(31, 38, 135, 0.35);
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
}

.heart-btn {
  position: absolute;
  top: 20px;
  right: 30px;
  height: 55px;
  width: 55px;
  font-size: 2rem;
  background: radial-gradient(circle, #ff0045, #ffffff);
  color: #ff0045;
  border: none;
  border-radius: 50%;
  align-items: center;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.heart-btn:hover {
  transform: scale(1.1); /* Scale up slightly on hover */
}

.profile-header {
  display: flex;
  gap: 1rem;
}

.profile-pic {
  width: 60px;
  height: 60px;
  border-radius: 50%; /* Make it a circle */
  object-fit: cover;
}

.separator {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%); 
  width: 90%;
  border: none;
  height: 1px;
  background-color: white;
  margin: 0;
}

.mixtape-scroll {
  max-height: 180px; 
  overflow-y: auto; 
  padding-right: 0.5rem;
  flex-grow: 0; 
  margin-top: 2rem;
}

.mixtape {
  display: flex;
  gap: 1rem; 
  margin-bottom: 1rem;
}

.clickable-mixtape {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  width: 100%;
  text-align: left;
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  color: inherit;
  outline: none; /* Remove outline on click/focus */
}

.clickable-mixtape:hover {
  transform: scale(1.02);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease-in-out;
}

.mixtape-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  margin-left: 0.5rem;
}

.mixtape-details h3 {
  font-size: 1rem;
  margin: 0;
}

.mixtape-details p {
  font-size: 0.85rem;
  margin: 0.2rem 0 0 0;
}

.mixtape-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  background: #32284879;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-radius: 12px;
  padding: 1.5rem;
  width: 35%;
  height: 26rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.mixtape-popup img {
  display: block;
  margin: 0 auto 1rem auto;
  height: 130px;
  width: 130px;
}

.mixtape-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding: 0 1rem;
  text-align: center;
}

.song-list {
  list-style: none;
  text-align: left;
  font-size: 0.9rem;
  line-height: 1.4;
  height: 33%;
  width: 100%;
  margin-top: 3%;
  padding: 10px 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align flex items to the left */
  gap: 0.5rem;
  overflow-y: auto;
  border: 1px solid #ffffff;
  border-radius: 10px;
  scrollbar-width: thin;
  scrollbar-color: #28203a transparent;
}


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
  0%, 100% { height: 10px; y: 6; }
  50% { height: 18px; y: 2; }
}

@keyframes bar2Anim {
  0%, 100% { height: 16px; y: 3; }
  50% { height: 8px; y: 7; }
}

@keyframes bar3Anim {
  0%, 100% { height: 6px; y: 8; }
  50% { height: 14px; y: 4; }
}

@keyframes bar4Anim {
  0%, 100% { height: 12px; y: 5; }
  50% { height: 20px; y: 1; }
}

.song-artwork {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 0.5rem;
  vertical-align: middle;
  align-items: left;
}

.exit-button {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  outline: none; /* Remove outline on click/focus */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); 
  z-index: 998; 
}

.confirm-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgb(134, 100, 172);
  color: #fff;
  padding: 2rem;
  border-radius: 12px;
  z-index: 999; 
  width: 300px;
  text-align: center;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.6);
}

.confirm-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
}

.confirm-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
}

.confirm-buttons button:first-child:hover {
  background: #28203a;
  color: #fff;
}

.confirm-buttons button:last-child:hover {
  background: red;
  color: white;
}

.favorites-count {
  font-size: 0.85rem;
  color: #28203a;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
  text-align: left;
}

.no-favorites {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #28203a;
  font-size: 1rem;
  max-width: 80%;
  line-height: 1.5;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}

/* Responsive styles */
@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  .mixtape-popup {
    width:70%;
  }
  }
  /* Additional styles for very small screens */
  @media (max-width: 480px) {
    .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  .mixtape-popup {
    width:80%;
  }
  }
</style>