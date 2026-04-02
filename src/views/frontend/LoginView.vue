<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-5 col-md-8">
        <div class="card shadow-lg border-0 rounded-3">
          <div class="card-header bg-primary text-white text-center py-3">
            <h4 class="mb-0 fw-bold">
              <i class="fas fa-sign-in-alt me-2"></i> Đăng Nhập Hệ Thống
            </h4>
          </div>
          
          <div class="card-body p-4">
            
            <div v-if="loginError" class="alert alert-danger small text-center">
              <i class="fas fa-exclamation-triangle me-1"></i> {{ loginError }}
            </div>

            <form @submit.prevent="handleLogin">
              
              <div class="mb-3">
                <label for="username" class="form-label fw-semibold">Tên đăng nhập (Email)</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-user"></i></span>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    v-model="loginData.username" 
                    placeholder="Nhập email" 
                    required
                  >
                </div>
              </div>
              
              <div class="mb-4">
                <label for="password" class="form-label fw-semibold">Mật khẩu</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-lock"></i></span>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    v-model="loginData.password" 
                    placeholder="Nhập mật khẩu" 
                    required
                  >
                </div>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary fw-bold" :disabled="isLoggingIn">
                  <span v-if="isLoggingIn" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoggingIn ? 'Đang xử lý...' : 'Đăng Nhập' }}
                </button>
              </div>
            </form>
          </div>
          
          <div class="card-footer text-center bg-light p-3">
            <p class="mb-0 small text-muted">
              Chưa có tài khoản? 
              <router-link :to="{ name: 'Register' }" class="text-primary fw-semibold text-decoration-none">Đăng ký ngay</router-link>
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

const loginData = ref({
  username: '', // email
  password: ''
});
const loginError = ref(null);
const isLoggingIn = ref(false);

// Tài khoản Admin cố định
const ADMIN_ACCOUNT = {
  id: '1', 
  email: 'admin@poly.vn',
  password: '123',
  name: 'Administrator',
  role: 'Admin'
};

const handleLogin = async () => {
  loginError.value = null;
  isLoggingIn.value = true;

  try {
    const { username, password } = loginData.value;

    // 1. KIỂM TRA TÀI KHOẢN ADMIN CỐ ĐỊNH
    if (username === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      localStorage.setItem('isAuthenticated', 'true');
      
      // *** ĐÃ SỬA: Lưu đối tượng JSON vào khóa 'user' ***
      localStorage.setItem('user', JSON.stringify(ADMIN_ACCOUNT)); 
      
      alert(`Chào mừng ${ADMIN_ACCOUNT.name} (${ADMIN_ACCOUNT.role})! Đăng nhập thành công.`);
      router.push({ name: 'AdminDashboard' }); 
      return;
    }

    // 2. KIỂM TRA TÀI KHOẢN TỪ JSON SERVER (USERS)
    const userResponse = await axios.get(`http://localhost:3000/users?email=${username}&password=${password}`);
    
    if (userResponse.data.length > 0) {
        const user = userResponse.data[0];
        
        // Lưu trạng thái đăng nhập
        localStorage.setItem('isAuthenticated', 'true');
        
        // *** ĐÃ SỬA: Lưu đối tượng JSON vào khóa 'user' ***
        localStorage.setItem('user', JSON.stringify(user)); 
        
        alert(`Chào mừng ${user.name} (${user.role || 'User'})! Đăng nhập thành công.`);

        if (user.role === 'Admin') {
            router.push({ name: 'AdminDashboard' });
        } else {
            router.push({ name: 'Home' }); 
        }

    } else {
        loginError.value = 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.';
    }

  } catch (error) {
    loginError.value = 'Lỗi hệ thống khi đăng nhập. Vui lòng kiểm tra JSON Server.';
    console.error('Login Error:', error);
  } finally {
    isLoggingIn.value = false;
  }
};
</script>