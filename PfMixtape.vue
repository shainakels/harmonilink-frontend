<template>
    <img src="/src/assets/background.png" alt="background" class="background" />
    
    <div class="create-text">Create your Mixtape</div>
    
    <div class="main-box">
      <div class="upload-box" @click="triggerPhotoUpload">
        <img v-if="photoUrl" :src="photoUrl" class="photo-preview" />
        <span v-else>Add photo</span>
        <input type="file" ref="photoInput" @change="handlePhotoUpload" hidden />
      </div>
  
      <input
        type="text"
        v-model="mixtapeName"
        class="input"
        placeholder="Mixtape Name"
        @input="validateMixtapeName"
      />
      <p v-if="mixtapeNameError" class="error-message">{{ mixtapeNameError }}</p>
  
      <textarea
        v-model="mixtapeBio"
        class="textarea"
        placeholder="Say something about your mixtape"
        @input="validateMixtapeBio"
      />
      <p v-if="mixtapeBioError" class="error-message">{{ mixtapeBioError }}</p>
  
      <div v-for="(song, index) in songs" :key="index" class="song-entry">
        {{ song.name }} - {{ song.artist }}
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
        :class="{'twinkle-effect': twinkleActive}"
        @click="handleFinish"
      >
        Create Mixtape
      </button>
      <button class="later-button" @click="skipMixtapeCreation">I want to do it later.</button>
  
      <div v-if="showSongModal" class="modal-overlay">
        <div class="modal-box">
          <div class="modal-header">
            Song Details
            <span class="close" @click="confirmCloseModal">×</span>
          </div>
          <input type="text" v-model="songName" class="modal-input" placeholder="Song Name" />
          <input type="text" v-model="artistName" class="modal-input" placeholder="Artist Name" />
          <button class="modal-add-btn" @click="addSong">Add Song to Mixtape</button>
        </div>
      </div>
  
      <div v-if="showConfirmClose" class="modal-overlay">
        <div class="confirm-box">
          <p>Are you sure you want to close this?</p>
          <div class="confirm-buttons">
            <button @click="closeSongModal">Yes</button>
            <button @click="showConfirmClose = false">No</button>
          </div>
        </div>
      </div>
  
      <div v-if="showCongratsPopup" class="modal-overlay">
        <div class="modal-box">
          <div class="modal-header">
            Congratulations!
            <span class="close" @click="closePopupAndRedirect">×</span>
          </div>
          <p>You just finished creating your profile.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
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
  const twinkleActive = ref(false); 
  
  const mixtapeNameError = ref('');
  const mixtapeBioError = ref('');
  const showSongError = ref(false); 
  
  function triggerPhotoUpload() {
    photoInput.value.click();
  }
  
  function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      photoUrl.value = URL.createObjectURL(file);
    }
  }
  
  function openSongModal() {
    showSongModal.value = true;
  }
  
  function confirmCloseModal() {
    showConfirmClose.value = true;
  }
  
  function closeSongModal() {
    showConfirmClose.value = false;
    showSongModal.value = false;
    songName.value = '';
    artistName.value = '';
  }
  
  function addSong() {
    if (songName.value && artistName.value) {
      songs.value.push({ name: songName.value, artist: artistName.value });
      closeSongModal();
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
    if (!mixtapeName.value.trim()) {
      alert('Mixtape name is required.');
      return;
    }
  
    if (!mixtapeBio.value.trim()) {
      alert('Mixtape bio is required.');
      return;
    }
  
    if (!photoUrl.value) {
      alert('Mixtape photo is required.');
      return;
    }
  
    if (songs.value.length < 3) {
      alert('At least 3 songs are required.');
      return;
    }
  
    const user_id = localStorage.getItem('user_id');
  
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/pfmixtape`, {
        user_id,
        name: mixtapeName.value,
        bio: mixtapeBio.value,
        photo_url: photoUrl.value,
        songs: songs.value,
      });
  
      if (response.data.status === 'success') {
        // Mark onboarding as completed
        await axios.post(`${import.meta.env.VITE_API_URL}/api/complete-onboarding`, { user_id });
        localStorage.setItem('onboardingStep', 'welcome');
  
        // Show the congratulations popup
        showCongratsPopup.value = true;
      }
    } catch (error) {
      console.error('Error in handleFinish:', error);
      alert('Failed to create mixtape. Please try again.');
    }
  };
  
  function skipMixtapeCreation() {
    router.push('/welcome'); 
  }
  
  function closePopupAndRedirect() {
    showCongratsPopup.value = false;
    router.push('/welcome');
  }
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
    transform: rotate(180deg);
    z-index: -1;
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
    height: 30rem;
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
    height: 10rem;
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
    width: 60%;
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
    height: 40px;
  }
  
  .song-count {
    text-align: center;
    font-size: 1rem;
    color: #bebebe;
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
    width: 350px;
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
  </style>