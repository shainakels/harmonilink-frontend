<template> 
<NavLayout> 
  <div class="profile-wrapper"> 
    <h1 class="page-title">Your Profile</h1> 
    <hr class="separator" />

  <div class="user-info-section">
    <div class="profile-image-container">
      <label v-if="isEditing" class="edit-image-label" style="position: relative;">
        <input type="file" accept="image/*" @change="handleProfileImageUpload" hidden />
        <img :src="profileImage" class="profile-image" />
        <span class="edit-image-icon">
          <i class="fa-solid fa-pen"></i>
        </span>
      </label>
      <img
        v-else
        class="profile-image"
        :src="profileImage"
        alt="Profile Picture"
      />
              <div style="display: flex; gap: 8px;">
          <button class="edit-btn" @click="toggleEdit">
            <i v-if="!isEditing" class="fa-solid fa-pen"></i>
            <i v-else class="fa-solid fa-floppy-disk"></i>
            <span>{{ isEditing ? 'Save' : 'Edit Profile' }}</span>
          </button>
          <button
            v-if="isEditing"
            class="exit-edit-btn"
            @click="cancelEdit"
            aria-label="Cancel editing"
            style="background-color: #7b62b5; border: none; color: #fff; font-size: 1.3rem; cursor: pointer; border-radius: 6px;"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
    </div>

    <div class="info-box">
      <div class="info-header">
        <h2 class="user-name" v-if="!isEditing">{{ profile.name }}</h2>
        <div v-if="isEditing" class="labeled-input">
          <label>
            <span>Username:</span>
            <input
              type="text"
              v-model="editableProfile.name"
              class="edit-input"
              placeholder="Enter name"
            />
          </label>
        </div>

<!-- dito dati edit profile -->


      </div>

      <template v-if="!isEditing">
        <p class="user-meta">{{ profile.age }} years old, {{ profile.gender }}</p>
        <p class="user-bio">{{ profile.bio }}</p>
      </template>

      <template v-else>
        <div class="labeled-input">
          <label>
            <span>Gender:</span>
            <select v-model="editableProfile.gender" class="edit-input" @change="onGenderChange">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Others">Prefer not to say</option>
            </select>
            <input
              v-if="editableProfile.gender === 'Others'"
              type="text"
              v-model="customGender"
              class="edit-input"
              placeholder="Please specify"
              @input="updateCustomGender"
              style="margin-top: 8px;"
            />
          </label>
        </div>
        <div class="labeled-input">
          <label>
            <span>Bio:</span>
            <textarea
              v-model="editableProfile.bio"
              class="edit-textarea"
              placeholder="Bio"
              rows="3"
            ></textarea>
          </label>
        </div>
      </template>
    </div>
  </div>

  <hr class="separator" />

  <div class="mixtapes-header">
    <div class="mixtapes-title">
      <i class="fa-solid fa-compact-disc"></i>
      <span style="text-align: left;">My Mixtapes</span>
      <i class="fa-solid fa-plus add-icon" @click="togglePopup"></i>
    </div>

    <div class="profile-search-filter">
      <div class="search-input-wrapper">
        <i
          class="fa-solid fa-microphone search-icon"
          :style="{ color: recognizing ? 'red' : '', cursor: 'pointer', pointerEvents: 'auto' }"
          @click="startVoiceSearch"
          tabindex="0"
          aria-label="Start voice search"
        ></i>
        <input
          type="text"
          v-model="searchQuery"
          class="search-input"
          placeholder="Search in your library"
        />
      </div>
      <i class="fa-solid fa-list-ul filter-icon" @click="toggleSortDropdown"></i>
      <div v-if="showSortDropdown" class="mixtape-sort-dropdown">
        <select v-model="sortOption" @change="sortMixtapes">
          <option value="az">Alphabetical (A–Z)</option>
          <option value="za">Alphabetical (Z–A)</option>
          <option value="newest">Date Added (Newest First)</option>
          <option value="oldest">Date Added (Oldest First)</option>
        </select>
      </div>
    </div>

  </div>

  <div class="mixtapes-list" :class="{ list: isListView, grid: !isListView }">
  <div
  v-for="mixtape in filteredMixtapes"
  :key="mixtape.id"
  class="mixtape-item editable-mixtape"
