<template>
  <main class="container my-5">
    <div v-if="loading" class="text-center text-info py-5">
      <i class="fas fa-spinner fa-spin fa-2x"></i> Đang tải tin tức...
    </div>

    <div v-else-if="error" class="alert alert-danger text-center">
      {{ error }}
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-8">
        
        <section>
          <h2 class="text-primary border-bottom border-3 pb-2 mb-4">
            <i class="fas fa-fire-alt me-2"></i> Bài Viết Nổi Bật (Công Nghệ)
          </h2>

          <div v-if="featuredPost" class="card mb-5 shadow-lg border-0 bg-white rounded-3">
            <div class="row g-0">
              <div class="col-md-5">
                <img
                  :src="getImageUrl(featuredPost.imageName)"
                  class="img-fluid rounded-start-3 w-100 object-fit-cover"
                  alt="Bài viết nổi bật"
                  style="min-height: 250px;" 
                />
              </div>
              <div class="col-md-7">
                <div class="card-body">
                  <span class="badge bg-warning text-dark mb-2 fw-bold"
                    >TOP TRENDING</span
                  >
                  <h3 class="card-title text-dark">
                    <router-link :to="{ name: 'PostDetail', params: { slug: featuredPost.id } }" class="text-decoration-none text-dark">
                      {{ featuredPost.title }}
                    </router-link>
                  </h3>
                  <p class="card-text text-muted small mb-3">
                    Tác giả: {{ featuredPost.author }} | Ngày đăng: {{ featuredPost.date }} |
                    <i class="fas fa-eye"></i> {{ featuredPost.views || 'N/A' }} lượt xem
                  </p>
                  <p class="card-text text-truncate">{{ featuredPost.summary }}</p>
                  <router-link
                    :to="{ name: 'PostDetail', params: { slug: featuredPost.id } }"
                    class="btn btn-primary mt-3 rounded-pill"
                    >Đọc Ngay <i class="fas fa-arrow-right"></i
                  ></router-link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2
            id="latest"
            class="mt-5 text-dark border-bottom border-3 border-secondary pb-2 mb-4"
          >
            <i class="fas fa-magic me-2"></i> Các Bài Viết Mới Nhất
          </h2>

          <div
            id="latestPostsCarousel"
            class="carousel slide carousel-fade mb-5 shadow-lg rounded-3"
            data-bs-ride="carousel"
          >
            <div class="carousel-indicators">
              <button
                v-for="(post, index) in latestCarouselPosts"
                :key="post.id"
                type="button"
                data-bs-target="#latestPostsCarousel"
                :data-bs-slide-to="index"
                :class="{ active: index === 0 }"
                :aria-current="index === 0 ? 'true' : null"
                :aria-label="'Slide ' + (index + 1)"
              ></button>
            </div>
            <div class="carousel-inner rounded-3">
              <div 
                v-for="(post, index) in latestCarouselPosts" 
                :key="post.id"
                class="carousel-item" 
                :class="{ active: index === 0 }" 
                data-bs-interval="4000"
              >
                <img
                  :src="getImageUrl(post.imageName)"
                  class="d-block w-100 object-fit-cover"
                  style="height: 400px;" 
                  :alt="post.title"
                />
                <div
                  class="carousel-caption d-none d-md-block bg-dark bg-opacity-75 p-3 rounded-3"
                >
                  <span :class="`badge bg-${getCategoryBadgeColor(post.category)} mb-2`">{{ post.category.toUpperCase() }}</span>
                  <h5>{{ post.title }}</h5>

                  <router-link
                    :to="{ name: 'PostDetail', params: { slug: post.id } }"
                    class="btn btn-sm btn-outline-light rounded-pill"
                    >Đọc ngay</router-link
                  >
                </div>
              </div>
            </div>
            <button
              class="carousel-control-prev"
              type="button"
              data-bs-target="#latestPostsCarousel"
              data-bs-slide="prev"
            >
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button
              class="carousel-control-next"
              type="button"
              data-bs-target="#latestPostsCarousel"
              data-bs-slide="next"
            >
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>
        </section>

        <section>
          <h2
            id="thoisu"
            class="mt-5 text-danger border-bottom border-3 border-danger pb-2 mb-4"
          >
            <i class="fas fa-newspaper me-2"></i> Thời Sự & Xã Hội
          </h2>

          <div class="row row-cols-1 g-4 mb-5">
            <div v-for="post in thoiSuPosts.slice(0, 2)" :key="post.id" class="col">
              <div class="card shadow-sm border-start border-5 border-danger">
                <div class="card-body">
                  <h5 class="card-title fw-bold text-dark">
                    <router-link :to="{ name: 'PostDetail', params: { slug: post.id } }" class="text-decoration-none text-dark">
                       {{ post.title }}
                    </router-link>
                  </h5>
                  <p class="card-text mb-2 text-truncate">
                    {{ post.summary }}
                  </p>
                  <small class="text-secondary">
                    <i class="fas fa-user-alt"></i> {{ post.author }} |
                    <i class="fas fa-clock"></i> {{ post.date }} |
                    <span class="badge bg-danger">Mới</span>
                  </small>
                  <router-link
                    :to="{ name: 'PostDetail', params: { slug: post.id } }"
                    class="btn btn-sm btn-outline-danger float-end rounded-pill"
                    >Đọc <i class="fas fa-arrow-right"></i
                  ></router-link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2
            id="kinhte"
            class="mt-5 text-success border-bottom border-3 border-success pb-2 mb-4"
          >
            <i class="fas fa-chart-line me-2"></i> Thị Trường & Kinh Tế
          </h2>

          <div class="row row-cols-1 row-cols-md-2 g-4 mb-5">
            <div v-for="post in kinhTePosts.slice(0, 2)" :key="post.id" class="col">
              <div class="card h-100 shadow-sm border-0">
                <img
                  :src="getImageUrl(post.imageName)"
                  class="card-img-top object-fit-cover"
                  :alt="post.title"
                  style="height: 180px;" 
                />
                <div class="card-body">
                  <h5 class="card-title fw-bold text-dark">
                    <router-link :to="{ name: 'PostDetail', params: { slug: post.id } }" class="text-decoration-none text-dark">
                       {{ post.title }}
                    </router-link>
                  </h5>
                  <p class="card-text small text-muted text-truncate">
                    {{ post.summary }}
                  </p>
                </div>
                <div
                  class="card-footer bg-light border-0 d-flex justify-content-between align-items-center"
                >
                  <small class="text-success fw-bold"
                    ><i class="fas fa-chart-line"></i> {{ post.author }}</small
                  >
                  <router-link :to="{ name: 'PostDetail', params: { slug: post.id } }" class="small text-success text-decoration-none"
                    >Đọc Chi Tiết</router-link
                  >
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2
            id="congnghe"
            class="mt-5 text-info border-bottom border-3 border-info pb-2 mb-4"
          >
            <i class="fas fa-laptop-code me-2"></i> Lập Trình & Công Nghệ
          </h2>

          <div class="list-group shadow-sm rounded-3 mb-5">
            <div class="row row-cols-1 row-cols-md-3 g-4 p-3">
              <div v-for="post in congNghePosts.slice(1, 4)" :key="post.id" class="col">
                <div class="card h-100 shadow-sm border-0">
                  <img
                    :src="getImageUrl(post.imageName)"
                    class="card-img-top object-fit-cover"
                    :alt="post.title"
                    style="height: 150px;" 
                  />
                  <div class="card-body p-3">
                    <h6 class="card-title fw-bold text-dark">
                      <router-link :to="{ name: 'PostDetail', params: { slug: post.id } }" class="text-decoration-none text-dark">
                          {{ post.title }}
                      </router-link>
                    </h6>
                    <p class="card-text small text-muted mb-0 text-truncate">
                      {{ post.summary }}
                    </p>
                  </div>
                  <div class="card-footer bg-white border-0 p-3 pt-0">
                    <small class="text-secondary"
                      ><i class="fas fa-user-alt"></i> {{ post.author }} |
                      <i class="fas fa-comment-dots"></i> N/A</small
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2
            id="quocte"
            class="mt-5 text-secondary border-bottom border-3 border-secondary pb-2 mb-4"
          >
            <i class="fas fa-globe me-2"></i> Tin Tức Quốc Tế
          </h2>
          <div class="list-group shadow-sm rounded-3 mb-5">
            <router-link
              v-if="quocTePosts[0]"
              :to="{ name: 'PostDetail', params: { slug: quocTePosts[0].id } }"
              class="list-group-item list-group-item-action py-3"
            >
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1 text-dark fw-bold">
                  {{ quocTePosts[0].title }}
                </h5>
                <small class="text-muted"
                  ><i class="fas fa-clock"></i> {{ quocTePosts[0].date }}</small
                >
              </div>
              <p class="mb-1 text-truncate">
                {{ quocTePosts[0].summary }}
              </p>
              <small class="text-secondary"
                ><i class="fas fa-user-alt"></i> {{ quocTePosts[0].author }} |
                <i class="fas fa-comment-dots"></i> N/A bình luận</small
              >
            </router-link>
          </div>
        </section>

        <section>
          <h2
            id="giaitri"
            class="mt-5 text-warning border-bottom border-3 border-warning pb-2 mb-4"
          >
            <i class="fas fa-film me-2"></i> Văn Hóa & Giải Trí
          </h2>

          <div class="list-group shadow-sm rounded-3 mb-5">
            <router-link
              v-if="giaiTriPosts[0]"
              :to="{ name: 'PostDetail', params: { slug: giaiTriPosts[0].id } }"
              class="list-group-item list-group-item-action py-3"
            >
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1 text-dark fw-bold">
                  {{ giaiTriPosts[0].title }}
                </h5>
                <small class="text-muted"
                  ><i class="fas fa-clock"></i> {{ giaiTriPosts[0].date }}</small
                >
              </div>
              <p class="mb-1 text-truncate">
                {{ giaiTriPosts[0].summary }}
              </p>
              <small class="text-secondary"
                ><i class="fas fa-user-alt"></i> {{ giaiTriPosts[0].author }} |
                <i class="fas fa-comment-dots"></i> N/A bình luận</small
              >
            </router-link>
          </div>
        </section>

      </div>

      <div class="col-lg-4">
        <aside class="sticky-top" style="top: 80px;">
          
          <!-- <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary text-white fw-bold">
              <i class="fas fa-search me-2"></i> Tìm Kiếm
            </div>
            <div class="card-body">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Nhập từ khóa..."
                />
                <button class="btn btn-outline-primary" type="button">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div> -->

          <div class="card shadow-sm mb-4">
            <div class="card-header bg-success text-white fw-bold">
              <i class="fas fa-list-ul me-2"></i> Chuyên Mục
            </div>
            <div class="list-group list-group-flush">
              
              <router-link :to="{ name: 'Category', params: { categorySlug: 'thoi-su' } }" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                Thời Sự <span class="badge bg-danger rounded-pill">{{ thoiSuPosts.length }}</span>
              </router-link>
              <router-link :to="{ name: 'Category', params: { categorySlug: 'kinh-te' } }" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                Kinh Tế <span class="badge bg-success rounded-pill">{{ kinhTePosts.length }}</span>
              </router-link>
              <router-link :to="{ name: 'Category', params: { categorySlug: 'cong-nghe' } }" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                Công Nghệ <span class="badge bg-info rounded-pill">{{ congNghePosts.length }}</span>
              </router-link>
              <router-link :to="{ name: 'Category', params: { categorySlug: 'quoc-te' } }" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                Quốc Tế <span class="badge bg-secondary rounded-pill">{{ quocTePosts.length }}</span>
              </router-link>
              <router-link :to="{ name: 'Category', params: { categorySlug: 'giai-tri' } }" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                Giải Trí
                <span class="badge bg-warning text-dark rounded-pill">{{ giaiTriPosts.length }}</span>
              </router-link>
            </div>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-header bg-info text-white fw-bold">
              <i class="fas fa-star me-2"></i> Được Xem Nhiều
            </div>
            <div class="list-group list-group-flush">
              <router-link
                v-for="post in popularPosts.slice(0, 3)"
                :key="post.id"
                :to="{ name: 'PostDetail', params: { slug: post.id } }"
                class="list-group-item list-group-item-action"
              >
                {{ post.title }}
              </router-link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';


