<template>
  <div class="d-flex flex-column min-vh-100 bg-light">
    <TheNavBar /> 
    
    <main class="flex-grow-1">
      <RouterView /> 
    </main>
    
    <TheFooter />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import TheNavBar from '../components/common/TheNavBar.vue'; 
import TheFooter from '../components/common/TheFooter.vue'; 
</script>

<style>
</style>