>
  <div v-if="editingMixtapeId !== mixtape.id" class="mixtape-content-wrapper">
    <img v-if="mixtape.cover" :src="mixtape.cover" alt="Mixtape Cover" class="mixtape-cover" />
    <span v-else class="no-cover">No cover</span>
    <div class="mixtape-info">
      <h3 class="mixtape-name">{{ mixtape.name }}</h3>
      <p class="mixtape-desc">{{ mixtape.description }}</p>
    </div>
    <div class="mixtape-actions-top-right">
      <button 
        @click="startEditMixtape(mixtape)" 
        :disabled="mixtape.id === firstMixtapeId"
        v-if="mixtape.id !== firstMixtapeId"
      >Edit</button>
      <button 
        @click="deleteMixtape(mixtape)" 
        :disabled="mixtape.id === firstMixtapeId"
        v-if="mixtape.id !== firstMixtapeId"
      >Delete</button>
    </div>
  </div>
  <div v-else class="mixtape-edit-form">
    <input v-model="editableMixtape.name" placeholder="Mixtape Name" class="mixtape-desc"/>
    <textarea v-model="editableMixtape.description" placeholder="Description" class="mixtape-desc"></textarea>
    <div class="edit-songs-section">
      <h4>Songs</h4>
      <div v-for="(song, idx) in editableMixtape.songs" :key="idx" class="song-item song-item-flex">
        <img
          v-if="song.artwork_url"
          :src="song.artwork_url"
          alt="Artwork"
          style="width: 40px; height: 40px; border-radius: 6px; margin-right: 0.5rem;"
        />
        <div style="flex:1;">
          <span>{{ song.name }} - {{ song.artist }}</span>
        </div>
        <button
          v-if="song.preview_url"
          class="mini-audio-btn"
          @click="playPreview(song.preview_url, idx)"
          :aria-label="playingIndex === idx ? 'Pause preview' : 'Play preview'"
          style="margin-left: 0.5rem;"
        >
          <i :class="playingIndex === idx ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
        </button>
        <div class="song-actions-buttons">
          <i class="fa-solid fa-trash delete-icon" @click="removeSongFromEditable(idx)"></i>
        </div>
      </div>
      <!-- Add Song Button -->
      <button
        class="add-song-btn"
        @click="openEditSongModal"
        style="margin-top: 1rem;"
      >
        <i class="fa-solid fa-circle-plus"></i> Add Song
      </button>
    </div>
    <button @click="saveEditMixtape(editableMixtape)" style="background: rgb(106, 79, 207); color: #fff; border-radius: 6px;">Save</button>
    &nbsp;&nbsp;&nbsp;
    <button @click="cancelEditMixtape" style="background: rgb(106, 79, 207); color: #fff; border-radius: 6px;">Cancel</button>
  </div>
  <transition name="fade">
    <div v-if="expandedMixtapeId === mixtape.id" class="expanded-songs">
      <ol v-if="mixtape.songs && mixtape.songs.length" class="song-list">
        <li v-for="(song, index) in mixtape.songs" :key="index" class="expanded-song-row">
          <img v-if="song.artwork_url" :src="song.artwork_url" class="song-artwork" />
          <span class="song-title">{{ song.name }}</span>
          <span class="artist-name">by {{ song.artist }}</span>
          <audio v-if="song.preview_url" :src="song.preview_url" controls style="vertical-align:middle; margin-left:10px; height:28px;" />
        </li>
      </ol>
      <p v-else class="song-list">(No songs listed)</p>
    </div>
  </transition>
</div>
</div>

<!-- START OF CREATE MIXTAPE  -->
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
        <div v-for="(song, index) in songs" :key="index" class="song-item song-item-flex">
          <img v-if="song.artwork_url" :src="song.artwork_url" style="width: 40px; height: 40px; border-radius: 6px; margin-right: 0.5rem;" />
          <span>{{ song.name }} - {{ song.artist }}</span>
          <button
            v-if="song.preview_url"
            class="mini-audio-btn"
            @click.stop="playPreview(song.preview_url, idx)"
            :aria-label="playingIndex === idx ? 'Pause preview' : 'Play preview'"
            style="margin-left: auto;"
          >
            <i :class="playingIndex === idx ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
          </button>
          <div class="song-actions-buttons">
            <i class="fa-solid fa-trash delete-icon" @click="deleteSong(index)"></i>
          </div>
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
<!-- END OF MAIN MIXTAPE CREATE MODAL -->