const posts = ref([]);
const loading = ref(true);
const error = ref(null);


// Hàm xử lý đường dẫn hình ảnh - Giữ nguyên
const getImageUrl = (imageName) => {
    if (!imageName) {
        // Trả về ảnh placeholder nếu tên file bị thiếu
        return 'https://via.placeholder.com/200x150?text=No+Image';
    }
    
    // ⭐ ĐÂY LÀ ĐƯỜNG DẪN MỚI: Chỉ cần đường dẫn tuyệt đối từ thư mục gốc (public/)
    // Nếu ảnh trong public/Images/ -> sử dụng /Images/
    return `/Images/${imageName}`;
};

// Hàm phân tích ngày tháng để sắp xếp - Giữ nguyên
const parseDate = (dateString) => {
    if (!dateString) return new Date(0); 
    const parts = dateString.split('/');
    if (parts.length === 3) {
        // Format: DD/MM/YYYY -> YYYY-MM-DD
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date(dateString); // Thử parse các format khác
};

// Hàm lấy màu Badge dựa trên Category (dùng cho Carousel) - Giữ nguyên
const getCategoryBadgeColor = (category) => {
    const map = {
        'Thời sự': 'danger', 
        'Kinh Tế': 'success',
        'Công Nghệ': 'info',
        'Quốc Tế': 'secondary',
        'Giải Trí': 'warning text-dark',
    };
    // Mặc định là primary nếu không khớp
    return map[category] || 'primary';
};


// Tải dữ liệu bài viết - Giữ nguyên
const fetchPosts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/posts');
    
    // Lọc bài viết đã xuất bản và sắp xếp theo ngày
    const publishedPosts = response.data
      .filter(post => post.status === 'published')
      .sort((a, b) => parseDate(b.date) - parseDate(a.date));

    posts.value = publishedPosts;
    
  } catch (err) {
    error.value = 'Không thể tải tin tức. Vui lòng kiểm tra JSON Server.';
    console.error('Lỗi khi tải bài viết:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPosts);

// Computed Properties để lọc bài viết theo chuyên mục - Giữ nguyên
const congNghePosts = computed(() => posts.value.filter(p => p.category === 'Công Nghệ'));
const featuredPost = computed(() => congNghePosts.value[0]);
const latestCarouselPosts = computed(() => {
    // Lấy 3 bài mới nhất, loại trừ bài nổi bật (nếu có)
    const carouselPosts = posts.value.filter(p => p.id !== (featuredPost.value ? featuredPost.value.id : null));
    return carouselPosts.slice(0, 3);
});
const thoiSuPosts = computed(() => posts.value.filter(p => p.category === 'Thời sự'));
const kinhTePosts = computed(() => posts.value.filter(p => p.category === 'Kinh Tế'));
const quocTePosts = computed(() => posts.value.filter(p => p.category === 'Quốc Tế'));
const giaiTriPosts = computed(() => posts.value.filter(p => p.category === 'Giải Trí'));
// Sắp xếp bài viết theo lượt xem - Giữ nguyên
const popularPosts = computed(() => posts.value.slice().sort((a, b) => (b.views || 0) - (a.views || 0)));
</script>

<style scoped>
</style>