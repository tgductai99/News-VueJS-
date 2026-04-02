<template>
  <div class="p-4">
    <h2 class="mb-4 text-primary fw-bold">
      <i :class="isEditMode ? 'fas fa-user-edit' : 'fas fa-user-plus'" class="me-2"></i> 
      {{ isEditMode ? 'Chỉnh Sửa Thông Tin Người Dùng' : 'Thêm Người Dùng Mới' }}
    </h2>

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg border-0 rounded-3">
          <div class="card-body p-4">

            <div v-if="loadingData" class="text-center p-5">
                <i class="fas fa-spinner fa-spin fa-2x text-info"></i> Đang tải dữ liệu...
            </div>
            
            <div v-if="error" class="alert alert-danger text-center">
              {{ error }}
            </div>

            <form @submit.prevent="handleSubmit" v-else>
              
              <div v-if="isEditingOtherUser" class="alert alert-warning small">
                <i class="fas fa-exclamation-triangle me-1"></i> Bạn đang chỉnh sửa tài khoản của người dùng khác. Bạn chỉ có thể thay đổi **Vai trò** của họ.
              </div>


              <div class="mb-3">
                <label for="name" class="form-label fw-bold">Họ và Tên (*)</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="name" 
                  v-model="userForm.name" 
                  required
                  :disabled="isEditingOtherUser" 
                >
              </div>

              <div class="mb-3">
                <label for="email" class="form-label fw-bold">Email (*)</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="userForm.email" 
                  required
                  :disabled="isEditingOtherUser" 
                >
              </div>

              <div class="mb-3">
                <label for="role" class="form-label fw-bold">Vai trò (*)</label>
                <select 
                  class="form-select" 
                  id="role" 
                  v-model="userForm.role" 
                  required
                >
                  <option value="User">Độc giả (User)</option>
                  <option value="Admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label fw-bold">
                    Mật khẩu 
                    <span v-if="!isEditMode">(*)</span>
                    <span v-else class="text-muted small">(Để trống nếu không muốn thay đổi)</span>
                </label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="userForm.password" 
                  :required="!isEditMode"
                  :disabled="isEditingOtherUser" 
                >
              </div>
              
              <hr class="my-4">

              <div class="mb-3">
                <label for="phone" class="form-label fw-bold">Điện thoại</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phone" 
                  v-model="userForm.phone" 
                  :disabled="isEditingOtherUser" 
                >
              </div>

              <div class="mb-4">
                <label for="address" class="form-label fw-bold">Địa chỉ</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="address" 
                  v-model="userForm.address" 
                  :disabled="isEditingOtherUser" 
                >
              </div>

              <div class="d-flex justify-content-end">
                <button 
                  type="button" 
                  class="btn btn-secondary me-3" 
                  @click="router.push({ name: 'UserManager' })"
                >
                  <i class="fas fa-times-circle me-2"></i> Hủy
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ isEditMode ? 'Lưu Thay Đổi' : 'Thêm Mới' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const API_URL = 'http://localhost:3000/users';

const userForm = ref({
  name: '',
  email: '',
  password: '', // Chỉ dùng khi tạo/thay đổi
  role: 'User', // Mặc định là User
  phone: '',
  address: '',
});

const loadingData = ref(false);
const isSubmitting = ref(false);
const error = ref(null);

// Xác định chế độ: Chỉnh sửa hay Tạo mới
const isEditMode = computed(() => !!route.params.id);
const userId = computed(() => route.params.id);


// 🌟 LOGIC MỚI: Lấy ID của Admin đang đăng nhập
const getCurrentAdminId = () => {
    try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            return user.id;
        }
    } catch (e) {
        console.error("Lỗi parse user:", e);
    }
    return null;
};

const currentAdminId = ref(getCurrentAdminId());

// 🌟 LOGIC MỚI: Xác định Admin đang chỉnh sửa hồ sơ của người khác
const isEditingOtherUser = computed(() => {
    // Chỉ áp dụng khi đang ở chế độ chỉnh sửa VÀ ID người dùng chỉnh sửa khác với ID của Admin
    return isEditMode.value && (userId.value !== currentAdminId.value);
});


