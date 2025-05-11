<template>
  <NavLayout>
    <div class="favorites-wrapper">
      <h1>Your Favorites</h1>
      <div v-if="favorites.length === 0" class="no-favorites">
        <p>You have no favorites yet.</p>
      </div>
      <div v-else class="favorites-list">
        <div v-for="favorite in favorites" :key="favorite.mixtape_id" class="favorite-card">
          <h2>{{ favorite.mixtape_name }}</h2>
          <p>{{ favorite.mixtape_bio }}</p>
          <img :src="favorite.photo_url" alt="Mixtape Cover" />
        </div>
      </div>
    </div>
  </NavLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NavLayout from '../layouts/NavLayout.vue';
import axios from 'axios';

const favorites = ref([]);

async function fetchFavorites() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You must be logged in to view favorites.');
      return;
    }

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    favorites.value = response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    alert('Failed to fetch favorites. Please try again.');
  }
}

onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.favorites-wrapper {
  padding: 2rem;
  text-align: center;
}

.favorite-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  text-align: left;
}

.favorite-card img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}
</style>