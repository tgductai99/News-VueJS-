<template>
  <div>
    <h1 class="mb-4 fw-bold text-primary">Admin Dashboard</h1>
    <p class="lead text-secondary">Tổng quan hoạt động hệ thống.</p>
    <hr class="mb-4">
    
    <div v-if="loading" class="text-center py-5">
      <i class="fas fa-spinner fa-spin fa-2x text-primary"></i> Đang tải dữ liệu tổng quan...
    </div>

    <div v-else class="row g-4">
      <div class="col-md-6 col-lg-3">
        <div class="card text-white bg-info shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title fw-bold">Tổng Bài Viết</h5>
              <p class="display-6 mb-0">{{ stats.postCount }}</p>
            </div>
            <i class="fas fa-file-alt fa-3x"></i>
          </div>
          <router-link :to="{ name: 'NewsManager' }" class="card-footer text-white bg-info text-decoration-none small opacity-75">
            Xem chi tiết <i class="fas fa-arrow-circle-right"></i>
          </router-link>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card text-white bg-secondary shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title fw-bold">Bài viết Nháp</h5>
              <p class="display-6 mb-0">{{ stats.draftCount }}</p>
            </div>
            <i class="fas fa-hourglass-half fa-3x"></i>
          </div>
          <router-link :to="{ name: 'NewsManager' }" class="card-footer text-white bg-secondary text-decoration-none small opacity-75">
            Xem chi tiết <i class="fas fa-arrow-circle-right"></i>
          </router-link>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card text-white bg-success shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title fw-bold">Tổng Người dùng</h5>
              <p class="display-6 mb-0">{{ stats.userCount }}</p>
            </div>
            <i class="fas fa-users fa-3x"></i>
          </div>
          <router-link :to="{ name: 'UserManager' }" class="card-footer text-white bg-success text-decoration-none small opacity-75">
            Xem chi tiết <i class="fas fa-arrow-circle-right"></i>
          </router-link>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-3">
        <div class="card text-white bg-danger shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title fw-bold">Tổng Bình luận</h5>
              <p class="display-6 mb-0">{{ stats.commentCount }}</p>
            </div>
            <i class="fas fa-comments fa-3x"></i>
          </div>
          <router-link :to="{ name: 'CommentManager' }" class="card-footer text-white bg-danger text-decoration-none small opacity-75">
            Xem chi tiết <i class="fas fa-arrow-circle-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const stats = ref({
    postCount: 0,
    draftCount: 0,
    userCount: 0,
    commentCount: 0,
});
const loading = ref(true);

const fetchDashboardData = async () => {
    loading.value = true;
    try {
        // Tải tất cả dữ liệu cùng lúc
        const [postsRes, usersRes, commentsRes] = await Promise.all([
            axios.get('http://localhost:3000/posts'),
            axios.get('http://localhost:3000/users'),
            axios.get('http://localhost:3000/comments')
        ]);

        stats.value.postCount = postsRes.data.length;
        stats.value.userCount = usersRes.data.length;
        stats.value.commentCount = commentsRes.data.length;

        // Đếm bài viết nháp
        stats.value.draftCount = postsRes.data.filter(p => p.status === 'draft').length;

    } catch (err) {
        console.error('Lỗi tải dữ liệu Dashboard:', err);
        // Có thể thêm thông báo lỗi cho người dùng ở đây
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchDashboardData();
});
</script>