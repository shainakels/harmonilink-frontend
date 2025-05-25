<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router';

const router = useRouter();
const message = ref("Loading...")

onMounted(async () => {
  const res = await axios.get("http://localhost:3000/")
  message.value = res.data
})

</script>

<template>
  <router-view />
</template>