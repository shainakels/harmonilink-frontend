<template>
  <NavLayout>
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
            <img :src="profile.image" alt="Profile Image" class="profile-pic" />
            <div class="profile-info">
              <h2>{{ profile.name }}</h2>
              <p>{{ profile.age }}, {{ profile.gender }}</p>
            </div>
          </div>

          <hr class="separator" />
          
          <div class="mixtape-scroll">
            <div class="mixtape-detail-overlay">
              <div class="mixtape-detail-box">
                <span class="close-detail" @click="selectedMixtape = null">&times;</span>
                <img :src="getFullPhotoUrl(selectedMixtape.photo_url)" class="detail-img" />
                <h2 class="mixtape-detail-name">{{ selectedMixtape.name }}</h2>
                <p class="mixtape-detail-description">{{ selectedMixtape.description }}</p>
                <p>{{ selectedMixtape.bio }}</p>
                <ul class="song-detail-list">
                  <li v-for="(song, i) in selectedMixtape.songs" :key="i" style="display: flex; align-items: center; gap: 10px; padding-bottom: 1rem;">
                    <img v-if="song.artwork_url" :src="song.artwork_url" alt="Artwork" style="width:35px; height:35px; border-radius:4px;" />
                    <span style="flex:1;">{{ song.name }} - {{ song.artist }}</span>
                    <button
                      v-if="song.preview_url"
                      class="mini-audio-btn"
                      @click="toggleSongPlay(i)"
                      :aria-label="playingSongIndex === i ? 'Pause preview' : 'Play preview'"
                      style="margin-left:8px;"
                    >
                      <i :class="playingSongIndex === i ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
                    </button>
                    <audio
                      v-if="song.preview_url"
                      ref="songAudioRefs"
                      :src="song.preview_url"
                      @ended="onSongAudioEnded"
                      style="display:none;"
                    ></audio>
                  </li>
                </ul>
              </div>
            </div>
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
          <ol v-if="selectedMixtape.songs && selectedMixtape.songs.length" class="song-list">
            <li v-for="(song, index) in selectedMixtape.songs" :key="index">
              <span class="song-number">{{ index + 1 }}. </span>
              <span class="song-title">{{ song.title }}</span> by <span class="artist-name">{{ song.artist }}</span>
            </li>
          </ol>
          <p v-else class="song-list">(No songs listed)</p>
        </div>
      </div>
    </div>
  </NavLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavLayout from '../layouts/NavLayout.vue'
import axios from 'axios';

const profiles = ref([]);
const showConfirmIndex = ref(null);
const selectedMixtape = ref(null);
const selectedProfile = ref(null);

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
    console.error('Favorites API error:', e); // <-- Add this line
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
    // Optionally show an error message to the user
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
</script>

<style scoped>
.favorites-wrapper {
  padding: 2rem;
  background-color: #dbb4d7;
  overflow: auto;
  color: black;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  margin-top: 80px;
  margin-left: 270px;
  min-height: calc(100vh - 100px);
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
  background-color: #080d2a;
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: left;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
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
}

.profile-pic {
  width: 70px;
  height: 70px;
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
  background-color: white;
  margin: 0;
}

.mixtape-scroll {
  max-height: 200px; 
  overflow-y: auto; 
  padding-right: 0.5rem;
  flex-grow: 0; 
  margin-top: 2rem;
}

.mixtape-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(20, 20, 20, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.mixtape-detail-box {
  background-color: #080d2a;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  text-align: center;
  color: white;
  position: relative;
}

.mixtape-detail-name {
  padding-bottom: 0.7rem;
}

.song-detail-list {
  margin-top: 1.3rem;
  text-align: left;
  border: 1px solid #dbb4d7;
  background-color: #2c1a40;
  padding: 0.7rem;
  border-radius: 0.5rem;
  max-height: 15rem;
  overflow-y: auto;
}

.close-detail {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  cursor: pointer;
}

.detail-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 2px solid #dbb4d7;
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
</style>