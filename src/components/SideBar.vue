<template>
<!-- MIXTAPE OVERLAY VIEW -->
          <div v-if="selectedMixtape" class="mixtape-detail-overlay">
          <div class="mixtape-detail-box">
            <span class="close-detail" @click="selectedMixtape = null"
              >&times;</span
            >
            <img
              :src="getFullPhotoUrl(selectedMixtape.cover)"
              class="detail-img"
            />
            <h2>{{ selectedMixtape.name }}</h2>
            <p>{{ selectedMixtape.description }}</p>
            <p>{{ selectedMixtape.bio }}</p>
            <ul class="song-detail-list">
              <li
                v-for="(song, i) in selectedMixtape.songs"
                :key="i"
                style="display: flex; align-items: center; gap: 10px"
              >
                <img
                  :src="song.artwork_url || '/src/assets/noimage.jpg'"
                  alt="Artwork"
                  style="width: 40px; height: 40px; border-radius: 4px"
                />
                <span style="flex: 1">{{ song.name }} - {{ song.artist }}</span>
                <button
                  v-if="song.preview_url"
                  class="mini-audio-btn"
                  @click="toggleSongPlay(i)"
                  :aria-label="
                    playingSongIndex === i ? 'Pause preview' : 'Play preview'
                  "
                  style="margin-left: 8px"
                >
                  <i
                    :class="
                      playingSongIndex === i
                        ? 'fa-solid fa-pause'
                        : 'fa-solid fa-play'
                    "
                  ></i>
                </button>
                <audio
                  v-if="song.preview_url"
                  ref="songAudioRefs"
                  :src="song.preview_url"
                  @ended="onSongAudioEnded"
                  style="display: none"
                ></audio>
              </li>
            </ul>
          </div>
        </div>
