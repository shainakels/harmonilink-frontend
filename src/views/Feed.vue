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

          <button class="submit-poll-btn" @click="createPoll">Create Poll</button>
        </div>
      </div>

      <div class="poll-scroll">
        <button 
          class="nav-button left" 
          @click="prevProfile" 
          :disabled="currentIndex === 0 || hasVoted"
        > 
          <i class="fa-solid fa-circle-arrow-left"></i>
        </button>

        <div class="poll-container">
          <!-- Poll Container -->
          <div class="poll-content">
            <div class="poll-profile">
              <img :src="currentProfile.image" alt="Profile Image" class="poll-profile-image" />
              <div class="poll-profile-info">
                <span class="poll-username">{{ currentProfile.name }}</span><br />
                <span class="poll-age-gender">{{ currentProfile.age }}, {{ currentProfile.gender }}</span>
              </div>
            </div>

            <div class="poll-description">
              <p>{{ currentProfile.poll.question }}</p>
            </div>

            <!-- Poll Options -->
            <div class="poll-options-container">
              <div class="poll-options" v-for="(option, index) in currentProfile.poll.options" :key="index">
                <div class="poll-option">
                  <input 
                    type="radio" 
                    :name="`poll-option-${currentIndex.value}`" 
                    :value="index" 
                    :disabled="hasVoted"
                    v-model="currentVote" 
                    @change="vote(index)"
                  />
                  <p :class="{'voted': option.voted}">{{ option.text }}</p>
                  <span class="poll-percentage">{{ calculatePercentage(index) }}%</span>
                </div>
              </div>
            </div>

            <!-- Number of Votes -->
            <div class="poll-votes">
              <span>Number of Votes: {{ totalVotes }}</span>
            </div>
          </div>
        </div>

        <button 
          class="nav-button right" 
          @click="nextProfile" 
          :disabled="currentIndex === profiles.length - 1 || hasVoted"
        > 
          <i class="fa-solid fa-circle-arrow-right"></i>
        </button>
      </div>
    </div>
  </NavLayout>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import NavLayout from '../layouts/NavLayout.vue'

  // temporary placeholders 
  const profiles = ref([
    {
      name: 'Aso',
      age: 19,
      gender: 'Male',
      image: '/src/assets/test1.png',
      poll: {
        question: 'What’s your favorite music genre?',
        options: [
          { text: 'Pop', votes: 0, voted: false },
          { text: 'Rock', votes: 0, voted: false },
          { text: 'Hip-Hop', votes: 0, voted: false }
        ]
      }
    },
    {
      name: 'Pusa',
      age: 20,
      gender: 'Male',
      image: '/src/assets/test2.png',
      poll: {
        question: 'What’s your favorite season?',
        options: [
          { text: 'Spring', votes: 0, voted: false },
          { text: 'Summer', votes: 0, voted: false },
          { text: 'Fall', votes: 0, voted: false },
          { text: 'Winter', votes: 0, voted: false }, 
          { text: 'Monsoon', votes: 0, voted: false }
        ]
      }
    },
    {
      name: 'Ibon',
      age: 21,
      gender: 'Male',
      image: '/src/assets/test3.png',
      poll: {
        question: 'What’s your favorite animal?',
        options: [
          { text: 'Dog', votes: 0, voted: false },
          { text: 'Cat', votes: 0, voted: false },
          { text: 'Bird', votes: 0, voted: false }
        ]
      }
    }
  ])

  const currentIndex = ref(0)
  const currentProfile = computed(() => profiles.value[currentIndex.value])
  const hasVoted = ref(false)
  const currentVote = ref(null)

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

  function vote(optionIndex) {
    if (!hasVoted.value) {
      const profile = profiles.value[currentIndex.value]
      profile.poll.options[optionIndex].votes++
      profile.poll.options[optionIndex].voted = true
      hasVoted.value = true
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
  const showCreatePoll = ref(false)
  const newPollQuestion = ref('')
  const newPollOptions = ref([''])

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

  function createPoll() {
    const cleanedOptions = newPollOptions.value
      .filter(opt => opt.trim() !== '')
      .map(opt => ({
        text: opt.trim(),
        votes: 0,
        voted: false
      }))

    if (!newPollQuestion.value.trim() || cleanedOptions.length < 2) {
      alert('Please enter a question and at least two options.')
      return
    }

    const newProfile = {
      name: 'You',
      age: 0,
      gender: 'Unknown',
      image: '/src/assets/default-profile.png',
      poll: {
        question: newPollQuestion.value.trim(),
        options: cleanedOptions
      }
    }

    profiles.value.push(newProfile)
    currentIndex.value = profiles.value.length - 1
    resetVoteState()
    closeCreatePollPopup()
  }
</script>

<style scoped>
.poll-wrapper {
  padding: 2rem;
  background-color: #dbb4d7;
  min-height: calc(100vh - 100px);
  color: black;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  margin-top: 80px;
  margin-left: 270px;
}

.poll-container {
   box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
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

.close-btn:hover {
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
  background-color: #ddb0d7;
  color: #080d2a;
}

.poll-scroll {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* Added for positioning nav buttons */
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
  top: 50%;
  transform: translateY(-20%);
  background: none;
  border: none;
  font-size: 2.5rem;
  color: #080d2a;
  cursor: pointer;
  z-index: 1;
  flex-direction: column; 
  gap: 1rem; 
}

.nav-button {
  outline: none;
  box-shadow: none;
}

.nav-button:focus {
  outline: none;
  box-shadow: none;
}

.nav-button:active {
  outline: none;
  box-shadow: none;
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
  font-size: 1rem;
  color: #fff;
  text-align: right;
  margin-top: 1rem;
}

.voted {
  color: #080d2a;
  font-weight: bold;
}
</style>