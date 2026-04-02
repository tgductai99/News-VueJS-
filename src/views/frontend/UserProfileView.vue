<template>
  <div class="container pt-5 pb-5">
    
    <div
      class="d-flex justify-content-between flex-wrap align-items-center pt-3 pb-2 mb-4 border-bottom"
    >
      <h1 class="h2 text-primary">
        <i class="fas fa-address-card me-2"></i> Thông Tin Hồ Sơ Cá Nhân
      </h1>
    </div>

    <div v-if="error && !isUpdating" class="alert alert-danger text-center">{{ error }}</div>

    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card shadow-lg border-0 rounded-4 p-4 p-md-5">
          <form @submit.prevent="handleUpdateProfile">
            
            <div class="text-center mb-5">
              <img
                :src="avatarPreview || userInfo.avatar"
                alt="Avatar người dùng"
                class="rounded-circle profile-img"
                style="height: 100px; width: 100px; object-fit: cover;"
              />
              <h3 class="mt-3 fw-bold text-dark">
                {{ userInfo.name }} (<span :class="`text-${getRoleBadgeColor(userInfo.role)}`">{{ userInfo.role }}</span>)
              </h3>
              <p class="text-muted">{{ userInfo.email }}</p>

              <label
                for="profilePicture"
                class="btn btn-sm btn-outline-primary mt-2 rounded-pill"
              >
                <i class="fas fa-upload me-1"></i> Thay đổi Avatar
              </label>
              <input
                type="file"
                id="profilePicture"
                class="d-none"
                accept="image/*"
                @change="handleFileChange" 
              />
            </div>
            
            <div v-if="successMessage" class="alert alert-success small text-center">{{ successMessage }}</div>
            <div v-if="error && isUpdating" class="alert alert-danger small text-center">{{ error }}</div>


            <div class="row">
              <div class="col-md-6 mb-4">
                <label for="fullName" class="form-label fw-bold">Họ và Tên</label>
                <input type="text" class="form-control" id="fullName" v-model="profileData.name" required />
              </div>

              <div class="col-md-6 mb-4">
                <label for="email" class="form-label fw-bold">Địa chỉ Email</label>
                <input type="email" class="form-control" id="email" :value="userInfo.email" disabled />
                <div class="form-text">
                  Không thể thay đổi email (đã dùng để đăng nhập).
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-4">
                <label for="SDT" class="form-label fw-bold">Số điện thoại</label>
                <input type="text" class="form-control" id="SDT" v-model="profileData.phone" />
              </div>

              <div class="col-md-6 mb-4">
                <label for="address" class="form-label fw-bold">Địa chỉ</label>
                <input type="text" class="form-control" id="address" v-model="profileData.address" />
              </div>
            </div>

            <div class="mb-4">
              <label for="bio" class="form-label fw-bold">Tiểu sử (Mô tả bản thân)</label>
              <textarea class="form-control" id="bio" rows="4" v-model="profileData.bio"></textarea>
            </div>

            <h4 class="mt-5 mb-3 border-bottom pb-2 text-secondary">Đổi Mật Khẩu</h4>
            <div class="row">
              <div class="col-md-6 mb-4">
                <label for="currentPassword" class="form-label fw-bold">Mật khẩu Hiện tại</label>
                <input type="password" class="form-control" id="currentPassword" v-model="passwordData.currentPassword" placeholder="Nhập mật khẩu hiện tại" />
              </div>
              <div class="col-md-6 mb-4">
                <label for="newPassword" class="form-label fw-bold">Mật khẩu Mới</label>
                <input type="password" class="form-control" id="newPassword" v-model="passwordData.newPassword" placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)" />
              </div>
            </div>

            <div class="d-grid gap-2 mt-4">
              <button
                type="submit"
                class="btn btn-primary btn-lg rounded-pill shadow-lg"
                :disabled="isUpdating"
              >
                <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-sync-alt me-2"></i> 
                {{ isUpdating ? 'Đang cập nhật...' : 'Cập Nhật Hồ Sơ' }}
              </button>
            </div>
          </form>
          
          <div class="d-grid gap-2 mt-4">
             <button @click="handleLogout" class="btn btn-outline-danger btn-lg rounded-pill">
                <i class="fas fa-sign-out-alt me-2"></i> Đăng Xuất
             </button>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const isUpdating = ref(false);