<!-- END OF MIXTAPE OVERLAY VIEW -->
       <!--START OF POPUP FOR CREATE MIXTAPE-->
      <div v-if="showPopup" class="popup-overlay">
        <div class="popup-box">
          <h2 v-if="createAction">Your Mixtape</h2>
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

          <input
            type="text"
            placeholder="Mixtape Name"
            class="mixtape-name"
            v-model="mixtapeName"
          />
          <textarea
            v-model="mixtapeDescription"
            placeholder="Say something about your mixtape"
            class="description-box"
          ></textarea>

          <div class="song-list-scroll">
            <div
              v-for="(song, index) in songs"
              :key="index"
              class="song-item song-item-flex"
            >
              <div class="song-details-flex">
                <img
                  v-if="song.artwork_url"
                  :src="song.artwork_url"
                  alt="Artwork"
                  class="search-artwork"
                />
                <div class="song-text">
                  <div>{{ song.name }} - {{ song.artist }}</div>
                </div>
                <button
                  v-if="song.preview_url"
                  class="mini-audio-btn"
                  @click="togglePlay(index)"
                  :aria-label="
                    playingIndex === index ? 'Pause preview' : 'Play preview'
                  "
                >
                  <i
                    :class="
                      playingIndex === index
                        ? 'fa-solid fa-pause'
                        : 'fa-solid fa-play'
                    "
                  ></i>
                </button>
                <audio
                  v-if="song.preview_url"
                  ref="audioRefs"
                  :src="song.preview_url"
                  @ended="onAudioEnded"
                  style="display: none"
                ></audio>
              </div>
              <div class="song-actions-buttons">
                <i
                  class="fa-solid fa-trash delete-icon"
                  @click="deleteSong(index)"
                ></i>
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
            <button @click="createMixtape">Save Mixtape</button>
            <button @click="showConfirmCancel = true">Cancel</button>
          </div>
        </div>
      </div>

      <div v-if="showSongModal" class="modal-overlay">
        <div class="song-popup-box">
          <span class="exit-btn" @click="closeSongModal">×</span>
          <h3>Song Search</h3>
          <input
            type="text"
            v-model="songName"
            placeholder="Song Name"
            @input="searchSongs"
          />
          <input
            type="text"
            v-model="artistName"
            placeholder="Artist Name"
            @input="searchSongs"
          />
          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="(result, index) in searchResults"
              :key="index"
              class="search-item"
            >
              <img
                v-if="result.artworkUrl100"
                :src="result.artworkUrl100"
                alt="Artwork"
                class="search-artwork"
              />
              <div class="search-details" @click="addSongFromResult(result)">
                <strong>{{ result.trackName }}</strong> -
                {{ result.artistName }}
              </div>
              <button
                v-if="result.previewUrl"
                class="mini-audio-btn"
                @click.stop="toggleSearchPlay(index)"
                :aria-label="
                  searchPlayingIndex === index
                    ? 'Pause preview'
                    : 'Play preview'
                "
              >
                <i
                  :class="
                    searchPlayingIndex === index
                      ? 'fa-solid fa-pause'
                      : 'fa-solid fa-play'
                  "
                ></i>
              </button>
              <div v-else class="no-preview">No preview</div>
              <audio
                v-if="result.previewUrl"
                ref="searchAudioRefs"
                :src="result.previewUrl"
                @ended="onSearchAudioEnded"
                style="display: none"
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
      
  <div class="side-nav-hidden" v-if="!show">
    <div class="nav-section sidebar_burger" @click="show = !show" style="color:white;">
      <i class="fa-solid fa-bars fa-2x"></i>
    </div>
  </div>
  <div class="side-nav" v-if="show">
    <div class="nav-section sidebar_burger" @click="show = !show"  style="color:#322848">
      <i class="fa-solid fa-bars fa-2x"></i>
    </div>
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
        <i
          class="fa-solid fa-plus add-icon"
          @click="
            togglePopup();
            createAction = !createAction;
          "
           @click.stop="toggleMixtapeMenu(null)"
           
        ></i>
      </div>



      <hr class="separator" />

      <div class="mixtape-search">
        <div class="input-wrapper input-with-mic">
          <i
            :class="[
              'fa-solid',
              'fa-microphone',
              micActive ? 'mic-recording' : 'mic-icon',
            ]"
            class="mic-left-inside"
            @click="toggleMicRecording"
          ></i>
          <input
            type="text"
            v-model="searchText"
            class="mixtape-input"
            placeholder="Search Your Mixtapes"
          />
          <i
            class="fa-solid fa-list-ul sort-icon"
            @click="toggleSortDropdown"
          ></i>
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
<!-- Was mixtape overlay -->

        <div
          class="mixtape-item"
          v-for="(mix, index) in filteredMixtapes"
          :key="mix.id || index"
          @click="selectedMixtape = mix"
          @click.stop="toggleMixtapeMenu(null)"
          style="position: relative"
        >
          <img
            :src="getFullPhotoUrl(mix.cover)"
            alt="Mixtape Image"
            class="mixtape-img"
          />
          <span>{{ mix.name.slice(0, 8) }}{{ mix.name.length > 8 ? '.' : '' }}</span>
          <!-- Three-dot menu -->
          <div
            
            class="mixtape-menu-wrapper"
            @click.stop
          >
            <i
              class="fa-solid fa-ellipsis-vertical mixtape-menu-icon"
              @click.stop="toggleMixtapeMenu(index)"
            ></i>
            <div v-if="openMenuIndex === index" class="mixtape-menu-dropdown">
              <div @click="editMixtape(index)">Edit</div>
              <div @click="deleteMixtape(index)" v-if="mix.id !== firstMixtapeId">Delete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
//FOR SIDEBAR
export default {
  data() {
    return { show: true };
    return { createAction: false };
    return { updateAction: false };
  },
};
</script>

<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import axios from "axios";

const showPopup = ref(false);
const showSongModal = ref(false);
const showConfirmCancel = ref(false);

