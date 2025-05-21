<template>
  <NavLayout>
    <div class="poll-wrapper">
      <div class="create-poll-container">
        <i class="fa-solid fa-square-poll-horizontal"></i>
        <button class="create-poll-button" @click="openCreatePollPopup">Create Poll</button>
      </div>

      <div v-if="showCreatePoll" class="popup-overlay">
        <div class="popup-container">
          <div class="popup-header">
            <h2>Poll</h2>
            <button class="close-btn" @click="closeCreatePollPopup">×</button>
          </div>
        <input
          class="poll-input"
          v-model="newPollQuestion"
          placeholder="Enter your poll question"
        />

        <div class="options-label">Options</div>
          <div class="options-inputs">
          <div v-for="(option, index) in newPollOptions" :key="index" class="option-row">
            <input
              class="poll-option-input"
              v-model="newPollOptions[index]"
              placeholder="Enter option"
            />
            <button v-if="newPollOptions.length > 1" @click="removePollOption(index)">−</button>
          </div>
          <button
            v-if="newPollOptions.length < 5"
            class="add-option-btn"
            @click="addPollOption"
          >
            + Add Option
          </button>
        </div>

        <div class="poll-length-section">
          <label>Poll Length:</label>
          <select v-model="pollDays">
            <option v-for="d in daysOptions" :key="d" :value="d">{{ d }} day{{ d === 1 ? '' : 's' }}</option>
          </select>
          <select v-model="pollHours">
            <option v-for="h in hoursOptions" :key="h" :value="h">{{ h }} hour{{ h === 1 ? '' : 's' }}</option>
          </select>
          <select v-model="pollMinutes">
            <option v-for="m in minutesOptions" :key="m" :value="m">{{ m }} minute{{ m === 1 ? '' : 's' }}</option>
          </select>
        </div>

        <button class="submit-poll-btn" @click="createPoll">Create Poll</button>
      </div>
    </div>

      <div class="poll-scroll">
        <div v-if="currentProfile" class="poll-container">
          <button class="nav-button left" @click="prevProfile">←</button>
          <button class="nav-button right" @click="nextProfile">→</button>

          <!-- Poll Container -->
          <div class="poll-content">
            <div class="poll-profile">
              <img :src="currentProfile.image" alt="Profile Image" class="poll-profile-image" />
              <div class="poll-profile-info">
                <span class="poll-username">{{ currentProfile.name }}</span><br />
                <span class="poll-age-gender">{{ currentProfile.age }}, {{ currentProfile.gender }}</span><br />
                <span class="poll-created-at">
                  Posted: {{ formatDateTime(currentProfile.createdAt) }} ({{ timeAgo(currentProfile.createdAt) }})
                </span>
              </div>
              <button
                v-if="currentProfile.userId === loggedInUserId"
                class="delete-poll-btn"
                @click="deletePoll"
                style="margin-left: auto; background: #ff4d4f; color: white; border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer;"
              >
                Delete Poll
              </button>
            </div>

            <div class="poll-description">
              <p>{{ currentProfile.poll.question }}</p>
            </div>

            <!-- Poll Options -->
            <div class="poll-options-container">
              <div
                class="poll-options"
                v-for="(option, index) in currentProfile.poll.options"
                :key="index"
              >
                <div
                  class="poll-option"
                  :class="{
                    'winner': pollEnded && winningOptionIndex && winningOptionIndex.includes(index)
                  }"
                  @click="currentProfile.userId !== loggedInUserId && !pollEnded && vote(index)"
                  style="cursor: pointer;"
                >
                  <input 
                    type="radio" 
                    :name="`poll-option-${currentIndex.value}`" 
                    :value="index" 
                    :checked="option.voted"
                    :disabled="currentProfile.userId === loggedInUserId || pollEnded"
                    v-model="currentVote" 
                    style="display: none;"
                    readonly
                  />
                  <p :class="{'voted': option.voted}" style="margin-bottom: 0;">
                    {{ option.text }}
                    <span v-if="option.voted" style="color: #080d2a; margin-left: 6px;">✔</span>
                  </p>
                  <span class="poll-percentage">{{ calculatePercentage(index) }}%</span>
                </div>
                <div class="poll-progress-bar-wrapper">
                  <div class="poll-progress-bar-bg">
                    <div
                      class="poll-progress-bar-fill"
                      :style="{ width: calculatePercentage(index) + '%' }"
                    ></div>
                  </div>
                  <span class="poll-progress-bar-label">{{ calculatePercentage(index) }}%</span>
                </div>
              </div>
            </div>

            <!-- Number of Votes -->
            <div class="poll-votes">
              <span>
                {{ totalVotes }} vote{{ totalVotes === 1 ? '' : 's' }} ·
                {{ getTimeLeft(currentProfile.createdAt, currentProfile.pollLengthSeconds) }} left
              </span>
            </div>
          </div>
          
        </div>
        <div v-else class="no-polls-message">
          <p>No polls available yet. Be the first to create one!</p>
        </div>
      </div>
    </div>
  </NavLayout>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import NavLayout from '../layouts/NavLayout.vue'
  import axios from 'axios'
  import { jwtDecode } from "jwt-decode";

  const profiles = ref([])
  const currentIndex = ref(0)
  const hasVoted = ref(false)
  const currentVote = ref(null)
  const showCreatePoll = ref(false)
  const newPollQuestion = ref('')
  const newPollOptions = ref(['', '']) // Start with 2 options

  const token = localStorage.getItem('token');
  let loggedInUserId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      loggedInUserId = decoded.id;
    } catch (e) {
      loggedInUserId = null;
    }
  }

  const API_URL = import.meta.env.VITE_API_URL

  onMounted(fetchPolls)

  async function fetchPolls() {
    try {
      const { data } = await axios.get(`${API_URL}/api/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Transform backend data to match your UI structure
      profiles.value = data.map(poll => ({
        name: poll.user.name,
        age: poll.user.birthday ? calculateAge(poll.user.birthday) : '',
        gender: poll.user.gender || '',
        image: poll.user.profile_image
          ? poll.user.profile_image.startsWith('http')
              ? poll.user.profile_image
              : `http://localhost:3000/${poll.user.profile_image.replace(/^\/+/, '').replace(/\\/g, '/')}`
          : '/src/assets/default-profile.jpg',
        userId: poll.user.id,
        createdAt: poll.created_at, // add this
        pollLengthSeconds: poll.poll_length_seconds, // add this
        poll: {
          question: poll.question,
          options: poll.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: opt.votes,
            voted: false
          })),
          id: poll.id
        }
      }))
      currentIndex.value = 0
      resetVoteState()
    } catch (e) {
      alert('Failed to fetch polls')
    }
  }

  const currentProfile = computed(() =>
    profiles.value.length > 0 ? profiles.value[currentIndex.value] : null
  );

  function nextProfile() {
    if (currentIndex.value < profiles.value.length - 1) {
      currentIndex.value++
      resetVoteState()
    }
  }

  function prevProfile() {
    if (currentIndex.value > 0) {
      currentIndex.value--
      resetVoteState()
    }
  }

  function resetVoteState() {
    hasVoted.value = false
    currentVote.value = null
  }

  async function vote(optionIndex) {
    if (pollEnded.value || currentProfile.value.userId === loggedInUserId) return;
    const poll = profiles.value[currentIndex.value].poll;
    const option = poll.options[optionIndex];
    try {
      await axios.post(`${API_URL}/api/feed/vote`, {
        pollId: poll.id,
        optionId: option.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Stay on the same poll after voting
      const prevIndex = currentIndex.value;
      await fetchPolls();
      currentIndex.value = prevIndex; // Restore index
      hasVoted.value = true;
      currentVote.value = optionIndex;
    } catch (e) {
      alert('Failed to vote');
    }
  }

  function calculatePercentage(optionIndex) {
    const profile = profiles.value[currentIndex.value]
    const optionVotes = profile.poll.options[optionIndex].votes
    const totalVotes = profile.poll.options.reduce((sum, option) => sum + option.votes, 0)
    return totalVotes > 0 ? ((optionVotes / totalVotes) * 100).toFixed(1) : 0
  }

  const totalVotes = computed(() => {
    const profile = profiles.value[currentIndex.value]
    return profile.poll.options.reduce((sum, option) => sum + option.votes, 0)
  })

  // Poll creation logic
  function openCreatePollPopup() {
    showCreatePoll.value = true
  }

  function closeCreatePollPopup() {
    showCreatePoll.value = false
    newPollQuestion.value = ''
    newPollOptions.value = ['']
  }

  function addPollOption() {
    if (newPollOptions.value.length < 5) {
      newPollOptions.value.push('')
    }
  }

  function removePollOption(index) {
    newPollOptions.value.splice(index, 1)
  }

  async function createPoll() {
    const cleanedOptions = newPollOptions.value.filter(opt => opt.trim() !== '');
    if (!newPollQuestion.value.trim() || cleanedOptions.length < 2) {
      alert('Please enter a question and at least two options.');
      return;
    }
    // Calculate total length in seconds (or send as separate fields)
    const pollLengthSeconds = pollDays.value * 86400 + pollHours.value * 3600 + pollMinutes.value * 60;
    if (pollLengthSeconds === 0) {
      alert('Poll length must be greater than 0.');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/feed`, {
        question: newPollQuestion.value.trim(),
        options: cleanedOptions,
        pollLengthSeconds // send this to backend
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      closeCreatePollPopup();
      await fetchPolls();
    } catch (e) {
      alert('Failed to create poll');
    }
  }

  async function deletePoll() {
    if (!confirm('Are you sure you want to delete this poll?')) return;
    const pollId = currentProfile.value.poll.id;
    try {
      await axios.delete(`${API_URL}/api/feed/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchPolls();
    } catch (e) {
      alert('Failed to delete poll.');
    }
  }

  function calculateAge(birthday) {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  function parseMySQLDate(mysqlDateString) {
    // Converts "YYYY-MM-DD HH:MM:SS" to "YYYY-MM-DDTHH:MM:SS"
    if (!mysqlDateString) return null;
    return new Date(mysqlDateString.replace(' ', 'T'));
  }

  function formatDateTime(dateTimeString) {
    const date = parseMySQLDate(dateTimeString);
    return date ? date.toLocaleString() : '';
  }

  function timeAgo(dateTimeString) {
    const posted = parseMySQLDate(dateTimeString);
    if (!posted) return '';
    const now = new Date();
    const diffMs = now - posted;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffSec > 10) return `${diffSec} seconds ago`;
    return 'just now';
  }

  const pollDays = ref(0);
  const pollHours = ref(0);
  const pollMinutes = ref(0);

  const daysOptions = Array.from({ length: 8 }, (_, i) => i);      // 0-7
  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);     // 0-23
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i);   // 0-59

  function getTimeLeft(createdAt, pollLengthSeconds) {
    const created = parseMySQLDate(createdAt);
    if (!created || !pollLengthSeconds) return '';
    const endTime = new Date(created.getTime() + pollLengthSeconds * 1000);
    const now = new Date();
    let diff = Math.max(0, Math.floor((endTime - now) / 1000)); // in seconds

    const days = Math.floor(diff / 86400);
    diff %= 86400;
    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const minutes = Math.floor(diff / 60);

    let parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0 && days === 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
    if (parts.length === 0) return 'ended';
    return parts.join(' ');
  }

  const pollEnded = computed(() => {
    if (!currentProfile.value) return false;
    const created = parseMySQLDate(currentProfile.value.createdAt);
    const pollLength = currentProfile.value.pollLengthSeconds;
    if (!created || !pollLength) return false;
    const endTime = new Date(created.getTime() + pollLength * 1000);
    return new Date() > endTime;
  });

  const winningOptionIndex = computed(() => {
    if (!currentProfile.value || !pollEnded.value) return null;
    const options = currentProfile.value.poll.options;
    if (!options.length) return null;
    // Find the index of the option(s) with the most votes
    const maxVotes = Math.max(...options.map(opt => opt.votes));
    // If there are multiple winners, highlight all
    return options
      .map((opt, idx) => (opt.votes === maxVotes && maxVotes > 0 ? idx : null))
      .filter(idx => idx !== null);
  });

  