// 1. Tải dữ liệu người dùng hiện tại (Chỉ trong chế độ Edit)
const fetchUser = async (id) => {
  loadingData.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    const data = response.data;
    
    // Gán dữ liệu vào form, ngoại trừ mật khẩu
    userForm.value.name = data.name || '';
    userForm.value.email = data.email || '';
    userForm.value.role = data.role || 'User';
    userForm.value.phone = data.phone || '';
    userForm.value.address = data.address || '';

  } catch (err) {
    error.value = 'Không thể tải dữ liệu người dùng này. Vui lòng kiểm tra ID và Server.';
    console.error('Lỗi tải dữ liệu người dùng:', err);
  } finally {
    loadingData.value = false;
  }
};

// Theo dõi userId để tải dữ liệu khi chuyển sang chế độ Edit
watch(userId, (newId) => {
    if (newId && isEditMode.value) {
        fetchUser(newId);
    }
}, { immediate: true });

onMounted(() => {
    if (isEditMode.value) {
        fetchUser(userId.value);
    }
});

// 2. Xử lý Gửi Form (Tạo mới hoặc Cập nhật)
const handleSubmit = async () => {
  isSubmitting.value = true;
  error.value = null;
  
  // Dữ liệu sẽ gửi đi
  let dataToSend = {
    role: userForm.value.role, // Vai trò luôn được gửi đi vì luôn được phép sửa
  };

  // 🌟 LOGIC MỚI: Nếu đang chỉnh sửa người khác, chỉ cho phép gửi trường 'role'
  if (!isEditingOtherUser.value) {
      // Nếu là tạo mới hoặc chỉnh sửa chính mình, gửi tất cả các trường
      dataToSend.name = userForm.value.name;
      dataToSend.email = userForm.value.email;
      dataToSend.phone = userForm.value.phone;
      dataToSend.address = userForm.value.address;
      
      // Thêm mật khẩu vào dataToSend nếu có
      if (userForm.value.password) {
        dataToSend.password = userForm.value.password;
      } else if (!isEditMode.value) {
        // Không cho phép tạo mới nếu không có mật khẩu (đã check required ở template)
        isSubmitting.value = false;
        return;
      }
  } else {
      // Nếu đang chỉnh sửa người khác và có cố tình nhập mật khẩu, bỏ qua mật khẩu.
      // Chỉ gửi role.
      if (userForm.value.password) {
          // Báo lỗi nếu cố tình thay đổi mật khẩu khi sửa user khác
          error.value = 'Bạn không được phép thay đổi mật khẩu của người dùng khác.';
          isSubmitting.value = false;
          return;
      }
  }

  try {
    if (isEditMode.value) {
      // Chế độ CẬP NHẬT (PATCH/PUT)
      await axios.patch(`${API_URL}/${userId.value}`, dataToSend); // Sử dụng PATCH để chỉ gửi các trường cần thiết
      alert('Cập nhật thông tin người dùng thành công!');
      
      // 🌟 Xử lý đặc biệt: Nếu Admin đang sửa chính mình, cần cập nhật localStorage
      if (!isEditingOtherUser.value) {
          const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...dataToSend };
          localStorage.setItem('user', JSON.stringify(updatedUser));
      }

    } else {
      // Chế độ TẠO MỚI (POST)
      await axios.post(API_URL, dataToSend);
      alert('Thêm người dùng mới thành công!');
    }

    // Chuyển hướng về trang quản lý người dùng
    router.push({ name: 'UserManager' });

  } catch (err) {
    error.value = isEditMode.value 
      ? 'Lỗi cập nhật người dùng. Vui lòng kiểm tra lại.'
      : 'Lỗi tạo người dùng mới. Vui lòng kiểm tra email đã tồn tại hay chưa.';
    console.error('Lỗi handleSubmit User:', err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Không có style đặc biệt */
</style>