const navItems = [
  { icon: "fa-solid fa-user-plus", text: "Discover", route: "/discover" },
  { icon: "fa-solid fa-pen", text: "Feed", route: "/feed" },
  { icon: "fa-solid fa-heart", text: "Favorites", route: "/favorites" },
];

const mixtapes = ref([]); // get mixtapes from backend
const isSortedByName = ref(true);
const mixtapeName = ref("");
const mixtapeDescription = ref("");
const songName = ref("");
const artistName = ref("");
const songs = ref([]);
const photoUrl = ref(null); // for preview (can be blob or backend url)
const photoPath = ref(null); // always the backend relative path
const photoInput = ref(null);
const selectedMixtape = ref(null);
const artworkUrl = ref(null); // for song artwork, can be full URL or backend relative path

const searchResults = ref([]);
const isEditing = ref(false);
const editingIndex = ref(null);

const playingIndex = ref(null);
const audioRefs = ref([]);
const searchAudioRefs = ref([]);
const searchPlayingIndex = ref(null);

const songAudioRefs = ref([]);
const playingSongIndex = ref(null);

const token = localStorage.getItem("token");

const togglePopup = () => {
  showPopup.value = true;
};

const closePopup = () => {
  showPopup.value = false;
  showConfirmCancel.value = false;
  mixtapeName.value = "";
  mixtapeDescription.value = "";
  songs.value = [];
  photoUrl.value = null;
  photoPath.value = null;
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
    formData.append("photo", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Save backend path for DB
      photoPath.value = response.data.imageUrl;
      // Show full URL for preview (from backend, not blob)
      photoUrl.value = getFullPhotoUrl(response.data.imageUrl);
    } catch (err) {
      alert("Failed to upload image.");
      photoUrl.value = "/src/assets/noimage.jpg";
      photoPath.value = null;
    }
  }
}

const createMixtape = async () => {
  if (mixtapeName.value.trim() === "") {
    alert("Please enter a mixtape name.");
    return;
  }
  if (songs.value.length < 1) {
    alert("Please add at least 1 song to create a mixtape.");
    return;
  }

  // Ensure all songs have artwork_url and preview_url
  const songsForDb = songs.value.map((song) => ({
    name: song.name,
    artist: song.artist,
    preview_url: song.preview_url || null,
    artwork_url: song.artwork_url || null,
  }));

  try {
    const token = localStorage.getItem("token");
    if (editingMixtapeId.value) {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/mixtapes/${editingMixtapeId.value}`,
        {
          name: mixtapeName.value,
          description: mixtapeDescription.value,
          photoUrl: photoPath.value, // always backend path
          songs: songsForDb,
          artwork_url: artworkUrl.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Always update preview with backend path after save
      if (response.data.photoUrl) {
        photoPath.value = response.data.photoUrl;
        photoUrl.value = getFullPhotoUrl(response.data.photoUrl);
      } else if (photoPath.value) {
        photoUrl.value = getFullPhotoUrl(photoPath.value);
      }
      await fetchUserMixtapes();
      closePopup();
      editingMixtapeId.value = null;
      return;
    } else {
      // For new mixtapes, allow default image
      const payload = {
        name: mixtapeName.value,
        description: mixtapeDescription.value,
        photoUrl: photoPath.value,
        songs: songsForDb,
        artwork_url: artworkUrl.value,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/create-mixtape`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }
    await fetchUserMixtapes();
    closePopup();
    editingMixtapeId.value = null;
  } catch (error) {
    alert("Failed to save mixtape.");
  }
};

const onSearchAudioEnded = () => {
  searchPlayingIndex.value = null;
};

