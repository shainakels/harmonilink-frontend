<template>
  <NavLayout>
    <div class="animated-background"></div>
    <div class="profile-wrapper">
      <h1 class="page-title">Your Profile</h1>
      <hr class="separator" style="color: #322848" />

      <!-- USER INFO -->
      <div class="user-info-section">
        <div class="profile-image-container">
          <label
            v-if="isEditing"
            class="edit-image-label"
            style="position: relative"
          >
            <input
              type="file"
              accept="image/*"
              @change="handleProfileImageUpload"
              hidden
            />
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
          <div style="display: flex; gap: 8px">
            <button class="edit-btn" @click="toggleEdit">
              <i v-if="!isEditing" class="fa-solid fa-pen"></i>
              <i v-else class="fa-solid fa-floppy-disk"></i>
              <span>{{ isEditing ? "Save" : "Edit Profile" }}</span>
            </button>
            <button
              v-if="isEditing"
              class="exit-edit-btn"
              @click="cancelEdit"
              aria-label="Cancel editing"
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
            <p class="user-meta">
              {{ profile.age }} years old, {{ profile.gender }}
            </p>
            <p class="user-bio">{{ profile.bio }}</p>
          </template>

          <template v-else>
            <div class="labeled-input">
              <label>
                <span>Gender:</span>
                <select
                  v-model="editableProfile.gender"
                  class="edit-input"
                  @change="onGenderChange"
                >
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
                  style="margin-top: 8px"
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
      <!-- USER INFO -->

      <div class="tabs">
        <button
          class="tabs-button"
          @click="() => { myMixtapesTab = true; myPollTabs = false; }"
        >
          My Mixtapes
        </button>
        <button
          class="tabs-button"
          @click="() => { myMixtapesTab = false; myPollTabs = true; }"
        >
          My Polls
        </button>
      </div>

      <!-- MIXTAPES AREA -->
      <div v-if="myMixtapesTab">
        <div class="mixtapes-area">
          <!-- MIXTAPES HEADER -->
          <div class="mixtapes-header">
            <div class="mixtapes-title">
              <i class="fa-solid fa-compact-disc"></i>
              <span style="text-align: left">My Mixtapes</span>
              <i class="fa-solid fa-plus add-icon" @click="togglePopup"></i>
            </div>

            <div class="profile-search-filter">
              <div class="search-input-wrapper">
                <i
                  class="fa-solid fa-microphone search-icon"
                  :style="{
                    color: recognizing ? 'red' : '#322848',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                  }"
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
              <i
                class="fa-solid fa-list-ul filter-icon"
                @click="toggleSortDropdown"
              ></i>
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
          <!-- MIXTAPES HEADER -->
        </div>

        <!-- MIXTAPES LIST -->
        <div
          class="mixtapes-list"
          :class="{ list: isListView, grid: !isListView }"
        >
          <div
            v-for="mixtape in filteredMixtapes"
            :key="mixtape.id"
            class="mixtape-item editable-mixtape"
          >
          

<div
  v-if="editingMixtapeId !== mixtape.id"
  class="mixtape-content-wrapper"
  style="cursor: pointer;"
  @click="selectedMixtape = mixtape"
>
  <img
    v-if="mixtape.cover"
    :src="mixtape.cover"
    alt="Mixtape Cover"
    class="mixtape-cover"
  />
  <span v-else class="no-cover">No cover</span>
  <div class="mixtape-info">
    <h3 class="mixtape-name">{{ mixtape.name }}</h3>
  </div>
  <div class="mixtape-actions-top-right">
    <button 
      @click.stop="startEditMixtape(mixtape)" 
      class="edit-btn"
    >
      Edit
    </button>
    <button
      @click.stop="deleteMixtape(mixtape)"
      :disabled="mixtape.id === firstMixtapeId"
      v-if="mixtape.id !== firstMixtapeId"
    >
      Delete
    </button>
  </div>
