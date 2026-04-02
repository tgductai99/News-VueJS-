<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom shadow-sm sticky-top">
        <div class="container-fluid">
            
            <h5 class="mb-0 ms-3 d-none d-sm-block">Trang quản trị</h5>

            <ul class="navbar-nav ms-auto mt-2 mt-lg-0">
                <li class="nav-item me-2">
                    <span class="nav-link text-dark fw-bold">Xin chào, {{ userName }}!</span>
                </li>
                <li class="nav-item">
                    <router-link :to="{ name: 'Home' }" class="btn btn-outline-success btn-sm">
                        <i class="fas fa-globe me-1"></i> Xem Website
                    </router-link>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const userName = ref('Quản trị viên');

onMounted(() => {
    const storedUserName = localStorage.getItem('userName'); 
    if (storedUserName) {
        userName.value = storedUserName;
    } else {
        userName.value = localStorage.getItem('userRole') || 'Quản trị viên';
    }
});
</script>