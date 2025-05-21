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
          <span>My Mixtapes</span>
          <i class="fa-solid fa-plus add-icon" @click="togglePopup"></i>
        </div>
  
        <!--START OF POPUP FOR CREATE MIXTAPE-->
        <div v-if="showPopup" class="popup-overlay">
          <div class="popup-box">
            <h2>Create your Mixtape</h2>
            
            <div class="upload-box" @click="triggerPhotoUpload">
              <img v-if="photoUrl" :src="photoUrl" class="photo-preview" />
              <span v-else>Add photo</span>
              <input
                type="file"
                accept=".jpg, .jpeg, .png"
                ref="photoInput"
                @change="handlePhotoUpload"
                hidden
              />
            </div>
  
            <input type="text" v-model="mixtapeName" placeholder="Mixtape Name" class="mixtape-name" />
            <textarea
              v-model="mixtapeDescription"
              placeholder="Say something about your mixtape"
              class="description-box"
            ></textarea>
  
            <div class="song-list-scroll">
              <div v-for="(song, index) in songs" :key="index" class="song-item song-item-flex">
                <div class="song-details-flex">
                  <img v-if="song.artwork_url" :src="song.artwork_url" alt="Artwork" class="search-artwork" />
                  <div class="song-text">
                    <div>{{ song.name }} - {{ song.artist }}</div>
                  </div>
                  <button
                    v-if="song.preview_url"
                    class="mini-audio-btn"
                    @click="togglePlay(index)"
                    :aria-label="playingIndex === index ? 'Pause preview' : 'Play preview'"
                  >
                    <i :class="playingIndex === index ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
                  </button>
                  <audio
                    v-if="song.preview_url"
                    ref="audioRefs"
                    :src="song.preview_url"
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

            <div class="song-actions">
              <div class="add-song" @click="openSongModal">
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
            <h3>Song Search</h3>
            <input type="text" v-model="songName" placeholder="Song Name" @input="searchSongs" />
            <input type="text" v-model="artistName" placeholder="Artist Name" @input="searchSongs" />
            <div v-if="searchResults.length > 0" class="search-results">
              <div v-for="(result, index) in searchResults" :key="index" class="search-item">
                <img v-if="result.artworkUrl100" :src="result.artworkUrl100" alt="Artwork" class="search-artwork" />
                <div class="search-details" @click="addSongFromResult(result)">
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
  
        <div v-if="showConfirmCancel" class="modal-overlay">
          <div class="confirm-box">
            <p>Are you sure you want to close this?</p>
              <div class="confirm-buttons">
                <button @click="closePopup">Yes</button>
                <button @click="showConfirmCancel = false">No</button>
              </div>
          </div>
        </div>

        <!--END OF POPUP FOR CREATE MIXTAPE-->
  
        <hr class="separator" />
  
        <div class="mixtape-search">
          <div class="input-wrapper input-with-mic">
            <i 
              :class="['fa-solid', 'fa-microphone', micActive ? 'mic-recording' : 'mic-icon']" 
              class="mic-left-inside"
              @click="toggleMicRecording"
            ></i>
            <input 
              type="text" 
              v-model="searchText" 
              class="mixtape-input" 
              placeholder="Search mixtapes..."
            />
            <i class="fa-solid fa-list-ul sort-icon" @click="toggleSortDropdown"></i>
          </div>
          <div v-if="showSortDropdown" class="mixtape-sort-dropdown">
            <select v-model="sortOption" @change="sortMixtapes">
              <option value="az">Alphabetical (A–Z)</option>
              <option value="za">Alphabetical (Z–A)</option>
              <option value="newest">Date Added (Newest First)</option>
              <option value="oldest">Date Added (Oldest First)</option>
            </select>
          </div>
        </div>
  
        <div class="mixtape-list">
          <div v-if="selectedMixtape" class="mixtape-detail-overlay">
          <div class="mixtape-detail-box">
            <span class="close-detail" @click="selectedMixtape = null">&times;</span>
            <img :src="getFullPhotoUrl(selectedMixtape.photo_url)" class="detail-img" />
            <h2>{{ selectedMixtape.name }}</h2>
            <p>{{ selectedMixtape.description }}</p>
            <p>{{ selectedMixtape.bio }}</p>
            <ul class="song-detail-list">
              <li v-for="(song, i) in selectedMixtape.songs" :key="i" style="display: flex; align-items: center; gap: 10px;">
                <img v-if="song.artwork_url" :src="song.artwork_url" alt="Artwork" style="width:32px; height:32px; border-radius:4px;" />
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

          <div 
            class="mixtape-item" 
            v-for="(mix, index) in mixtapes" 
            :key="index"
            @click="selectedMixtape = mix"
            style="position: relative;"
          >
            <img :src="getFullPhotoUrl(mix.photo_url)" alt="Mixtape Image" class="mixtape-img" />
            <span>{{ mix.name }}</span>
            <!-- Three-dot menu -->
            <div class="mixtape-menu-wrapper" @click.stop>
              <i class="fa-solid fa-ellipsis-vertical mixtape-menu-icon" @click.stop="toggleMixtapeMenu(index)"></i>
              <div v-if="openMenuIndex === index" class="mixtape-menu-dropdown">
                <div @click="editMixtape(index)">Edit</div>
                <div @click="deleteMixtape(index)">Delete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
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