</div>
            <div v-else class="mixtape-edit-form">
              <div class="upload-box" @click="triggerEditCoverUpload">
                <input
                  type="file"
                  ref="editCoverInput"
                  @change="handleEditCoverUpload"
                  accept="image/*"
                  hidden
                />
                <img
                  v-if="editableMixtape.coverPreview || editableMixtape.cover"
                  :src="editableMixtape.coverPreview || getFullPhotoUrl(editableMixtape.cover)"
                  class="photo-preview"
                  alt="Mixtape Cover"
                />
                <span v-else>Click to upload cover</span>
              </div>
              <input
                v-model="editableMixtape.name"
                placeholder="Mixtape Name"
                class="mixtape-desc"
              />
              <textarea
                v-model="editableMixtape.description"
                placeholder="Description"
                class="mixtape-desc"
              ></textarea>
              <div class="edit-songs-section">
                <h4>Songs</h4>
                <br />
                <div
                  v-for="(song, idx) in editableMixtape.songs"
                  :key="idx"
                  class="song-item song-item-flex"
                >
                  <img
                    v-if="song.artwork_url"
                    :src="song.artwork_url"
                    alt="Artwork"
                    style="
                      width: 40px;
                      height: 40px;
                      border-radius: 6px;
                      margin-right: 0.5rem;
                    "
                  />
                  <div style="flex: 1">
                    <span>{{ song.name }} - {{ song.artist }}</span>
                  </div>
                  <button
                    v-if="song.preview_url"
                    class="mini-audio-btn"
                    @click="playPreview(song.preview_url, idx)"
                    :aria-label="
                      playingIndex === idx ? 'Pause preview' : 'Play preview'
                    "
                    style="margin-left: 0.5rem"
                  >
                    <i
                      :class="
                        playingIndex === idx
                          ? 'fa-solid fa-pause'
                          : 'fa-solid fa-play'
                      "
                    ></i>
                  </button>
                  <div class="song-actions-buttons">
                    <i
                      class="fa-solid fa-trash delete-icon"
                      @click="removeSongFromEditable(idx)"
                    ></i>
                  </div>
                </div>
                <button
                  class="add-song-btn"
                  @click="showSongModalEdit = true"
                  style="margin-top: 1rem"
                >
                  <i class="fa-solid fa-circle-plus"></i> Add Song
                </button>
              </div>
              <button
                @click="saveEditMixtape(editableMixtape)"
                style="
                  background: rgb(106, 79, 207);
                  color: #fff;
                  border-radius: 6px;
                "
              >
                Save
              </button>
              &nbsp;&nbsp;&nbsp;
              <button
                @click="cancelEditMixtape"
                style="
                  background: rgb(106, 79, 207);
                  color: #fff;
                  border-radius: 6px;
                "
              >
                Cancel
              </button>
            </div>
            <transition name="fade">
              <div v-if="expandedMixtapeId === mixtape.id" class="expanded-songs">
                <ol
                  v-if="mixtape.songs && mixtape.songs.length"
                  class="song-list"
                >
                  <li
                    v-for="(song, index) in mixtape.songs"
                    :key="index"
                    class="expanded-song-row"
                  >
                    <img
                      v-if="song.artwork_url"
                      :src="song.artwork_url"
                      class="song-artwork"
                    />
                    <span class="song-title">{{ song.name }}</span>
                    <span class="artist-name">by {{ song.artist }}</span>
                    <audio
                      v-if="song.preview_url"
                      :src="song.preview_url"
                      controls
                      style="
                        vertical-align: middle;
                        margin-left: 10px;
                        height: 28px;
                      "
                    />
                  </li>
                </ol>
                <p v-else class="song-list">(No songs listed)</p>
              </div>
            </transition>
          </div>
        </div>
      </div>
      <!-- MIXTAPES LIST -->

      <!-- Start of POLL -->
      <div v-if="myPollTabs" class="poll-area">
        <div class="mixtapes-title">
          <i class="fa-solid fa-square-poll-horizontal"></i>
          <span style="text-align: left">My Polls</span>
        </div>
        <div class="grid-container">
          <div v-if="myPolls.length === 0" class="poll-container">
            <div class="poll-content">
              <span>No polls created yet.</span>
            </div>
          </div>
          <div v-for="poll in myPolls" :key="poll.id" class="poll-container">
            <div class="poll-content">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div class="postedtime" style="text-align: left; margin-top: 3px;">
                  <span>{{ poll.question }}</span>
                </div>
                <button 
                  @click="deletePoll(poll.id)" 
                  class="delete-poll-btn"
                  title="Delete poll"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div class="poll-created-at" style="text-align: left; font-size: 11px; color: #322848; margin-top: 2px; margin-bottom: 20px;">
                <span>Posted: {{ new Date(poll.created_at).toLocaleString() }}</span>
              </div>
              <div class="poll-options-container" v-if="poll.options && poll.options.length">
                <div class="poll-option" v-for="option in poll.options" :key="option.id">
                  <span>{{ option.text }}</span>
                  <span>{{ option.votes }} votes</span>
                </div>
              </div>
              <div class="poll-length" :class="{ 'finished': isPollFinished(poll) }">
                {{ getPollTimeRemaining(poll) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- End of POLL -->
    </div>

    <!-- Mixtape Detail Popup -->
    <!-- Find this section in your template and replace it -->
<div v-if="selectedMixtape" class="mixtape-detail-overlay" @click="selectedMixtape = null">
  <div class="mixtape-detail-box" @click.stop>
    <div class="close-detail" @click="selectedMixtape = null">&times;</div>
    <img 
      :src="selectedMixtape.cover || '/src/assets/noimage.jpg'" 
      :alt="selectedMixtape.name" 
      class="detail-img"
    />
    <h2>{{ selectedMixtape.name }}</h2>
    <p v-if="selectedMixtape.description">{{ selectedMixtape.description }}</p>
    <div class="song-list">
      <div 
        v-for="(song, index) in selectedMixtape.songs" 
        :key="index"
        class="song-details-flex"
      >
        <img
          v-if="song.artwork_url"
          :src="song.artwork_url"
          alt="Song artwork"
          class="song-artwork"
        />
        <div class="song-info">
          <span class="song-title">{{ song.name }}</span>
          <span class="artist-name">by {{ song.artist }}</span>
        </div>
        <button 
          v-if="song.preview_url" 
          class="mini-audio-btn"
          @click="playPreview(song.preview_url, index)"
        >
          <i :class="playingIndex === index ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
        </button>
      </div>
    </div>
  </div>
</div>

    <!-- Create Mixtape Popup -->
    <div v-if="showPopup" class="popup-overlay" @click="closePopup">
      <div class="popup-box" @click.stop>
        <h2>Create New Mixtape</h2>
        <div class="upload-box" @click="triggerPhotoUpload">
          <input
            type="file"
            ref="photoInput"
            @change="handlePhotoUpload"
            accept="image/*"
            hidden
          />
          <img v-if="photoUrl" :src="photoUrl" class="photo-preview" />
          <span v-else>Click to upload cover</span>
        </div>
        <input
          v-model="mixtapeName"
          placeholder="Mixtape Name"
          class="mixtape-name"
        />
        <textarea
          v-model="mixtapeDescription"
          placeholder="Description (optional)"
          class="description-box"
        ></textarea>
        <div class="song-list-scroll">
  <div v-for="(song, index) in songs" :key="index" class="song-item-flex">
    <!-- Add the artwork display -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <img
        v-if="song.artwork_url"
        :src="song.artwork_url"
        alt="Song artwork"
        style="width: 40px; height: 40px; border-radius: 6px;"
      />
      <span>{{ song.name }} - {{ song.artist }}</span>
    </div>
    <div class="song-actions-buttons">
      <i class="fa-solid fa-trash" @click="deleteSong(index)"></i>
    </div>
  </div>
</div>
        <button class="add-song-btn" @click="showSongModal = true">
          <i class="fa-solid fa-plus"></i> Add Song
        </button>
        <div class="popup-buttons">
          <button @click="createMixtape">Create Mixtape</button>
          <button @click="closePopup">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Song Modal -->
    <div v-if="showSongModal" class="modal-overlay" @click="closeSongModal">
      <div class="song-popup-box" @click.stop>
        <div class="exit-btn" @click="closeSongModal">&times;</div>
        <h3>Add Song</h3>
        <input
          v-model="songSearchQuery"
          placeholder="Search for a song..."
          @input="searchSongs"
        />
        <div v-if="songSearchResults.length > 0" class="song-search-results">
          <div
            v-for="song in songSearchResults"
            :key="song.name + song.artist"
            class="song-search-item"
            @click="selectSongFromSearch(song)"
          >
            <img
              v-if="song.artwork_url"
              :src="song.artwork_url"
              alt="Song artwork"
              class="song-search-artwork"
            />
            <div class="song-search-info">
              <div class="song-search-name">{{ song.name }}</div>
              <div class="song-search-artist">{{ song.artist }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Song Modal -->
    <div v-if="showSongModalEdit" class="modal-overlay" @click="closeEditSongModal">
      <div class="song-popup-box" @click.stop>
        <div class="exit-btn" @click="closeEditSongModal">&times;</div>
        <h3>Add Song to Mixtape</h3>
        <input
          v-model="songSearchQuery"
          placeholder="Search for a song..."
          @input="searchSongs"
        />
        <div v-if="songSearchResults.length > 0" class="song-search-results">
          <div
            v-for="song in songSearchResults"
            :key="song.name + song.artist"
            class="song-search-item"
            @click="addSongToEditableMixtape(song)"
          >
            <img
              v-if="song.artwork_url"
              :src="song.artwork_url"
              alt="Song artwork"
              class="song-search-artwork"
            />
            <div class="song-search-info">
              <div class="song-search-name">{{ song.name }}</div>
              <div class="song-search-artist">{{ song.artist }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NavLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import NavLayout from "../layouts/NavLayout.vue";
import { onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";

const sortOption = ref("az");
const mixtapes = ref([]);
const DEFAULT_PROFILE_IMAGE = "/src/assets/default-profile.jpg";
const myPollTabs = ref(false);
const myMixtapesTab = ref(true);
const showSongModalEdit = ref(false);
const editingMixtapeId = ref(null);

const profile = ref({
  name: "",
  age: "",
  gender: "",
  bio: "",
  profile_image: "",
});
const editableProfile = ref({
  name: "",
  gender: "",
  bio: "",
  profile_image: "",
});
const profileImage = ref(DEFAULT_PROFILE_IMAGE);
const isEditing = ref(false);

const customGender = ref("");

const token = localStorage.getItem("token");

const mixtapeName = ref("");
const mixtapeDescription = ref("");
const songs = ref([]);
const photoUrl = ref(null);
const photoInput = ref(null);
const songName = ref("");
const artistName = ref("");
const songUrl = ref("");
const editingSongIndex = ref(null);
const editableMixtape = ref({
  id: null,
  name: "",
  description: "",
  cover: null,
  songs: [],
});

onMounted(() => {
  fetchProfile();
  fetchMixtapes();
  // Start interval when component mounts
  timeUpdateInterval.value = setInterval(() => {
    if (myPollTabs.value) {
      // Force a reactivity update
      myPolls.value = [...myPolls.value];
    }
  }, 1000);
});

async function getFullPhotoUrl(photoUrl) {
  if (!photoUrl) return "/src/assets/noimage.jpg";
  if (photoUrl.startsWith("http")) return photoUrl;
  // Always use backend API URL for uploads
  const baseUrl = import.meta.env.VITE_API_URL;
  return `${baseUrl}/${photoUrl}`;
}

async function toggleSongPlay(index) {
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

async function onSongAudioEnded() {
  playingSongIndex.value = null;
}

async function fetchProfile() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/profile`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = response.data.profile;
    const img = data.profile_image || DEFAULT_PROFILE_IMAGE;
    profile.value = {
      name: data.name || "",
      age: data.age || "",
      gender: data.gender || "",
      bio: data.bio || "",
      profile_image: img,
    };
    editableProfile.value = {
      name: data.name || "",
      gender: data.gender || "",
      bio: data.bio || "",
      profile_image: img,
    };
    profileImage.value = img;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    profileImage.value = DEFAULT_PROFILE_IMAGE;
  }
}

async function fetchMixtapes() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/mixtapes`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    mixtapes.value = response.data.map((mix) => ({
      ...mix,
      cover: mix.cover
        ? mix.cover.startsWith("http")
          ? mix.cover
          : `${import.meta.env.VITE_API_URL.replace(
              /\/$/,
              ""
            )}/${mix.cover.replace(/^\/?/, "")}`
        : "",
      songs: mix.songs || [],
    }));
  } catch (error) {
    console.error("Failed to fetch mixtapes:", error);
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

function cancelEdit() {
  isEditing.value = false;
  editableProfile.value = {
    name: profile.value.name,
    gender: profile.value.gender,
    bio: profile.value.bio,
    profile_image: profile.value.profile_image,
  };
  profileImage.value = profile.value.profile_image || DEFAULT_PROFILE_IMAGE;
  customGender.value = ""; // Reset custom gender input if it exists
}

async function saveProfile() {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/profile`,
      {
        name: editableProfile.value.name,
        gender: editableProfile.value.gender,
        bio: editableProfile.value.bio,
        profile_image: profileImage.value,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    profile.value = { ...editableProfile.value, age: profile.value.age };
    isEditing.value = false;
    alert("Profile updated!");
  } catch (error) {
    alert("Failed to update profile.");
    console.error(error);
  }
}

// Handle profile image upload
async function handleProfileImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("photo", file);

  try {
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
    // Use full URL for preview
    profileImage.value =
      `${import.meta.env.VITE_API_URL}/${response.data.imageUrl}` ||
      DEFAULT_PROFILE_IMAGE;
    editableProfile.value.profile_image = profileImage.value;
  } catch (err) {
    alert("Failed to upload image.");
  }
}

function onGenderChange() {
  if (editableProfile.value.gender !== "Others") {
    customGender.value = "";
  }
}

function updateCustomGender() {
  editableProfile.value.gender = customGender.value;
}

// When entering edit mode, if gender is not one of the dropdown options, set to "Others" and fill customGender
watch(isEditing, (val) => {
  if (val) {
    const g = editableProfile.value.gender;
    if (g && !["Male", "Female", "Non-Binary", "Others"].includes(g)) {
      customGender.value = g;
      editableProfile.value.gender = "Others";
    } else {
      customGender.value = "";
    }
  }
});

const searchQuery = ref("");
const isListView = ref(true);

const showPopup = ref(false);
const showSongModal = ref(false);
const showEditSongModal = ref(false);
const showConfirmCancel = ref(false);
const selectedMixtape = ref(null);

const myPolls = ref([]);
async function fetchMyPolls() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/polls`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    myPolls.value = response.data;
  } catch (error) {
    myPolls.value = [];
    console.error("Failed to fetch polls:", error);
  }
}

// Watch for tab change and fetch polls when "My Polls" tab is active
watch(
  () => myPollTabs.value,
  (isActive) => {
    if (isActive) fetchMyPolls();
  }
);

const filteredMixtapes = computed(() => {
  if (!mixtapes.value) return [];
  let arr = [...mixtapes.value];

  // Filter by search query (mixtape name or any song name/artist)
  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    arr = arr.filter((mix) => {
      // Check mixtape name
      if (mix.name && mix.name.toLowerCase().includes(query)) return true;
      // Check any song name or artist
      if (Array.isArray(mix.songs)) {
        return mix.songs.some(
          (song) =>
            (song.name && song.name.toLowerCase().includes(query)) ||
            (song.artist && song.artist.toLowerCase().includes(query))
        );
      }
      return false;
    });
  }

  // Sorting
  switch (sortOption.value) {
    case "az":
      arr.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "za":
      arr.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "newest":
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case "oldest":
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
  }
  return arr;
});

function sortMixtapes() {
  // This triggers the computed property to update
}

const togglePopup = () => {
  showPopup.value = !showPopup.value;
};

const toggleSortAndMaybeView = () => {
  isListView.value = !isListView.value;
};

const triggerPhotoUpload = () => {
  photoInput.value.click();
};

const handlePhotoUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    photoUrl.value = URL.createObjectURL(file);
  }
};

const createMixtape = async () => {
  if (!mixtapeName.value.trim()) {
    alert("Please enter a mixtape name");
    return;
  }
  if (songs.value.length < 1) {
    alert("Please add at least one song");
    return;
  }
  try {
    const token = localStorage.getItem("token");
    const coverPath = await uploadCoverIfNeeded();

    const formattedSongs = songs.value.map((song) => ({
      name: song.name,
      artist: song.artist,
      preview_url: song.preview_url || song.url || "",
      artwork_url: song.artwork_url || "",
    }));

    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/mixtapes`,
      {
        name: mixtapeName.value,
        description: mixtapeDescription.value,
        cover: coverPath,
        songs: formattedSongs,
      },
      {
         headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Mixtape created successfully!");
    // Clear input fields after successful creation
    mixtapeName.value = "";
    mixtapeDescription.value = "";
    songs.value = [];
    photoUrl.value = null;

    await fetchMixtapes(); // Refresh mixtapes list
    closePopup();         // <-- Add this line to close the modal
  } catch (error) {
    console.error("Failed to create mixtape:", error);
    alert("Failed to create mixtape.");
  }
};

const resetCreateForm = () => {
  mixtapeName.value = "";
  mixtapeDescription.value = "";
  songs.value = [];
  photoUrl.value = null;
};

const closePopup = () => {
  showConfirmCancel.value = false;
  showPopup.value = false;
  resetCreateForm();
};

const closeSongModal = () => {
  showSongModal.value = false;
  songName.value = "";
  artistName.value = "";
  songUrl.value = "";
  editingSongIndex.value = null;
};

const closeEditSongModal = () => {
  showSongModalEdit.value = false;
  songName.value = "";
  artistName.value = "";
  songUrl.value = "";
  editingSongIndex.value = null;
};

const addSong = () => {
  if (!songName.value.trim() || !artistName.value.trim()) {
    alert("Please enter both song name and artist");
    return;
  }

  const newSong = {
    name: songName.value.trim(),
    artist: artistName.value.trim(),
    preview_url: songUrl.value.trim() || "", // <-- use preview_url
    artwork_url: "", // <-- allow user to set or leave blank
  };

  if (editingMixtapeId.value !== null) {
    if (editingSongIndex.value !== null) {
      editableMixtape.value.songs[editingSongIndex.value] = newSong;
    } else {
      editableMixtape.value.songs.push(newSong);
    }
    editingSongIndex.value = null;
    closeEditSongModal();
  } else {
    if (editingSongIndex.value !== null) {
      songs.value[editingSongIndex.value] = newSong;
    } else {
      songs.value.push(newSong);
    }
    editingSongIndex.value = null;
    closeSongModal();
  }

  songName.value = "";
  artistName.value = "";
  songUrl.value = "";
};

const deleteSong = (index) => {
  songs.value.splice(index, 1);
};

const removeSongFromEditable = (index) => {
  editableMixtape.value.songs.splice(index, 1);
};



const editEditableSong = (index) => {
  editingSongIndex.value = index;
  const song = editableMixtape.value.songs[index];
  songName.value = song.name;
  artistName.value = song.artist;
  showEditSongModal.value = true;
};


function startEditMixtape(mixtape) {
  editingMixtapeId.value = mixtape.id;
  let backendCover = mixtape.cover;
  if (backendCover && backendCover.startsWith(import.meta.env.VITE_API_URL)) {
    backendCover = backendCover.replace(import.meta.env.VITE_API_URL + '/', '');
  }
  editableMixtape.value = {
    ...JSON.parse(JSON.stringify(mixtape)),
    cover: backendCover,
    coverPreview: mixtape.cover,
  };
  showSongModalEdit.value = false;
  selectedMixtape.value = null;  // This ensures detail box is closed
}

async function saveEditMixtape(mixtape) {
  try {
    const token = localStorage.getItem("token");
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/mixtapes/${mixtape.id}`,
      {
        name: editableMixtape.value.name,
        description: editableMixtape.value.description,
        cover: editableMixtape.value.cover,
        songs: editableMixtape.value.songs,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    await fetchMixtapes();
    editingMixtapeId.value = null;
    editableMixtape.value.coverPreview = null; // <-- clear preview
    alert("Mixtape updated successfully!");
  } catch (error) {
    alert("Failed to update mixtape.");
    console.error(error);
  }
}

function cancelEditMixtape() {
  editingMixtapeId.value = null;
  editableMixtape.value = {
    id: null,
    name: "",
    description: "",
    cover: null,
    songs: [],
  };
}

const confirmDeleteMixtape = (mixtape) => {
  if (confirm(`Are you sure you want to delete "${mixtape.name}"?`)) {
    mixtapes.value = mixtapes.value.filter((m) => m.id !== mixtape.id);
  }
};

const triggerEditCoverUpload = () => {
  editCoverInput.value.click();
};

const handleEditCoverUpload = async (e) => {
  const file = e.target.files[0];
  if (file) {
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
      editableMixtape.value.cover = response.data.imageUrl; // backend path
      editableMixtape.value.coverPreview = `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/${response.data.imageUrl.replace(/^\/?/, "")}`; // full URL
    } catch (err) {
      alert("Failed to upload image.");
    }
  }
};

const closeMixtapePopup = () => {
  selectedMixtape.value = null;
};

const expandedMixtapeId = ref(null);

function toggleExpandMixtape(mixtape) {
  expandedMixtapeId.value =
    expandedMixtapeId.value === mixtape.id ? null : mixtape.id;
}

const showSortDropdown = ref(false);

function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value;
}

function handleClickOutside(event) {
  const dropdown = document.querySelector(".mixtape-sort-dropdown");
  const icon = document.querySelector(".filter-icon");
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
  // Clear interval when component unmounts
  if (timeUpdateInterval.value) {
    clearInterval(timeUpdateInterval.value);
  }
});