<!-- START OF SONG SELECT -->
  <div v-if="showSongModal" class="modal-overlay">
    <div class="song-popup-box">
      <span class="exit-btn" @click="closeSongModal">×</span>
      <h3>Song Search</h3>
      <input
        type="text"
        v-model="songSearchQuery"
        placeholder="Search song or artist"
        @input="searchSongs"
        autocomplete="off"
      />
      <div v-if="isSearchingSongs" style="margin: 0.5rem 0;">Searching...</div>
      <ul v-if="songSearchResults.length" 
      style="margin-top: 1rem;
            max-height: 150px;
            overflow-y: auto;
            background: #1f0d3e;
            padding: 0.5rem;
            border-radius: 0.5rem;
            color: #dbb4d7;">
        <li
          v-for="(song, idx) in songSearchResults"
          :key="idx"
          @click="selectSongFromSearch(song)"
          style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border-bottom: 1px solid #eee;"
        >
          <img :src="song.artwork_url" style="width: 40px; height: 40px; border-radius: 6px; margin-right: 0.5rem;" />
          <div>
            <div style="font-weight: bold;">{{ song.name }}</div>
            <div style="font-size: 0.9em; color: #555;">{{ song.artist }}</div>
          </div>
          <audio v-if="song.preview_url" :src="song.preview_url" controls style="margin-left: auto; width: 80px; height: 28px;" />
        </li>
      </ul>
      <div v-if="!isSearchingSongs && !songSearchResults.length && songSearchQuery" style="color: #888; margin: 0.5rem 0;">No results found.</div>
      <button v-if="!songSearchQuery" @click="showSongModal = false">Cancel</button>
    </div>
  </div>

<!-- END OF SONG SELECT -->


<!-- START OF CONFIRM CANCEL -->
  <div v-if="showConfirmCancel" class="modal-overlay">
    <div class="confirm-box">
      <p>Are you sure you want to close it?</p>
      <div class="confirm-buttons">
        <button @click="showConfirmCancel = false">Stay</button>
        <button @click="closePopup">Close</button>
      </div>
    </div>
  </div>

  <!-- END OF CONFIRM CANCEL -->

  <div v-if="selectedMixtape" class="modal-overlay" @click="closeMixtapePopup"></div>
  <div v-if="selectedMixtape" class="mixtape-popup">
    <button class="exit-button" @click="closeMixtapePopup">✕</button>
    <div class="back-mixtape">
      <img v-if="selectedMixtape && selectedMixtape.cover" :src="selectedMixtape.cover" alt="Mixtape Image" class="mixtape-image" />
      <span v-else class="no-cover">No cover</span>
      <h3 class="mixtape-title-back">{{ selectedMixtape.name }}</h3>
      <ol v-if="selectedMixtape.songs && selectedMixtape.songs.length" class="song-list">
        <li v-for="(song, index) in selectedMixtape.songs" :key="index">
          <span class="song-title">{{ song.name }}</span> by <span class="artist-name">{{ song.artist }}</span>
          <audio v-if="song.url" :src="song.url" controls style="vertical-align:middle; margin-left:10px; height:28px;" />
        </li>
      </ol>
      <p v-else class="song-list">(No songs listed)</p>
    </div>
  </div>
</div>
  </NavLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import NavLayout from '../layouts/NavLayout.vue'
import { onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

const DEFAULT_PROFILE_IMAGE = '/src/assets/default-profile.jpg';

const profile = ref({
  name: '',
  age: '',
  gender: '',
  bio: '',
  profile_image: '',
});
const editableProfile = ref({
  name: '',
  gender: '',
  bio: '',
  profile_image: '',
});
const profileImage = ref(DEFAULT_PROFILE_IMAGE);
const isEditing = ref(false);

const customGender = ref('');

const token = localStorage.getItem('token');

onMounted(() => {
  fetchProfile();
  fetchMixtapes();
});

async function fetchProfile() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = response.data.profile;
    const img = data.profile_image || DEFAULT_PROFILE_IMAGE;
    profile.value = {
      name: data.name || '',
      age: data.age || '',
      gender: data.gender || '',
      bio: data.bio || '',
      profile_image: img,
    };
    editableProfile.value = {
      name: data.name || '',
      gender: data.gender || '',
      bio: data.bio || '',
      profile_image: img,
    };
    profileImage.value = img;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    profileImage.value = DEFAULT_PROFILE_IMAGE;
  }
}

