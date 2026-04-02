<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-6 col-md-9">
        <div class="card shadow-lg border-0 rounded-3">
          <div class="card-header bg-success text-white text-center py-3">
            <h4 class="mb-0 fw-bold">
              <i class="fas fa-user-plus me-2"></i> Đăng Ký Tài Khoản Mới
            </h4>
          </div>
          
          <div class="card-body p-4">
            
            <div v-if="successMessage" class="alert alert-success small text-center">
              <i class="fas fa-check-circle me-1"></i> {{ successMessage }}
            </div>
            <div v-if="registerError" class="alert alert-danger small text-center">
              <i class="fas fa-exclamation-triangle me-1"></i> {{ registerError }}
            </div>

            <form @submit.prevent="handleRegister">
              
              <div class="mb-3">
                <label for="name" class="form-label fw-semibold">Tên hiển thị</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-signature"></i></span>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    v-model="registerData.name" 
                    placeholder="Ví dụ: Nguyễn Văn A" 
                    required
                  >
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label fw-semibold">Email</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="registerData.email" 
                    placeholder="Địa chỉ email" 
                    required
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label fw-semibold">Mật khẩu</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-lock"></i></span>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    v-model="registerData.password" 
                    placeholder="Tối thiểu 6 ký tự" 
                    required
                  >
                </div>
              </div>
              
              <div class="mb-4">
                <label for="confirmPassword" class="form-label fw-semibold">Xác nhận mật khẩu</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-check-double"></i></span>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword" 
                    v-model="registerData.confirmPassword" 
                    placeholder="Nhập lại mật khẩu" 
                    required
                  >
                </div>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-success fw-bold" :disabled="isRegistering">
                  <span v-if="isRegistering" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isRegistering ? 'Đang đăng ký...' : 'Đăng Ký' }}
                </button>
              </div>
            </form>
          </div>
          
          <div class="card-footer text-center bg-light p-3">
            <p class="mb-0 small text-muted">
              Đã có tài khoản? 
              <router-link :to="{ name: 'Login' }" class="text-success fw-semibold text-decoration-none">Đăng nhập ngay</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const registerData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const registerError = ref(null);
const successMessage = ref(null);
const isRegistering = ref(false);

const handleRegister = async () => {
  registerError.value = null;
  successMessage.value = null;
  isRegistering.value = true;

  try {
    const { name, email, password, confirmPassword } = registerData.value;

    if (password.length < 6) {
      registerError.value = 'Mật khẩu phải tối thiểu 6 ký tự.';
      return;
    }

    if (password !== confirmPassword) {
      registerError.value = 'Mật khẩu xác nhận không khớp.';
      return;
    }
    
    // Gửi dữ liệu đăng ký với các trường phụ được đặt là null
    const userData = {
        name: name,
        email: email,
        password: password, 
        role: 'User', 
        status: 'active',
        phone: null,     
        address: null,   
        bio: null,       
        avatar: null,    
        createdAt: new Date().toISOString() 
    };

    const response = await axios.post('http://localhost:3000/users', userData);

    if (response.status === 201) {
        successMessage.value = `Tài khoản ${email} đã đăng ký thành công! Bạn sẽ được chuyển hướng sang trang đăng nhập.`;
        
        registerData.value = { name: '', email: '', password: '', confirmPassword: '' };

        setTimeout(() => {
            router.push({ name: 'Login' });
        }, 2000);
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
        registerError.value = 'Lỗi kết nối Server. Vui lòng kiểm tra JSON Server.';
    } else {
        registerError.value = 'Lỗi hệ thống khi đăng ký.';
    }
    console.error('Register POST Error:', error);
  } finally {
    isRegistering.value = false;
  }
};
</script>