<template>
  <!--REPLACED TO THIS-->
  <div class="background"></div>

  <div class="create-text">Create your Mixtape</div>

  <div class="main-box">
    <div class="upload-box" @click="triggerPhotoUpload">
      <img v-if="photoUrl" :src="getFullPhotoUrl(photoUrl)" class="photo-preview" />
      <!-- EDITED HERE -->
      <span v-else class="upload-icon">
        <i class="fa-regular fa-image"></i>
        <i class="fa-solid fa-plus plus-badge"></i>
      </span>
      <input type="file" ref="photoInput" @change="handlePhotoUpload" hidden />
    </div>
    <p v-if="photoUploadError" class="error-message">{{ photoUploadError }}</p>

    <input type="text" v-model="mixtapeName" class="input" :class="{ error: mixtapeNameError }"
      placeholder="Mixtape Name" @input="validateMixtapeName" />

    <p v-if="mixtapeNameError" class="error-message">{{ mixtapeNameError }}</p>

    <textarea v-model="mixtapeBio" class="textarea" :class="{ error: mixtapeBioError }"
      placeholder="Say something about your mixtape" @input="validateMixtapeBio"></textarea>

    <p v-if="mixtapeBioError" class="error-message">{{ mixtapeBioError }}</p>



    <!-- SONGS AREA (keep this) -->
    <div class="songs-area-label">
      Add 3 songs to create your first mixtape
    </div>
    <div class="songs-area">
      <div
  v-for="i in 3"
  :key="i"
  class="song-slot"
  :class="{ filled: songs[i-1] }"
>
  <template v-if="songs[i-1]">
    <div class="song-info">
      <img v-if="songs[i-1].artwork" :src="songs[i-1].artwork" alt="Artwork" class="song-artwork-mini" />
      <div class="song-meta">
        <div class="song-title">{{ songs[i-1].name }}</div>
        <div class="song-artist">{{ songs[i-1].artist }}</div>
      </div>
      <button
        v-if="songs[i-1].previewUrl"
        class="mini-audio-btn"
        @click.stop="togglePlay(i-1)"
        :aria-label="playingIndex === (i-1) ? 'Pause preview' : 'Play preview'"
      >
        <i :class="playingIndex === (i-1) ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
      </button>
      <!-- Bind the audio ref using :ref and the index -->
      <audio
        v-if="songs[i-1].previewUrl"
        :ref="el => audioRefs[i-1] = el"
        :src="songs[i-1].previewUrl"
        @ended="onAudioEnded"
        style="display: none;"
      ></audio>
    </div>
    <button class="remove-song-btn" @click="deleteSong(i-1)">
      <i class="fa-solid fa-minus"></i>
    </button>
  </template>

  <template v-else>
    <button class="add-song-btn" @click="openSongModal">
      <i class="fa-solid fa-circle-plus"></i>
    </button>
  </template>
</div>

    </div>

    <!-- MOVE BUTTON BELOW SONGS AREA -->
    <p v-if="showSongError" class="error-message">You need to add at least 3 songs.</p>
    <button class="create-button" :class="{ 'gradient-active': gradientActive, 'twinkle-effect': twinkleActive }"
      :disabled="isSubmitting" @click="handleFinish">
      {{ isSubmitting ? 'Creating...' : 'Create Mixtape' }}
    </button>

    <!-- Song Modal IS EDITED -->
    <div v-if="showSongModal" class="modal-overlay">
      <div class="modal-box song-modal-box">
        <div class="modal-header">
          Song Search
          <span class="close" @click="closeSongModal">×</span>
        </div>
        <input
          type="text"
          v-model="songName"
          class="modal-input input"
          placeholder="Song Name"
          @input="searchSongs"
        />
        <input
          type="text"
          v-model="artistName"
          class="modal-input input"
          placeholder="Artist Name"
          @input="searchSongs"
        />

        <div v-if="searchResults.length > 0" class="search-results">
          <div v-for="(result, index) in searchResults" :key="index" class="search-item">
            <img v-if="result.artworkUrl100" :src="result.artworkUrl100" alt="Artwork" class="search-artwork" />
            <div class="search-details" @click="addSongFromResult(result)">
              <strong>{{ result.trackName }}</strong> - {{ result.artistName }}
            </div>
            <button v-if="result.previewUrl" class="mini-audio-btn" @click.stop="toggleSearchPlay(index)"
              :aria-label="searchPlayingIndex === index ? 'Pause preview' : 'Play preview'">
              <i :class="searchPlayingIndex === index ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
            </button>
            <div v-else class="no-preview">No preview available</div>
            <audio v-if="result.previewUrl" ref="searchAudioRefs" :src="result.previewUrl" @ended="onSearchAudioEnded"
              style="display: none;"></audio>
          </div>
        </div>
      </div>
    </div>

    <!-- Congrats Modal -->
    <div v-if="showCongratsPopup" class="modal-overlay">
      <div class="congrats-modal-box">
        <div class="modal-header">
          Congratulations!
          <span class="close" @click="closePopupAndRedirect">×</span>
        </div>
        <p>You just finished creating your profile.</p>
      </div>
    </div>
  </div>
  <!-- UNTIL HERE -->
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const photoInput = ref(null);
const photoUrl = ref('');
const mixtapeName = ref('');
const mixtapeBio = ref('');
const songs = ref([]);

