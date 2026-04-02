<template>
  <div class="p-4">
    <h2 class="mb-4 text-primary fw-bold">
      <i class="fas fa-comment-dots me-2"></i> Quản Lý Bình Luận
    </h2>

    <div class="d-flex justify-content-end align-items-center mb-4">
      <div class="input-group" style="width: 350px;">
        <input 
          type="text" 
          class="form-control" 
          placeholder="Tìm kiếm theo nội dung hoặc tác giả..." 
          v-model="searchQuery"
        >
        <span class="input-group-text"><i class="fas fa-search"></i></span>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info text-center">
      <i class="fas fa-spinner fa-spin me-2"></i> Đang tải danh sách bình luận...
    </div>
    <div v-else-if="error" class="alert alert-danger text-center">
      {{ error }}
    </div>
    <div v-else-if="filteredComments.length === 0" class="alert alert-warning text-center">
      Không tìm thấy bình luận nào phù hợp.
    </div>

    <div v-else class="table-responsive shadow-lg rounded-3">
      <table class="table table-hover table-striped align-middle bg-white">
        <thead class="bg-light text-dark">
          <tr>
            <th scope="col" style="width: 5%;">ID</th>
            <th scope="col" style="width: 35%;">Nội dung</th>
            <th scope="col" style="width: 15%;">Tác giả</th>
            <th scope="col" style="width: 15%;">Bài viết</th>
            <th scope="col" style="width: 15%;">Ngày đăng</th>
            <th scope="col" style="width: 15%;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in filteredComments" :key="comment.id">
            <td>{{ comment.id }}</td>
            <td>
              <p class="text-dark mb-0 small text-truncate" style="max-width: 300px;">
                {{ comment.content }}
              </p>
            </td>
            <td>{{ comment.author || 'Ẩn danh' }}</td>
            <td>
              <span v-if="!comment.postId" class="text-muted small">
                N/A (Không liên kết)
              </span>
              <router-link 
                v-else
                :to="{ name: 'PostDetail', params: { slug: comment.postId } }" 
                class="text-primary small text-decoration-none"
                target="_blank"
                title="Xem bài viết gốc"
              >
                #{{ comment.postId }} - Xem
              </router-link>
            </td>
            <td>{{ comment.date }}</td>
            <td>
              <button 
                @click="confirmDelete(comment.id, comment.content)"
                class="btn btn-sm btn-danger"
                title="Xóa bình luận"
              >
                <i class="fas fa-trash-alt"></i> Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const comments = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

const API_URL = 'http://localhost:3000/comments';

// 1. Hàm Tải dữ liệu
const fetchComments = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Lấy tất cả bình luận, sắp xếp theo ID giảm dần (mới nhất lên đầu)
    const response = await axios.get(`${API_URL}?_sort=id&_order=desc`);
    comments.value = response.data;
  } catch (err) {
    error.value = 'Không thể tải danh sách bình luận. Vui lòng kiểm tra JSON Server.';
    console.error('Lỗi tải bình luận Admin:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchComments);

// 2. Computed Property cho Tìm kiếm
const filteredComments = computed(() => {
  if (!searchQuery.value) {
    return comments.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return comments.value.filter(comment => 
    comment.content?.toLowerCase().includes(query) || 
    comment.author?.toLowerCase().includes(query)
  );
});

// 3. Hàm Xóa bình luận
const deleteComment = async (commentId) => {
  try {
    await axios.delete(`${API_URL}/${commentId}`);
    // Cập nhật lại danh sách sau khi xóa thành công
    comments.value = comments.value.filter(c => c.id !== commentId);
    alert('Xóa bình luận thành công!');
  } catch (err) {
    error.value = 'Lỗi khi xóa bình luận. Vui lòng thử lại.';
    console.error('Lỗi xóa bình luận:', err);
  }
};

const confirmDelete = (commentId, commentContent) => {
  const truncatedContent = commentContent.length > 50 ? commentContent.substring(0, 50) + '...' : commentContent;
  if (confirm(`Bạn có chắc chắn muốn xóa bình luận: "${truncatedContent}" không?`)) {
    deleteComment(commentId);
  }
};
</script>

<style scoped>
</style>