import { createRouter, createWebHistory } from 'vue-router';

import AppLayout from '../layouts/AppLayout.vue';      // Layout chung cho Frontend
import AdminLayout from '../layouts/AdminLayout.vue';  // Layout chung cho Admin

import LoginView from '../views/frontend/LoginView.vue';
import RegisterView from '../views/frontend/RegisterView.vue';

// Frontend Views
import HomeView from '../views/frontend/HomeView.vue';
import CategoryView from '../views/frontend/CategoryView.vue'; 
import PostDetailView from '../views/frontend/PostDetailView.vue';
import UserProfileView from '../views/frontend/UserProfileView.vue'; // Hồ sơ độc giả

// Admin Views
import AdminDashboardView from '../views/admin/AdminDashboardView.vue';
import NewsManagerView from '../views/admin/NewsManagerView.vue';
import NewPostView from '../views/admin/NewPostView.vue';
import UserManagerView from '../views/admin/UserManagerView.vue';
import NewUserView from '../views/admin/NewUserView.vue';
import CommentManagerView from '../views/admin/CommentManagerView.vue';


const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },

  {
    path: '/',
    component: AppLayout, // Layout chính
    children: [
      { path: '', name: 'Home', component: HomeView },
      
      // ⚠️ Tối ưu hóa: Gộp tất cả chuyên mục vào một route động duy nhất
      // Tên route là 'Category' và lấy slug qua tham số URL: /thoi-su, /kinh-te, ...
      { 
          path: ':categorySlug', 
          name: 'Category', 
          component: CategoryView, 
          props: true 
      },
      
      // Trang Chi tiết Bài viết (post-detail.html)
      // Dùng param 'slug' để lấy dữ liệu bài viết
      { path: 'post/:slug', name: 'PostDetail', component: PostDetailView, props: true },
      
      // Trang Hồ sơ độc giả (hosoDocGia.html)
      { path: 'profile', name: 'UserProfile', component: UserProfileView, meta: { requiresAuth: true } },
    ]
  },

  {
    path: '/admin',
    component: AdminLayout, // Layout cho Admin
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboardView }, // admin-index.html

      // Quản lý Bài viết
      { path: 'news', name: 'NewsManager', component: NewsManagerView },
      { path: 'news/new', name: 'NewPost', component: NewPostView }, 
      { path: 'news/edit/:id', name: 'EditPost', component: NewPostView, props: true }, // Truyền ID qua params

      // Quản lý Người dùng
      { path: 'users', name: 'UserManager', component: UserManagerView },
      { path: 'users/new', name: 'NewUser', component: NewUserView }, 
      { path: 'users/edit/:id', name: 'EditUser', component: NewUserView, props: true }, 

      // Quản lý Bình luận
      { path: 'comments', name: 'CommentManager', component: CommentManagerView },

      // Trang hồ sơ Admin (Dùng chung UserProfileView)
      { path: 'profile', name: 'AdminProfile', component: UserProfileView }, 
    ]
  },
  
  // ⚠️ Xử lý 404: Đặt ở cuối cùng và dùng component NotFoundView
  { 
      path: '/:catchAll(.*)', 
      name: 'NotFound', 
      component: HomeView 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === 'true';

  // Lấy đối tượng user và vai trò của nó
  let user = null;
  let userRole = 'User';
  try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
          user = JSON.parse(userJson);
          userRole = user.role; // Lấy role từ đối tượng user
      }
  } catch (e) {
      // Bỏ qua lỗi parse, giữ user = null
  }
  
  const isAdmin = userRole === 'Admin';

  // 1. Đã đăng nhập và cố truy cập Login/Register
  if (isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    if (isAdmin) { 
      next({ name: 'AdminDashboard' });
    } else {
      next({ name: 'Home' });
    }
    return;
  }
  
  // 2. Kiểm tra yêu cầu Quyền Admin (requiresAdmin)
  if (to.meta.requiresAdmin) {
    if (!isAuthenticated) {
       alert("Bạn cần đăng nhập với tài khoản quản trị để truy cập!");
       next({ name: 'Login' });
       return;
    }
    
    // *** KIỂM TRA QUYỀN ADMIN DỰA TRÊN DỮ LIỆU ĐÃ PARSE ***
    if (!isAdmin) {
       alert("Bạn không có quyền truy cập trang quản trị!");
       next({ name: 'Home' }); 
       return;
    }
  } 

  // 3. Kiểm tra yêu cầu Đăng nhập (requiresAuth)
  if (to.meta.requiresAuth && !isAuthenticated) {
    alert("Vui lòng đăng nhập để truy cập trang này!");
    next({ name: "Login" });
    return; 
  } 
  
  // Cho phép đi tiếp
  next();
});

export default router;