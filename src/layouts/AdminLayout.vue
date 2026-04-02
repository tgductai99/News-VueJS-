<template>
    <div class="d-flex min-vh-100">
        
        <AdminSidebar />
        
        <div class="d-flex flex-column flex-grow-1">
            
            <AdminNavbar />

            <main class="container-fluid p-4 flex-grow-1">
                <RouterView />
            </main>
        </div>
    </div>
</template>

<script setup>
import AdminSidebar from '../components/admin/AdminSidebar.vue';
import AdminNavbar from '../components/admin/AdminNavbar.vue';
</script>

<style>
</style>