const error = ref(null);
const successMessage = ref(null);

const INTERNAL_PLACEHOLDER = 'no-avatar.png'; 

const userInfo = ref({
    id: null,
    name: 'Khách',
    email: 'N/A',
    role: 'Guest',
    avatar: 'https://via.placeholder.com/100x100?text=Loading'
});

const profileData = ref({
    name: '',
    phone: '',
    address: '',
    bio: ''
});

const passwordData = ref({
    currentPassword: '',
    newPassword: ''
});

const selectedAvatarFile = ref(null);
const avatarPreview = ref(null); 

const getRoleBadgeColor = (role) => {
    const map = { 'Admin': 'danger', 'User': 'success', 'Guest': 'secondary', };
    return map[role] || 'secondary';
};

// Thay thế hàm getAssetUrl cũ bằng hàm này
const getAssetUrl = (imageName) => {
    if (!imageName) {
        // Nếu không có tên file, trả về ảnh placeholder
        return 'https://via.placeholder.com/200x150?text=No+Image';
    }
    
    // ⭐ ĐƯỜNG DẪN MỚI CHO ẢNH TIN TỨC:
    // Vì ảnh đã nằm trong public/Images, đường dẫn tuyệt đối bắt đầu từ gốc là /Images/
    // (Lưu ý chữ I hoa trong Images, nếu bạn đặt tên là public/images thì dùng /images/)
    return `/Images/${imageName}`;
}

// Hàm này loại bỏ new URL, try/catch, và tham chiếu đến src/assets/
// Đây là giải pháp DỨT ĐIỂM cho vấn đề phải npm run dev lại.

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedAvatarFile.value = file;
        
        if (avatarPreview.value) {
            URL.revokeObjectURL(avatarPreview.value); 
        }
        avatarPreview.value = URL.createObjectURL(file);
        
    } else {
        selectedAvatarFile.value = null;
        if (avatarPreview.value) {
            URL.revokeObjectURL(avatarPreview.value);
        }
        avatarPreview.value = null;
    }
};


// 1. Tải thông tin người dùng từ API (ĐÃ SỬA LỖI ĐỌC USER ID)
const fetchUserProfile = async () => {
    let userFromStorage = null;
    try {
        const userJson = localStorage.getItem('user');
        if (!userJson) {
             // Chưa đăng nhập, chuyển hướng
             router.push({ name: 'Login' });
             return;
        }
        userFromStorage = JSON.parse(userJson);
    } catch (e) {
        // Lỗi parse JSON, chuyển hướng
        router.push({ name: 'Login' });
        return;
    }
    
    const userId = userFromStorage.id;
    
    if (!userId) {
        router.push({ name: 'Login' });
        return;
    }
    // ************************************************************

    try {
        const response = await axios.get(`http://localhost:3000/users/${userId}`);
        const user = response.data;
        
        // Cập nhật thông tin cơ bản
        userInfo.value.id = user.id;
        userInfo.value.name = user.name;
        userInfo.value.email = user.email;
        userInfo.value.role = user.role || 'User';
        
        // Cập nhật các trường dữ liệu form
        profileData.value.name = user.name || '';
        profileData.value.phone = user.phone || '';
        profileData.value.address = user.address || '';
        profileData.value.bio = user.bio || '';
        
        // LOGIC HIỂN THỊ AVATAR
        let avatarSrc = '';
        if (user.avatar && user.avatar.startsWith('data:image')) {
            avatarSrc = user.avatar; // Base64
        } else if (user.avatar) {
            avatarSrc = getAssetUrl(user.avatar); 
        } else {
            avatarSrc = getAssetUrl(INTERNAL_PLACEHOLDER);
        }
        
        userInfo.value.avatar = avatarSrc; 

    } catch (err) {
        error.value = 'Không thể tải hồ sơ. Vui lòng kiểm tra JSON Server.';
        userInfo.value.avatar = getAssetUrl(INTERNAL_PLACEHOLDER); 
        console.error('Fetch Profile Error:', err);
    }
};

