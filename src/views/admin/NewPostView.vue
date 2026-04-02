<template>
    <div class="card shadow mb-4">
        <div class="card-header bg-primary text-white fw-bold">
            <h1 class="h5 mb-0">
                <i class="fas fa-edit me-2"></i> {{ isEditing ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới' }}
            </h1>
        </div>
        <div class="card-body">
            
            <div v-if="loading" class="text-center py-5">
                <i class="fas fa-spinner fa-spin fa-2x text-primary"></i> Đang tải dữ liệu...
            </div>

            <div v-else>
                <form @submit.prevent="savePost">
                    
                    <div class="mb-3">
                        <label for="postTitle" class="form-label fw-bold">Tiêu đề <span class="text-danger">*</span></label>
                        <input type="text" 
                               class="form-control" 
                               :class="{'is-invalid': errors.title}"
                               id="postTitle" 
                               v-model="post.title" 
                               required 
                               placeholder="Nhập tiêu đề bài viết" />
                        <div class="invalid-feedback" v-if="errors.title">{{ errors.title }}</div>
                    </div>

                    <div class="mb-3">
                        <label for="postSlug" class="form-label fw-bold">Slug URL</label>
                        <input type="text" 
                               class="form-control form-control-sm bg-light" 
                               id="postSlug" 
                               v-model="post.slug" 
                               disabled />
                        <div class="form-text">Slug tự động được tạo từ tiêu đề.</div>
                    </div>

                    <div class="mb-3">
                        <label for="postSummary" class="form-label fw-bold">Tóm tắt (Summary)</label>
                        <textarea class="form-control" 
                                  id="postSummary" 
                                  rows="3" 
                                  v-model="post.summary" 
                                  placeholder="Tóm tắt ngắn gọn nội dung bài viết"></textarea>
                    </div>

                    <div class="mb-3">
                        <label for="postContent" class="form-label fw-bold">Nội dung <span class="text-danger">*</span></label>
                        <textarea class="form-control" 
                                  :class="{'is-invalid': errors.content}"
                                  id="postContent" 
                                  rows="10" 
                                  v-model="post.content" 
                                  required 
                                  placeholder="Nhập nội dung chi tiết của bài viết"></textarea>
                        <div class="invalid-feedback" v-if="errors.content">{{ errors.content }}</div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="postCategory" class="form-label fw-bold">Chuyên mục <span class="text-danger">*</span></label>
                            <select class="form-select" id="postCategory" v-model="post.category" required>
                                <option value="" disabled>-- Chọn chuyên mục --</option>
                                <option v-for="(title, slug) in categoryMap" :key="slug" :value="title">
                                    {{ title }}
                                </option>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="postAuthor" class="form-label fw-bold">Tác giả</label>
                            <input type="text" 
                                   class="form-control" 
                                   id="postAuthor" 
                                   v-model="post.author" 
                                   placeholder="Tên tác giả" />
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold d-block">Hình Ảnh</label>
                            <div class="d-flex align-items-center">
                                <label
                                    for="postImageFile"
                                    class="btn btn-sm btn-outline-primary mt-2 rounded-pill me-3"
                                >
                                    <i class="fas fa-upload me-1"></i> Chọn File Ảnh
                                </label>
                                <input
                                    type="file"
                                    id="postImageFile"
                                    class="d-none"
                                    accept="image/*"
                                    @change="handleFileChange" 
                                />
                                <span v-if="post.imageName" class="small text-success mt-2">
                                    File: {{ post.imageName }}
                                </span>
                            </div>
                            <div class="form-text">Chọn file ảnh. Chỉ tên file được lưu lại (Không upload file thực tế).</div>
                            
                            <div v-if="currentImageSrc" class="mt-3 border rounded p-2 text-center bg-light">
                                <p class="small mb-1 fw-bold">Xem trước:</p>
                                <img :src="currentImageSrc" 
                                     alt="Preview" 
                                     style="width: 150px; height: 100px; object-fit: cover;" 
                                     class="rounded shadow-sm">
                            </div>

                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="postStatus" class="form-label fw-bold">Trạng thái <span class="text-danger">*</span></label>
                            <select class="form-select" id="postStatus" v-model="post.status" required>
                                <option value="draft">Bản nháp</option>
                                <option value="published">Đã đăng (Xuất bản)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div v-if="message" :class="messageClass" class="mt-3 p-3 rounded">{{ message }}</div>

                    <div class="d-flex justify-content-between mt-4">
                        <router-link :to="{ name: 'NewsManager' }" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-1"></i> Quay lại
                        </router-link>
                        <button type="submit" class="btn btn-primary" :disabled="isSaving">
                            <i v-if="isSaving" class="fas fa-spinner fa-spin me-1"></i>
                            <i v-else class="fas fa-save me-1"></i>
                            {{ isEditing ? 'Lưu Thay Đổi' : 'Tạo Bài Viết' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const postId = computed(() => route.params.id);
const isEditing = computed(() => !!postId.value);

const API_URL = 'http://localhost:3000/posts';

// --- BIẾN RIÊNG CHO FILE UPLOAD VÀ PREVIEW ---
// Lưu URL tạm thời (blob:http://...) của file mới được chọn
const imagePreviewUrl = ref(null); 
// ---------------------------------------------


// Hàm tạo slug đơn giản
const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
};

const initialPostState = {
    title: '',
    summary: '',
    content: '',
    author: localStorage.getItem('userName') || 'Admin', 
    category: '', 
    date: new Date().toLocaleDateString('vi-VN'),
    status: 'draft',
    imageName: '', // Tên file ảnh (được lưu vào DB)
    slug: '',
    views: 0
};

const post = ref({ ...initialPostState });
const loading = ref(false);
const isSaving = ref(false);
const message = ref('');
const messageClass = ref('');
const errors = ref({});

// Ánh xạ chuyên mục
const categoryMap = {
    'thoi-su': 'Thời sự',
    'kinh-te': 'Kinh Tế',
    'cong-nghe': 'Công Nghệ',
    'quoc-te': 'Quốc Tế',
    'giai-tri': 'Giải Trí',
};

// ------------------------------------
// LOGIC HÌNH ẢNH
// ------------------------------------

// Hàm lấy đường dẫn cho file tĩnh (ảnh đã lưu trong assets)
const getStaticImageUrl = (imageName) => {
    if (!imageName) {
        // Trả về ảnh placeholder nếu tên file bị thiếu
        return 'https://via.placeholder.com/200x150?text=No+Image';
    }
    
    // ⭐ ĐÂY LÀ ĐƯỜNG DẪN MỚI: Chỉ cần đường dẫn tuyệt đối từ thư mục gốc (public/)
    // Nếu ảnh trong public/Images/ -> sử dụng /Images/
    return `/Images/${imageName}`;
};

// Computed property để xác định nguồn ảnh hiện tại (ưu tiên ảnh vừa chọn)
const currentImageSrc = computed(() => {
    if (imagePreviewUrl.value) {
        return imagePreviewUrl.value;
    }
    if (post.value.imageName) {
        return getStaticImageUrl(post.value.imageName);
    }
    return null;
});

// Xử lý khi chọn file mới
const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        // 1. Lưu tên file vào post.imageName (sẽ gửi lên DB)
        post.value.imageName = file.name;

        // 2. Tạo URL tạm thời để xem trước (CHỈ CÓ TÁC DỤNG PHÍA CLIENT)
        if (imagePreviewUrl.value) {
            URL.revokeObjectURL(imagePreviewUrl.value); // Giải phóng URL cũ
        }
        imagePreviewUrl.value = URL.createObjectURL(file);
    } else {
        post.value.imageName = '';
        if (imagePreviewUrl.value) {
            URL.revokeObjectURL(imagePreviewUrl.value);
        }
        imagePreviewUrl.value = null;
    }
};


// ------------------------------------
// LOGIC FORM
// ------------------------------------

// Theo dõi tiêu đề để tự động tạo slug
watch(() => post.value.title, (newTitle) => {
    post.value.slug = slugify(newTitle);
});

// Xóa URL tạm thời khi tải dữ liệu mới hoặc chuyển trang
const clearPreview = () => {
    if (imagePreviewUrl.value) {
        URL.revokeObjectURL(imagePreviewUrl.value);
    }
    imagePreviewUrl.value = null;
};

const fetchPost = async () => {
    if (!isEditing.value) return;

    loading.value = true;
    clearPreview(); // Xóa preview cũ khi tải bài mới
    try {
        const response = await axios.get(`${API_URL}/${postId.value}`);
        post.value = response.data;
    } catch (err) {
        console.error('Lỗi tải bài viết:', err);
        message.value = `Lỗi: Không tìm thấy bài viết ID ${postId.value}. Tự động chuyển hướng.`;
        messageClass.value = 'alert-danger';
        setTimeout(() => { router.push({ name: 'NewsManager' }); }, 3000); 
    } finally {
        loading.value = false;
    }
};

const validateForm = () => {
    errors.value = {};
    if (!post.value.title) {
        errors.value.title = 'Tiêu đề không được để trống.';
    }
    if (!post.value.content) {
        errors.value.content = 'Nội dung không được để trống.';
    }
    if (!post.value.category) {
         errors.value.category = 'Vui lòng chọn chuyên mục.';
    }
    return Object.keys(errors.value).length === 0;
};

const savePost = async () => {
    if (!validateForm()) {
        message.value = 'Vui lòng kiểm tra và điền đầy đủ các trường bị lỗi.';
        messageClass.value = 'alert-danger';
        return;
    }

    isSaving.value = true;
    message.value = '';
    
    // Chỉ gửi dữ liệu form, không gửi file (vì JSON Server không hỗ trợ)
    let dataToSave = { ...post.value }; 

    try {
        let response;
        if (isEditing.value) {
            response = await axios.patch(`${API_URL}/${postId.value}`, dataToSave);
            message.value = 'Chỉnh sửa bài viết thành công!';
            messageClass.value = 'alert-success';
        } else {
            dataToSave.date = new Date().toLocaleDateString('vi-VN');
            response = await axios.post(API_URL, dataToSave);
            message.value = 'Tạo bài viết mới thành công!';
            messageClass.value = 'alert-success';
            
            // Chuyển sang chế độ chỉnh sửa bài vừa tạo
            router.replace({ name: 'EditPost', params: { id: response.data.id } });
        }
        
    } catch (err) {
        console.error('Lỗi khi lưu bài viết:', err);
        message.value = `Thao tác thất bại. Lỗi Server: ${err.message}`;
        messageClass.value = 'alert-danger';
    } finally {
        isSaving.value = false;
        // Giữ lại tên file đã chọn, nhưng xóa preview URL
        clearPreview(); 
        setTimeout(() => { message.value = ''; }, 5000);
    }
};

onMounted(() => {
    fetchPost();
});
</script>