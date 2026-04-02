<template>
  <div class="container pt-5 pb-5">
    <main class="container pt-5 pb-5">
      <nav aria-label="breadcrumb" class="mb-4 pt-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item small">
            <router-link to="/" class="text-decoration-none text-muted">Trang chủ</router-link>
          </li>
          <li class="breadcrumb-item small active fw-bold text-primary" aria-current="page">
            {{ categoryTitle }}
          </li>
        </ol>
      </nav>

      <section class="container">
        <div class="row g-4">
          <div class="col-lg-8">
            <div class="bg-white p-4 rounded-4 shadow-sm">
              <h2 class="mb-4 fw-bold text-dark border-bottom pb-3">
                <i :class="getCategoryIcon(categorySlug)"></i> {{ categoryTitle }}
              </h2>

              <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Đang tải...</span>
                </div>
                <p class="mt-2 text-muted">Đang tải tin tức...</p>
              </div>

              <div v-else-if="error" class="alert alert-danger text-center">
                {{ error }}
              </div>

              <div v-else-if="filteredPosts.length === 0" class="alert alert-info text-center">
                Hiện tại chưa có bài viết nào thuộc chuyên mục **{{ categoryTitle }}**.
              </div>
              
              <div v-else>
                <router-link
                  v-for="post in paginatedPosts"
                  :key="post.id"
                  :to="{ name: 'PostDetail', params: { slug: post.id } }"
                  class="text-decoration-none text-dark d-block"
                >
                  <div class="row g-3 align-items-center mb-4 pb-4 border-bottom border-light">
                    <div class="col-4 col-md-3">
                      <img
                        :src="getAssetUrl(post.imageName)"
                        :alt="post.title"
                        class="img-fluid rounded-3 shadow-sm object-fit-cover"
                        style="height: 100px;" 
                      />
                    </div>
                    <div class="col-8 col-md-9">
                      <h5 class="fw-bold mb-2 text-truncate d-block">
                        {{ post.title }}
                      </h5>
                      <p class="small text-muted mb-1 d-none d-sm-block text-truncate">
                        {{ post.summary }}
                      </p>
                      <div>
                        <span :class="getCategoryBadge(post.category)">{{ post.category }}</span>
                        <small class="text-secondary ms-3">
                          <i class="far fa-clock me-1"></i> {{ post.date }}
                        </small>
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>

              <div class="d-flex justify-content-center mt-4 pt-3">
                <nav aria-label="Page navigation example" v-if="totalPages > 1">
                  <ul class="pagination">
                    <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
                      <a 
                          class="page-link" 
                          href="#" 
                          @click.prevent="goToPage(currentPage - 1)" 
                          aria-label="Previous"
                      >
                        <span aria-hidden="true">&laquo;</span>
                      </a>
                    </li>

                    <li 
                      class="page-item" 
                      v-for="page in totalPages" 
                      :key="page"
                      :class="{ 'active': page === currentPage }"
                    >
                      <a class="page-link" href="#" @click.prevent="goToPage(page)">
                        {{ page }}
                      </a>
                    </li>

                    <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
                      <a 
                          class="page-link" 
                          href="#" 
                          @click.prevent="goToPage(currentPage + 1)" 
                          aria-label="Next"
                      >
                        <span aria-hidden="true">&raquo;</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <aside class="col-lg-4 d-none d-lg-block">
            <div class="bg-white rounded-3 shadow-sm mb-4 overflow-hidden">
              <h3
                class="bg-dark text-white p-3 fw-bold text-uppercase rounded-top fs-6 mb-0"
              >
                <i class="fas fa-fire me-2"></i> TIN MỚI NHẤT
              </h3>
              <div class="p-3">
                <router-link
                  v-for="(post, index) in latestPosts"
                  :key="post.id"
                  :to="{ name: 'PostDetail', params: { slug: post.id } }"
                  class="text-decoration-none text-dark d-block p-2"
                  :class="{'border-bottom border-light-subtle': index < latestPosts.length - 1}"
                >
                  <p class="mb-0 fw-bold small" :class="{'text-primary': post.category === categoryTitle}">
                    {{ post.title }}
                  </p>
                  <small class="text-muted"
                    ><i class="far fa-clock me-1"></i> {{ post.date }}</small
                  >
                </router-link>
                <div v-if="latestPosts.length === 0" class="text-muted small p-2">
                    Không có bài viết nào được tìm thấy.
                </div>
              </div>
            </div>

            <div class="card shadow-sm mb-4">
              <div class="card-header bg-success text-white fw-bold">
                <i class="fas fa-list-ul me-2"></i> Chuyên Mục
              </div>
              <div class="list-group list-group-flush">
                <router-link
                  v-for="(title, slug) in categoryMap"
                  :key="slug"
                  :to="{ name: 'Category', params: { categorySlug: slug } }"
                  :class="['list-group-item', 'list-group-item-action', 'd-flex', 'justify-content-between', 'align-items-center', {'active': slug === categorySlug}]"
                  active-class=""
                >
                  {{ title }} <span class="badge bg-secondary rounded-pill">?</span>
                </router-link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'; // 🌟 Đã thêm 'computed'
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();