async function fetchMixtapes() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/mixtapes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    mixtapes.value = response.data.map(mix => ({
      ...mix,
      cover: mix.cover
        ? (mix.cover.startsWith('http') ? mix.cover : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/${mix.cover.replace(/^\/?/, '')}`)
        : '',
      songs: mix.songs || [],
    }));
  } catch (error) {
    console.error('Failed to fetch mixtapes:', error);
    mixtapes.value = [];
  }
}

function toggleEdit() {
  if (isEditing.value) {
    saveProfile();
  } else {
    editableProfile.value = {
      name: profile.value.name,
      gender: profile.value.gender,
      bio: profile.value.bio,
      profile_image: profile.value.profile_image,
    };
    isEditing.value = true;
  }
}

async function saveProfile() {
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, {
      name: editableProfile.value.name,
      gender: editableProfile.value.gender,
      bio: editableProfile.value.bio,
      profile_image: profileImage.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    profile.value = { ...editableProfile.value, age: profile.value.age };
    isEditing.value = false;
    alert('Profile updated!');
  } catch (error) {
    alert('Failed to update profile.');
    console.error(error);
  }
}

// Handle profile image upload
async function handleProfileImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('photo', file);

  try {
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
    // Use full URL for preview
    profileImage.value = `${import.meta.env.VITE_API_URL}/${response.data.imageUrl}` || DEFAULT_PROFILE_IMAGE;
    editableProfile.value.profile_image = profileImage.value;
  } catch (err) {
    alert('Failed to upload image.');
  }
}

function onGenderChange() {
  if (editableProfile.value.gender !== 'Others') {
    customGender.value = '';
  }
}

function updateCustomGender() {
  editableProfile.value.gender = customGender.value;
}

// When entering edit mode, if gender is not one of the dropdown options, set to "Others" and fill customGender
watch(isEditing, (val) => {
  if (val) {
    const g = editableProfile.value.gender;
    if (g && !['Male', 'Female', 'Non-Binary', 'Others'].includes(g)) {
      customGender.value = g;
      editableProfile.value.gender = 'Others';
    } else {
      customGender.value = '';
    }
  }
});

const searchQuery = ref('')
const isListView = ref(true)

const showPopup = ref(false)
const showSongModal = ref(false)
const showEditSongModal = ref(false) 
const showConfirmCancel = ref(false)
const selectedMixtape = ref(null)

const mixtapes = ref([]); // Remove the hardcoded array, keep as empty array

const editingMixtapeId = ref(null);
const editableMixtape = ref({
  id: null,
  name: '',
  description: '',
  cover: null,
  songs: [],
});

//creating new mixtape
const mixtapeName = ref('')
const mixtapeDescription = ref('')
const songs = ref([])

// song ( both create and edit)
const songName = ref('')
const artistName = ref('')

// song edit index (for edit mixtape songs)
const editingSongIndex = ref(null)

const photoUrl = ref(null)

const photoInput = ref(null)
const editCoverInput = ref(null)

const sortOption = ref('az');

const filteredMixtapes = computed(() => {
  if (!mixtapes.value) return [];
  let arr = [...mixtapes.value];

  // Filter by search query (mixtape name or any song name/artist)
  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    arr = arr.filter(mix => {
      // Check mixtape name
      if (mix.name && mix.name.toLowerCase().includes(query)) return true;
      // Check any song name or artist
      if (Array.isArray(mix.songs)) {
        return mix.songs.some(song =>
          (song.name && song.name.toLowerCase().includes(query)) ||
          (song.artist && song.artist.toLowerCase().includes(query))
        );
      }
      return false;
    });
  }

  // Sorting
  switch (sortOption.value) {
    case 'az':
      arr.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'za':
      arr.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'newest':
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'oldest':
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
  }
  return arr;
});

function sortMixtapes() {
  // This triggers the computed property to update
}

const togglePopup = () => {
  showPopup.value = !showPopup.value
}

const toggleSortAndMaybeView = () => {
  isListView.value = !isListView.value
}

const triggerPhotoUpload = () => {
  photoInput.value.click()
}

const handlePhotoUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    photoUrl.value = URL.createObjectURL(file)
  }
}

const createMixtape = async () => {
  if (!mixtapeName.value.trim()) {
    alert('Please enter a mixtape name');
    return;
  }
  if (songs.value.length < 1) {
    alert('Please add at least one song');
    return;
  }
  try {
    const token = localStorage.getItem('token');
    const coverPath = await uploadCoverIfNeeded();

    // Map songs to ensure correct keys
    const formattedSongs = songs.value.map(song => ({
      name: song.name,
      artist: song.artist,
      preview_url: song.preview_url || song.url || '',
      artwork_url: song.artwork_url || '',
    }));

    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/mixtapes`,
      {
        name: mixtapeName.value,
        description: mixtapeDescription.value,
        cover: coverPath, // Use backend path
        songs: formattedSongs,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    await fetchMixtapes(); // Refresh mixtape list
    resetCreateForm();
    showPopup.value = false;
  } catch (error) {
    alert('Failed to create mixtape.');
    console.error(error);
  }
};

const resetCreateForm = () => {
  mixtapeName.value = ''
  mixtapeDescription.value = ''
  songs.value = []
  photoUrl.value = null
}

const closePopup = () => {
  showConfirmCancel.value = false
  showPopup.value = false
  resetCreateForm()
}

const closeSongModal = () => {
  showSongModal.value = false
  songName.value = ''
  artistName.value = ''
  songUrl.value = ''
  editingSongIndex.value = null
}

const closeEditSongModal = () => {
  showEditSongModal.value = false
  songName.value = ''
  artistName.value = ''
  songUrl.value = ''
  editingSongIndex.value = null
}

const addSong = () => {
  if (!songName.value.trim() || !artistName.value.trim()) {
    alert('Please enter both song name and artist')
    return
  }

  const newSong = {
    name: songName.value.trim(),
    artist: artistName.value.trim(),
    preview_url: songUrl.value.trim() || '', // <-- use preview_url
    artwork_url: '', // <-- allow user to set or leave blank
  }

  if (editingMixtapeId.value !== null) {
    if (editingSongIndex.value !== null) {
      editableMixtape.value.songs[editingSongIndex.value] = newSong
    } else {
      editableMixtape.value.songs.push(newSong)
    }
    editingSongIndex.value = null
    closeEditSongModal()
  } else {
    if (editingSongIndex.value !== null) {
      songs.value[editingSongIndex.value] = newSong
    } else {
      songs.value.push(newSong)
    }
    editingSongIndex.value = null
    closeSongModal()
  }

  songName.value = ''
  artistName.value = ''
  songUrl.value = ''
}

const deleteSong = (index) => {
  songs.value.splice(index, 1)
}

const removeSongFromEditable = (index) => {
  editableMixtape.value.songs.splice(index, 1)
}

const editSong = (index) => {
  const song = songs.value[index]
  songName.value = song.name
  artistName.value = song.artist
  editingSongIndex.value = index
  showSongModal.value = true
}

const editEditableSong = (index) => {
  editingSongIndex.value = index;
  const song = editableMixtape.value.songs[index];
  songName.value = song.name;
  artistName.value = song.artist;
  showEditSongModal.value = true;
}

const saveEditedSong = () => {
  if (!songName.value.trim() || !artistName.value.trim()) {
    alert('Please enter both song name and artist');
    return;
  }

  const updatedSong = {
    name: songName.value.trim(),
    artist: artistName.value.trim(),
    url: songUrl.value.trim() || '#',
  };

  if (editingSongIndex.value !== null) {
    editableMixtape.value.songs[editingSongIndex.value] = updatedSong;
  }

  closeEditSongModal();
}

function startEditMixtape(mixtape) {
  if (mixtape.id === firstMixtapeId.value) return;
  editingMixtapeId.value = mixtape.id;
  editableMixtape.value = JSON.parse(JSON.stringify(mixtape));
}

async function saveEditMixtape(mixtape) {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/mixtapes/${mixtape.id}`,
      {
        name: editableMixtape.value.name,
        description: editableMixtape.value.description,
        photoUrl: editableMixtape.value.cover,
        songs: editableMixtape.value.songs,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    await fetchMixtapes();
    editingMixtapeId.value = null;
  } catch (error) {
    alert('Failed to update mixtape.');
  }
}

function cancelEditMixtape() {
  editingMixtapeId.value = null;
  editableMixtape.value = {
    id: null,
    name: '',
    description: '',
    cover: null,
    songs: [],
  };
}

const confirmDeleteMixtape = (mixtape) => {
  if (confirm(`Are you sure you want to delete "${mixtape.name}"?`)) {
    mixtapes.value = mixtapes.value.filter((m) => m.id !== mixtape.id)
  }
}

const triggerEditCoverUpload = () => {
  editCoverInput.value.click()
}

const handleEditCoverUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    editableMixtape.value.cover = URL.createObjectURL(file)
  }
}

const closeMixtapePopup = () => {
  selectedMixtape.value = null
}

const expandedMixtapeId = ref(null);

function toggleExpandMixtape(mixtape) {
  expandedMixtapeId.value = expandedMixtapeId.value === mixtape.id ? null : mixtape.id;
}

function cancelEdit() {
  // Reset editableProfile to original profile values
  editableProfile.value = {
    name: profile.value.name,
    gender: profile.value.gender,
    bio: profile.value.bio,
    profile_image: profile.value.profile_image,
  };
  isEditing.value = false;
  customGender.value = '';
}

const showSortDropdown = ref(false);

function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value;
}

function handleClickOutside(event) {
  const dropdown = document.querySelector('.mixtape-sort-dropdown');
  const icon = document.querySelector('.filter-icon');
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

const editMixtapeName = ref('');
const editMixtapeDescription = ref('');
const songSearchQuery = ref('');
const songSearchResults = ref([]);
const isSearchingSongs = ref(false);

async function deleteMixtape(mixtape) {
  if (mixtape.id === firstMixtapeId.value) return;
  if (!confirm('Are you sure you want to delete this mixtape?')) return;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/mixtapes/${mixtape.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    await fetchMixtapes();
  } catch (error) {
    alert('Failed to delete mixtape.');
  }
}

async function searchSongs() {
  if (!songSearchQuery.value.trim()) {
    songSearchResults.value = [];
    return;
  }
  isSearchingSongs.value = true;
  try {
    const response = await axios.get(
      `https://itunes.apple.com/search`,
      {
        params: {
          term: songSearchQuery.value,
          media: 'music',
          limit: 10,
        },
      }
    );
    songSearchResults.value = response.data.results.map(item => ({
      name: item.trackName,
      artist: item.artistName,
      artwork_url: item.artworkUrl100,
      preview_url: item.previewUrl,
    }));
  } catch (e) {
    songSearchResults.value = [];
  }
  isSearchingSongs.value = false;
}

function selectSongFromSearch(song) {
  songs.value.push(song);
  songSearchQuery.value = '';
  songSearchResults.value = [];
  showSongModal.value = false;
}

function addSongToEditableMixtape(song) {
  if (editingSongIndex.value === null) {
    editableMixtape.value.songs.push(song);
  } else {
    editableMixtape.value.songs[editingSongIndex.value] = song;
  }
  showEditSongModal.value = false;
  editingSongIndex.value = null;
}

const firstMixtapeId = computed(() => {
  if (!mixtapes.value.length) return null;
  return Math.min(...mixtapes.value.map(m => m.id));
});

async function uploadCoverIfNeeded() {
  if (!photoUrl.value || photoUrl.value.startsWith('http')) {
    // Already a real URL or not set
    return photoUrl.value;
  }
  // If it's a blob URL, upload the file
  const fileInput = photoInput.value;
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const formData = new FormData();
    formData.append('photo', fileInput.files[0]);
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
    // Return the backend path (not full URL)
    return response.data.imageUrl;
  }
  return '';
}

