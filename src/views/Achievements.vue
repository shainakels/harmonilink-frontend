<template>
  <NavLayout>
    <div class="achievements-wrapper">
      <h1 class="achievements-title">User Achievements</h1>
      <p class="achievements-description">
        Level Up Your Music Journey! Unlock badges, earn recognition, and show off your vibes!
      </p>

      <div class="achievements-grid">
        <div class="favorite-box achievement-box" v-for="(achievement, index) in achievements" :key="index">
          <i class="fa-solid fa-star achievement-star"></i>
          <div class="achievement-content">
            <h2 class="achievement-title">{{ achievement.title }}</h2>
            <hr class="separator" />
            <p class="achievement-description">{{ achievement.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </NavLayout>
</template>

<script setup>
import { ref } from 'vue'
import NavLayout from '../layouts/NavLayout.vue'

const achievements = ref([
  {
    title: 'Debut Drop',
    description: 'You’ve shared your first mixtape! Let the world hear your vibe.',
  },
  {
    title: 'Rising Start',
    description: 'Your mixtape is getting noticed! You\'ve received 10 likes—keep the good vibes going!',
  },
  {
    title: 'A HarmoBuddy',
    description: 'You’ve made your first connection! Great music is better with friends.',
  }
])
</script>

<style scoped>
.achievements-wrapper {
  padding: 2rem;
  background-color: #dbb4d7;
  min-height: 100vh;
  overflow: auto;
  color: black;
  display: flex;
  flex-direction: column;
}

.achievements-title {
  font-size: 2rem;
  font-weight: bold;
  color: black;
}

.achievements-description {
  font-size: 1rem;
  margin-bottom: 2rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.favorite-box.achievement-box {
  background-color: #080d2a;
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  
}

.achievement-star {
  position: absolute;
  top: 1.7rem;
  right: 1.7rem;
  color: #ffb703;
  font-size: 2.5rem;
  pointer-events: none;
}

.achievement-content {
  display: flex;
  flex-direction: column;
}

.achievement-title {
  font-size: 1.7rem;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.separator {
  border: none;
  height: 1px;
  background-color: #aaa;
  margin: 1rem 0;
  width: 100%;
}

.achievement-description {
  font-size: 0.95rem;
  padding: 0 0.5rem;
}
</style>