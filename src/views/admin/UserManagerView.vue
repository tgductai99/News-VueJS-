<template>
  <div class="p-4">
    <h2 class="mb-4 text-primary fw-bold">
      <i class="fas fa-users-cog me-2"></i> Quản Lý Người Dùng
    </h2>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <router-link :to="{ name: 'NewUser' }" class="btn btn-success btn-lg rounded-pill shadow-sm">
        <i class="fas fa-user-plus me-2"></i> Thêm Người Dùng Mới
      </router-link>

      <div class="d-flex align-items-center">
        <select v-model="filterRole" class="form-select me-3" style="width: 150px;">
          <option value="">Tất cả Vai trò</option>
          <option value="Admin">Quản trị viên</option>
          <option value="User">Độc giả</option>
        </select>

        <div class="input-group" style="width: 300px;">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm theo tên/email..." 
            v-model="searchQuery"
          >
          <span class="input-group-text"><i class="fas fa-search"></i></span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info text-center">
      <i class="fas fa-spinner fa-spin me-2"></i> Đang tải danh sách người dùng...
    </div>
    <div v-else-if="error" class="alert alert-danger text-center">
      {{ error }}
    </div>
    <div v-else-if="filteredUsers.length === 0" class="alert alert-warning text-center">
      Không tìm thấy người dùng nào phù hợp.
    </div>

    <div v-else class="table-responsive shadow-lg rounded-3">
      <table class="table table-hover table-striped align-middle bg-white">
        <thead class="bg-light text-dark">
          <tr>
            <th scope="col" style="width: 5%;">ID</th>
            <th scope="col" style="width: 25%;">Họ tên</th>
            <th scope="col" style="width: 20%;">Email</th>
            <th scope="col" style="width: 15%;">Điện thoại</th>
            <th scope="col" style="width: 15%;">Vai trò</th>
            <th scope="col" style="width: 20%;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <h6 class="fw-bold mb-0 text-dark">{{ user.name || 'N/A' }}</h6>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || 'Chưa có' }}</td>
            <td>
              <span :class="`badge rounded-pill bg-${getRoleBadge(user.role)}`">
                {{ user.role || 'User' }}
              </span>
            </td>
            <td>
              <router-link 
                :to="{ name: 'EditUser', params: { id: user.id } }"
                class="btn btn-sm btn-info text-white me-2"
                title="Chỉnh sửa"
              >
                <i class="fas fa-edit"></i>
              </router-link>
              
              <button 
                @click="confirmDelete(user.id, user.name || user.email)"
                class="btn btn-sm btn-danger"
                title="Xóa"
              >
                <i class="fas fa-trash-alt"></i>
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

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const filterRole = ref('');

const API_URL = 'http://localhost:3000/users';

// 1. Hàm Tải dữ liệu
const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(API_URL);
    // Giả sử dữ liệu trả về có trường id, name, email, role, phone
    users.value = response.data.sort((a, b) => {
      // Sắp xếp Admin lên đầu
      if (a.role === 'Admin' && b.role !== 'Admin') return -1;
      if (a.role !== 'Admin' && b.role === 'Admin') return 1;
      // Nếu cùng vai trò, sắp xếp theo ID giảm dần (người mới nhất lên đầu)
      return b.id - a.id;
    });
  } catch (err) {
    error.value = 'Không thể tải danh sách người dùng. Vui lòng kiểm tra JSON Server.';
    console.error('Lỗi tải người dùng Admin:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

// 2. Computed Property cho Tìm kiếm và Lọc
const filteredUsers = computed(() => {
  let filtered = users.value;

  // Lọc theo Vai trò
  if (filterRole.value) {
    filtered = filtered.filter(user => (user.role || 'User') === filterRole.value);
  }

  // Lọc theo Tên/Email (Tìm kiếm)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      (user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query))
    );
  }

  return filtered;
});

// 3. Hàm Xử lý Vai trò (hiển thị màu sắc)
const getRoleBadge = (role) => {
  if (role === 'Admin') {
    return 'danger'; // Admin dùng màu nổi bật
  }
  return 'primary'; // User dùng màu mặc định
};

// 4. Hàm Xóa người dùng
const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_URL}/${userId}`);
    // Cập nhật lại danh sách người dùng sau khi xóa thành công
    users.value = users.value.filter(u => u.id !== userId);
    alert('Xóa người dùng thành công!');
  } catch (err) {
    error.value = 'Lỗi khi xóa người dùng. Vui lòng thử lại.';
    console.error('Lỗi xóa người dùng:', err);
  }
};

const confirmDelete = (userId, userName) => {
  if (confirm(`Bạn có chắc chắn muốn xóa người dùng: "${userName}" không?`)) {
    deleteUser(userId);
  }
};
</script>

<style scoped>
</style>