// Speech recognition setup
const recognizing = ref(false);
let recognition = null;

if ('webkitSpeechRecognition' in window) {
  recognition = new window.webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    recognizing.value = true;
  };
  recognition.onend = () => {
    recognizing.value = false;
  };
  recognition.onresult = (event) => {
    if (event.results.length > 0) {
      searchQuery.value = event.results[0][0].transcript;
    }
    recognizing.value = false;
  };
}

function startVoiceSearch() {
  if (recognition) {
    recognition.start();
  } else {
    alert('Voice recognition not supported in this browser.');
  }
}

const playingIndex = ref(null);
const audioRef = ref(null);

function playPreview(url, idx) {
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.currentTime = 0;
  }
  if (playingIndex.value === idx) {
    playingIndex.value = null;
    return;
  }
  audioRef.value = new Audio(url);
  playingIndex.value = idx;
  audioRef.value.play();
  audioRef.value.onended = () => {
    playingIndex.value = null;
  };
}
</script>


<style scoped>
.mixtape-name-inp{
  padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 0.95rem;
}
.mixtape-desc{
  padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 0.95rem;
}
.profile-wrapper {
  padding: 2rem;
  background-color: #dbb4d7;
  min-height: 100vh;
  overflow: auto;
  color: black;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  margin-top: 80px;
  /* margin-left: 270px; */
}