const showSongModal = ref(false);
const showCongratsPopup = ref(false);

const songName = ref('');
const artistName = ref('');
const searchResults = ref([]);

const twinkleActive = ref(false);

// ADDED THIS
const gradientActive = ref(false);

const mixtapeNameError = ref('');
const mixtapeBioError = ref('');
const showSongError = ref(false);
const isSubmitting = ref(false);
const photoUploadError = ref('');

const isEditing = ref(false);
const editingIndex = ref(null);

const playingIndex = ref(null);

const audioRefs = ref([]);

const searchAudioRefs = ref([]);
const searchPlayingIndex = ref(null);

const rawUrl = import.meta.env.VITE_API_URL;
const VITE_API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

function getFullPhotoUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${VITE_API_URL.replace(/\/$/, '')}/${url.replace(/^\/?/, '')}`;
}

function triggerPhotoUpload() {
  photoInput.value.click();
}

async function handlePhotoUpload(event) {
  photoUploadError.value = '';
  const file = event.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post(`${VITE_API_URL}/api/upload`, formData);
      photoUrl.value = response.data.imageUrl;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        photoUploadError.value = error.response.data.error;
      } else {
        photoUploadError.value = 'Photo upload failed. Please try again.';
      }
    }
  }
}

function openSongModal() {
  showSongModal.value = true;
  songName.value = '';
  artistName.value = '';
  searchResults.value = [];
}

function closeSongModal() {
  showSongModal.value = false;
}

function addSongFromResult(result) {
  const newSong = {
    name: result.trackName,
    artist: result.artistName,
    previewUrl: result.previewUrl || null,   // <-- camelCase
    artwork: result.artworkUrl100 || null    // <-- camelCase
  };
  if (isEditing.value && editingIndex.value !== null) {
    songs.value[editingIndex.value] = newSong;
    isEditing.value = false;
    editingIndex.value = null;
  } else if (songs.value.length < 3) {
    songs.value.push(newSong);
  }
  showSongError.value = false;
  closeSongModal();
}

async function searchSongs() {
  if (!songName.value && !artistName.value) {
    searchResults.value = [];
    return;
  }

  const query = `${songName.value} ${artistName.value}`.trim();
  try {
    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: query,
        entity: 'musicTrack',
        limit: 5,
      },
    });
    searchResults.value = response.data.results || [];
  } catch (err) {
    console.error('Error fetching songs from iTunes:', err);
    searchResults.value = [];
  }
}

function validateMixtapeName() {
  if (mixtapeName.value.length > 50) {
    mixtapeNameError.value = 'Mixtape name cannot exceed 50 characters.';
  } else if (!mixtapeName.value.trim()) {
    mixtapeNameError.value = 'Mixtape name cannot be empty.';
  } else {
    mixtapeNameError.value = '';
  }
}

function validateMixtapeBio() {
  if (mixtapeBio.value.length > 120) {
    mixtapeBioError.value = 'Mixtape bio cannot exceed 120 characters.';
  } else {
    mixtapeBioError.value = '';
  }
}

const handleFinish = async () => {
  // ADDED THIS
  gradientActive.value = true;
  validateMixtapeName();
  validateMixtapeBio();

  if (mixtapeNameError.value || mixtapeBioError.value) return;
  if (!photoUrl.value) return alert('Mixtape photo is required.');
  if (songs.value.length < 3) return showSongError.value = true;

  const user_id = Number(localStorage.getItem('user_id'));
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    console.log('Submitting songs:', songs.value);
    const response = await axios.post(`${VITE_API_URL}/api/pfmixtape`, {
      user_id,
      name: mixtapeName.value,
      bio: mixtapeBio.value,
      photo_url: photoUrl.value,
      songs: songs.value,
    });

    if (response.data.status === 'success') {
      await axios.post(`${VITE_API_URL}/api/complete-onboarding`, { user_id });
      localStorage.setItem('onboardingStep', 'welcome');
      showCongratsPopup.value = true;
    }
  } catch (error) {
    console.error('Error in handleFinish:', error);
    alert('Failed to create mixtape. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

function skipMixtapeCreation() {
  router.push('/welcome');
}

function closePopupAndRedirect() {
  showCongratsPopup.value = false;
  router.push('/welcome');
}

function editSong(index) {
  const song = songs.value[index];
  songName.value = song.name;
  artistName.value = song.artist;
  // If you want to allow editing previewUrl, add here
  isEditing.value = true;
  editingIndex.value = index;
  showSongModal.value = true;
}

function deleteSong(index) {
  songs.value.splice(index, 1);
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

function toggleSearchPlay(index) {
  // Pause all other search audios
  searchAudioRefs.value.forEach((audio, i) => {
    if (audio && i !== index) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  const currentAudio = searchAudioRefs.value[index];
  if (!currentAudio) return;

  if (searchPlayingIndex.value === index && !currentAudio.paused) {
    currentAudio.pause();
    searchPlayingIndex.value = null;
  } else {
    currentAudio.play();
    searchPlayingIndex.value = index;
  }
}

function onSearchAudioEnded() {
  searchPlayingIndex.value = null;
}

// Reset refs when search results change
watch(searchResults, () => {
  searchAudioRefs.value = [];
});

onMounted(() => {
  document.addEventListener('play', function (e) {
    const audios = document.querySelectorAll('audio');
    audios.forEach((audio) => {
      if (audio !== e.target) {
        audio.pause();
      }
    });
  }, true);
});

watch(songs, () => {
  audioRefs.value = [];
});

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Fira Code', monospace;
}

/*EDITED*/
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(120deg, #e3b8ff 0%, #dbb4d7 25%, #c697bd 50%, #8a6bb8 75%, #322848 100%);
  background-size: 200% 200%;
  background-position: 0% 50%;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  transform: rotate(180deg);
  animation: gradientMove 12s ease-in-out infinite;
  transition: background-position 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

/*ADDED*/
@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/*EDITED*/
.create-text {
  width:100%;
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  color: #322848;
  text-align: center;
  font-weight: 425;
  z-index: 1;
}

/*EDITED FOR GLASS*/
.main-box {
  background: rgba(255, 255, 255, 0.55);
  /* glassmorphism */
  width: 40%;
  height: auto;
  padding: 0.5rem;
  border-radius: 15px;
  color: #322848;
  position: absolute;
  top: 57%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

/*ADDED*/
.main-box:hover {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.35);
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

/* EDITED */
.upload-box {
  background-color: #3228485a;
  width: 7rem;
  height: 7rem;
  margin: 0 auto 1rem;
  border: 2px solid #322848;
  border-radius: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #322848;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* UPDATED, EDITED ON ALL INOUT AREAS UNTIL TEXT AREA */
.input,
.textarea {
  width: 95% !important;
  height: 42px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.495);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  font-size: 15px;
  color: #322848;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  font-weight: normal;
  overflow: hidden;
}

.input::placeholder,
.textarea::placeholder {
  color: rgba(50, 40, 72, 0.6);
  opacity: 1;
}

.input:focus,
.textarea:focus {
  outline: none;
  background: #3228485a;
  color: #322848;
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
}

/* ADDED */
/* Make mixtape name input text bold when user types */
.input:focus,
.input:not(:placeholder-shown) {
  font-weight: bold;
}

/* ADDED */
/* When input is focused and background is #3228485a, make text white */
.input:focus {
  color: #fff;
}

/* ADDED */
.textarea:focus {
  color: #fff;
}

/* ADDED */
/* When input is not focused, revert to normal color */
.input {
  color: #322848;
}

.textarea {
  height: 40px;
  resize: none;
}

/* EDITED */
/* Song count and add song icon color */
.song-count {
  text-align: right;
  margin-right: 1.5rem;
  font-size: 12px;
  color: #322848;
  margin-bottom: 1rem;
}

.add-song-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: center; 
  margin-bottom: 1rem;
  cursor: pointer;
  width: 95%; 
  margin-left: auto;
  margin-right: auto;
}

/* EDITED */
.add-song-row i,
.add-song-row span {
  color: #322848 !important;
}

.song-entry {
  text-align: center;
  margin-bottom: 0.3rem;
}

.song-item-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c1a40;
  padding: 0.5rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  color: white;
}

.song-actions-buttons {
  display: flex;
  gap: 0.5rem;
}

.song-actions-buttons i {
  margin-left: 0.5rem;
  cursor: pointer;
  color: #c2b4d6;
}

.song-actions-buttons i:hover {
  color: #ffffff;
}

.edit-icon,
.delete-icon {
  cursor: pointer;
  font-size: 1.2rem;
  color: #dbb4d7;
}

/*EDITED AND ADDED EVERYTHING ABOUT BUTTON BELOW*/
.create-button {
  width: 50%;
  height: 35px;
  padding: 5px;
  background: #322848;
  color: #fff;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  outline: none;
  display: block;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
}

/* Gradient overlay for magical effect */
.create-button.gradient-active::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, #e3b8ff 0%, #dbb4d7 25%, #c697bd 50%, #8a6bb8 75%, #322848 100%);
  background-size: 200% 200%;
  animation: buttonGradientMove 2s linear infinite;
  opacity: 0.85;
  z-index: 0;
  pointer-events: none;
  border-radius: 25px;
  transition: opacity 0.3s;
}

@keyframes buttonGradientMove {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* Keep the glowy hover effect */
.create-button:hover {
  background: #322848;
  color: #dbb4d7;
  transform: translateY(-1px);
  box-shadow: 0 0 10px #8a6bb8, 0 0 20px #c697bd, 0 0 30px #dbb4d7;
  border: none;
}

/* Keep text above the gradient */
.create-button span,
.create-button i {
  position: relative;
  z-index: 2;
}

/* Focus and disabled states */
.create-button:focus {
  outline: none;
}

.create-button:disabled {
  background: #888;
  cursor: not-allowed;
}
/* END OF BUTTONS */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(5, 5, 5, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.modal-box {
  background-color: #dbb4d7;
  padding: 1.5rem;
  border-radius: 1rem;
  width: 350px;
  text-align: center;
  color: #1f0d3e;
  position: relative;
}

/* Song Search Modal matches main-box glassmorphism - EDITED THIS PARTS TOO ABT SONG MODAL*/ 
.song-modal-box {
  background: rgba(255, 255, 255, 0.744);
  border-radius: 15px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  color: #322848;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
  width: 400px;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  position: relative;
}

/* Ensure Song Name and Artist Name inputs have normal font weight */
.song-modal-box .modal-input.input {
  font-weight: normal;
}

.song-modal-box .modal-header {
  font-weight: bold;
  font-size: 1.3rem;
  color: #322848;
  margin-bottom: 1.2rem;
  text-align: center;
  letter-spacing: 0.5px;
}

/* Make modal input fields match other input fields */
.song-modal-box .modal-input.input {
  width: 95% !important;
  height: 42px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.495);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  font-size: 13px;
  color: #322848;
  transition: all 0.3s ease;
  margin-bottom: 0.7rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
  text-align: left;
}

.song-modal-box .modal-input.input:focus {
  outline: none;
  background: #3228485a;
  color: #fff;
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
}

.close {
  position: absolute;
  top: 3px;
  right: 1rem;
  cursor: pointer;
  font-size: 2rem;
}

.modal-input {
  width: 90%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 0.3rem;
  border: none;
}

.modal-add-btn {
  background-color: #1f0d3e;
  color: white;
  padding: 0.5rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  width: 60%;
}

.confirm-box {
  background-color: #dbb4d7;
  padding: 1rem;
  border-radius: 0.75rem;
  text-align: center;
  width: 250px;
  color: #1f0d3e;
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

@keyframes twinkle {
  0% {
    box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.5);
  }

  50% {
    box-shadow: 0 0 15px 10px rgba(255, 255, 255, 0.8);
  }

  100% {
    box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.5);
  }
}

.twinkle-effect {
  animation: twinkle 1s ease-in-out infinite;
}

.error {
  color: red;
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.error-message {
  color: red;
  font-size: 0.7rem;
  margin-top: -0.rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.input.error,
.textarea.error {
  border: 1px solid red;
  background-color: rgba(255, 255, 255, 0.495);
}

/* EDITED ALL SEARCH */
.search-results {
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  background: #3228485a;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-sizing: border-box;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.7rem;
  background-color: #322848;
  border-radius: 8px;
  cursor: pointer;
  min-height: 48px;
}

.search-artwork {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 5px;
  flex-shrink: 0;
}

.search-details {
  flex: 1;
  margin-bottom: 0;
  color: #dbb4d7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}

.search-details strong {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-details span,
.search-details {
  font-size: 0.92rem;
  color: #bbb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-audio-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #dbb4d7;
  font-size: 1.2rem;
  margin-left: 0.7rem;
  flex-shrink: 0;
  align-self: center;
}

/* Remove square border when play button is clicked (no outline) */
.mini-audio-btn:focus {
  outline: none;
  box-shadow: none;
}

.no-preview {
  font-size: 0.85rem;
  color: #bbb;
  margin-left: 0.7rem;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
}

/* ADDED SONG AREA UNTIL THE END */
.songs-area-label {
  text-align: center;
  font-size: 0.85rem;
  color: #322848;
  font-weight: 500;
  margin-bottom: 0.7rem;
  margin-top: 0.4rem;
  letter-spacing: 0.5px;
}

.songs-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.song-slot {
  width: 90%;
  margin-left: auto;            
  margin-right: auto;        
  margin-bottom: 0;
  border-radius: 8px;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-start; 
  background: none;
  transition: background 0.3s;
}

.song-slot.filled {
  background: #322848; 
  padding: 0.1rem;
}

/* EDITED PARTS ABOOUT ADD SONG */
/* Style the add-song-btn like other input areas and align it */
.add-song-btn {
  width: 95%;
  height: 42px;
  background: rgba(255, 255, 255, 0.495);
  color: #322848;
  border: none; /* No border */
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  margin-bottom: 0.5rem;
  outline: none;
}

.add-song-btn:hover,
.add-song-btn:focus,
.add-song-btn:active {
  background: #3228485a;
  color: #fff;
  border: none;      /* Ensure no border on hover/focus/click */
  outline: none;
  box-shadow: none;
}

/* Align song meta (title & artist) to the left, beside artwork */
.song-info {
  display: flex;
  align-items: center; 
  width: 100%;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 8px;
}

.song-artwork-mini {
  width: 40px;
  height: 40px;
  border-radius: 3px;
  object-fit: cover;
  margin-right: 0.10rem;
}

.song-meta {
  flex-grow: 1;
  margin-left: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  justify-content: center;
}

.song-title {
  font-weight: bold;
  color: #dbb4d7;
  text-align: left;
  width: 100%;
}

.song-artist {
  font-size: 0.9rem;
  color: #bbb;
  text-align: left;
  width: 100%;
}

.song-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 0.5rem;
}

.song-actions i {
  cursor: pointer;
  color: #c2b4d6;
}

.remove-song-btn {
  background: none;
  border: none;
  color: #dbb4d7;
  font-size: 1.5rem;
  margin-left: 0.7rem;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.3rem;
  align-self: flex-end;
}

.remove-song-btn:hover {
  color: red;
}

.remove-song-btn:focus {
  outline: none;
  box-shadow: none;
}

/* Make search results width match input fields */
.song-modal-box .search-results {
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  background: #3228485a;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-sizing: border-box;
}

/* Only for the Congratulations modal */
.congrats-modal-box {
  position: relative;
  overflow: hidden;
  background: transparent;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  border-radius: 1rem;
  width: 350px;
  text-align: center;
  color: #322848;
  z-index: 20;
  font-size: 15px;
  box-shadow: 0 0 24px 6px #dbb4d7cc, 0 0 40px 10px #c697bd66;
}

/* Animated gradient background for congrats modal */
.congrats-modal-box::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 1rem;
  background: linear-gradient(120deg, #e3b8ff 0%, #dbb4d7 25%, #c697bd 50%, #8a6bb8 75%, #322848 100%);
  background-size: 200% 200%;
  animation: gradientMove 6s ease-in-out infinite;
  opacity: 0.95;
}

/* Glow effect for the Congratulations text */
.congrats-modal-box .modal-header {
  position: relative;
  font-size: 20px;
  font-weight: bold;
  color: #322848;
  z-index: 1;
  text-shadow:
    0 0 10px #dbb4d7,
    0 0 20px #c697bd,
    0 0 30px #8a6bb8,
    0 0 40px #e3b8ff;
  margin-bottom: 1rem;
  letter-spacing: 1px;
}

/* Ensure modal content is above the gradient */
.congrats-modal-box > * {
  position: relative;
  z-index: 1;
}

/* Keep close button visible above gradient */
.congrats-modal-box .close {
  z-index: 2;
  color: #fff;
  text-shadow: 0 0 8px #8a6bb8, 0 0 12px #322848;
  position: absolute;
  top: -1rem;
  right: -0.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  line-height: 1;
}

/* Responsive styles */
@media (max-width: 1024px) {
  .main-box{
    width: 60%;
  }

  }
@media (max-width: 768px) {
  .main-box{
    width: 80%;
    top: 55%;
  }

  }
  /* Additional styles for very small screens */
  @media (max-width: 480px) {
.main-box{
    width: 90%;
    top: 80%;
  }
  }
</style>