const mixtapes = ref([]); // get mixtapes from backend
const isSortedByName = ref(true);
const mixtapeName = ref('');
const mixtapeDescription = ref('');
const songName = ref('');
const artistName = ref('');
const songs = ref([]);
const photoUrl = ref(null);
const photoInput = ref(null);
const selectedMixtape = ref(null); 

const searchResults = ref([]);
const isEditing = ref(false);
const editingIndex = ref(null);

const playingIndex = ref(null);
const audioRefs = ref([]);
const searchAudioRefs = ref([]);
const searchPlayingIndex = ref(null);

const songAudioRefs = ref([]);
const playingSongIndex = ref(null);

const token = localStorage.getItem('token');

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
  editingMixtapeId.value = null;
};

function triggerPhotoUpload() {
  photoInput.value?.click();
}

async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // Show preview (for local preview before upload)
    photoUrl.value = URL.createObjectURL(file);

    // Upload to backend
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Use getFullPhotoUrl to convert the returned imageUrl to a full URL
      photoUrl.value = getFullPhotoUrl(response.data.imageUrl);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload image.');
      photoUrl.value = null;
    }
  }
}

const createMixtape = async () => {
  if (mixtapeName.value.trim() === '') {
    alert('Please enter a mixtape name.');
    return;
  }
  if (songs.value.length < 1) { 
    alert('Please add at least 1 song to create a mixtape.');
    return;
  }

  console.log('Songs being sent:', songs.value); // <-- Add this line

  let photoPath = photoUrl.value;
  // Remove base URL if present
  if (photoPath && photoPath.startsWith(import.meta.env.VITE_API_URL)) {
    photoPath = photoPath.replace(import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/', '');
  }

  try {
    const token = localStorage.getItem('token');
    if (editingMixtapeId.value) {
      // Update existing mixtape
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/mixtapes/${editingMixtapeId.value}`,
        {
          name: mixtapeName.value,
          description: mixtapeDescription.value,
          photoUrl: photoPath,
          songs: songs.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } else {
      // Create new mixtape
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/create-mixtape`,
        {
          name: mixtapeName.value,
          description: mixtapeDescription.value,
          photoUrl: photoPath,
          songs: songs.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }
    await fetchUserMixtapes();
    closePopup();
    editingMixtapeId.value = null;
  } catch (error) {
    alert('Failed to save mixtape.');
  }
};

const onSearchAudioEnded = () => {
  searchPlayingIndex.value = null;
};

const toggleSearchPlay = (index) => {
  if (searchPlayingIndex.value !== null && searchAudioRefs.value[searchPlayingIndex.value]) {
    searchAudioRefs.value[searchPlayingIndex.value].pause();
    searchAudioRefs.value[searchPlayingIndex.value].currentTime = 0;
  }

  if (searchPlayingIndex.value === index) {
    searchPlayingIndex.value = null;
    return;
  }

  const audio = searchAudioRefs.value[index];
  if (audio) {
    audio.play();
    searchPlayingIndex.value = index;
  }
};

const openSongModal = () => {
  showSongModal.value = true;
  songName.value = '';
  artistName.value = '';
  searchResults.value = [];
};

const closeSongModal = () => {
  showSongModal.value = false;
  isEditing.value = false;
  editingIndex.value = null;
  songName.value = '';
  artistName.value = '';
  searchResults.value = [];
};

const addSongFromResult = (result) => {
  const newSong = {
    name: result.trackName,
    artist: result.artistName,
    preview_url: result.previewUrl || null,
    artwork_url: result.artworkUrl100 || null,
  };
  if (isEditing.value && editingIndex.value !== null) {
    songs.value[editingIndex.value] = newSong;
    isEditing.value = false;
    editingIndex.value = null;
  } else {
    songs.value.push(newSong); // <-- NO LIMIT
  }
  closeSongModal();
};

const searchSongs = async () => {
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
    searchResults.value = [];
  }
};

const editSong = (index) => {
  const songToEdit = songs.value[index];
  songName.value = songToEdit.name;
  artistName.value = songToEdit.artist;
  isEditing.value = true;
  editingIndex.value = index;
  showSongModal.value = true;
};

const deleteSong = (index) => {
  songs.value.splice(index, 1);
};

const togglePlay = (index) => {
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
};

const onAudioEnded = () => {
  playingIndex.value = null;
};

function toggleSongPlay(index) {
  // Pause any currently playing audio
  if (playingSongIndex.value !== null && songAudioRefs.value[playingSongIndex.value]) {
    songAudioRefs.value[playingSongIndex.value].pause();
    songAudioRefs.value[playingSongIndex.value].currentTime = 0;
  }

  if (playingSongIndex.value === index) {
    playingSongIndex.value = null;
    return;
  }

  nextTick(() => {
    const audio = songAudioRefs.value[index];
    if (audio) {
      audio.play();
      playingSongIndex.value = index;
    }
  });
}

function onSongAudioEnded() {
  playingSongIndex.value = null;
}

// Reset refs when selectedMixtape changes
watch(() => selectedMixtape.value, () => {
  songAudioRefs.value = [];
  playingSongIndex.value = null;
});

watch(songs, () => {
  audioRefs.value = [];
});
watch(searchResults, () => {
  searchAudioRefs.value = [];
});

const sortOption = ref('az');

function sortMixtapes() {
  if (!mixtapes.value || mixtapes.value.length === 0) return;
  switch (sortOption.value) {
    case 'az':
      mixtapes.value.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'za':
      mixtapes.value.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'newest':
      mixtapes.value.sort((a, b) => {
        // If you have a created_at field, use it. Otherwise, fallback to id.
        return (b.created_at || b.id) - (a.created_at || a.id);
      });
      break;
    case 'oldest':
      mixtapes.value.sort((a, b) => {
        return (a.created_at || a.id) - (b.created_at || b.id);
      });
      break;
  }
}

// --- Drag and Drop Sorting ---
let dragSourceIndex = null;

const handleDragStart = (event, index) => {
  dragSourceIndex = index;
  event.dataTransfer.effectAllowed = 'move';
};

const handleDrop = (event, dropIndex) => {
  if (dragSourceIndex !== null && dropIndex !== dragSourceIndex) {
    const draggedSong = songs.value[dragSourceIndex];
    songs.value.splice(dragSourceIndex, 1);
    songs.value.splice(dropIndex, 0, draggedSong);
  }
  dragSourceIndex = null;
};

const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

onMounted(() => {
  dragSourceIndex = null;
});

// --- Speech Recognition ---
const searchText = ref('');
const micActive = ref(false);

// Function to toggle the microphone recording state
const toggleMicRecording = () => {
  micActive.value = !micActive.value;

  if (micActive.value) {
    startSpeechRecognition(); // Start speech recognition when recording starts
  } else {
    stopSpeechRecognition(); // Stop speech recognition when recording stops
  }
};

// Function to start speech recognition (as you already have this)
const startSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition is not supported by your browser.');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log('Speech recognition started');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchText.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    alert('There was an error with speech recognition.');
  };

  recognition.onend = () => {
    console.log('Speech recognition ended');
  };

  recognition.start();
};