const editMixtapeName = ref("");
const editMixtapeDescription = ref("");
const songSearchQuery = ref("");
const songSearchResults = ref([]);
const isSearchingSongs = ref(false);

async function deleteMixtape(mixtape) {
  if (mixtape.id === firstMixtapeId.value) return;
  if (!confirm("Are you sure you want to delete this mixtape?")) return;
  try {
    const token = localStorage.getItem("token");
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/mixtapes/${mixtape.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    await fetchMixtapes();
  } catch (error) {
    alert("Failed to delete mixtape.");
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
      `${import.meta.env.VITE_API_URL}/api/itunes-search`,
      {
        params: {
          term: songSearchQuery.value,
        },
      }
    );
    songSearchResults.value = response.data.results.map((item) => ({
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
  songs.value.push({
    name: song.name,
    artist: song.artist,
    artwork_url: song.artwork_url,
    preview_url: song.preview_url
  });
  songSearchQuery.value = "";
  songSearchResults.value = [];
  showSongModal.value = false;
}

function addSongToEditableMixtape(song) {
  if (
    !editableMixtape.value.songs.some(
      (s) => s.name === song.name && s.artist === song.artist
    )
  ) {
    editableMixtape.value.songs.push({
      name: song.name ?? "",
      artist: song.artist ?? "",
      preview_url: song.preview_url ?? "",
      artwork_url: song.artwork_url ?? "",
    });
  }
  showSongModalEdit.value = false;
  songSearchQuery.value = "";
  songSearchResults.value = [];
}

const firstMixtapeId = computed(() => {
  if (!mixtapes.value.length) return null;
  return Math.min(...mixtapes.value.map((m) => m.id));
});

const uploadCoverIfNeeded = async () => {
  if (!photoUrl.value || !photoInput.value?.files?.[0]) return null;

  const formData = new FormData();
  formData.append("photo", photoInput.value.files[0]);

  try {
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
    return response.data.imageUrl;
  } catch (error) {
    console.error("Cover upload failed:", error);
    alert("Failed to upload cover image.");
    return null;
  }
};


// Speech recognition setup
const recognizing = ref(false);
let recognition = null;

if ("webkitSpeechRecognition" in window) {
  recognition = new window.webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

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
    alert("Voice recognition not supported in this browser.");
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

function isPollFinished(poll) {
  const createdAt = new Date(poll.created_at).getTime();
  const now = new Date().getTime();
  return (now - createdAt) >= (poll.poll_length_seconds * 1000);
}

function getPollTimeRemaining(poll) {
  if (!poll.created_at || !poll.poll_length_seconds) return 'Invalid poll data';

  const createdAt = new Date(poll.created_at).getTime();
  const now = new Date().getTime();
  const endTime = createdAt + (poll.poll_length_seconds * 1000);
  
  if (now >= endTime) {
    return 'Finished result';
  }

  const timeLeft = endTime - now;
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return `${String(days).padStart(2, '0')} days ${String(hours).padStart(2, '0')} hours ${String(minutes).padStart(2, '0')} minutes ${String(seconds).padStart(2, '0')} seconds`;
}

// Add interval to update time remaining
const timeUpdateInterval = ref(null);

async function deletePoll(pollId) {
  if (!confirm('Are you sure you want to delete this poll?')) return;
  
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/polls/${pollId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Remove the poll from the local state
    myPolls.value = myPolls.value.filter(poll => poll.id !== pollId);
  } catch (error) {
    console.error('Failed to delete poll:', error);
    alert('Failed to delete poll. Please try again.');
  }
}
</script>

<style scoped>
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

.poll-length {
  margin-top: 10px;
  padding: 8px;
  background-color: rgba(50, 40, 72, 0.1);
  border-radius: 6px;
  font-size: 0.9rem;
  color: #322848;
}

.poll-length.finished {
  color: #ff4757;
  font-weight: bold;
}

.delete-poll-btn {
  background: none;
  border: none;
  color: #322848;
  padding: 4px 8px;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s, transform 0.2s;
  border-radius: 50%;
}

.delete-poll-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  background-color: rgba(255, 255, 255, 0.1);
}

.delete-poll-btn:active {
  transform: scale(0.95);
}

/* Add general button styles to remove outlines */
button {
  outline: none !important;
  border: none !important;
}

button:focus {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

button:active {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* Specific button styles */
.tabs-button:focus,
.tabs-button:active,
.edit-btn:focus,
.edit-btn:active,
.exit-edit-btn:focus,
.exit-edit-btn:active,
.mini-audio-btn:focus,
.mini-audio-btn:active {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
  text-decoration: none !important;
}

.postedtime {
  margin-bottom: 20px;
  color: #322848;
}
/* Start Polls Style */
.poll-progress-bar-bg {
  background: #e0e0e0;
  border-radius: 8px;
  width: 100%;
  height: 16px;
  margin-right: 8px;
  overflow: hidden;
  position: relative;
}
.poll-progress-bar-wrapper {
  display: flex;
  align-items: center;
  width: 180px;
  margin-left: 12px;
}
.poll-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
  border: 1px solid #322848;
  padding: 4px 20px 4px 20px;
  border-radius: 10px;
}
.poll-options {
  text-align: left;
}
.poll-options-container {
  background-color: rgba(218, 171, 224, 0.7);
  border: 4px solid white;
  padding: 0.5rem;
  border-radius: 10px;
  width: 100%;
  height: 100px;
  overflow-y: auto;
}
.poll-created-at {
  font-size: 12px;
  color: #322848;
}
.poll-container {
  background: rgba(255, 255, 255, 0.55);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  height: auto;
  position: relative;
  perspective: 1500px;
  user-select: none;
}
.poll-content {
  background-color: rgba(108, 119, 178, 0.35);
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  color: #ffffff;
  height: auto;
  width: 100%;
}
.poll-area {
  width: 100%;
  padding: 10px;
  border: 1px solid #322848;
  border-radius: 6px;
  margin-top: 0;
}
.grid-container {
  display: grid;
  grid-template-columns: 70%;
  gap: 10px;
  margin-top: 0;
}

.left-column,
.right-column {
  display: flex; /* Enables flex centering */
  flex-direction: column; /* Stacks children vertically */
  justify-content: center; /* Centers vertically */
  align-items: center; /* Centers horizontally */
  padding: 15px;
  height: 480px;
}

.main-column {
  padding: 20px;
}

/* End Polls Style */
.tabs {
  width: 100%;
  margin-bottom: 15px;
}
.tabs-button {
  font-size: 17pt;
  background: none;
  border: none;
  color: #322848;
  font-family: monospace;
  font-weight: 600;
  padding: 6px 10px;
  cursor: pointer;
  width: 20%;
  margin-left: 10px;
  margin-right: 10px;
  border-radius: 0;
  position: relative;
}

.tabs-button::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 50%;
  background-color: #322848;
  transition: all 0.3s ease-in-out;
}

.tabs-button:hover::after {
  width: 100%;
  left: 0;
}

.tabs-button:active {
  text-decoration: none;
  background: none !important;
}

.tabs-button:focus {
  background: none !important;
  outline: none;
}
.mixtapes-area {
  border: 1px solid #322848;
  padding: 10px;
  border-radius: 6px;
  margin-top: 0;
}
.mixtape-edit-form {
  width: 100%;
}
.mixtape-name-inp {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
}
.mixtape-desc {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #322848;
  font-size: 0.95rem;
  font-weight: bold;
}
.mixtape-desc:focus {
  outline: none;
  background: #3228485a;
  color: white;
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
}

/* .profile-wrapper {
  padding: 2rem;

  min-height: 100vh;
  overflow: auto;
  color: black;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  /* margin-left: 270px; */

.profile-wrapper {
  padding: 2rem 2rem 1rem 2rem; /* reduce top padding if needed */
  min-height: 100vh;
  overflow: auto;
  color: black;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}


.page-title {
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: 8px;
  text-align: left;
  margin-left: 50px;
}

.separator {
  border: 1px solid #9877a0;
  margin: 10px 0 20px;
}

.user-info-section {
  display: flex;
  gap: 15px;
  align-items: center;
  border: 1px solid #322848;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
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
  background: rgba(255, 255, 255, 0.55);
  border-radius: 12px;
  padding: 20px;
  color: #322848;
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
  background-color: #322848;
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

.edit-btn:hover {
  background-color: #28203a;
}

.edit-btn i {
  margin-right: 10px;
}

.exit-edit-btn {
  background-color: #322848;
  border: none;
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
  border-radius: 6px;
  padding: 6px 10px;
  transition: background-color 0.25s ease;
}

.exit-edit-btn:hover {
  background-color: #28203a;
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
  background: #28203a;
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
  color: #28203a;
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
  background-color: rgba(169, 163, 173, 0.379);
  color: #28203a; /* Add this line to change text color */
}

.search-input:focus {
  outline: none;
  border: none;
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.174);
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
  display: block;
  flex-wrap: wrap;
  padding-bottom: 40px;
  padding: 10px;
  height: auto;
  width: 100%;
}

.mixtapes-list.list {
  flex-direction: column;
}

.mixtape-item {
  background: rgba(255, 255, 255, 0.55);
  border-radius: 12px;
  color: #322848;
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  width: 100%;
  max-width: 50rem;
  transition: background-color 0.3s ease;
  position: relative;
  margin-bottom: 10px;
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
  background-color: #322848;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.15);
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
  color: #322848;
}

.mixtape-name,
.mixtape-desc {
  padding: 0.75rem;
  border: none;
  width: 100%;
  color: #322848;
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
  background-color: #28203a;
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
  background-color: #9467b3;
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
  background: linear-gradient(
    120deg,
    #e3b8ff 0%,
    #dbb4d7 25%,
    #c697bd 50%,
    #8a6bb8 75%,
    #75629e 100%
  );
  padding: 2rem;
  border-radius: 1rem;
  width: 600px;
  color: #322848;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 85vh;
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
  color: #322848;
  background: rgba(255, 255, 255, 0.495);
  text-align: center;
  border-radius: 5px;
}
.mixtape-name:focus,
.description-box:focus {
  outline: none;
  background: #3228485a;
  color: white;
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
}
.description-box {
  height: 40px;
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
  cursor: pointer;
}

.popup-buttons button:first-child:hover {
  background: #080d2a;
  color: #dbb4d7;
  border: 1px solid #ebebeb;
}

.popup-buttons button:last-child:hover {
  background: red;
  color: white;
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
  background-color: #8a63b6;
  padding: 0.5rem;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.song-item-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0.5rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  color: #322848;
}

.song-actions-buttons i {
  margin-left: 0.5rem;
  cursor: pointer;
  color: #c2b4d6;
}

.song-actions-buttons i:hover {
  color: #dbb4d7;
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  color: #2e1f45;
  font-size: 0.97em;
  margin-right: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.edit-songs-section {
  margin: 1rem 0;
  background: linear-gradient(
    120deg,
    #e3b8ff 0%,
    #dbb4d7 25%,
    #c697bd 50%,
    #8a6bb8 75%,
    #75629e 100%
  );
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
  background-color: #1f0d3e;
  color: #dbb4d7;
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
.mixtape-sort-dropdown select {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #dbb4d7;
  background: #2e1f45;
  color: #fff;
  font-size: 11pt;
  width: 100%;
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
  background: linear-gradient(
    120deg,
    #e3b8ff 0%,
    #dbb4d7 25%,
    #c697bd 50%,
    #8a6bb8 75%,
    #75629e 100%
  );
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  text-align: center;
  color: #322848;
  position: relative;
}

/* For Mixtape PopUp */
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

.song-search-results {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 1rem;
}

.song-search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
}

.song-search-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.song-search-artwork {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
}

.song-search-info {
  flex: 1;
  text-align: left;
}

.song-search-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.song-search-artist {
  font-size: 0.9em;
  opacity: 0.8;
}
</style>