const toggleSearchPlay = (index) => {
  if (
    searchPlayingIndex.value !== null &&
    searchAudioRefs.value[searchPlayingIndex.value]
  ) {
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
  songName.value = "";
  artistName.value = "";
  searchResults.value = [];
};

const closeSongModal = () => {
  showSongModal.value = false;
  isEditing.value = false;
  editingIndex.value = null;
  songName.value = "";
  artistName.value = "";
  searchResults.value = [];
};

const addSongFromResult = (result) => {
  const newSong = {
    name: result.trackName,
    artist: result.artistName,
    preview_url: result.previewUrl || null,
    artwork_url: result.artworkUrl100 || null, // This is a full URL from iTunes
  };
  if (isEditing.value && editingIndex.value !== null) {
    songs.value[editingIndex.value] = newSong;
    isEditing.value = false;
    editingIndex.value = null;
  } else {
    songs.value.push(newSong);
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
    const response = await axios.get("https://itunes.apple.com/search", {
      params: {
        term: query,
        entity: "musicTrack",
        limit: 5,
      },
    });
    searchResults.value = response.data.results || [];
  } catch (err) {
    searchResults.value = [];
  }
};

const editMixtape = (index) => {
  const mix = mixtapes.value[index];
  mixtapeName.value = mix.name;
  mixtapeDescription.value = mix.description || mix.bio || "";
  songs.value = (mix.songs || []).map((song) => ({
    name: song.name,
    artist: song.artist,
    preview_url: song.preview_url || song.url || null,
    artwork_url: song.artwork_url || null,
  }));
  // Set both the display URL and the database path
  if (mix.cover) {
    photoUrl.value = getFullPhotoUrl(mix.cover);
    photoPath.value = mix.cover;
  } else {
    photoUrl.value = "/src/assets/noimage.jpg";
    photoPath.value = null;
  }
  editingMixtapeId.value = mix.id;
  showPopup.value = true;
  openMenuIndex.value = null;
}

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
  if (
    playingSongIndex.value !== null &&
    songAudioRefs.value[playingSongIndex.value]
  ) {
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
watch(
  () => selectedMixtape.value,
  () => {
    songAudioRefs.value = [];
    playingSongIndex.value = null;
  }
);

watch(songs, () => {
  audioRefs.value = [];
});
watch(searchResults, () => {
  searchAudioRefs.value = [];
});

const sortOption = ref("az");

function sortMixtapes() {
  if (!mixtapes.value || mixtapes.value.length === 0) return;
  switch (sortOption.value) {
    case "az":
      mixtapes.value.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "za":
      mixtapes.value.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "newest":
      mixtapes.value.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      break;
    case "oldest":
      mixtapes.value.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      break;
  }
}

// --- Drag and Drop Sorting ---
let dragSourceIndex = null;

const handleDragStart = (event, index) => {
  dragSourceIndex = index;
  event.dataTransfer.effectAllowed = "move";
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
  event.dataTransfer.dropEffect = "move";
};

onMounted(() => {
  dragSourceIndex = null;
});

// --- Speech Recognition ---
const searchText = ref("");
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
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition is not supported by your browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log("Speech recognition started");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchText.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    alert("There was an error with speech recognition.");
  };

  recognition.onend = () => {
    console.log("Speech recognition ended");
  };

  recognition.start();
};

// Function to stop speech recognition
const stopSpeechRecognition = () => {
  console.log("Speech recognition stopped");
  // You can implement stopping the recognition here if necessary
};

const filteredMixtapes = computed(() => {
  if (!searchText.value.trim()) return mixtapes.value;
  const q = searchText.value.trim().toLowerCase();
  return mixtapes.value.filter(
    (mix) =>
      (mix.name && mix.name.toLowerCase().includes(q)) ||
      (mix.description && mix.description.toLowerCase().includes(q)) ||
      (mix.songs &&
        mix.songs.some(
          (song) =>
            (song.name && song.name.toLowerCase().includes(q)) ||
            (song.artist && song.artist.toLowerCase().includes(q))
        ))
  );
});

onMounted(async () => {
  await fetchUserMixtapes();
});