// Function to stop speech recognition
const stopSpeechRecognition = () => {
  console.log('Speech recognition stopped');
  // You can implement stopping the recognition here if necessary
};

onMounted(async () => {
  await fetchUserMixtapes();
});

async function fetchUserMixtapes() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/mixtapes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    mixtapes.value = response.data;
    sortMixtapes(); // <-- sort after fetching
  } catch (error) {
    console.error('Failed to fetch mixtapes:', error);
    mixtapes.value = [];
  }
}

function getFullPhotoUrl(photoUrl) {
  if (!photoUrl) return '/src/assets/logo2.png';
  if (photoUrl.startsWith('http')) return photoUrl;
  // Always use backend API URL for uploads
  return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/${photoUrl.replace(/^\/?/, '')}`;
}

const openMenuIndex = ref(null);

function toggleMixtapeMenu(index) {
  openMenuIndex.value = openMenuIndex.value === index ? null : index;
}

function editMixtape(index) {
  // Populate popup with mixtape data for editing
  const mix = mixtapes.value[index];
  mixtapeName.value = mix.name;
  mixtapeDescription.value = mix.bio || '';
  songs.value = mix.songs ? JSON.parse(JSON.stringify(mix.songs)) : [];
  photoUrl.value = mix.photo_url;
  editingMixtapeId.value = mix.id;
  showPopup.value = true;
  openMenuIndex.value = null;
}

const editingMixtapeId = ref(null);

async function deleteMixtape(index) {
  if (!confirm('Are you sure you want to delete this mixtape?')) return;
  const mix = mixtapes.value[index];
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3000/api/mixtapes/${mix.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    await fetchUserMixtapes();
    openMenuIndex.value = null;
  } catch (err) {
    alert('Failed to delete mixtape.');
  }
}

const showSortDropdown = ref(false);

function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value;
}

function handleClickOutside(event) {
  const dropdown = document.querySelector('.mixtape-sort-dropdown');
  const icon = document.querySelector('.sort-icon');
  if (
    dropdown &&
    !dropdown.contains(event.target) &&
    icon &&
    !icon.contains(event.target)
  ) {
    showSortDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

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
  z-index: 1;
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
  justify-content: space-between;
  gap: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  right: 0;
  bottom: 0;
  z-index: 1; 
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
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
     z-index: 10000;
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
    width: 30rem;
    text-align: center;
    color: #1f0d3e;
    position: relative;
}
  
.song-popup-box h3 {
    margin-bottom: 1rem;
    font-size: 1.6rem;
}
  
  .song-popup-box input {
    width: 90%;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 0.3rem;
    border: none;
  }
  
  .exit-btn {
    position: absolute;
    top: 3px;
    right: 1rem;
    cursor: pointer;
    font-size: 2rem;
    font-weight: bold;
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
    background: #080d2a;
    color: #dbb4d7;
    border: 1px solid #ebebeb;
  }
  
  .confirm-buttons button:last-child:hover {
    background: red;
    color: white;
    border: 1px solid #ebebeb;
  }
  
  .separator {
    border: none;
    border-top: 1px solid white;
    margin: 1rem 0;
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

.input-with-mic {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.mic-left-inside {
  position: absolute;
  left: 10px;
  z-index: 1;
}

.input-with-mic .mixtape-input {
  padding-left: 32px; /* to make space for the mic icon */
}

.sort-icon {
  position: absolute;
  right: 0;
  cursor: pointer;
  color: white;
  transition: color 0.2s;
}

.sort-icon:hover {
  color: #555;
}
  
  .mixtape-input {
    width: 85%;
    padding: 5px 35px;
    background-color: #432775;
    border: none;
    border-radius: 30px;
    color: white;
    font-size: 12px;
  }
  
  .mixtape-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .mixtape-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: white;
    padding: 0.5rem;
    cursor: pointer;  
  }
  
  .mixtape-img {
    width: 40px;
    object-fit: cover;
    border-radius: 6px;
  }

  .mixtape-name {
  font-weight: bold;
  font-size: 1.1rem; 
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

.song-list-scroll {
    display: flex;
    flex-direction: column;
    height: 10rem;
    overflow-y: auto;
    padding: 5px;
    margin-top: 1rem;
    border: 1px solid #444;
    border-radius: 10px;
    }

.song-item-flex {
  display: flex;
  justify-content: space-between;
  background-color: #2c1a40;
  padding: 0.5rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  color: white;
}

.song-actions-buttons {
    display: flex;
    gap: 0.5rem;
    font-size: 1.25rem;
    align-items: center;
  }
  
  .song-actions-buttons i {
    margin-left: 0.5rem;
    cursor: pointer;
    color: #c2b4d6;
  }
  
  .song-actions-buttons i:hover {
    color: #ffffff;
  }

.song-link {
  margin-left: 10px;
  color: #dbb4d7;
  text-decoration: none;
  font-size: 1.1rem;
}

.song-link:hover {
  color: white;
}

.mixtape-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(20, 20, 20, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.mixtape-detail-box {
  background-color: #1e1e1e;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  text-align: center;
  color: white;
  position: relative;
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
}

.song-details-flex {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mic-icon {
  color: white;
  cursor: pointer;
}

.mic-recording {
  color: red;
  cursor: pointer;
  animation: pulse 1s infinite;
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
  flex: 1;
  font-size: 14px;
}

.search-artwork,
.photo-preview {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  object-fit: cover;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.mixtape-menu-wrapper {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;;
}

.mixtape-menu-icon {
  cursor: pointer;
  color: #dbb4d7;
  font-size: 18px;
  padding: 4px;
}

.mixtape-menu-dropdown {
  position: absolute;
  right: 0;
  top: 25px;
  background: #2e1f45;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1500;
  min-width: 80px;
  text-align: left;
}

.mixtape-menu-dropdown div {
  padding: 8px 16px;
  cursor: pointer;
  color: #fff;
}

.mixtape-menu-dropdown div:hover {
  background: #dbb4d7;
  color: #1f0d3e;
}

.mixtape-sort-dropdown {
  margin-bottom: 0.5rem;
  text-align: right;
}

.mixtape-sort-dropdown select {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #dbb4d7;
  background: #2e1f45;
  color: #fff;
  font-size: 0.95rem;
}
</style>

