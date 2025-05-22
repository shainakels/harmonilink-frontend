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
              <ol v-if="selectedMixtape.songs && selectedMixtape.songs.length" class="song-list">
                <li v-for="(song, index) in selectedMixtape.songs" :key="index" class="song-list-item">
                  <span class="song-number">{{ index + 1 }}. </span>
                  <span class="song-title">{{ song.title }}</span> by <span class="artist-name">{{ song.artist }}</span>
                  <template v-if="song.artwork_url">
                    <img :src="song.artwork_url" alt="Artwork" class="song-artwork" style="width:32px;height:32px;margin-left:8px;vertical-align:middle;" />
                  </template>
                  <template v-if="song.preview_url">
                    <audio
                      :src="song.preview_url"
                      controls
                      controlsList="nodownload noplaybackrate"
                      style="vertical-align:middle; margin-left:8px; height:24px;"
                    ></audio>
                  </template>
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
  min-height: 100vh;
  overflow: auto;
  color: black;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  margin-top: 80px;
  margin-left: 270px;
}

.favorites-title {
  font-size: 2rem;
  font-weight: bold;
  color: black;
}

.favorites-description {
  font-size: 1rem;
  margin-bottom: 2rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding-right: 0.5rem;
  padding-bottom: 2rem;
}

.favorite-box {
  background-color: #080d2a;
  padding: 1rem;
  border-radius: 10px;
  color: white;
  position: relative;
  overflow: hidden;
  width: 400px;
  height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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

.heart-btn.clicked {
  transform: scale(1.2);
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
  background-color: #1a1f4a;
  border-radius: 12px;
  padding: 1.5rem;
  width: 35rem;
  height: 25rem;
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

.song-list {
  margin-top: 1rem;
  overflow-y: auto; 
  max-height: 180px; 
  flex-grow: 1;
  text-align: left;
}

.song-list li {
  margin-bottom: 0.5rem;
}

.song-title {
  font-weight: bold;
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

.song-artwork {
  border-radius: 4px;
  object-fit: cover;
  display: inline-block;
  vertical-align: middle;
}
</style>