async function fetchUserMixtapes() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/mixtapes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Mixtapes API response:", response.data); // <--- Add this line
    mixtapes.value = (response.data || []).map((mix) => ({
      ...mix,
      songs: (mix.songs || []).map((song) => ({
        // Use all possible keys for each field, just like Discover
        name: song.name ?? song.song_name ?? "",
        artist: song.artist ?? song.artist_name ?? "",
        preview_url: song.preview_url ?? song.url ?? "",
        artwork_url: song.artwork_url || song.artworkUrl100 || song.artwork || null,
      })),
    }));
    console.log('Mapped songs:', mixtapes.value.flatMap(m => m.songs));
    sortMixtapes(); // <-- sort after fetching
  } catch (error) {
    console.error("Failed to fetch mixtapes:", error);
    mixtapes.value = [];
  }
}

function getFullPhotoUrl(photoUrl) {
  if (!photoUrl || photoUrl === "/src/assets/noimage.jpg") return "/src/assets/noimage.jpg";
  if (photoUrl.startsWith("http")) return photoUrl;
  const baseUrl = import.meta.env.VITE_API_URL;
  return `${baseUrl}/${photoUrl.replace(/^\/+/, '')}`;
}

const openMenuIndex = ref(null);

function toggleMixtapeMenu(index) {
  openMenuIndex.value = openMenuIndex.value === index ? null : index;
}

const editingMixtapeId = ref(null);

