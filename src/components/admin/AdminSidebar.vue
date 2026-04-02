<template>
    <div class="bg-dark border-end vh-100 sticky-top" style="width: 250px;">
        <div class="p-3 text-white fw-bold border-bottom border-secondary">
            <i class="fas fa-screwdriver-wrench me-2"></i> ADMIN DASHBOARD
        </div>
        <div class="list-group list-group-flush">
            
            <router-link
            :to="{ name: 'AdminDashboard' }"
            :class="['list-group-item', 'list-group-item-action', 'bg-dark', 'text-white', 'border-secondary', {'active': $route.name === 'AdminDashboard'}]"
            >
            <i class="fas fa-home me-2"></i> Dashboard
            </router-link>

            <router-link
            :to="{ name: 'NewsManager' }"
            :class="['list-group-item', 'list-group-item-action', 'bg-dark', 'text-white', 'border-secondary', {'active': $route.name.includes('Post') || $route.name.includes('News')}]"
            >
            <i class="fas fa-newspaper me-2"></i> Quản lý Bài viết
            </router-link>

            <router-link
            :to="{ name: 'UserManager' }"
            :class="['list-group-item', 'list-group-item-action', 'bg-dark', 'text-white', 'border-secondary', {'active': $route.name.includes('User')}]"
            >
            <i class="fas fa-users me-2"></i> Quản lý Người dùng
            </router-link>

            <router-link
            :to="{ name: 'CommentManager' }"
            :class="['list-group-item', 'list-group-item-action', 'bg-dark', 'text-white', 'border-secondary', {'active': $route.name.includes('Comment')}]"
            >
            <i class="fas fa-comments me-2"></i> Quản lý Bình luận
            </router-link>
            
            <router-link
            :to="{ name: 'AdminProfile' }"
            :class="['list-group-item', 'list-group-item-action', 'bg-dark', 'text-white', 'border-secondary', {'active': $route.name === 'AdminProfile'}]"
            >
            <i class="fas fa-user-circle me-2"></i> Hồ sơ cá nhân
            </router-link>
            
            <a href="#" @click.prevent="logout" class="list-group-item list-group-item-action bg-dark text-danger border-secondary mt-3">
            <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
            </a>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem('user');
  localStorage.removeItem("userRole"); 
//   localStorage.removeItem("userId"); 
  localStorage.removeItem("userName"); 
  router.push({ name: 'Home' });
};
</script>