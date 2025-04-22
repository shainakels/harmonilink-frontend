<template>
    <div class="terms-page">
      <div class="terms-container">
        <h1>Data Privacy Notice</h1>
        <p>
          At <strong>HarmoniLink</strong>, we value your privacy and are fully committed to safeguarding your personal
          information in accordance with the <strong>Data Privacy Act of 2012 (RA 10173)</strong>.
        </p>
  
        <p>
          By signing up and using our services, you consent to the <strong>collection, use, storage, and processing</strong>
          of your personal data—including, but not limited to, your name, email address, and account credentials. This
          data is collected solely for the purpose of delivering and enhancing the features and functionality of our
          platform.
        </p>
  
        <ul>
          <li>Your personal information is kept <strong>secure and confidential</strong>.</li>
          <li>Your data will <strong>not be shared with third parties</strong> without your explicit consent, unless required by law.</li>
          <li>You retain the <strong>right to access, correct, update, or withdraw</strong> your personal data at any time.</li>
        </ul>
  
        <p>
          We are committed to using your information responsibly and transparently.
        </p>
  
        <p>
          For more detailed information, please read our complete
          <router-link to="/privacy-policy" class="privacy-link">Privacy Policy</router-link>.
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
.terms-page {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-image: url('/src/assets/background.png'); 
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 4rem 1rem;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: -1;
}

.terms-container {
  max-width: 800px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  padding: 2rem;
  color: #1f0d3e;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  width: 100%;
  z-index: 1;
}

.terms-container h1 {
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: bold;
}

.terms-container p {
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.terms-container a {
  color: #6e32a5;
  text-decoration: underline;
}
</style>