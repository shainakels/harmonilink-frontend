<template>
  <img src="/src/assets/background.png" alt="background" class="background">
  
  <div class="create-text">Create your Mixtape</div>
  
  <div class="main-box">
    <div class="upload-box" @click="triggerPhotoUpload">
      <img v-if="photoUrl" :src="getFullPhotoUrl(photoUrl)" class="photo-preview" />
      <span v-else>Add photo</span>
      <input
        type="file"
        accept=".jpg, .jpeg, .png"
        ref="photoInput"
        @change="handlePhotoUpload"
        hidden
      />

    </div>
    <p v-if="photoUploadError" class="error-message">{{ photoUploadError }}</p>

    <input
      type="text"
      v-model="mixtapeName"
      class="input"
      :class="{ error: mixtapeNameError }"
      placeholder="Mixtape Name"
      @input="validateMixtapeName"
    />
    
    <p v-if="mixtapeNameError" class="error-message">{{ mixtapeNameError }}</p>

    <textarea
      v-model="mixtapeBio"
      class="textarea"
      :class="{ error: mixtapeBioError }"
      placeholder="Say something about your mixtape"
      @input="validateMixtapeBio"
    ></textarea>

    <p v-if="mixtapeBioError" class="error-message">{{ mixtapeBioError }}</p>

    <div class="song-list-container">
    <div v-for="(song, index) in songs" :key="index" class="song-entry song-item-flex">
      <div class="song-details-flex">
      <img v-if="song.artwork" :src="song.artwork" alt="Artwork" class="song-artwork" />
      <div class="song-text">
        <div>{{ song.name }} - {{ song.artist }}</div>
      </div>
        <button
          v-if="song.previewUrl"
          class="mini-audio-btn"
          @click="togglePlay(index)"
          :aria-label="playingIndex === index ? 'Pause preview' : 'Play preview'"
        >
          <i :class="playingIndex === index ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
        </button>
        <div v-else class="no-preview">No preview available</div>
        <audio
          v-if="song.previewUrl"
          ref="audioRefs"
          :src="song.previewUrl"
          @ended="onAudioEnded"
          style="display: none;"
        ></audio>
      </div>
      <div class="song-actions-buttons">
        <i class="fa-solid fa-pen edit-icon" @click="editSong(index)"></i>
        <i class="fa-solid fa-trash delete-icon" @click="deleteSong(index)"></i>
      </div>
    </div>
    </div>

    <div class="song-count">
      {{ songs.length }} / 3 Songs
      <p v-if="showSongError && songs.length < 3" class="error-message">
        You need to add 3 songs to proceed.
      </p>
    </div>

    <div v-if="songs.length < 3" class="add-song-row" @click="openSongModal">
      <i class="fa-solid fa-circle-plus"></i> <span>Add Song</span>
    </div>
    
    <button
      class="create-button"
      :class="{ 'twinkle-effect': twinkleActive }"
      :disabled="isSubmitting"
      @click="handleFinish"
    >
      {{ isSubmitting ? 'Creating...' : 'Create Mixtape' }}
    </button>

    <button class="later-button" @click="skipMixtapeCreation">I want to do it later.</button>
  </div>
    <!-- Song Modal -->
    <div v-if="showSongModal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-header">
          Song Search
          <span class="close" @click="confirmCloseModal">×</span>
        </div>
        <input type="text" v-model="songName" class="modal-input" placeholder="Song Name" @input="searchSongs" />
        <input type="text" v-model="artistName" class="modal-input" placeholder="Artist Name" @input="searchSongs" />
        
        <div v-if="searchResults.length > 0" class="search-results">
          <div v-for="(result, index) in searchResults" :key="index" class="search-item">
            <img
              v-if="result.artworkUrl100"
              :src="result.artworkUrl100"
              alt="Artwork"
              class="search-artwork"
            />
            <div class="search-info" @click="addSongFromResult(result)">
              <strong>{{ result.trackName }}</strong> - {{ result.artistName }}
            </div>
            <button
              v-if="result.previewUrl"
              class="mini-audio-btn"
              @click.stop="toggleSearchPlay(index)"
              :aria-label="searchPlayingIndex === index ? 'Pause preview' : 'Play preview'"
            >
              <i :class="searchPlayingIndex === index ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
            </button>
            <div v-else class="no-preview">No preview</div>
            <audio
              v-if="result.previewUrl"
              ref="searchAudioRefs"
              :src="result.previewUrl"
              @ended="onSearchAudioEnded"
              style="display: none;"
            ></audio>
          </div>

        </div>
        <div v-else class="search-empty">
          <p>No results found yet. Try typing a song name or artist.</p>
        </div>
      </div>
    </div>

    <!-- Confirm Close Modal -->
    <div v-if="showConfirmClose" class="modal-overlay">
      <div class="confirm-box">
        <p>Are you sure you want to close this?</p>
        <div class="confirm-buttons">
          <button @click="closeSongModal">Yes</button>
          <button @click="showConfirmClose = false">No</button>
        </div>
      </div>
    </div>

    <!-- Congrats Modal -->
    <div v-if="showCongratsPopup" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-header">
          Congratulations!
          <span class="close" @click="closePopupAndRedirect">×</span>
        </div>
        <p>You just finished creating your profile.</p>
      </div>
    </div>
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
const showConfirmClose = ref(false);
const showCongratsPopup = ref(false);