</script>


<style scoped>
.poll-wrapper {
  background-color: #ddb0d7;
  padding: 2rem;
  min-height: 100vh;
  overflow: auto;
  color: black;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  margin-top: 80px;
  margin-left: 270px;
}

.create-poll-container {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 auto 0.5rem auto;
  width: 890px;
}

.create-poll-container i {
  font-size: 1.2rem;
  color: white;
  background-color: #080d2a;
  border: 1px solid black;
  padding: 7px 8px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
  cursor: pointer;
}

.create-poll-button {
  background-color: #080d2a;
  color: white;
  border: 1px solid black;
  padding: 7px 28px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 50px;
  line-height: 1;
  height: auto;
  display: flex;
  align-items: center;
}

.create-poll-button:hover {
  background-color: #1c1b2e;
  color: #ddb0d7;
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
  z-index: 2000;
}

.popup-container {
  background: #080d2a;
  padding: 2rem;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  position: relative;
}

.popup-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 1rem;
}

.popup-header h2 {
  font-size: 1.5rem;
  color: white;
}

.close-btn {
  position: absolute;
  top: -20px;
  right: 0;
  font-size: 2.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: white;
}

.close-btn:hover{
  color: #ddb0d7;
}

.poll-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid white;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.options-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
}

.options-inputs {
  margin-bottom: 1rem;
}