.page-title {
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: 8px;
  text-align: left;
  margin-left: 30px;
}

.separator {
  border: 1px solid #9877a0;
  margin: 10px 0 20px;
}

.user-info-section {
  display: flex;
  gap: 15px;
  align-items: center;
}

.profile-image {
  width: 170px;
  height: 170px;
  border-radius: 12px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #4a2c6f;
}

.profile-image.editable {
  outline: 2px dashed #c69df4;
  opacity: 0.9;
}

.info-box {
  flex: 1;
  background-color: #080d2a;
  border-radius: 12px;
  padding: 20px;
  color: white;
  position: relative;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-name {
  font-weight: 700;
  font-size: 1.8rem;
  margin: 0;
}

.edit-btn {
  background-color: #5e4a87;
  border: none;
  border-radius: 6px;
  color: #ddd;
  font-family: monospace;
  font-weight: 600;
  padding: 6px 10px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  width: 100%;
}

.edit-btn i {
  margin-right: 10px;
}

.edit-btn:hover {
  background-color: #7b62b5;
}

.user-meta {
  margin-bottom: 12px;
  font-size: 1rem;
  text-align: left;
  margin-left: 1rem;
}

.user-bio {
  white-space: pre-wrap;
  font-size: 1rem;
  text-align: left;
  margin-left: 1rem;
}

/* Editing inputs */
.edit-input,
.edit-textarea {
  width: 100%;
  background: #5e4a87;
  border: none;
  border-radius: 6px;
  color: #eee;
  font-family: monospace;
  font-size: 1rem;
  padding: 6px 8px;
  margin: 6px 0;
  resize: none;
}

.save-btn {
  margin-top: 10px;
  background-color: #8259b0;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #9b79d2;
}

.mixtapes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.mixtapes-title {
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 700;
  font-size: 1.3rem;
}

.mixtapes-title .icon {
  font-size: 1.4rem;
}

.add-btn {
  background: none;
  border: none;
  padding: 0;
  color: #080d2a;
  font-size: 2rem;
  cursor: pointer;
}

.add-btn:hover {
  color: #7b62b5;
}

.profile-search-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 1rem;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 40px; 
  border: 1px solid #ccc;
  border-radius: 50px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: white;
  pointer-events: none;
}

