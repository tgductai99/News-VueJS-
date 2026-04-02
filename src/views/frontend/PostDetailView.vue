<template>
  <div class="container my-5">
    <div v-if="loading" class="text-center text-info py-5">
      <i class="fas fa-spinner fa-spin fa-2x"></i> Đang tải bài viết...
    </div>

    <div v-else-if="error" class="alert alert-danger text-center">
      <h4 class="alert-heading fw-bold">Lỗi truy cập</h4>
      {{ error }}
    </div>

    <div v-else-if="post" class="row g-4">
      <div class="col-lg-8">
        <article class="p-4 shadow-sm bg-white rounded-3">
          <div class="mb-3 text-muted small border-bottom pb-2">
            <span :class="`badge bg-${getCategoryBadgeColor(post.category)} me-2`">{{ post.category }}</span>
            <i class="fas fa-user me-1"></i> {{ post.author }} |
            <i class="fas fa-calendar-alt me-1"></i> {{ post.date }} |
            <i class="fas fa-eye me-1"></i> {{ post.views || 'N/A' }} lượt xem
          </div>

          <h1 class="mb-3 text-dark fw-bold display-6">{{ post.title }}</h1>
          
          <p class="lead text-primary fw-semibold border-start border-4 border-primary ps-3 mb-4">
            {{ post.summary }}
          </p>

          <img
            :src="getImageUrl(post.imageName)"
            class="img-fluid rounded-3 mb-4 shadow-sm w-100 object-fit-cover"
            style="max-height: 500px;" 
            :alt="post.title"
          />

          <div class="content-body" style="white-space: pre-wrap;">
            {{ post.content }}
          </div>
          
          <hr class="my-4">

          <h4 class="fw-bold mb-3"><i class="fas fa-comment-dots me-2"></i> Bình luận ({{ comments.length }})</h4>
          
          <div class="list-group mb-4">
            <div v-if="comments.length === 0" class="list-group-item text-muted">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
            <div v-for="comment in comments" :key="comment.id" class="list-group-item list-group-item-light">
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1 fw-bold text-dark">{{ comment.author }}</h6>
                <small class="text-muted">{{ comment.date }}</small>
              </div>
              <p class="mb-1 small">{{ comment.content }}</p>
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-header bg-light fw-bold">Viết bình luận của bạn</div>
            <div class="card-body">
              <div v-if="!isAuthenticated" class="text-center">
                <p class="text-danger fw-bold">Vui lòng đăng nhập để gửi bình luận.</p>
                <router-link :to="{ name: 'Login' }" class="btn btn-warning rounded-pill">
                    <i class="fas fa-sign-in-alt me-2"></i> Đăng Nhập Ngay
                </router-link>
              </div>

              <form v-else @submit.prevent="submitComment">
                <div class="mb-3">
                  <input 
                    type="text" 
                    class="form-control bg-light text-muted" 
                    :value="currentUser?.name" 
                    disabled 
                    placeholder="Tên của bạn (tự động lấy từ tài khoản)"
                  >
                </div>
                <div class="mb-3">
                  <textarea class="form-control" rows="3" v-model="newComment.content" placeholder="Nội dung bình luận..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-sm rounded-pill">Gửi Bình Luận</button>
              </form>
            </div>
          </div>
        </article>
      </div>

      <div class="col-lg-4">
        <aside class="sticky-top" style="top: 80px;">
          <h4 class="fw-bold text-dark border-bottom pb-2 mb-3">
            <i class="fas fa-link me-2"></i> Bài Viết Cùng Chuyên Mục
          </h4>
          <div class="list-group shadow-sm">
            <router-link
              v-for="relatedPost in relatedPosts.slice(0, 4)"
              :key="relatedPost.id"
              :to="{ name: 'PostDetail', params: { slug: relatedPost.id } }" 
              class="list-group-item list-group-item-action"
            >
              <div class="d-flex align-items-center">
                <img :src="getImageUrl(relatedPost.imageName)" class="me-3 rounded object-fit-cover" style="width: 60px; height: 50px;">
                <h6 class="mb-0 small fw-semibold text-dark">{{ relatedPost.title }}</h6>
              </div>
            </router-link>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'; 
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const post = ref(null);
const comments = ref([]);
const relatedPosts = ref([]);
const loading = ref(true);
const error = ref(null);

const newComment = ref({
  content: '',
});

const API_URL = 'http://localhost:3000/posts';
const COMMENT_API_URL = 'http://localhost:3000/comments';

// =================================================================
// LOGIC XÁC THỰC VÀ TRẠNG THÁI
// =================================================================

const getAuthStatus = () => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    let user = null;
    try {
        const userJson = localStorage.getItem('user');
        if (userJson && userJson !== 'undefined') {
             user = JSON.parse(userJson);
        }
    } catch (e) {
        user = null;
    }
    return { isAuth, user };
};

const auth = ref(getAuthStatus());

const isAuthenticated = computed(() => auth.value.isAuth);
const currentUser = computed(() => auth.value.user);

// =================================================================
// CÁC HÀM XỬ LÝ DỮ LIỆU
// =================================================================

