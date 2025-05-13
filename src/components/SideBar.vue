<template>
    <div class="side-nav">
      <div class="nav-section">
        <router-link
          v-for="(item, index) in navItems"
          :key="index"
          :to="item.route"
          class="nav-item"
          active-class="active"
          exact
        >
          <i :class="item.icon"></i>
          <span>{{ item.text }}</span>
        </router-link>
      </div>
  
      <div class="mixtape-section">
        <div class="mixtape-header">
          <i class="fa-solid fa-compact-disc"></i>
          <span>Mixtapes</span>
          <i class="fa-solid fa-plus add-icon" @click="togglePopup"></i>
        </div>
  
        <div v-if="showPopup" class="popup-overlay">
          <div class="popup-box">
            <h2>Create your Mixtape</h2>
  
            <div class="upload-box" @click="triggerPhotoUpload">
              <img v-if="photoUrl" :src="photoUrl" class="photo-preview" />
              <span v-else>Add photo</span>
              <input type="file" ref="photoInput" @change="handlePhotoUpload" hidden />
            </div>
  
            <input type="text" v-model="mixtapeName" placeholder="Mixtape Name" class="mixtape-name" />
            <textarea
              v-model="mixtapeDescription"
              placeholder="Say something about your mixtape"
              class="description-box"
            ></textarea>
  
            <div class="song-list-scroll">
              <div v-for="(song, index) in songs" :key="index" class="song-item">
                <span>{{ song.name }} - {{ song.artist }}</span>
              </div>
            </div>

            <div class="song-actions">
              <div class="add-song" @click="showSongModal = true">
                <i class="fa-solid fa-circle-plus"></i>
                <span>Add Song</span>
              </div>
            </div>

            <div class="popup-buttons">
              <button @click="createMixtape">Create Mixtape</button>
              <button @click="showConfirmCancel = true">Cancel</button>
            </div>
          </div>
        </div>
  
        <div v-if="showSongModal" class="modal-overlay">
          <div class="song-popup-box">
            <span class="exit-btn" @click="closeSongModal">×</span>
            <h3>Song Details</h3>
            <input type="text" v-model="songName" placeholder="Song Name" />
            <input type="text" v-model="artistName" placeholder="Artist Name" />
            <button @click="addSong">Add Song to Mixtape</button>
          </div>
        </div>
  
        <div v-if="showConfirmCancel" class="modal-overlay">
          <div class="confirm-box">
            <p>Are you sure you want to close it?</p>
            <div class="confirm-buttons">
              <button @click="closePopup">Close</button>
              <button @click="showConfirmCancel = false">Stay</button>
            </div>
          </div>
        </div>
  
        <hr class="separator" />
  
        <div class="mixtape-search">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" class="mixtape-input" />
          <i class="fa-solid fa-list-ul sort-icon" @click="sortMixtapes"></i>
        </div>
  
        <div class="mixtape-list">
          <div class="mixtape-item" v-for="(mix, index) in mixtapes" :key="index">
            <img :src="mix.photo_url || '/src/assets/logo2.png'" alt="Mixtape Image" class="mixtape-img" />
            <span>{{ mix.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
    import { ref } from 'vue';
    import axios from 'axios';
  
    const showPopup = ref(false);
    const showSongModal = ref(false);
    const showConfirmCancel = ref(false);
  
    const navItems = [
      { icon: 'fa-solid fa-user-plus', text: 'Discover', route: '/discover' },
      { icon: 'fa-solid fa-pen', text: 'Feed', route: '/feed' },
      { icon: 'fa-solid fa-trophy', text: 'Achievements', route: '/achievements' },
      { icon: 'fa-solid fa-heart', text: 'Favorites', route: '/favorites' }
    ];
  
    const mixtapes = ref([]); 
    const mixtapeName = ref('');
    const mixtapeDescription = ref('');
    const songName = ref('');
    const artistName = ref('');
    const songs = ref([]);
    const photoUrl = ref(null);
    const photoInput = ref(null);
  
    const togglePopup = () => {
      showPopup.value = true;
    };
  
    const closePopup = () => {
      showPopup.value = false;
      showConfirmCancel.value = false;
      mixtapeName.value = '';
      mixtapeDescription.value = '';
      songs.value = [];
      photoUrl.value = null;
    };
  
    function triggerPhotoUpload() {
      photoInput.value?.click();
    }
  
    function handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        photoUrl.value = URL.createObjectURL(file);
      }
    }
  
    const createMixtape = async () => {
      if (!mixtapeName.value || songs.value.length === 0) {
        alert('Please provide a mixtape name and at least one song.');
        return;
      }
  
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          alert('You must be logged in to create a mixtape.');
          return;
        }
  
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/create-mixtape`,
          {
            name: mixtapeName.value,
            description: mixtapeDescription.value,
            photoUrl: photoUrl.value,
            songs: songs.value,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        alert('Mixtape created successfully!');
        closePopup();
        fetchMixtapes();
      } catch (error) {
        console.error('Error creating mixtape:', error);
        alert('Failed to create mixtape. Please try again.');
      }
    };
  
    const addSong = () => {
      if (songName.value && artistName.value) {
        songs.value.push({ name: songName.value, artist: artistName.value });
        songName.value = '';
        artistName.value = '';
        showSongModal.value = false;
      }
    };
  
    const closeSongModal = () => {
      showSongModal.value = false;
      songName.value = '';
      artistName.value = '';
    };
  
    const fetchMixtapes = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found.');
          return;
        }
    
        // Use the correct endpoint to fetch mixtapes
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/mixtapes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        mixtapes.value = response.data;
      } catch (error) {
        console.error('Error fetching mixtapes:', error);
      }
    };
  
    // Fetch mixtapes on component mount
    fetchMixtapes();
  
    const sortMixtapes = () => {
      mixtapes.value.sort((a, b) => a.localeCompare(b));
    };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
  
  * {
    font-family: 'Fira Code', monospace;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .side-nav {
  position: fixed;
  top: 70px;
  left: 0;
  height: calc(100vh - 60px);
  width: 270px;
  background-color: #080d2a;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  z-index: 999;
}
  
  .nav-section,
  .mixtape-section {
    background-color: #1f0d3e;
    padding: 2rem;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    color: #cec3c3;
    margin-bottom: 1.5rem;
    text-decoration: none;
    transition: color 0.3s, font-weight 0.3s;
  }
  
  .nav-item.active,
  .nav-item.router-link-active {
    font-weight: bold;
    color: white;
  }
  
  .nav-item i {
    width: 35px;
    height: 35px;
    background-color: #322848;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
  }
  
  .mixtape-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: white;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .add-icon {
    background-color: #dbb4d7;
    color: #1f0d3e;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    margin-left: auto;
    cursor: pointer;
  }
  
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 1000;
  }
  
  .popup-box {
    background-color: #080d2a;
    padding: 2rem;
    border-radius: 1rem;
    width: 600px;
    color: white;
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
  
  .mixtape-name,
  .description-box {
    padding: 0.75rem;
    border: none;
    width: 100%;
    color: white;
    background: transparent;
    text-align: center;
  }
  
  .description-box {
    height: 60px;
    resize: none;
  }
  
  .song-item {
    padding: 0.2rem;
    text-align: center;
  }
  
.song-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
  padding: 0 2rem;
}

.song-count {
  font-size: 0.9rem;
  color: #fff;
}

.add-song {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #fff;
  margin: 0;
}
  
.popup-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}
  
.popup-buttons button {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 0.5rem;
    background-color: #dbb4d7;
    color: #1f0d3e;
    cursor: pointer;
    font-size: 15px;
  }
  
  .popup-buttons button:hover {
    background: #080d2a;
    color: #dbb4d7;
    border: 1px solid #ebebeb;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(5, 5, 5, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
  }
  
  .song-popup-box {
    background-color: #dbb4d7;
    padding: 1.5rem;
    border-radius: 1rem;
    width: 350px;
    text-align: center;
    color: #1f0d3e;
    position: relative;
  }
  
  .song-popup-box h3 {
    margin-bottom: 1rem;
  }
  
  .song-popup-box input {
    width: 90%;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 0.3rem;
    border: none;
  }
  
  .song-popup-box button {
    padding: 0.75rem;
    border: none;
    border-radius: 30px;
    background-color: #1f0d3e;
    color: white;
    cursor: pointer;
    width: 60%;
  }
  
  .exit-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    color: #1f0d3e;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
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
  
  .confirm-buttons button:first-child:hover {
    background: red;
    color: white;
    border: 1px solid #ebebeb;
  }
  
  .confirm-buttons button:last-child:hover {
    background: #080d2a;
    color: #dbb4d7;
    border: 1px solid #ebebeb;
  }
  
  .separator {
    border: none;
    border-top: 1px solid white;
    margin: 1rem 0;
  }
  
  .mixtape-search {
    position: relative;
    margin-bottom: 1rem;
  }
  
  .search-icon,
  .sort-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .search-icon { left: 7px; }
  .sort-icon  { right: 0px; cursor: pointer; }
  
  .mixtape-input {
    width: 85%;
    padding: 0.2rem 1rem 0.2rem 2.5rem;
    background-color: #432775;
    border: none;
    border-radius: 30px;
    color: white;
  }
  
  .mixtape-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .mixtape-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: white;
    padding: 0.5rem;
  }
  
  .mixtape-img {
    width: 25px;
    object-fit: cover;
    border-radius: 6px;
  }

  .mixtape-name {
  font-weight: bold;
  font-size: 1.1rem; /* Slightly larger than default */
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.description-box {
  font-size: 0.95rem;
  padding: 0.5rem;
  width: 100%;
  height: 80px;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 0.5rem;
}

.song-item {
  font-size: 0.9rem;
  padding: 0.25rem 0;
  overflow-wrap: break-word;
}

.popup-box {
  max-height: 90vh;
  overflow-y: auto;
  padding-right: 1rem;
}

.song-item + .song-item {
  border-top: 1px solid #3a2c56;
}

.popup-box .song-list-scroll {
  max-height: 150px;
  overflow-y: auto;
  background-color: #2e1f45;
  padding: 0.5rem;
  border-radius: 5px;
  margin-bottom: 1rem;
}

  </style>

