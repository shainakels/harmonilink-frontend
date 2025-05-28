<template>
  <transition name="fade"></transition>

      <!-- Mixtape Popup -->
      <div v-if="selectedMixtape" class="modal-overlay" @click="closeMixtapePopup"></div>
      <div v-if="selectedMixtape" class="mixtape-popup">
        <button class="exit-button" @click="closeMixtapePopup">×</button>
        <div class="back-mixtape">
          <img :src="selectedMixtape.image" alt="Mixtape Image" class="mixtape-image" />
          <h3 class="mixtape-title-back">{{ selectedMixtape.name }}</h3>
          <ol v-if="selectedMixtape.songs && selectedMixtape.songs.length" class="song-list">
            <li 
              v-for="(song, index) in selectedMixtape.songs" 
              :key="index" 
              class="song-list-item"
              @click="song.preview_url && toggleSongPlay(index)"
              :aria-label="playingSongIndex === index ? 'Pause preview' : 'Play preview'"
              tabindex="0"
            >
              <div class="song-content">
                <span
                  class="soundwave"
                  :class="{ active: playingSongIndex === index }"
                  v-if="song.preview_url"
                >
                  <svg width="22" height="22" viewBox="0 0 22 22">
                    <rect class="bar bar1" x="2" y="6" width="3" height="10" rx="1.5" />
                    <rect class="bar bar2" x="7" y="3" width="3" height="16" rx="1.5" />
                    <rect class="bar bar3" x="12" y="8" width="3" height="6" rx="1.5" />
                    <rect class="bar bar4" x="17" y="5" width="3" height="12" rx="1.5" />
                  </svg>
                </span>
                <span v-else class="soundwave-placeholder"></span>

                <img 
                  v-if="song.artwork_url" 
                  :src="song.artwork_url" 
                  alt="Artwork" 
                  class="song-artwork"
                  style="width: 30px; height: 30px; border-radius: 4px;"
                />
                <div class="song-info">
                  <span class="song-title">{{ song.title }}</span>
                  <span class="song-artist">{{ song.artist }}</span>
                </div>

                <audio
                  v-if="song.preview_url"
                  ref="songAudioRefs"
                  :src="song.preview_url"
                  @ended="onSongAudioEnded"
                  style="display: none"
                ></audio>
                <span v-if="!song.preview_url" class="no-preview">No preview</span>
              </div>
            </li>
          </ol>
          <p v-else class="song-list">(No songs listed)</p>
        </div>
      </div>
       <!-- END Mixtape Popup -->

  <NavLayout>
    <div class="animated-background"></div>
    <div class="favorites-wrapper">
      <h1 class="favorites-title">Favorites</h1>
      <p class="favorites-description">
        Your personal playlist of connections! Keep track of the profiles that hit the right notes with you.
      </p>

      <div class="favorites-grid">
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

      <div v-if="profiles.length === 0" class="no-favorites">
        <p>Your favorited users will appear here! Favorite some to see their hidden mixtapes.</p>
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
    


    </div>
  </NavLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import NavLayout from '../layouts/NavLayout.vue'
import axios from 'axios';

const profiles = ref([]);
const showConfirmIndex = ref(null);
const selectedMixtape = ref(null);
const selectedProfile = ref(null);
const songAudioRefs = ref([]);
const playingSongIndex = ref(null);

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

function toggleSongPlay(index) {
  // Pause all other audios
  songAudioRefs.value.forEach((audio, i) => {
    if (audio && i !== index) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  const currentAudio = songAudioRefs.value[index];
  if (!currentAudio) return;

  if (playingSongIndex.value === index && !currentAudio.paused) {
    currentAudio.pause();
    playingSongIndex.value = null;
  } else {
    currentAudio.play();
    playingSongIndex.value = index;
  }
}

function onSongAudioEnded() {
  playingSongIndex.value = null;
}

// Reset refs when songs change
watch(
  () => selectedMixtape.value?.songs,
  () => {
    songAudioRefs.value = [];
    playingSongIndex.value = null;
  }
);
</script>

<style scoped>
.profile-info{
  color: #ffffff;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease-in-out; 
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.favorites-wrapper {
  padding: 2rem;
  width: 90%;
  height: auto;
  overflow: auto;
  color: black;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  margin-left: auto;
  margin-right: auto;
  /* margin-left: 270px; */
}

.favorites-title {
  font-size: 2rem;
  font-weight: bold;
  color: #322848;
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
  background-color: #32284879;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: left;
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
}

.profile-header {
  display: flex;
  gap: 1rem;
  color: #ffffff;
}

.profile-pic {
  width: 60px;
  height: 60px;
  border-radius: 8px;
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
  background-color: #322848;
  margin: 0;
}

.mixtape-scroll {
  max-height: 180px; 
  overflow-y: auto; 
  padding-right: 0.5rem;
  flex-grow: 0; 
  margin-top: 2.5rem;
  border-radius: 10px;
  padding: 0.7rem;
  background-color: #32284889;
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
  color: #ffffff;
}

.mixtape-details p {
  font-size: 0.85rem;
  margin: 0.2rem 0 0 0;
  color: #ffffff;
}

.mixtape-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 12px;
  padding: 1.5rem;
  width: 45%;
  height: 26rem;

  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;

  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.mixtape-popup img {
  display: block;
  margin: 0 auto 1rem auto;
  height: 130px;
  width: 130px;
  color: #322848;
}

.mixtape-title-back{
  color: #322848;
}

.song-list {
  margin-top: 1rem;
  overflow-y: auto; 
  max-height: 180px; 
  flex-grow: 1;
  text-align: left;
  border: 1px solid #322848;
  padding: 10px;
  border-radius: 10px;
  color: #322848;
}

.song-list li {
  margin-bottom: 0.5rem;
}

.song-title {
  font-weight: bold;
}

.song-artwork {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  flex-shrink: 0;
}

.song-audio-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  margin-left: 8px;
}

.exit-button {
  position: absolute;
  top: -15px;
  right: -25px;
  background: transparent;
  border: none;
  font-size: 3rem;
  color: #322848;
  cursor: pointer;
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
  background-color: #dbb4d7;
  color: #080d2a;
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
  background: #080d2a;
  color: #dbb4d7;
  border: 1px solid #ebebeb;
}

.confirm-buttons button:last-child:hover {
  background: red;
  color: white;
  border: 1px solid #ebebeb;
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
  0%, 100% {
    height: 10px;
    y: 6;
  }
  50% {
    height: 18px;
    y: 2;
  }
}

@keyframes bar2Anim {
  0%, 100% {
    height: 16px;
    y: 3;
  }
  50% {
    height: 8px;
    y: 7;
  }
}

@keyframes bar3Anim {
  0%, 100% {
    height: 6px;
    y: 8;
  }
  50% {
    height: 14px;
    y: 4;
  }
}

@keyframes bar4Anim {
  0%, 100% {
    height: 12px;
    y: 5;
  }
  50% {
    height: 20px;
    y: 1;
  }
}

.song-list-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  gap: 12px;
}

.song-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin: 0;
}

.song-title {
  font-weight: bold;
  margin: 0;
  color: #fff;
}

.song-artist {
  font-size: 0.9em;
  opacity: 0.8;
  margin: 0;
  color: #fff;
}

.soundwave {
  min-width: 22px;
  margin: 0;
}

.soundwave-placeholder {
  min-width: 22px;
}

.song-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.no-preview {
  margin-left: auto;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.no-favorites {
  position: absolute;
  top: 48%;
  left: 48%;
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
</style>