.filter-icon {
  font-size: 1.5rem;
  cursor: pointer;
}

.mixtape-content-wrapper {
  display: flex;
  align-items: flex-start; 
  gap: 12px;
}

.mixtapes-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-bottom: 40px;
}

.mixtapes-list.list {
  flex-direction: column;
}

.mixtape-item {
  background-color: #080d2a;
  border-radius: 12px;
  color: #ddd;
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  width: 100%;
  max-width: 50rem;
  transition: background-color 0.3s ease;
  position: relative;
}

.mixtape-actions-top-right {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.mixtape-actions-top-right button {
  background-color: #6a5acd;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.15);
}

.mixtape-actions-top-right button:hover {
  background-color: #483d8b; 
}

.mixtape-actions-top-right button:active {
  background-color: #2f2b60; 
}

.editable-mixtape {
  position: relative;
}

.mixtape-cover {
  border-radius: 12px;
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.mixtape-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mixtape-name, .mixtape-desc {
  padding: 0.75rem;
  border: none;
  width: 100%;
  color: white;
  background: transparent;
  text-align: center;
}

.mixtape-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.mixtape-desc {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results {
  font-style: italic;
  color: #6b587b;
  margin-top: 20px;
  width: 100%;
  text-align: center;
}

/* mixtape edit mode */
.edit-mixtape-container {
  background-color: #6a4fcf;
  border-radius: 1.5rem;
  padding: 14px 16px;
  width: 100%;
  max-width: 50rem;
  margin: 3rem auto;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edit-form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.labeled-input {
  text-align: left;
}

.edit-form-section label {
  font-weight: 500;
}

.edit-form-section input[type="text"],
.edit-form-section textarea {
  width: 100%;
  background-color: #2a2a2a;
  border: none;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 1rem;
  resize: none;
}

.edit-form-section input[type="file"] {
  background-color: transparent;
  color: white;
}

.mixtape-cover-preview {
  width: 100%;
  max-width: 200px;
  margin-top: 0.5rem;
  border-radius: 1rem;
  object-fit: cover;
}

.song-list-scroll {
  max-height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.song-item-flex {
  display: flex;
  justify-content: space-between; 
  align-items: center; 
  padding: 8px 2px;
}

.song-item-flex input {
  background-color: #3a3a3a;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
}

button {
  background-color: #6a4fcf;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #8b6eff;
}

.add-song-btn {
  align-self: flex-start;
}

.popup-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* mixtape creation (same sa Sidebar) */
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
  width: 750px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 90vh;
  overflow-y: auto;
  padding-right: 1rem;
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

/* song list popup */
.mixtape-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1200;
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
  object-fit: cover;
  border-radius: 8px;
}

.mixtape-title-back {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.song-list {
  margin-top: 1rem;
  overflow-y: auto;
  max-height: 180px;
  flex-grow: 1;
  text-align: left;
  padding-left: 2.5rem;
}

.song-list li {
  margin-bottom: 0.5rem;
}

.song-number {
  font-weight: bold;
  margin-right: 0.5rem;
}

.song-title {
  font-weight: bold;
}

.mixtape-popup .exit-button {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
}

.popup-box .song-list-scroll {
  max-height: 150px;
  overflow-y: auto;
  background-color: #2e1f45;
  padding: 0.5rem;
  border-radius: 5px;
  margin-bottom: 1rem;
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

.song-actions-buttons i {
  margin-left: 0.5rem;
  cursor: pointer;
  color: #c2b4d6;
}

.song-actions-buttons i:hover {
  color: #ffffff;
}

.edit-image-label {
  cursor: pointer;
  display: inline-block;
  position: relative;
}

.edit-image-icon {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: #6a4fcf;
  color: #fff;
  border-radius: 50%;
  padding: 7px;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.18);
  pointer-events: none;
  z-index: 2;
  width: 40px;
  height: 40px;
}

.expanded-songs {
  width: 100%;
  background: #2e1f45;
  border-radius: 0 0 12px 12px;
  margin-top: 0.5rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.expanded-song-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.7rem;
}

.song-artwork {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 8px;
  background: #fff;
  border: 1px solid #dbb4d7;
}

.song-title {
  font-weight: 600;
  margin-right: 8px;
}

.artist-name {
  color: #dbb4d7;
  font-size: 0.97em;
  margin-right: 8px;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.25s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.edit-songs-section {
  margin: 1rem 0;
  background: #2e1f45;
  border-radius: 8px;
  padding: 1rem;
}
.edit-song-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.edit-song-input {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
}
  .add-icon { 
    background-color:#1f0d3e;
    color:  #dbb4d7;
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
.mixtape-sort-dropdown select{
    padding: 0.3rem 0.7rem;
    border-radius: 6px;
    border: 1px solid #dbb4d7;
    background: #2e1f45;
    color: #fff;
    font-size: 11pt;
    width: 100%;
}
</style>