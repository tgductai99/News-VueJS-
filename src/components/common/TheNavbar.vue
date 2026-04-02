<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-2" style="top: 0; z-index: 1100;">
    <div class="container">
      <router-link :to="{ name: 'Home' }" class="navbar-brand d-flex align-items-center fw-bold text-primary">
        <i class="fas fa-newspaper me-2 fs-4"></i> POLY NEWS
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mx-auto">
          <li v-for="item in navItems" :key="item.slug" class="nav-item mx-2">
            <router-link 
              :to="{ name: 'Category', params: { categorySlug: item.slug } }" 
              class="nav-link fw-semibold px-0 text-dark" 
              :class="{
                // 🌟 Sửa logic active: So sánh slug trong route hiện tại với slug của item
                'router-link-active text-primary border-bottom border-primary border-3': 
                  $route.name === 'Category' && $route.params.categorySlug === item.slug
              }"
            >
              {{ item.name }}
            </router-link>
          </li>
        </ul>

        <div class="d-flex align-items-center">
          
          <router-link v-if="isAdmin" :to="{ name: 'AdminDashboard' }" class="btn btn-danger me-3 rounded-pill fw-semibold btn-sm">
            <i class="fas fa-user-shield me-1"></i> Admin
          </router-link>

          <template v-if="!isLoggedIn">
            <router-link :to="{ name: 'Login' }" class="btn btn-outline-primary me-2 rounded-pill btn-sm">
              Đăng nhập
            </router-link>
            <router-link :to="{ name: 'Register' }" class="btn btn-primary rounded-pill btn-sm">
              Đăng ký
            </router-link>
          </template>

          <div v-else class="dropdown">
            <button class="btn btn-outline-dark dropdown-toggle rounded-pill btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-user-circle me-1"></i> {{ userName }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link :to="{ name: 'UserProfile' }" class="dropdown-item">
                  <i class="fas fa-id-card me-2"></i> Hồ sơ
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button @click="handleLogout" class="dropdown-item text-danger">
                  <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- LOGIC XÁC THỰC THỰC TẾ (Giữ nguyên) ---
const isLoggedIn = ref(false);
const userRole = ref('User');
const userName = ref('Khách');

const checkAuthStatus = () => {
  isLoggedIn.value = localStorage.getItem('isAuthenticated') === 'true';
  
  let user = null;
  try {
      const userJson = localStorage.getItem('user');
      if (userJson && userJson !== 'undefined') {
           user = JSON.parse(userJson);
      }
  } catch (e) {
      user = null;
  }
  
  if (user) {
      // *** ĐÃ SỬA: Lấy role và name trực tiếp từ đối tượng user ***
      userRole.value = user.role || 'User';
      userName.value = user.name || user.email; // Ưu tiên tên, nếu không có thì lấy email
  } else {
      userRole.value = 'User';
      userName.value = 'Khách';
  }
};

const isAdmin = computed(() => isLoggedIn.value && userRole.value === 'Admin');

// 🌟 SỬA ĐỔI: Thay thế routeName bằng slug
const navItems = ref([
  // Thêm slug tương ứng với đường dẫn (path) trong router/index.js
  { name: 'Thời Sự', slug: 'thoi-su' },
  { name: 'Kinh Tế', slug: 'kinh-te' },
  { name: 'Công Nghệ', slug: 'cong-nghe' },
  { name: 'Quốc Tế', slug: 'quoc-te' },
  { name: 'Giải Trí', slug: 'giai-tri' },
]);

// Hàm xử lý Logout (Giữ nguyên)
const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    checkAuthStatus(); // Cập nhật trạng thái
    router.push({ name: 'Home' });
    alert('Đã đăng xuất thành công!');
};

// Cập nhật trạng thái khi component được mount và khi route thay đổi (Giữ nguyên)
onMounted(checkAuthStatus);
watch(
  () => router.currentRoute.value,
  checkAuthStatus,
  { immediate: true }
);
</script>

<style scoped>
/* Giữ nguyên hoặc thêm style nếu cần */
.router-link-active {
    /* Đảm bảo style active hoạt động đúng */
}
</style>