const posts = ref([]);
const filteredPosts = ref([]);
const isLoading = ref(false);
const error = ref(null);

// ⭐ BIẾN QUẢN LÝ PHÂN TRANG
const currentPage = ref(1); // Trang hiện tại
const postsPerPage = 5;   // Số bài viết trên mỗi trang

const categorySlug = ref(route.params.categorySlug);

const categoryMap = {
    'thoi-su': 'Thời sự',
    'kinh-te': 'Kinh Tế',
    'cong-nghe': 'Công Nghệ',
    'quoc-te': 'Quốc Tế',
    'giai-tri': 'Giải Trí',
};

const categoryTitle = ref(categoryMap[categorySlug.value] || 'Chuyên Mục');

// ------------------------------------
// I. COMPUTED PROPERTIES
// ------------------------------------

// Computed 1: Tính toán tổng số trang
const totalPages = computed(() => {
    return Math.ceil(filteredPosts.value.length / postsPerPage);
});

// Computed 2: Lấy bài viết cho trang hiện tại
const paginatedPosts = computed(() => {
    const start = (currentPage.value - 1) * postsPerPage;
    const end = start + postsPerPage;
    
    return filteredPosts.value.slice(start, end);
});

// Computed 3: Lấy bài viết mới nhất cho Sidebar
const latestPosts = computed(() => {
    // Lấy 3 bài viết đã xuất bản và sắp xếp theo ngày
    return posts.value
        .filter(post => post.status === 'published')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
});


// ------------------------------------
// II. FUNCTIONS
// ------------------------------------

// Hàm lấy URL tài nguyên hình ảnh (Giữ nguyên)
// Thay thế hàm getAssetUrl cũ bằng hàm này
const getAssetUrl = (imageName) => {
    if (!imageName) {
        // Trả về ảnh placeholder nếu tên file bị thiếu
        return 'https://via.placeholder.com/200x150?text=No+Image';
    }
    
    // ⭐ ĐÂY LÀ ĐƯỜNG DẪN MỚI: Chỉ cần đường dẫn tuyệt đối từ thư mục gốc (public/)
    // Nếu ảnh trong public/Images/ -> sử dụng /Images/
    return `/Images/${imageName}`;
}

// Hàm lấy class CSS cho badge (Giữ nguyên)
const getCategoryBadge = (categoryName) => {
    const map = {
        'Thời sự': 'badge text-bg-danger fw-bold',
        'Kinh Tế': 'badge text-bg-success fw-bold',
        'Công Nghệ': 'badge text-bg-primary fw-bold',
        'Quốc Tế': 'badge text-bg-secondary fw-bold',
        'Giải Trí': 'badge text-bg-warning text-dark fw-bold',
    };
    return map[categoryName] || 'badge text-bg-info fw-bold';
};

// Hàm lấy icon cho tiêu đề (Giữ nguyên)
const getCategoryIcon = (slug) => {
    const map = {
        'thoi-su': 'fas fa-gavel text-danger me-2',
        'kinh-te': 'fas fa-chart-line text-success me-2',
        'cong-nghe': 'fas fa-microchip text-primary me-2',
        'quoc-te': 'fas fa-globe-asia text-secondary me-2',
        'giai-tri': 'fas fa-camera-retro text-warning me-2',
    };
    return map[slug] || 'fas fa-list-alt text-info me-2';
};

// Hàm chuyển trang
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        // Scroll lên đầu trang khi chuyển trang
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}


// ⭐️ HÀM LỌC BÀI VIẾT QUAN TRỌNG (Đã thêm reset currentPage) ⭐️
const filterPostsByCategory = () => {
    const targetTitle = categoryTitle.value;
    
    filteredPosts.value = posts.value
        .filter(post => post.status === 'published')
        .filter(post => 
            post.category && post.category === targetTitle
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));
        
    // Reset trang về 1 mỗi khi chuyên mục thay đổi
    currentPage.value = 1; 
};


// 1. Tải Dữ liệu (Giữ nguyên)
const fetchPosts = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const response = await axios.get('http://localhost:3000/posts');
        posts.value = response.data || [];
        
        filterPostsByCategory();

    } catch (err) {
        error.value = 'Không thể tải dữ liệu. Vui lòng kiểm tra JSON Server.';
        console.error('Fetch Posts Error:', err);
        posts.value = [];
        filteredPosts.value = [];
    } finally {
        isLoading.value = false;
    }
};

// 2. Theo dõi thay đổi Route (Giữ nguyên)
watch(
  () => route.params.categorySlug,
  (newSlug) => {
    if (newSlug) {
      categorySlug.value = newSlug;
      categoryTitle.value = categoryMap[newSlug] || 'Chuyên Mục';
      if (posts.value.length > 0) {
        filterPostsByCategory(); 
      }
    }
  },
  { immediate: true }
);

// 3. Tải lần đầu khi component được mount (Giữ nguyên)
onMounted(() => {
    categoryTitle.value = categoryMap[categorySlug.value] || 'Chuyên Mục';
    fetchPosts();
});
</script>