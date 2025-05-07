<!-- src/layouts/NavLayout.vue -->
<template>
    <div class="layout-wrapper">
      <NavBar />
      <div class="layout-container">
        <SideNav />
        <div class="page-content">
          <slot />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import NavBar from '../components/NavBar.vue'
  import SideNav from '../components/SideBar.vue'
  </script>
  
  <style scoped>
  .layout-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh; 
  }
  
  .layout-container {
    display: flex;
    flex: 1; 
    overflow: hidden;
  }
  
  .page-content {
    flex: 1;
    padding: 20px;
    margin-left: 270px; 
    overflow-y: auto;
    height: 100vh; 
    position: relative; 
  }
  
  .NavBar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px; 
    z-index: 1000; 
  }
  
  .SideNav {
    position: fixed;
    top: 60px;
    left: 0;
    width: 270px; 
    height: calc(100vh - 60px); 
    z-index: 900;
    overflow-y: auto; 
  }
  </style>