const getImageUrl = (imageName) => {
    if (!imageName) {
        // Trả về ảnh placeholder nếu tên file bị thiếu
        return 'https://via.placeholder.com/200x150?text=No+Image';
    }
    
    // ⭐ ĐÂY LÀ ĐƯỜNG DẪN MỚI: Chỉ cần đường dẫn tuyệt đối từ thư mục gốc (public/)
    // Nếu ảnh trong public/Images/ -> sử dụng /Images/
    return `/Images/${imageName}`;
};

const getCategoryBadgeColor = (category) => {
    const map = {
        'Thời sự': 'danger', 
        'Kinh Tế': 'success',
        'Công Nghệ': 'info',
        'Quốc Tế': 'secondary',
        'Giải Trí': 'warning text-dark',
    };
    return map[category] || 'primary';
};

// Hàm Tải dữ liệu bài viết và bình luận (ĐÃ SỬA LỖI SẮP XẾP BÌNH LUẬN)
const fetchPostData = async (postId) => {
  loading.value = true;
  error.value = null;
  post.value = null;
  comments.value = [];
  relatedPosts.value = [];
  
  if (!postId) {
      error.value = 'ID bài viết không hợp lệ.';
      loading.value = false;
      return;
  }

  try {
    const postResponse = await axios.get(`${API_URL}/${postId}`);
    const fetchedPost = postResponse.data;

    if (!fetchedPost || Object.keys(fetchedPost).length === 0) {
        error.value = `Bài viết ID '${postId}' không tồn tại. (Lỗi 404)`;
        loading.value = false;
        return;
    }
    
    post.value = fetchedPost;

    // 1. Tăng lượt xem
    if (fetchedPost.views === undefined) fetchedPost.views = 0;
    const updatedViews = (fetchedPost.views || 0) + 1;
    
    axios.patch(`${API_URL}/${postId}`, { views: updatedViews });
    post.value.views = updatedViews; 

    // 2. Tải bình luận
    const commentsResponse = await axios.get(`${COMMENT_API_URL}?postId=${postId}`); 
    let fetchedComments = commentsResponse.data;

    // 🌟 LOGIC SỬA LỖI: Sắp xếp bình luận ở phía Client (mới nhất lên đầu bằng cách sắp xếp ID giảm dần)
    fetchedComments.sort((a, b) => {
        if (a.id < b.id) return 1;
        if (a.id > b.id) return -1;
        return 0;
    });

    comments.value = fetchedComments;

    // 3. Tải bài viết liên quan
    const relatedResponse = await axios.get(`${API_URL}?category=${fetchedPost.category}&_limit=5`);
    relatedPosts.value = relatedResponse.data
      .filter(p => p.id !== postId) 
      .slice(0, 4); 

  } catch (err) {
    if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
        error.value = `Bài viết ID '${postId}' không tồn tại.`;
    } else {
        error.value = 'Không thể tải chi tiết bài viết. Lỗi kết nối Server.';
    }
    console.error('Lỗi khi tải bài viết:', err);
  } finally {
    loading.value = false;
  }
};


// 1. WATCH THEO SLUG (để tải dữ liệu bài viết mới)
watch(
  () => route.params.slug,
  (newId) => {
    // Luôn cập nhật trạng thái xác thực khi slug thay đổi
    auth.value = getAuthStatus(); 
    
    if (newId) {
      fetchPostData(newId); 
    } else {
        router.replace({ name: 'Home' }); 
    }
  },
  { immediate: true }
);

// 2. KHẮC PHỤC LỖI KHÔNG CẬP NHẬT TRẠNG THÁI KHI COMPONENT TÁI SỬ DỤNG
onBeforeRouteUpdate((to, from, next) => {
    // Buộc cập nhật lại trạng thái Auth ngay trước khi route thay đổi
    auth.value = getAuthStatus(); 
    next();
});

// 3. Gửi bình luận (SỬ DỤNG unshift để thêm bình luận mới lên đầu)
const submitComment = async () => {
  if (!isAuthenticated.value || !currentUser.value) {
    alert('Vui lòng đăng nhập để gửi bình luận.');
    router.push({ name: 'Login' }); 
    return;
  }

  if (!newComment.value.content) {
    alert('Vui lòng nhập nội dung bình luận.');
    return;
  }
  
  if (!post.value || !post.value.id) {
    alert('Không thể gửi bình luận. Bài viết không hợp lệ.');
    return;
  }

  try {
    const newCommentData = {
      postId: post.value.id, 
      author: currentUser.value.name, 
      content: newComment.value.content,
      date: new Date().toLocaleDateString('vi-VN'),
      userId: currentUser.value.id 
    };

    const response = await axios.post(COMMENT_API_URL, newCommentData);
    
    if (response.status === 201) {
        comments.value.unshift(response.data); // Thêm bình luận mới vào đầu mảng
        newComment.value.content = '';
        alert('Bình luận đã được gửi thành công!');
    }
  } catch (err) {
    console.error('Lỗi khi gửi bình luận:', err);
    alert('Không thể gửi bình luận. Lỗi Server.');
  }
};
</script>

<style scoped>
/* Không có style đặc biệt */
</style>