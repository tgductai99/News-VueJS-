<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mt-4 mb-4">
      <h1 class="text-dark fw-bold">
        <i class="fas fa-clipboard-list text-primary me-2"></i> QUẢN LÝ BÀI VIẾT
      </h1>
      <router-link :to="{ name: 'NewPost' }" class="btn btn-success rounded-pill px-4 shadow-sm">
        <i class="fas fa-plus me-2"></i> Thêm Bài Viết Mới
      </router-link>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <i class="fas fa-spinner fa-spin fa-2x text-primary"></i> Đang tải danh sách bài viết...
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="card shadow mb-4">
      <div class="card-header py-3 bg-dark text-white d-flex justify-content-between align-items-center">
        <h6 class="m-0 fw-bold">Danh sách tất cả Bài viết ({{ filteredPosts.length }})</h6>
        <div class="input-group w-50">
          <input 
            type="text" 
            class="form-control form-control-sm" 
            placeholder="Tìm kiếm theo Tiêu đề, Tác giả..."
            v-model="searchTerm"
          />
          <button class="btn btn-outline-warning btn-sm" type="button">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover table-striped" style="min-width: 1000px;">
            <thead class="table-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col" style="width: 30%;">Tiêu đề</th>
                <th scope="col">Tác giả</th>
                <th scope="col">Danh mục</th>
                <th scope="col">Ngày đăng</th>
                <th scope="col">Trạng thái</th>
                <th scope="col" style="width: 15%;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(post, index) in filteredPosts" :key="post.id">
                <th scope="row">{{ index + 1 }}</th>
                <td>
                  <router-link :to="`/post/${post.slug}`" class="text-decoration-none fw-bold text-dark">
                    {{ post.title }}
                  </router-link>
                </td>
                <td>{{ post.author }}</td>
                <td>
                  <span 
                    :class="getCategoryBadge(post.category)"
                  >
                    {{ post.category }}
                  </span>
                </td>
                <td>{{ post.date }}</td>
                <td>
                  <span 
                    :class="getPostStatusBadge(post.status)"
                  >
                    {{ post.status === 'published' ? 'Đã đăng' : 'Bản nháp' }}
                  </span>
                </td>
                <td>
                  <router-link :to="{ name: 'EditPost', params: { id: post.id } }" class="btn btn-sm btn-info text-white me-1">
                    <i class="fas fa-edit"></i> Sửa
                  </router-link>
                  <button @click="deletePost(post.id, post.title)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash-alt"></i> Xóa
                  </button>
                </td>
              </tr>
              <tr v-if="filteredPosts.length === 0">
                <td colspan="7" class="text-center text-danger fw-bold">Không tìm thấy bài viết nào phù hợp.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const posts = ref([]);
const searchTerm = ref('');
const loading = ref(true);
const error = ref(null);

const API_URL = 'http://localhost:3000/posts';

const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(API_URL);
    // Sắp xếp ID giảm dần
    posts.value = response.data.sort((a, b) => b.id - a.id); 
  } catch (err) {
    error.value = 'Không thể tải dữ liệu bài viết. Vui lòng kiểm tra JSON Server.';
    console.error('Lỗi khi tải danh sách bài viết:', err);
  } finally {
    loading.value = false;
  }
};

const deletePost = async (id, title) => {
  if (confirm(`Bạn có chắc chắn muốn xóa bài viết: "${title}" không? Thao tác này không thể hoàn tác.`)) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      posts.value = posts.value.filter(post => post.id !== id);
      alert(`Bài viết "${title}" đã được xóa thành công.`);
    } catch (err) {
      console.error('Lỗi khi xóa bài viết:', err);
      alert('Xảy ra lỗi trong quá trình xóa bài viết.');
    }
  }
};

const filteredPosts = computed(() => {
  const query = searchTerm.value.toLowerCase().trim();
  if (!query) {
    return posts.value;
  }
  return posts.value.filter(post => 
    post.title.toLowerCase().includes(query) ||
    (post.author && post.author.toLowerCase().includes(query)) ||
    (post.category && post.category.toLowerCase().includes(query))
  );
});

const getPostStatusBadge = (status) => {
    return status === 'published' ? 'badge bg-success' : 'badge bg-warning text-dark';
};

const getCategoryBadge = (categoryName) => {
    // Ánh xạ đơn giản cho các màu sắc nổi bật
    const map = {
        'Thời sự': 'badge text-bg-danger fw-bold',
        'Kinh Tế': 'badge text-bg-success fw-bold',
        'Công Nghệ': 'badge text-bg-primary fw-bold',
        'Quốc Tế': 'badge text-bg-secondary fw-bold',
        'Giải Trí': 'badge text-bg-warning text-dark fw-bold',
    };
    return map[categoryName] || 'badge text-bg-info fw-bold';
};

onMounted(fetchPosts);
</script>