.option-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.poll-option-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #aaa;
  border-radius: 6px;
}

.option-row button {
  background-color: #ddd;
  border: none;
  padding: 0 0.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 6px;
}

.add-option-btn {
  margin-top: 0.5rem;
  background: none;
  border: 1px dashed white;
  padding: 0.4rem 0.7rem;
  cursor: pointer;
  color: white;
  border-radius: 6px;
}

.submit-poll-btn {
  background-color: white;
  color: #080d2a;
  border: none;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
}

.submit-poll-btn:hover {
  background-color: #ddb0d2;
  color: #080d2a;
}

.poll-scroll {
  display: flex;
  justify-content: center;
}

.poll-container {
  background-color: #080d2a;
  border-radius: 12px;
  padding: 3rem;
  width: 900px;
  height: 550px;
  position: relative;
  perspective: 1500px;
  user-select: none;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  border: 2px solid #080d2a;
  color: #080d2a;
  font-size: 2rem;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  z-index: 10;
  user-select: none;
}

.nav-button.left {
  left: 15px;
}

.nav-button.right {
  right: 15px;
}

.poll-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #ffffff;
  flex-grow: 0;
}

.refresh-label {
  font-weight: bold;
  font-size: 0.9rem;
}

.refresh-time {
  font-size: 0.9rem;
}