onMounted(fetchUserProfile);


// 2. Xử lý Cập Nhật Hồ Sơ (PATCH)
const handleUpdateProfile = async () => {
    isUpdating.value = true;
    error.value = null;
    successMessage.value = null;

    const userId = userInfo.value.id;

    // 1. Validation mật khẩu
    if (passwordData.value.currentPassword || passwordData.value.newPassword) {
        if (passwordData.value.newPassword.length < 6) {
            error.value = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
            isUpdating.value = false;
            return;
        }
        // *LƯU Ý: Trong ứng dụng thực tế, phải kiểm tra mật khẩu hiện tại qua API*
    }

    try {
        const updatePayload = {
            name: profileData.value.name,
            phone: profileData.value.phone || null, 
            address: profileData.value.address || null,
            bio: profileData.value.bio || null,
        };
        
        // Logic Avatar (Chỉ lưu tên file/URL hoặc null vào DB)
        if (selectedAvatarFile.value) {
            updatePayload.avatar = selectedAvatarFile.value.name; 
        } else if (userInfo.value.avatar && userInfo.value.avatar !== getAssetUrl(INTERNAL_PLACEHOLDER)) {
            const parts = userInfo.value.avatar.split('/');
            updatePayload.avatar = parts[parts.length - 1]; 
        } else {
            updatePayload.avatar = null;
        }
        
        // Xử lý Đổi Mật Khẩu
        if (passwordData.value.currentPassword || passwordData.value.newPassword) {
            updatePayload.password = passwordData.value.newPassword;
        }

        const response = await axios.patch(`http://localhost:3000/users/${userId}`, updatePayload);

        if (response.status === 200) {
            
            // Cập nhật lại đối tượng user trong Local Storage
            const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...updatePayload };
            localStorage.setItem('user', JSON.stringify(updatedUser)); 

            // Cập nhật lại tên hiển thị (nếu có header dùng riêng khóa 'userName', mặc dù ta đã sửa code header để dùng 'user')
            // localStorage.setItem('userName', updatePayload.name); 

            // Cập nhật UI
            userInfo.value.name = updatePayload.name;
            
            if (selectedAvatarFile.value) {
                userInfo.value.avatar = getAssetUrl(selectedAvatarFile.value.name);
            } else if (!updatePayload.avatar) {
                userInfo.value.avatar = getAssetUrl(INTERNAL_PLACEHOLDER);
            }

            // Dọn dẹp
            if (avatarPreview.value) {
                URL.revokeObjectURL(avatarPreview.value);
            }
            selectedAvatarFile.value = null;
            avatarPreview.value = null;

            successMessage.value = 'Cập nhật hồ sơ thành công!';
            passwordData.value = { currentPassword: '', newPassword: '' };
        }
        
    } catch (err) {
        error.value = 'Lỗi khi cập nhật hồ sơ. Vui lòng thử lại.';
        console.error('Update Profile Error:', err);
    } finally {
        isUpdating.value = false;
        setTimeout(() => successMessage.value = null, 3000);
    }
};


// 3. Xử lý Đăng xuất (ĐÃ SỬA: Chỉ xóa các khóa chính)
const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user'); // *** QUAN TRỌNG: Xóa khóa 'user' đầy đủ

  // Xóa các khóa cũ không cần thiết (tùy chọn, để dọn dẹp)
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId'); 

  alert('Bạn đã đăng xuất thành công.');
  router.push({ name: 'Login' });
};
</script>