const songName = ref('');
const artistName = ref('');
const searchResults = ref([]);

const twinkleActive = ref(false); 

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
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      photoUploadError.value = 'Only JPG and PNG images are allowed.';
      return;
    }

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

function confirmCloseModal() {
  showConfirmClose.value = true;
}

function closeSongModal() {
  showConfirmClose.value = false;
  showSongModal.value = false;
}

function addSongFromResult(result) {
  const newSong = {
    name: result.trackName,
    artist: result.artistName,
    previewUrl: result.previewUrl || null,
    artwork: result.artworkUrl100 || null,
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
  
  .background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  transform: rotate(180deg);
}
  
  .create-text {
    position: absolute;
    top: 4.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3rem;
    color: #ffffff;
    text-align: center;
  }
  
  .main-box {
    background-color: #080d2a;
    width: 35rem;
    height: 36rem;
    padding: 2rem;
    border-radius: 15px;
    color: white;
    position: absolute;
    top: 58%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .upload-box {
    background-color: #bebebe;
    width: 10rem;
    min-height: 10rem;
    margin: 0 auto 1rem;
    border: 5px solid #fffefd;
    border-radius: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #444;
    cursor: pointer;
    overflow: hidden;
  }
  
  .photo-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .input,
  .textarea {
    width: 80%;
    text-align: center;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.4rem;
    border: none;
    display: block;
    margin-left: auto;
    margin-right: auto;
    background-color: #080d2a;
    color: #ffffff;
    font-size: 14px;
  }
  
  .input::placeholder,
  .textarea::placeholder {
    color: #bebebe; 
    opacity: 1;
  }
  
  .input {
    font-weight: bold;
  }
  
  .textarea {
    resize: none;
    height: 50px;
  }

  .song-list-container {
    display: flex;
    flex-direction: column;
    height: 10rem;
    overflow-y: auto;
    padding: 5px;
    margin-top: 1rem;
    border: 1px solid #444;
    border-radius: 10px;
    }
  
  .song-count {
    text-align: center;
    font-size: 1rem;
    color: #bebebe;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  
  .add-song-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    justify-content: flex-start;
    margin-bottom: 1rem;
    cursor: pointer;
    padding-left: 10%;
  }
  
  .add-song-row i {
    margin-right: 8px;
    color: #dbb4d7;
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
    padding: 0.3rem;
    border-radius: 5px;
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
  
  .create-button,
  .later-button {
    display: block;
    width: 45%;
    padding: 0.5rem;
    border-radius: 0.5rem;
    margin: 0.2rem auto;
    text-decoration: none;
    text-align: center;
    background: radial-gradient(circle, #dbb4d7 10%, #1f0d3e 90%);
    font-weight: bold;
    font-size: 15px;
  }
  
  .create-button {
    color: #080d2a;
    border: 1px solid #ffffff;
    margin-top: auto; 
  }
  
  .create-button:hover {
    background: #080d2a;
    color: #dbb4d7;
    border: 1px solid #ebebeb;
  }
  
  .later-button {
    background: none;
    font-size: 0.8rem;
    color: #dbb4d7;
    text-decoration: underline;
    border: none;
    cursor: pointer;
  }
  
  .later-button:hover {
    color: #ffffff;
  }
  
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
    width: 30rem;
    text-align: center;
    color: #1f0d3e;
    position: relative;
  }
  
  .modal-header {
    font-weight: bold;
    margin-bottom: 1rem;
    font-size: 1.6rem;
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
  border: 1px solid #ff4d4f;
  background-color: #2c1c1c;
}

.search-results {
  margin-top: 1rem;
  max-height: 150px;
  overflow-y: auto;
  background: #1f0d3e;
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: #dbb4d7;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}

.search-details {
  margin-bottom: 0.25rem;
}

.preview-player {
  width: 100%;
  outline: none;
  
}

.no-preview {
  font-size: 12px;
  color: #999;
}

.mini-audio-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #dbb4d7;
}

.mini-audio-btn:hover {
  color: #dbb4d7;
}

.search-details {
  color: #dbb4d7;
  cursor: pointer;
}

.song-details-flex {
  display: flex;
  align-items: center;
  gap: 10px;
}

.song-artwork {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  object-fit: cover;
}

.song-text {
  flex-grow: 1;
  text-align: left;
}

.search-artwork {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.search-info {
  flex: 1;
  font-size: 14px;
}

  </style>
 