<template>
  <transition name="fade">
    <div>
      <!--REPLACED TO THIS-->
      <div class="background"></div>

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
          <button class="gender-button" :class="{ selected: selectedGender === 'Prefer not to say' }" @click="selectGender('Prefer not to say')">Prefer not to say</button>
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
  let val = e.target.value.replace(/\D/g, ''); 
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
  let val = e.target.value.replace(/\D/g, ''); 
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
  let val = e.target.value.replace(/\D/g, ''); 
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

/*CHANGED .background*/
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(120deg, #e3b8ff 0%, #dbb4d7 25%, #c697bd 50%, #8a6bb8 75%, #322848 100%);
  background-size: 200% 200%; 
  display: flex;
  flex-direction: column;
  transform: rotate(180deg);
  animation: gradientMove 12s ease-in-out infinite;
  transition: background-position 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/*ADDED THIS*/
@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease-in-out; 
}
.fade-enter, .fade-leave-to {
  opacity: 0;
<<<<<<< HEAD
}

/* added font weigtht */
.setup-text {
  width: 100%;
  position: absolute;
  top: 3rem; 
  left: 50%;
  transform: translateX(-50%);
  font-size: 35pt;
  color: #322848;
  text-align: center;
  font-weight: 425;
}

/* EDITED THIS FOR GLASSMORPHISM */
.profile-setup {
  background: rgba(255, 255, 255, 0.55);
  width: 50%;
  height: auto;
  padding: 2rem;
  border-radius: 15px;
  color: #322848;
  position: absolute;
  top: 57%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

/* ADDED HOVER EFFECT */
.profile-setup:hover {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.35);
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

p {
  font-size: 1.5rem;
  margin: 0.1rem 1rem 1rem 1rem;
  margin-bottom: 1.2rem;
}

/*EDITED*/
.birthday-inputs {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

=======
}

/* added font weigtht */
.setup-text {
  position: absolute;
  top: 3rem; 
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  color: #322848;
  text-align: center;
  font-weight: 425;
}

/* EDITED THIS FOR GLASSMORPHISM */
.profile-setup {
  background: rgba(255, 255, 255, 0.55);
  width: 42rem;
  height: 33rem;
  padding: 2rem;
  border-radius: 15px;
  color: #322848;
  position: absolute;
  top: 57%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

/* ADDED HOVER EFFECT */
.profile-setup:hover {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.35);
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

p {
  font-size: 1.5rem;
  margin: 0.1rem 1rem 1rem 1rem;
  margin-bottom: 1.2rem;
}

/*EDITED*/
.birthday-inputs {
  display: flex;
  gap: 2.5rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

>>>>>>> main
/* EDITED */
.birthday-inputs input {
  width: 95%;
  height: 42px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.495);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  font-size: 15px;
  color: #322848;
  transition: all 0.3s ease;
  margin: 0 0.5rem;
  text-align: center;
}
/* ADDED */
.birthday-inputs input::placeholder {
  color: rgba(50, 40, 72, 0.6);
}
/* ADDED */
.birthday-inputs input:focus {
  outline: none;
  background: #3228485a;
  color: #fff;
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
}

.gender-options {
<<<<<<< HEAD
  display: block;
=======
  display: flex;
  gap: 1rem;
>>>>>>> main
  justify-content: center;
  margin-bottom: 2rem;
}

/* EDITED */
.gender-button {
  background: rgba(255, 255, 255, 0.495);
  border: none;
  padding: 9px 25px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1rem;
  color: #32284889;
  font-weight: 400;
<<<<<<< HEAD
  margin:5px;
=======
>>>>>>> main
}

/*EDITED*/
.gender-button.selected,
.gender-button:focus {
  background-color: #3228485a !important;
  color: #322848 !important;
  border: none;
  outline: none;
}

/* EDITED */
textarea {
  width: 95% !important;
  height: 90px;
  background: rgba(255, 255, 255, 0.495);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 15px;
  color: #322848;
  transition: all 0.3s ease;
  resize: none;
  margin-left: 0;
}
/*ADDED*/
textarea::placeholder {
  color: rgba(50, 40, 72, 0.6);
}
/*ADDED*/
textarea:focus {
  outline: none;
  background: #3228485a;
  color: #fff;
  box-shadow: 0 8px 12px rgba(31, 13, 62, 0.08);
}
/*EDITED*/
.continue-button {
  width: 50%;
  height: 45px;
  padding: 10px;
  background: #322848;
  color: #fff;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  outline: none;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
/*EDITED*/
.continue-button:hover {
  background: #322848;
  color: #dbb4d7;
  transform: translateY(-1px);
  box-shadow: 0 0 10px #8a6bb8, 0 0 20px #c697bd, 0 0 30px #dbb4d7;
  border: none;
}
/*ADDED*/
.continue-button:focus {
  outline: none;
}
/*ADDED*/
.continue-button:disabled {
  background: #888;
  cursor: not-allowed;
}

input:focus,
textarea:focus {
  outline: none;
  background-color: #3228485a;
}
<<<<<<< HEAD


/* Responsive styles */
@media (max-width: 768px) {
  .profile-setup{
    width: 80%;
  }
  .setup-text{
    font-size: 20pt;
  }
  }
  /* Additional styles for very small screens */
  @media (max-width: 480px) {
.profile-setup{
    width: 90%;
  }
  .setup-text{
    font-size: 15pt;
  }
  }
=======
>>>>>>> main
</style>