.profile-count {
  background-color: #1c1b2e;
  padding: 0.3rem 0.7rem;
  border-radius: 30px;
  font-size: 0.8rem;
  display: inline-block;
}

.poll-content {
  background-color: rgba(108, 119, 178, 0.35);
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 20px;
  text-align: center;
  color: #ffffff;
  width: 800px;
  height: 400px;
}

.poll-profile {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.poll-profile-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
}

.poll-profile-info {
  color: #fff;
  text-align: left;
}

.poll-username {
  font-size: 2rem;
  font-weight: bold;
}

.poll-age-gender {
  font-size: 1rem;
  color: #fff;
}

.poll-description {
  font-size: 1rem;
  margin: 1.5rem 0;
  text-align: left;
}

.poll-options-container {
  background-color: rgba(218, 171, 224, 0.7); 
  border: 4px solid white;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  width: 750px;
  height: 140px; 
  overflow-y: auto; 
}

.poll-options {
  text-align: left;
}

.poll-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.7rem;
}

.poll-option input[type="radio"] {
  transform: scale(1.5);
  cursor: pointer;
  margin-right: 1rem;
}

.poll-option p {
  font-size: 1rem;
  cursor: pointer;
  flex-grow: 1;
}

.poll-percentage {
  font-size: 1rem;
  text-align: right;
  color: #ffffff;
}

.poll-option input[type="radio"]:checked + p + .poll-percentage {
  color: #080d2a;
}

.poll-votes {
  font-size: 12px;
  color: #fff;
  text-align: right;
  margin-top: 1rem;
}

.voted {
  color: #080d2a;
  font-weight: bold;
}

.no-polls-message {
  text-align: center;
  color: #080d2a;
  font-size: 1.5rem;
  margin-top: 2rem;
}

.poll-created-at {
  font-size: 12px;
  color: #e0e0e0;
}

.poll-progress-bar-wrapper {
  display: flex;
  align-items: center;
  width: 180px;
  margin-left: 12px;
}

.poll-progress-bar-bg {
  background: #e0e0e0;
  border-radius: 8px;
  width: 120px;
  height: 16px;
  margin-right: 8px;
  overflow: hidden;
  position: relative;
}

.poll-progress-bar-fill {
  background: linear-gradient(90deg, #ddb0d7 0%, #080d2a 100%);
  height: 100%;
  border-radius: 8px 0 0 8px;
  transition: width 0.4s;
}

.poll-progress-bar-label {
  font-size: 0.95rem;
  color: #080d2a;
  min-width: 38px;
  text-align: right;
}

</style>