async function deleteMixtape(index) {
  const mix = mixtapes.value[index];
  if (mix.id === firstMixtapeId.value) return;
  if (!confirm("Are you sure you want to delete this mixtape?")) return;
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:3000/api/mixtapes/${mix.id}`, {
      headers:
        {
          Authorization: `Bearer ${token}`,
        },
    });
    await fetchUserMixtapes();
    openMenuIndex.value = null;
  } catch (err) {
    alert("Failed to delete mixtape.");
  }
}

const showSortDropdown = ref(false);

function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value;
}

function handleClickOutside(event) {
  const dropdown = document.querySelector(".mixtape-sort-dropdown");
  const icon = document.querySelector(".sort-icon");
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
  document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const firstMixtapeId = computed(() => {
  if (!mixtapes.value.length) return null;
  // Find the mixtape with the lowest id (first created)
  return Math.min(...mixtapes.value.map(m => m.id));
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

* {
  font-family: "Fira Code", monospace;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #dbb4d7;
  overflow-x: hidden;
}

.side-nav {
  position: relative;
  left: 0;
  height: calc(100vh - 60px);
  width: 270px;
  /* background-color: #080d2a; */
   background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.616),
    rgba(255, 255, 255, 0)
  );
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2); /* stronger shadow for depth */
  backdrop-filter: blur(12px) brightness(1.05);
  -webkit-backdrop-filter: blur(12px) brightness(1.05);

  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  z-index: 10;
}

.side-nav-hidden {
  position: absolute;
  top: 10px;
  margin-left: 10px;
  height: 50px;
  width: 50px;
  padding: 10px;
  padding-top: 9px;
  padding-left: 11px;
  border-radius: 10px;
  background-color: #322848;
  display: flex;
  overflow: hidden;
  z-index: 10;
}

.nav-section,
.mixtape-section {
  /* background-color: #1f0d3e; */
   background: rgba(255, 255, 255, 0.55);
  padding: 2rem;
color:#322848;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color:#322848;
  margin-bottom: 1.5rem;
  text-decoration: none;
  transition: color 0.3s, font-weight 0.3s;
}

.nav-item.active,
.nav-item.router-link-active {
  font-weight: bold;
  color: #322848;
  text-decoration: underline;
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
  background-color: #322848;
  color: white;
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
  background-color: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-box {
  /* background-color: #080d2a; */
    background: linear-gradient(120deg, #e3b8ff 0%, #dbb4d7 25%, #c697bd 50%, #8a6bb8 75%, #75629e 100%);
  padding: 2rem;
  border-radius: 1rem;
  width: 600px;
  color: #322848;
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
  color: #322848;
  background: rgba(255, 255, 255, 0.495);
  text-align: center;
}
.mixtape-name:focus{
  outline: none;
  background: #3228485a;
  color: white;
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
}
.description-box:focus{
  outline: none;
  background: #3228485a;
  color: white;
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
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
  color: #322848;
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
  background: rgba(255, 255, 255, 0.495);
  color:#322848;
}
.song-popup-box input:focus {
outline: none;
  background: #3228485a;
  color: white;
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
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
  background: #8a63b6;
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: white;
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
  border-top: 1px solid #322848;
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
  color:#322848;
}

.input-with-mic .mixtape-input {
  padding-left: 32px; /* to make space for the mic icon */
}

.sort-icon {
  position: absolute;
  right: 0;
  cursor: pointer;
  color: #322848;
  transition: color 0.2s;
}

.sort-icon:hover {
  color: #555;
}

.mixtape-input {
  width: 85%;
  padding: 5px 35px;
  background-color: rgba(169, 163, 173, 0.379);
  border: none;
  border-radius: 30px;
  color: #322848;
  font-size: 12px;
}
.mixtape-input:focus {
  outline: none;
  border: none;
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.174);
}
.mixtape-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  overflow: auto;
  height: 130px;
}

.mixtape-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #322848;
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
  max-height: 85vh;
  overflow-y: auto;
  padding-right: 1rem;
  margin-top: 60px;
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
  background: rgba(255, 255, 255, 0.495);
}

.song-item-flex {
  display: flex;
  justify-content: space-between;
  background-color: #8a63b6;
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
  height: 100vh;
  background-color: rgba(20, 20, 20, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.mixtape-detail-box {
  /* background-color: #1e1e1e; */
  background: linear-gradient(120deg, #e3b8ff 0%, #dbb4d7 25%, #c697bd 50%, #8a6bb8 75%, #75629e 100%);
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  text-align: center;
  color: #322848;
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
  border:1px solid #322848;
}

.song-details-flex {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mic-icon {
  color: #322848;
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
  z-index: 500;
}

.mixtape-menu-icon {
  cursor: pointer;
  color: #322848;
  font-size: 18px;
  padding: 4px;
}

.mixtape-menu-dropdown {
  position: absolute;
  right: 0;
  top: 0;
  /* top: 25px; */
  background: #2e1f45;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  background: #ffffff;
  color: #1f0d3e;
  border:1px solid #322848;
  border-radius: 6px;
  font-weight:bold;
}

.mixtape-menu-dropdown .disabled {
  color: #aaa;
  pointer-events: none;
  cursor: not-allowed;
  background: #eee;
}

.mixtape-sort-dropdown {
  margin-bottom: 0.5rem;
  text-align: right;
  margin-top: 5px;
}

.mixtape-sort-dropdown select {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #dbb4d7;
  background: #322848;
  color: #fff;
  font-size: 11pt;
  width: 100%;
  
}
.sidebar_burger {
  text-align: right;
  background-color: unset;
  padding: 0;
  padding-right: 5px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .mixtape-header span {
    text-align: left;
  }
  .side-nav {
    width: 100%;
    height: 100vh; /* Allow height to adjust */
    position: relative; /* Change position to relative */
  }
  /* .nav-section, */
  .mixtape-section {
    padding: 1rem; /* Adjust padding for smaller screens */
  }
  .nav-item span {
    font-size: 1rem;
  }
  .nav-item {
    flex-direction: row; /* Ensure items are in a row */
    justify-content: left; /* Align items to the start */
  }
  /* .mixtape-header span {
  display: none;
 } */
  .add-icon {
    margin-left: 0; /* Remove margin for smaller screens */
  }
}
/* Additional styles for very small screens */
@media (max-width: 480px) {
  .side-nav {
    width: 100%;
    height: 100vh; /* Allow height to adjust */
    position: relative; /* Change position to relative */
  }
  .nav-item {
    font-size: 0.9rem; /* Smaller font size */
  }
  .mixtape-input {
    font-size: 0.8rem; /* Smaller input font size */
  }
}

</style>