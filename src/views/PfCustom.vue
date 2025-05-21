<template>
  <transition name="fade">
    <div>
      <img src="/src/assets/background.png" alt="background" class="background">

      <div class="setup-text">Let's set up your Profile</div>

      <div class="profile-setup">
        <p>My Birthday</p>
        <div class="birthday-inputs">
          <input
            type="text"
            v-model="month"
            placeholder="MM"
            @input="onMonthInput"
            maxlength="2"
          />

          <input
            type="text"
            v-model="day"
            placeholder="DD"
            @input="onDayInput"
            maxlength="2"
          />

          <input
            type="text"
            v-model="year"
            placeholder="YYYY"
            @input="onYearInput"
            maxlength="4"
          />
        </div>

        <p>I identify as ...</p>
        <div class="gender-options">
          <button class="gender-button" :class="{ selected: selectedGender === 'Female' }" @click="selectGender('Female')">Female</button>
          <button class="gender-button" :class="{ selected: selectedGender === 'Male' }" @click="selectGender('Male')">Male</button>
          <button class="gender-button" :class="{ selected: selectedGender === 'Non-Binary' }" @click="selectGender('Non-Binary')">Non-Binary</button>
          <button class="gender-button" :class="{ selected: selectedGender === 'Other' }" @click="selectGender('Other')">Other</button>
        </div>

        <p>Tell People More About You!</p>
        <textarea v-model="bio" placeholder="Write something about yourself..."></textarea>

        <button class="continue-button" @click="saveProfile">Continue</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const selectedGender = ref('');
const month = ref('');
const day = ref('');
const year = ref('');
const bio = ref('');

const currentYear = new Date().getFullYear();

function selectGender(gender) {
  selectedGender.value = gender;
}

// Helper to check if a date is valid
function isValidDate(y, m, d) {
  const date = new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  // Check if date is valid and matches input (handles leap years, month lengths, etc.)
  return (
    date.getFullYear() === Number(y) &&
    date.getMonth() + 1 === Number(m) &&
    date.getDate() === Number(d)
  );
}

function onMonthInput(e) {
  let val = e.target.value.replace(/\D/g, ''); // allow digits only
  if (val.length > 2) val = val.slice(0, 2);

  // Clamp month between 1 and 12 only if user has entered 2 digits
  if (val.length === 2) {
    const num = parseInt(val, 10);
    if (num < 1) val = '01';
    else if (num > 12) val = '12';
  }

  month.value = val;
}

function onDayInput(e) {
  let val = e.target.value.replace(/\D/g, ''); // digits only
  if (val.length > 2) val = val.slice(0, 2);

  // Only clamp day if input length is 2 (user finished typing)
  if (val.length === 2) {
    const num = parseInt(val, 10);
    if (num < 1) val = '01';
    else if (num > maxDay.value) val = maxDay.value.toString();
  }

  day.value = val;
}

function onYearInput(e) {
  let val = e.target.value.replace(/\D/g, ''); // digits only
  if (val.length > 4) val = val.slice(0, 4);

  // Only clamp year if input length is 4 (user finished typing)
  if (val.length === 4) {
    const num = parseInt(val, 10);
    if (num < 1900) val = '1900';
    else if (num > currentYear) val = currentYear.toString();
  }

  year.value = val;
}



// Compute max day for the selected month/year (handles leap years)
const maxDay = computed(() => {
  const y = Number(year.value) || 2000;
  const m = Number(month.value) || 1;
  return new Date(y, m, 0).getDate();
});

const saveProfile = async () => {
  // Validate year, month, day
  const y = Number(year.value);
  const m = Number(month.value);
  const d = Number(day.value);

  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  if (
    !y || !m || !d ||
    y < 1900 || y > currentYear ||
    m < 1 || m > 12 ||
    d < 1 || d > maxDay.value ||
    !isValidDate(y, m, d)
  ) {
    alert('Please enter a valid date.');
    return;
  }

  // Prevent future dates
  const inputDate = new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  const today = new Date();
  if (inputDate > today) {
    alert('Birthday cannot be in the future.');
    return;
  }

  const birthday = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const user_id = localStorage.getItem('user_id'); 

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/pfcustom`, {
      user_id,
      birthday,
      gender: selectedGender.value,
      bio: bio.value,
    });

    if (response.data.status === 'success') {
      localStorage.setItem('onboardingStep', 'pfmixtape'); 
      router.push('/pfmixtape'); 
    } else {
      alert(response.data.message || 'Something went wrong!');
    }
  } catch (error) {
    console.error(error);
    alert('Failed to save profile. Please try again.');
  }
};
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


.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease-in-out; 
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.setup-text {
  position: absolute;
  top: 3rem; 
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  color: #ffffff;
  text-align: center;
}

.profile-setup {
  background-color: #080d2a;
  width: 35rem;
  height: 30rem;
  padding: 2rem;
  border-radius: 15px;
  color: white;
  position: absolute;
  top: 57%;
  left: 50%;
  transform: translate(-50%, -50%);
}

p {
  font-size: 1.5rem;
  margin: 1rem;
  margin-bottom: 1.2rem;
}

.birthday-inputs {
  display: flex;
  gap: 2.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.birthday-inputs input {
  background: rgba(235, 235, 235, 0.7);
  border: none;
  padding: 9px;
  width: 7rem;
  text-align: center;
  font-size: 1rem;
  color: #080d2a;
  border-radius: 5px;
}

.gender-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.gender-button {
  background: rgba(235, 235, 235, 0.7);
  border: none;
  padding: 9px 25px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1rem;
}

.gender-button.selected {
  background-color: #dbb4d7;
  color: #080d2a;
}

textarea {
  width: 470px !important;
  height: 90px;
  background: rgba(235, 235, 235, 0.7);
  border: none;
  padding: 10px;
  margin-left: 2rem;
  font-size: 1rem;
  border-radius: 5px;
  resize: none;
}

.continue-button {
  background: #dbb4d7;
  color: #080d2a;
  padding: 5px 30px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  display: block; 
  margin-left: auto;
  margin-right: auto;
}

.continue-button:hover {
  background: #080d2a;
  color: #dbb4d7;
  border: 1px solid #ebebeb;
}

input:focus,
textarea:focus {
  outline: none;
  background-color: #dbb4d7;
}
</style>