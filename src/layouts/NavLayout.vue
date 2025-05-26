<!-- src/layouts/NavLayout.vue -->
<template>
    <div class="layout-wrapper">
      <NavBar />
      <div class="layout-container">
        <SideNav />
        <div class="page-content">
          <slot/>
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
    width: 100vw;
    overflow-x: hidden;
  }
 
  .layout-container {
    flex: 1;
    display: flex;
    margin-top: 60px; /* Height of navbar */
    height: calc(100vh - 60px);
    position: relative;
  }
 
  .page-content {
    flex: 1;
    overflow-y: auto;
    position: relative;
    margin-left: 270px; /* Width of sidebar */
    width: calc(100% - 270px);
    transition: margin-left 0.3s ease, width 0.3s ease;
  }
 
  .NavBar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    z-index: 100;
  }
 
  .SideNav {
    position: fixed;
    top: 60px;
    left: 0;
    width: 270px;
    height: calc(100vh - 60px);
    overflow-y: auto;
    z-index: 90;
  }

  /* Responsive styles */
  @media (max-width: 768px) {
    .layout-container {
      flex-direction: column;
    }

    .page-content {
      margin-left: 0;
      width: 100%;
      height: calc(100vh - 120px); /* Account for navbar and collapsed sidebar */
    }
  }

  @media (max-width: 480px) {
    .layout-wrapper {
      height: auto;
      min-height: 100vh;
    }

    .page-content {
      padding: 10px;
    }
  }
  </style>

