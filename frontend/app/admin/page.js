'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tab điều hướng: 'products' (chính), 'categories', 'brands', 'users'
  const [activeTab, setActiveTab] = useState('products');

  // ================= 1. DỮ LIỆU BẢNG CATEGORIES (THEO CSDL) =================
  const initialCategories = [
    { id: 1, name: 'Điện thoại di động', slug: 'dien-thoai', description: 'Các dòng smartphone cao cấp và phổ thông', status: 'ACTIVE' },
    { id: 2, name: 'Laptop / Máy tính xách tay', slug: 'laptop', description: 'Laptop văn phòng, đồ họa và gaming', status: 'ACTIVE' },
    { id: 3, name: 'Máy tính bảng (Tablet)', slug: 'tablet', description: 'iPad và máy tính bảng Android', status: 'ACTIVE' },
    { id: 4, name: 'Phụ kiện & Tai nghe', slug: 'phu-kien', description: 'Tai nghe, củ cáp sạc, phụ kiện chính hãng', status: 'ACTIVE' },
    { id: 5, name: 'Đồng hồ thông minh', slug: 'smartwatch', description: 'Smartwatch và thiết bị đeo theo dõi sức khỏe', status: 'ACTIVE' },
  ];

  // ================= 2. DỮ LIỆU BẢNG BRANDS (THEO CSDL) =================
  const initialBrands = [
    { id: 1, name: 'Apple', slug: 'apple', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', status: 'ACTIVE' },
    { id: 2, name: 'Samsung', slug: 'samsung', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', status: 'ACTIVE' },
    { id: 3, name: 'ASUS', slug: 'asus', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg', status: 'ACTIVE' },
    { id: 4, name: 'Sony', slug: 'sony', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', status: 'ACTIVE' },
    { id: 5, name: 'Xiaomi', slug: 'xiaomi', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg', status: 'ACTIVE' },
  ];

  // ================= 3. DỮ LIỆU BẢNG PRODUCTS (CHUẨN 100% CSDL) =================
  const initialProducts = [
    {
      id: 1,
      sku: 'IP16PM-256-TN',
      name: 'iPhone 16 Pro Max 256GB',
      description: 'Chip Apple A18 Pro, màn hình Super Retina XDR 6.9 inch, khung viền Titan sa mạc cao cấp.',
      price: 34990000,
      image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop',
      category_id: 1,
      brand_id: 1,
      status: 'ACTIVE',
      created_at: '2026-11-15 08:30:00',
      updated_at: '2026-11-20 14:20:00',
    },
    {
      id: 2,
      sku: 'SS-S24U-512-TI',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      description: 'Snapdragon 8 Gen 3 for Galaxy, Galaxy AI dịch thuật 2 chiều, bút S-Pen tích hợp.',
      price: 29990000,
      image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
      category_id: 1,
      brand_id: 2,
      status: 'ACTIVE',
      created_at: '2026-11-16 09:15:00',
      updated_at: '2026-11-21 11:45:00',
    },
    {
      id: 3,
      sku: 'MBA-M3-15-16GB',
      name: 'MacBook Air M3 15 inch 16GB/512GB',
      description: 'Apple Silicon M3 8-core CPU / 10-core GPU, màn hình Liquid Retina sắc nét.',
      price: 32490000,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
      category_id: 2,
      brand_id: 1,
      status: 'ACTIVE',
      created_at: '2026-11-17 10:00:00',
      updated_at: '2026-11-21 16:10:00',
    },
    {
      id: 4,
      sku: 'IPP-M4-11-256',
      name: 'iPad Pro M4 11 inch Wi-Fi 256GB',
      description: 'Màn hình Ultra Retina XDR Tandem OLED đột phá, siêu mỏng 5.3mm, chip Apple M4.',
      price: 28990000,
      image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
      category_id: 3,
      brand_id: 1,
      status: 'ACTIVE',
      created_at: '2026-11-18 13:20:00',
      updated_at: '2026-11-21 09:30:00',
    },
    {
      id: 5,
      sku: 'APP2-USBC-WHITE',
      name: 'Tai nghe Apple AirPods Pro 2 USB-C',
      description: 'Chip H2, chống ồn chủ động ANC gấp 2 lần, hộp sạc MagSafe cổng USB-C.',
      price: 5790000,
      image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=300&fit=crop',
      category_id: 4,
      brand_id: 1,
      status: 'ACTIVE',
      created_at: '2026-11-19 15:45:00',
      updated_at: '2026-11-22 08:00:00',
    },
    {
      id: 6,
      sku: 'ASUS-ROG-G16-4070',
      name: 'Laptop Gaming ASUS ROG Zephyrus G16',
      description: 'Intel Core Ultra 9, RTX 4070 8GB, màn hình ROG Nebula OLED 2.5K 240Hz.',
      price: 52990000,
      image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&h=300&fit=crop',
      category_id: 2,
      brand_id: 3,
      status: 'ACTIVE',
      created_at: '2026-11-19 16:30:00',
      updated_at: '2026-11-22 08:15:00',
    },
    {
      id: 7,
      sku: 'XM-14U-512-LEICA',
      name: 'Xiaomi 14 Ultra 5G 512GB Leica',
      description: 'Ống kính quang học Leica Vario-Summilux, cảm biến 1 inch đỉnh cao công nghệ chụp ảnh.',
      price: 26990000,
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
      category_id: 1,
      brand_id: 5,
      status: 'INACTIVE',
      created_at: '2026-11-20 11:00:00',
      updated_at: '2026-11-22 08:20:00',
    },
    {
      id: 8,
      sku: 'SONY-WH1000XM5-BLK',
      name: 'Tai nghe không dây Sony WH-1000XM5',
      description: 'Bộ xử lý chống ồn V1 tích hợp QN1, thời lượng pin 30 giờ, công nghệ đàm thoại AI.',
      price: 7990000,
      image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=300&fit=crop',
      category_id: 4,
      brand_id: 4,
      status: 'ACTIVE',
      created_at: '2026-11-20 14:10:00',
      updated_at: '2026-11-22 08:25:00',
    },
  ];

  // ================= 4. DỮ LIỆU BẢNG USERS (CHUẨN 100% CSDL IDENTITY) =================
  const initialUsers = [
    {
      id: 1,
      email: 'admin@techmart.vn',
      full_name: 'Nguyễn Quản Trị',
      phone: '0988123456',
      role: 'ADMIN',
      status: 'ACTIVE',
      created_at: '2026-11-01 08:00:00',
      updated_at: '2026-11-20 10:00:00',
    },
    {
      id: 2,
      email: 'staff01@techmart.vn',
      full_name: 'Lê Văn Nhân Viên 1',
      phone: '0977222333',
      role: 'STAFF',
      status: 'ACTIVE',
      created_at: '2026-11-10 09:15:00',
      updated_at: '2026-11-21 11:30:00',
    },
    {
      id: 3,
      email: 'staff02@techmart.vn',
      full_name: 'Trần Thị Thu Ngân',
      phone: '0912444555',
      role: 'STAFF',
      status: 'ACTIVE',
      created_at: '2026-11-12 14:30:00',
      updated_at: '2026-11-22 09:00:00',
    },
    {
      id: 4,
      email: 'customer01@gmail.com',
      full_name: 'Hoàng Khách Hàng',
      phone: '0905888999',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      created_at: '2026-11-15 16:45:00',
      updated_at: '2026-11-22 10:15:00',
    },
    {
      id: 5,
      email: 'customer02@gmail.com',
      full_name: 'Phạm Minh Khôi',
      phone: '0933777888',
      role: 'CUSTOMER',
      status: 'INACTIVE',
      created_at: '2026-11-16 11:20:00',
      updated_at: '2026-11-23 15:40:00',
    },
  ];

  const [categories, setCategories] = useState(initialCategories);
  const [brands, setBrands] = useState(initialBrands);
  const [products, setProducts] = useState(initialProducts);
  const [users, setUsers] = useState(initialUsers);

  // Bộ lọc & Tìm kiếm Users
  const [userSearchKeyword, setUserSearchKeyword] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Modal Thêm / Sửa Users
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [currentEditUserId, setCurrentEditUserId] = useState(null);
  const [userValidated, setUserValidated] = useState(false);
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'STAFF',
    status: 'ACTIVE',
  });

  // Bộ lọc & Tìm kiếm Products
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  // Bộ lọc & Tìm kiếm Categories
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState('ALL');

  // Bộ lọc & Tìm kiếm Brands
  const [brandSearch, setBrandSearch] = useState('');
  const [brandStatusFilter, setBrandStatusFilter] = useState('ALL');

  // Modal State cho Products
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category_id: '1',
    brand_id: '1',
    price: '',
    image_url: '',
    description: '',
    status: 'ACTIVE',
  });

  // Modal State cho Categories (CRUD)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentEditCategoryId, setCurrentEditCategoryId] = useState(null);
  const [categoryValidated, setCategoryValidated] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'ACTIVE',
  });

  // Modal State cho Brands (CRUD)
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [currentEditBrandId, setCurrentEditBrandId] = useState(null);
  const [brandValidated, setBrandValidated] = useState(false);
  const [brandFormData, setBrandFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    status: 'ACTIVE',
  });

  // Thông báo Toast alert
  const [alertNotice, setAlertNotice] = useState({ show: false, message: '', type: 'success' });

  // Auth Guard: Kiểm tra quyền ADMIN
  useEffect(() => {
    const saved = localStorage.getItem('adminUser') || localStorage.getItem('currentUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user.role === 'ADMIN') {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const showAlert = (message, type = 'success') => {
    setAlertNotice({ show: true, message, type });
    setTimeout(() => setAlertNotice({ show: false, message: '', type: 'success' }), 4000);
  };

  // Helper sinh tự động URL slug
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  // Helper tìm tên category và brand theo ID
  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === Number(catId));
    return cat ? cat.name : `Danh mục #${catId}`;
  };

  const getBrandName = (bId) => {
    const brand = brands.find((b) => b.id === Number(bId));
    return brand ? brand.name : `Hãng #${bId}`;
  };

  // Đếm số lượng sản phẩm tham chiếu
  const countProductsByCat = (catId) => products.filter((p) => p.category_id === Number(catId)).length;
  const countProductsByBrand = (brandId) => products.filter((p) => p.brand_id === Number(brandId)).length;

  // ================= A. CRUD PRODUCTS =================
  const handleOpenAddProduct = () => {
    setIsEditingProduct(false);
    setCurrentEditId(null);
    setFormData({
      sku: '',
      name: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '1',
      brand_id: brands.length > 0 ? String(brands[0].id) : '1',
      price: '',
      image_url: '',
      description: '',
      status: 'ACTIVE',
    });
    setValidated(false);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p) => {
    setIsEditingProduct(true);
    setCurrentEditId(p.id);
    setFormData({
      sku: p.sku,
      name: p.name,
      category_id: String(p.category_id),
      brand_id: String(p.brand_id),
      price: p.price,
      image_url: p.image_url || '',
      description: p.description || '',
      status: p.status || 'ACTIVE',
    });
    setValidated(false);
    setShowProductModal(true);
  };

  const handleSubmitProduct = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const priceVal = Number(formData.price);
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Kiểm tra trùng SKU
    const isDuplicateSku = products.some(
      (p) => p.sku.toLowerCase() === formData.sku.trim().toLowerCase() && p.id !== currentEditId
    );
    if (isDuplicateSku) {
      alert(`Lỗi Ràng Buộc UNIQUE: Mã SKU "${formData.sku}" đã tồn tại trong bảng products!`);
      return;
    }

    if (isEditingProduct && currentEditId) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === currentEditId) {
            return {
              ...p,
              sku: formData.sku.trim(),
              name: formData.name.trim(),
              category_id: Number(formData.category_id),
              brand_id: Number(formData.brand_id),
              price: priceVal,
              image_url: formData.image_url.trim() || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
              description: formData.description.trim(),
              status: formData.status,
              updated_at: nowTime,
            };
          }
          return p;
        })
      );
      showAlert(`Đã UPDATE sản phẩm [${formData.name}] (ID: ${currentEditId}) thành công!`, 'success');
    } else {
      const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct = {
        id: nextId,
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        category_id: Number(formData.category_id),
        brand_id: Number(formData.brand_id),
        price: priceVal,
        image_url: formData.image_url.trim() || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
        description: formData.description.trim(),
        status: formData.status,
        created_at: nowTime,
        updated_at: nowTime,
      };
      setProducts([newProduct, ...products]);
      showAlert(`Đã INSERT sản phẩm mới [${formData.name}] (SKU: ${formData.sku}) vào CSDL!`, 'success');
    }

    setShowProductModal(false);
    setValidated(false);
  };

  const handleDeleteProduct = (id, sku, name) => {
    if (window.confirm(`Xác nhận DELETE FROM products WHERE id = ${id} AND sku = '${sku}'?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showAlert(`Đã xóa sản phẩm ID: ${id} (${name}) khỏi cơ sở dữ liệu!`, 'danger');
    }
  };

  const handleExportCSV = () => {
    const headers = 'id,sku,name,price,category_id,brand_id,status,image_url,created_at,updated_at\n';
    const rows = products
      .map(
        (p) =>
          `${p.id},"${p.sku}","${p.name}",${p.price},${p.category_id},${p.brand_id},"${p.status}","${p.image_url}","${p.created_at}","${p.updated_at}"`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Đã xuất dữ liệu bảng products thành công (file CSV)!', 'success');
  };

  // ================= B. CRUD CATEGORIES =================
  const handleOpenAddCategory = () => {
    setIsEditingCategory(false);
    setCurrentEditCategoryId(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      status: 'ACTIVE',
    });
    setCategoryValidated(false);
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (c) => {
    setIsEditingCategory(true);
    setCurrentEditCategoryId(c.id);
    setCategoryFormData({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      status: c.status || 'ACTIVE',
    });
    setCategoryValidated(false);
    setShowCategoryModal(true);
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setCategoryValidated(true);
      return;
    }

    const trimmedName = categoryFormData.name.trim();
    const trimmedSlug = (categoryFormData.slug.trim() || generateSlug(trimmedName));

    // Kiểm tra UNIQUE slug trong bảng categories
    const isDuplicateSlug = categories.some(
      (c) => c.slug.toLowerCase() === trimmedSlug.toLowerCase() && c.id !== currentEditCategoryId
    );
    if (isDuplicateSlug) {
      alert(`Lỗi Ràng Buộc UNIQUE: Đường dẫn slug "${trimmedSlug}" đã tồn tại trong bảng categories!`);
      return;
    }

    if (isEditingCategory && currentEditCategoryId) {
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === currentEditCategoryId) {
            return {
              ...c,
              name: trimmedName,
              slug: trimmedSlug,
              description: categoryFormData.description.trim(),
              status: categoryFormData.status,
            };
          }
          return c;
        })
      );
      showAlert(`Đã UPDATE danh mục [${trimmedName}] (ID: ${currentEditCategoryId}) thành công!`, 'success');
    } else {
      const nextId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
      const newCategory = {
        id: nextId,
        name: trimmedName,
        slug: trimmedSlug,
        description: categoryFormData.description.trim(),
        status: categoryFormData.status,
      };
      setCategories([...categories, newCategory]);
      showAlert(`Đã INSERT danh mục mới [${trimmedName}] (ID: ${nextId}) vào bảng categories!`, 'success');
    }

    setShowCategoryModal(false);
    setCategoryValidated(false);
  };

  const handleDeleteCategory = (id, name) => {
    // Kiểm tra ràng buộc khóa ngoại fk_products_category
    const refCount = countProductsByCat(id);
    if (refCount > 0) {
      alert(
        `Lỗi Ràng Buộc Khóa Ngoại (CONSTRAINT fk_products_category):\n\nKhông thể xóa danh mục "${name}" (ID: ${id}) vì đang có ${refCount} sản phẩm thuộc danh mục này!\n\nHãy sửa hoặc chuyển danh mục cho các sản phẩm đó trước khi xóa.`
      );
      return;
    }

    if (window.confirm(`Xác nhận DELETE FROM categories WHERE id = ${id}?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showAlert(`Đã xóa danh mục ID: ${id} (${name}) khỏi bảng categories!`, 'danger');
    }
  };

  const handleExportCategoryCSV = () => {
    const headers = 'id,name,slug,description,status\n';
    const rows = categories
      .map((c) => `${c.id},"${c.name}","${c.slug}","${c.description || ''}","${c.status}"`)
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `categories_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Đã xuất dữ liệu bảng categories thành công (file CSV)!', 'success');
  };

  // ================= C. CRUD BRANDS =================
  const handleOpenAddBrand = () => {
    setIsEditingBrand(false);
    setCurrentEditBrandId(null);
    setBrandFormData({
      name: '',
      slug: '',
      logo_url: '',
      status: 'ACTIVE',
    });
    setBrandValidated(false);
    setShowBrandModal(true);
  };

  const handleOpenEditBrand = (b) => {
    setIsEditingBrand(true);
    setCurrentEditBrandId(b.id);
    setBrandFormData({
      name: b.name,
      slug: b.slug,
      logo_url: b.logo_url || '',
      status: b.status || 'ACTIVE',
    });
    setBrandValidated(false);
    setShowBrandModal(true);
  };

  const handleSubmitBrand = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setBrandValidated(true);
      return;
    }

    const trimmedName = brandFormData.name.trim();
    const trimmedSlug = (brandFormData.slug.trim() || generateSlug(trimmedName));

    // Kiểm tra UNIQUE name
    const isDuplicateName = brands.some(
      (b) => b.name.toLowerCase() === trimmedName.toLowerCase() && b.id !== currentEditBrandId
    );
    if (isDuplicateName) {
      alert(`Lỗi Ràng Buộc UNIQUE: Tên thương hiệu "${trimmedName}" đã tồn tại trong bảng brands!`);
      return;
    }

    // Kiểm tra UNIQUE slug
    const isDuplicateSlug = brands.some(
      (b) => b.slug.toLowerCase() === trimmedSlug.toLowerCase() && b.id !== currentEditBrandId
    );
    if (isDuplicateSlug) {
      alert(`Lỗi Ràng Buộc UNIQUE: Đường dẫn slug "${trimmedSlug}" đã tồn tại trong bảng brands!`);
      return;
    }

    if (isEditingBrand && currentEditBrandId) {
      setBrands((prev) =>
        prev.map((b) => {
          if (b.id === currentEditBrandId) {
            return {
              ...b,
              name: trimmedName,
              slug: trimmedSlug,
              logo_url: brandFormData.logo_url.trim(),
              status: brandFormData.status,
            };
          }
          return b;
        })
      );
      showAlert(`Đã UPDATE thương hiệu [${trimmedName}] (ID: ${currentEditBrandId}) thành công!`, 'success');
    } else {
      const nextId = brands.length > 0 ? Math.max(...brands.map((b) => b.id)) + 1 : 1;
      const newBrand = {
        id: nextId,
        name: trimmedName,
        slug: trimmedSlug,
        logo_url: brandFormData.logo_url.trim() || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
        status: brandFormData.status,
      };
      setBrands([...brands, newBrand]);
      showAlert(`Đã INSERT thương hiệu mới [${trimmedName}] (ID: ${nextId}) vào bảng brands!`, 'success');
    }

    setShowBrandModal(false);
    setBrandValidated(false);
  };

  const handleDeleteBrand = (id, name) => {
    // Kiểm tra ràng buộc khóa ngoại fk_products_brand
    const refCount = countProductsByBrand(id);
    if (refCount > 0) {
      alert(
        `Lỗi Ràng Buộc Khóa Ngoại (CONSTRAINT fk_products_brand):\n\nKhông thể xóa thương hiệu "${name}" (ID: ${id}) vì đang có ${refCount} sản phẩm liên kết với hãng này!\n\nHãy sửa hoặc chuyển thương hiệu cho các sản phẩm đó trước khi xóa.`
      );
      return;
    }

    if (window.confirm(`Xác nhận DELETE FROM brands WHERE id = ${id}?`)) {
      setBrands((prev) => prev.filter((c) => c.id !== id));
      showAlert(`Đã xóa thương hiệu ID: ${id} (${name}) khỏi bảng brands!`, 'danger');
    }
  };

  const handleExportBrandCSV = () => {
    const headers = 'id,name,slug,logo_url,status\n';
    const rows = brands
      .map((b) => `${b.id},"${b.name}","${b.slug}","${b.logo_url || ''}","${b.status}"`)
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `brands_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Đã xuất dữ liệu bảng brands thành công (file CSV)!', 'success');
  };

  // ================= D. CRUD USERS (BẢNG USERS & USER_ROLES) =================
  const handleOpenAddUser = () => {
    setIsEditingUser(false);
    setCurrentEditUserId(null);
    setUserFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'STAFF',
      status: 'ACTIVE',
    });
    setUserValidated(false);
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u) => {
    setIsEditingUser(true);
    setCurrentEditUserId(u.id);
    setUserFormData({
      email: u.email,
      password: '',
      full_name: u.full_name,
      phone: u.phone || '',
      role: u.role,
      status: u.status,
    });
    setUserValidated(false);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId, email) => {
    if (userId === 1) {
      alert('Không thể xóa tài khoản Quản trị viên hệ thống gốc (ID: 1)!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản [${email}] (ID: ${userId}) khỏi bảng users không?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showAlert(`Đã xóa tài khoản [${email}] thành công!`, 'success');
    }
  };

  const handleToggleUserStatus = (userId) => {
    if (userId === 1) {
      alert('Không thể vô hiệu hóa tài khoản Quản trị viên hệ thống gốc (ID: 1)!');
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          showAlert(`Đã đổi trạng thái [${u.email}] sang ${newStatus}!`, 'info');
          return {
            ...u,
            status: newStatus,
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
          };
        }
        return u;
      })
    );
  };

  const handleSubmitUser = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setUserValidated(true);
      return;
    }

    const trimmedEmail = userFormData.email.trim();
    const trimmedFullName = userFormData.full_name.trim();

    // Kiểm tra UNIQUE email trong bảng users
    const isDuplicateEmail = users.some(
      (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.id !== currentEditUserId
    );
    if (isDuplicateEmail) {
      alert(`Lỗi Ràng Buộc UNIQUE: Email "${trimmedEmail}" đã tồn tại trong bảng users!`);
      return;
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (isEditingUser && currentEditUserId) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentEditUserId) {
            return {
              ...u,
              email: trimmedEmail,
              full_name: trimmedFullName,
              phone: userFormData.phone.trim(),
              role: userFormData.role,
              status: userFormData.status,
              updated_at: now,
            };
          }
          return u;
        })
      );
      showAlert(`Đã cập nhật thông tin tài khoản [${trimmedEmail}] (ID: ${currentEditUserId}) thành công!`, 'success');
    } else {
      const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newUser = {
        id: nextId,
        email: trimmedEmail,
        full_name: trimmedFullName,
        phone: userFormData.phone.trim(),
        role: userFormData.role,
        status: userFormData.status,
        created_at: now,
        updated_at: now,
      };
      setUsers([newUser, ...users]);
      showAlert(`Đã thêm mới tài khoản [${trimmedEmail}] (${userFormData.role}) vào bảng users!`, 'success');
    }

    setShowUserModal(false);
  };

  const handleExportUserCSV = () => {
    const headers = ['id', 'email', 'full_name', 'phone', 'role', 'status', 'created_at', 'updated_at'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.email}"`,
      `"${u.full_name}"`,
      `"${u.phone || ''}"`,
      u.role,
      u.status,
      `"${u.created_at}"`,
      `"${u.updated_at}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `techmart_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Đã xuất dữ liệu bảng users thành công (file CSV)!', 'success');
  };

  // Lọc và sắp xếp Products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        String(p.id) === searchKeyword.trim();
      const matchCat = categoryFilter === 'ALL' || String(p.category_id) === categoryFilter;
      const matchBrand = brandFilter === 'ALL' || String(p.brand_id) === brandFilter;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchCat && matchBrand && matchStatus;
    });

    if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'NAME_AZ') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [products, searchKeyword, categoryFilter, brandFilter, statusFilter, sortBy]);

  // Lọc Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        c.slug.toLowerCase().includes(categorySearch.toLowerCase()) ||
        String(c.id) === categorySearch.trim();
      const matchStatus = categoryStatusFilter === 'ALL' || c.status === categoryStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [categories, categorySearch, categoryStatusFilter]);

  // Lọc Brands
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
        b.slug.toLowerCase().includes(brandSearch.toLowerCase()) ||
        String(b.id) === brandSearch.trim();
      const matchStatus = brandStatusFilter === 'ALL' || b.status === brandStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [brands, brandSearch, brandStatusFilter]);

  // Lọc Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.email.toLowerCase().includes(userSearchKeyword.toLowerCase()) ||
        u.full_name.toLowerCase().includes(userSearchKeyword.toLowerCase()) ||
        (u.phone && u.phone.includes(userSearchKeyword.trim())) ||
        String(u.id) === userSearchKeyword.trim();
      const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, userSearchKeyword, userRoleFilter, userStatusFilter]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải trang quản trị...</span>
        </div>
      </div>
    );
  }

  // Route Guard Screen: Khi chưa đăng nhập quyền ADMIN
  if (!currentUser) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
        <div className="card shadow border-0 rounded-4 p-4 text-center" style={{ maxWidth: '480px' }}>
          <div className="mb-3 text-warning">
            <i className="bi bi-shield-lock-fill fs-1"></i>
          </div>
          <h4 className="fw-bold text-dark">Yêu Cầu Quyền Quản Trị</h4>
          <p className="text-secondary small mb-4">
            Bạn cần đăng nhập tài khoản có quyền <strong>ADMIN</strong> để truy cập bảng điều khiển cơ sở dữ liệu.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link href="/login" className="btn btn-primary px-4 fw-semibold">
              <i className="bi bi-box-arrow-in-right me-1"></i> Đăng nhập Admin
            </Link>
            <button
              onClick={() => {
                const mockAdmin = { id: 1, name: 'Nguyễn Quản Trị', email: 'admin@techstore.vn', role: 'ADMIN' };
                localStorage.setItem('adminUser', JSON.stringify(mockAdmin));
                setCurrentUser(mockAdmin);
              }}
              className="btn btn-outline-secondary px-3"
            >
              Kích hoạt Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100 bg-light overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ================= 1. SIDEBAR (COOLADMIN THEME) ================= */}
      <aside
        className={`bg-white border-end d-flex flex-column transition-all duration-300 ${
          sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'
        }`}
        style={{
          width: sidebarOpen ? '260px' : '80px',
          minWidth: sidebarOpen ? '260px' : '80px',
          transition: 'width 0.25s ease-in-out',
          zIndex: 1050,
        }}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <Link href="/" className="d-flex align-items-center gap-2 overflow-hidden text-decoration-none">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#d70018',
                borderRadius: '10px',
                flexShrink: 0,
              }}
            >
              <i className="bi bi-phone-fill fs-5 text-white"></i>
            </div>
            {sidebarOpen && (
              <div className="text-truncate" style={{ lineHeight: '1.1' }}>
                <span className="fw-black text-dark d-block" style={{ fontWeight: '900', letterSpacing: '-0.5px', fontSize: '18px' }}>
                  Tech<b className="text-warning">Mart</b>
                </span>
                <span className="badge bg-danger-subtle text-danger px-1 py-0" style={{ fontSize: '10px' }}>
                  ADMIN
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-link text-muted p-0 text-decoration-none"
            title="Thu nhỏ/Mở rộng sidebar"
          >
            <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'} fs-6`}></i>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-grow-1 overflow-auto py-3">
          <ul className="nav flex-column px-2 gap-1">
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('products')}
                className={`nav-link rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 ${
                  activeTab === 'products' ? 'active bg-primary-subtle text-primary' : 'text-secondary bg-transparent hover-primary'
                }`}
              >
                <i className="bi bi-box-seam fs-5"></i>
                {sidebarOpen && <span>Sản phẩm ({products.length})</span>}
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={() => setActiveTab('categories')}
                className={`nav-link rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 ${
                  activeTab === 'categories' ? 'active bg-success-subtle text-success' : 'text-secondary bg-transparent hover-primary'
                }`}
              >
                <i className="bi bi-grid-fill fs-5"></i>
                {sidebarOpen && <span>Danh mục ({categories.length})</span>}
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={() => setActiveTab('brands')}
                className={`nav-link rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 ${
                  activeTab === 'brands' ? 'active bg-info-subtle text-info' : 'text-secondary bg-transparent hover-primary'
                }`}
              >
                <i className="bi bi-award-fill fs-5"></i>
                {sidebarOpen && <span>Thương hiệu ({brands.length})</span>}
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={() => setActiveTab('users')}
                className={`nav-link rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 ${
                  activeTab === 'users' ? 'active bg-warning-subtle text-dark' : 'text-secondary bg-transparent hover-primary'
                }`}
              >
                <i className="bi bi-people-fill fs-5 text-warning"></i>
                {sidebarOpen && <span>Tài khoản ({users.length})</span>}
              </button>
            </li>

            <li className="nav-item pt-2 border-top mt-2">
              <div className="px-3 pb-1 text-uppercase text-muted" style={{ fontSize: '10px' }}>
                {sidebarOpen && 'Thao tác nhanh'}
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="nav-link rounded-3 px-3 py-2 text-danger fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 bg-transparent hover-primary"
              >
                <i className="bi bi-plus-circle-fill fs-5"></i>
                {sidebarOpen && <span>+ Thêm Sản Phẩm</span>}
              </button>
              <button
                onClick={handleOpenAddCategory}
                className="nav-link rounded-3 px-3 py-2 text-success fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 bg-transparent hover-primary"
              >
                <i className="bi bi-plus-circle fs-5"></i>
                {sidebarOpen && <span>+ Thêm Danh Mục</span>}
              </button>
              <button
                onClick={handleOpenAddBrand}
                className="nav-link rounded-3 px-3 py-2 text-info fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 bg-transparent hover-primary"
              >
                <i className="bi bi-plus-circle fs-5"></i>
                {sidebarOpen && <span>+ Thêm Thương Hiệu</span>}
              </button>
              <button
                onClick={handleOpenAddUser}
                className="nav-link rounded-3 px-3 py-2 text-warning fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 bg-transparent hover-primary"
              >
                <i className="bi bi-person-plus-fill fs-5"></i>
                {sidebarOpen && <span>+ Thêm Nhân Viên</span>}
              </button>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-top d-flex align-items-center justify-content-between">
          {sidebarOpen && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                ● 3 Tables CRUD Ready
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-outline-danger border-0"
            title="Đăng xuất khỏi hệ thống"
          >
            <i className="bi bi-power fs-5"></i>
          </button>
        </div>
      </aside>

      {/* ================= 2. MAIN CONTENT WRAPPER ================= */}
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-bottom px-4 py-2 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-light text-dark border px-3 py-2 fw-semibold">
              <i className="bi bi-database me-2 text-primary"></i>
                Sản phẩm - Danh mục - Thương hiệu - Tài khoản
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Nút Xem Cửa Hàng màu đỏ theo yêu cầu */}
            <Link href="/" className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold">
              <i className="bi bi-shop me-1"></i>Xem Cửa Hàng
            </Link>

            {/* User Profile */}
            <div className="d-flex align-items-center gap-2 border-start ps-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold shadow-sm"
                style={{ width: '38px', height: '38px', fontSize: '14px', flexShrink: 0 }}
              >
                AD
              </div>
              <div className="d-none d-md-block text-start" style={{ lineHeight: '1.2' }}>
                <span className="fw-bold small text-dark d-block">Nguyễn Quản Trị</span>
                <span className="text-muted" style={{ fontSize: '11px' }}>Database Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Toast Notification Alert */}
        {alertNotice.show && (
          <div className="px-4 pt-3">
            <div className={`alert alert-${alertNotice.type} alert-dismissible fade show shadow-sm mb-0 py-2 small`} role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>{alertNotice.message}</strong>
              <button
                type="button"
                className="btn-close py-2"
                onClick={() => setAlertNotice({ show: false, message: '', type: 'success' })}
              ></button>
            </div>
          </div>
        )}

        {/* Main Dashboard Body */}
        <main className="flex-grow-1 overflow-auto p-4">
          {/* Page Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
            <div>
              <h4 className="fw-bold text-dark mb-1">
                {activeTab === 'products' && 'Quản Lý Bản Ghi Products'}
                {activeTab === 'categories' && 'Quản Lý Bảng Categories'}
                {activeTab === 'brands' && 'Quản Lý Brands'}
                {activeTab === 'users' && 'Quản Lý Tài Khoản (Users & Roles)'}
              </h4>
              <p className="text-secondary small mb-0">
                Toàn bộ thao tác Thêm, Sửa, Xóa tuân thủ ràng buộc Khóa Chính, Khóa Ngoại và Ràng Buộc UNIQUE của MySQL.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              {activeTab === 'products' && (
                <>
                  <button
                    onClick={handleExportCSV}
                    className="btn btn-white btn-sm bg-white border text-secondary shadow-sm rounded-2 px-3 fw-semibold"
                    title="Xuất bảng products ra CSV"
                  >
                    <i className="bi bi-file-earmark-spreadsheet me-1 text-success"></i>Xuất CSV
                  </button>
                  <button
                    onClick={handleOpenAddProduct}
                    className="btn btn-primary btn-sm rounded-2 px-3 fw-semibold shadow-sm d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span>+ Thêm Sản Phẩm</span>
                  </button>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <button
                    onClick={handleExportCategoryCSV}
                    className="btn btn-white btn-sm bg-white border text-secondary shadow-sm rounded-2 px-3 fw-semibold"
                    title="Xuất bảng categories ra CSV"
                  >
                    <i className="bi bi-file-earmark-spreadsheet me-1 text-success"></i>Xuất CSV
                  </button>
                  <button
                    onClick={handleOpenAddCategory}
                    className="btn btn-success btn-sm rounded-2 px-3 fw-semibold shadow-sm d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span>+ Thêm Danh Mục</span>
                  </button>
                </>
              )}

              {activeTab === 'brands' && (
                <>
                  <button
                    onClick={handleExportBrandCSV}
                    className="btn btn-white btn-sm bg-white border text-secondary shadow-sm rounded-2 px-3 fw-semibold"
                    title="Xuất bảng brands ra CSV"
                  >
                    <i className="bi bi-file-earmark-spreadsheet me-1 text-success"></i>Xuất CSV
                  </button>
                  <button
                    onClick={handleOpenAddBrand}
                    className="btn btn-info text-white btn-sm rounded-2 px-3 fw-semibold shadow-sm d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span>+ Thêm Thương Hiệu</span>
                  </button>
                </>
              )}

              {activeTab === 'users' && (
                <>
                  <button
                    onClick={handleExportUserCSV}
                    className="btn btn-white btn-sm bg-white border text-secondary shadow-sm rounded-2 px-3 fw-semibold"
                    title="Xuất bảng users ra CSV"
                  >
                    <i className="bi bi-file-earmark-spreadsheet me-1 text-success"></i>Xuất CSV
                  </button>
                  <button
                    onClick={handleOpenAddUser}
                    className="btn btn-warning text-dark btn-sm rounded-2 px-3 fw-bold shadow-sm d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-person-plus-fill"></i>
                    <span>+ Thêm Tài Khoản</span>
                  </button>
                </>
              )}


            </div>
          </div>

          {/* ================= 3. STATS STRIP ================= */}
          <div className="row g-3 mb-4">
            {/* Thẻ 1: Products */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div
                className={`card border-0 shadow-sm rounded-3 p-3 bg-white h-100 cursor-pointer ${
                  activeTab === 'products' ? 'border-primary border-2 border' : ''
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('products')}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small fw-semibold text-uppercase">Bảng Products</span>
                  <div className="rounded-3 d-flex align-items-center justify-content-center text-primary" style={{ width: '40px', height: '40px', backgroundColor: '#eef2ff' }}>
                    <i className="bi bi-box-seam fs-5"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">{products.length} Sản phẩm</h4>
                <span className="text-danger small fw-semibold">
                  <i className="bi bi-check2-circle me-1"></i>{products.filter((p) => p.status === 'ACTIVE').length} đang kinh doanh
                </span>
              </div>
            </div>

            {/* Thẻ 2: Categories */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div
                className={`card border-0 shadow-sm rounded-3 p-3 bg-white h-100 cursor-pointer ${
                  activeTab === 'categories' ? 'border-success border-2 border' : ''
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('categories')}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small fw-semibold text-uppercase">Bảng Categories</span>
                  <div className="rounded-3 d-flex align-items-center justify-content-center text-success" style={{ width: '40px', height: '40px', backgroundColor: '#ecfdf5' }}>
                    <i className="bi bi-grid-fill fs-5"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">{categories.length} Danh mục</h4>
                <span className="text-success small fw-semibold">
                  <i className="bi bi-check2-circle me-1"></i>{categories.filter((c) => c.status === 'ACTIVE').length} đang kích hoạt
                </span>
              </div>
            </div>

            {/* Thẻ 3: Brands */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div
                className={`card border-0 shadow-sm rounded-3 p-3 bg-white h-100 cursor-pointer ${
                  activeTab === 'brands' ? 'border-info border-2 border' : ''
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('brands')}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small fw-semibold text-uppercase">Bảng Brands</span>
                  <div className="rounded-3 d-flex align-items-center justify-content-center text-info" style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe' }}>
                    <i className="bi bi-award-fill fs-5"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">{brands.length} Thương hiệu</h4>
                <span className="text-info small fw-semibold">
                  <i className="bi bi-check2-circle me-1"></i>{brands.filter((b) => b.status === 'ACTIVE').length} đang hoạt động
                </span>
              </div>
            </div>

            {/* Thẻ 4: Users */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div
                className={`card border-0 shadow-sm rounded-3 p-3 bg-white h-100 cursor-pointer ${
                  activeTab === 'users' ? 'border-warning border-2 border' : ''
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('users')}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small fw-semibold text-uppercase">Bảng Users</span>
                  <div className="rounded-3 d-flex align-items-center justify-content-center text-warning" style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7' }}>
                    <i className="bi bi-people-fill fs-5"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">{users.length} Tài khoản</h4>
                <span className="text-warning-emphasis small fw-semibold">
                  <i className="bi bi-person-badge me-1"></i>{users.filter((u) => u.role === 'STAFF').length} nhân viên (Staff)
                </span>
              </div>
            </div>
          </div>

          {/* ================= 4. TAB NAVIGATION ================= */}
          <ul className="nav nav-pills mb-3 bg-white p-2 rounded-3 shadow-sm border">
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('products')}
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'products' ? 'active' : 'text-secondary'}`}
              >
                <i className="bi bi-box-seam me-2"></i>Products ({products.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('categories')}
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'categories' ? 'active bg-success text-white' : 'text-secondary'}`}
              >
                <i className="bi bi-grid-fill me-2"></i>Categories ({categories.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('brands')}
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'brands' ? 'active bg-info text-white' : 'text-secondary'}`}
              >
                <i className="bi bi-award-fill me-2"></i>Brands ({brands.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('users')}
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'users' ? 'active bg-warning text-dark' : 'text-secondary'}`}
              >
                <i className="bi bi-people-fill me-2"></i>Users & Roles ({users.length})
              </button>
            </li>
          </ul>

          {/* ================= 5. BẢNG PRODUCTS (TAB CHÍNH THEO CSDL) ================= */}
          {activeTab === 'products' && (
            <div className="card border-0 shadow-sm rounded-3 bg-white mb-4" id="crudTable">
              <div className="card-header bg-white py-3 border-bottom">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="bi bi-table me-2 text-primary"></i>
                      Sản Phẩm
                    </h5>
                    <small className="text-muted">
                    </small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                    >
                      <i className="bi bi-file-earmark-spreadsheet me-1"></i>Xuất CSV
                    </button>
                    <button onClick={handleOpenAddProduct} className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold">
                      <i className="bi bi-plus-circle me-1"></i>Thêm Sản Phẩm
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Strip */}
              <div className="card-body border-bottom bg-light bg-opacity-50 py-3">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-3">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-white border-start-0"
                        placeholder="Tìm SKU, tên sản phẩm hoặc ID..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-2">
                    <select
                      className="form-select form-select-sm"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="ALL">Tất cả danh mục (category_id)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          #{c.id} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6 col-md-2">
                    <select
                      className="form-select form-select-sm"
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                    >
                      <option value="ALL">Tất cả hãng (brand_id)</option>
                      {brands.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          #{b.id} - {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6 col-md-2">
                    <select
                      className="form-select form-select-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">Tất cả status</option>
                      <option value="ACTIVE">Đang bán</option>
                      <option value="INACTIVE">Tạm ngưng</option>
                    </select>
                  </div>

                  <div className="col-6 col-md-3 text-md-end">
                    <select
                      className="form-select form-select-sm d-inline-block w-auto"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="DEFAULT">Sắp xếp: Mặc định</option>
                      <option value="PRICE_ASC">Giá tăng dần</option>
                      <option value="PRICE_DESC">Giá giảm dần</option>
                      <option value="NAME_AZ">Tên A-Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Products */}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase small text-muted" style={{ fontSize: '11px' }}>
                    <tr>
                      <th className="ps-4" style={{ width: '70px' }}>ID</th>
                      <th style={{ width: '130px' }}>Mã SKU</th>
                      <th style={{ width: '60px' }}>Ảnh</th>
                      <th>Tên Sản Phẩm</th>
                      <th>Danh Mục</th>
                      <th>Thương Hiệu</th>
                      <th className="text-end">Đơn Giá (`price`)</th>
                      <th className="text-center">Trạng Thái</th>
                      <th className="text-end pe-4" style={{ width: '120px' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-5 text-muted">
                          <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                          Không tìm thấy sản phẩm nào khớp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="ps-4 fw-bold text-secondary">#{p.id}</td>
                          <td>
                            <code className="text-dark bg-light px-2 py-1 rounded fw-semibold" style={{ fontSize: '12px' }}>
                              {p.sku}
                            </code>
                          </td>
                          <td>
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="rounded-2 border"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop';
                              }}
                            />
                          </td>
                          <td>
                            <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '280px' }} title={p.name}>
                              {p.name}
                            </div>
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '280px', fontSize: '11px' }}>
                              {p.description || 'Chưa có mô tả'}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              #{p.category_id} - {getCategoryName(p.category_id)}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info-subtle text-info border border-info-subtle">
                              #{p.brand_id} - {getBrandName(p.brand_id)}
                            </span>
                          </td>
                          <td className="text-end fw-bold text-dark font-monospace">
                            {Number(p.price).toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="text-center">
                            {p.status === 'ACTIVE' ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle">
                                ● ACTIVE
                              </span>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                ○ INACTIVE
                              </span>
                            )}
                          </td>
                          <td className="text-end pe-4">
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="btn btn-light text-primary border"
                                title="Chỉnh sửa"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.sku, p.name)}
                                className="btn btn-light text-danger border"
                                title="Xóa"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="card-footer bg-white py-3 border-top d-flex flex-wrap justify-content-between align-items-center">
                <small className="text-muted">
                  Hiển thị <strong>{filteredProducts.length}</strong> / <strong>{products.length}</strong> sản phẩm trong bảng <code>products</code>
                </small>
                <small className="text-muted font-monospace">
                  Ràng buộc kiểm tra: <code>chk_products_price (price &gt;= 0)</code>
                </small>
              </div>
            </div>
          )}

          {/* ================= 6. BẢNG CATEGORIES (TAB DANH MỤC CÓ ĐỦ CRUD) ================= */}
          {activeTab === 'categories' && (
            <div className="card border-0 shadow-sm rounded-3 bg-white mb-4">
              <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-grid-fill me-2 text-success"></i>
                    Danh Mục
                  </h5>
                  <small className="text-muted">
                     <code></code>
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  </span>
                  <button
                    onClick={handleExportCategoryCSV}
                    className="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold"
                  >
                    <i className="bi bi-file-earmark-spreadsheet me-1"></i>Xuất CSV
                  </button>
                  <button
                    onClick={handleOpenAddCategory}
                    className="btn btn-success btn-sm rounded-pill px-3 fw-semibold shadow-sm"
                  >
                    <i className="bi bi-plus-circle me-1"></i>Thêm Danh Mục
                  </button>
                </div>
              </div>

              {/* Categories Filter Strip */}
              <div className="card-body border-bottom bg-light bg-opacity-50 py-3">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-4">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-white border-start-0"
                        placeholder="Tìm tên danh mục, slug, ID..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={categoryStatusFilter}
                      onChange={(e) => setCategoryStatusFilter(e.target.value)}
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Categories Table */}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase small text-muted" style={{ fontSize: '11px' }}>
                    <tr>
                      <th className="ps-4" style={{ width: '80px' }}>ID</th>
                      <th>Tên Danh Mục</th>
                      <th>Đường Dẫn Slug</th>
                      <th>Mô Tả</th>
                      <th>Sản Phẩm Đang Liên Kết</th>
                      <th>Trạng Thái</th>
                      <th className="text-end pe-4" style={{ width: '130px' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                          Không tìm thấy danh mục nào.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((c) => {
                        const linkedCount = countProductsByCat(c.id);
                        return (
                          <tr key={c.id}>
                            <td className="ps-4 fw-bold text-secondary">#{c.id}</td>
                            <td className="fw-semibold text-dark">{c.name}</td>
                            <td>
                              <code className="text-success bg-light px-2 py-1 rounded">{c.slug}</code>
                            </td>
                            <td className="text-muted text-truncate" style={{ maxWidth: '280px' }} title={c.description}>
                              {c.description || 'Chưa có mô tả'}
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border px-2 py-1">
                                <i className="bi bi-box-seam me-1 text-primary"></i>
                                {linkedCount} sản phẩm
                              </span>
                            </td>
                            <td>
                              {c.status === 'ACTIVE' ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                  ● ACTIVE
                                </span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  ○ INACTIVE
                                </span>
                              )}
                            </td>
                            <td className="text-end pe-4">
                              <div className="btn-group btn-group-sm">
                                <button
                                  onClick={() => handleOpenEditCategory(c)}
                                  className="btn btn-light text-primary border"
                                  title="Chỉnh sửa danh mục"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(c.id, c.name)}
                                  className="btn btn-light text-danger border"
                                  title="Xóa danh mục"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="card-footer bg-white py-3 border-top d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Hiển thị <strong>{filteredCategories.length}</strong> / <strong>{categories.length}</strong> danh mục
                </small>
                <small className="text-muted">
                </small>
              </div>
            </div>
          )}

          {/* ================= 7. BẢNG BRANDS (TAB THƯƠNG HIỆU CÓ ĐỦ CRUD) ================= */}
          {activeTab === 'brands' && (
            <div className="card border-0 shadow-sm rounded-3 bg-white mb-4">
              <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-award-fill me-2 text-info"></i>
                    Thương Hiệu
                  </h5>
                  <small className="text-muted">
                    
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">
                  </span>
                  <button
                    onClick={handleExportBrandCSV}
                    className="btn btn-outline-info btn-sm rounded-pill px-3 fw-semibold"
                  >
                    <i className="bi bi-file-earmark-spreadsheet me-1"></i>Xuất CSV
                  </button>
                  <button
                    onClick={handleOpenAddBrand}
                    className="btn btn-info text-white btn-sm rounded-pill px-3 fw-semibold shadow-sm"
                  >
                    <i className="bi bi-plus-circle me-1"></i>Thêm Thương Hiệu
                  </button>
                </div>
              </div>

              {/* Brands Filter Strip */}
              <div className="card-body border-bottom bg-light bg-opacity-50 py-3">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-4">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-white border-start-0"
                        placeholder="Tìm tên hãng, slug, ID..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={brandStatusFilter}
                      onChange={(e) => setBrandStatusFilter(e.target.value)}
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Brands Table */}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase small text-muted" style={{ fontSize: '11px' }}>
                    <tr>
                      <th className="ps-4" style={{ width: '80px' }}>ID</th>
                      <th style={{ width: '70px' }}>Logo</th>
                      <th>Tên Thương Hiệu</th>
                      <th>Đường Dẫn Slug</th>
                      <th>Sản Phẩm Đang Liên Kết</th>
                      <th>Trạng Thái</th>
                      <th className="text-end pe-4" style={{ width: '130px' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                          Không tìm thấy thương hiệu nào.
                        </td>
                      </tr>
                    ) : (
                      filteredBrands.map((b) => {
                        const linkedCount = countProductsByBrand(b.id);
                        return (
                          <tr key={b.id}>
                            <td className="ps-4 fw-bold text-secondary">#{b.id}</td>
                            <td>
                              <div
                                className="bg-white border rounded d-flex align-items-center justify-content-center p-1"
                                style={{ width: '42px', height: '42px' }}
                              >
                                <img
                                  src={b.logo_url}
                                  alt={b.name}
                                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                  onError={(e) => {
                                    e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';
                                  }}
                                />
                              </div>
                            </td>
                            <td className="fw-semibold text-dark">{b.name}</td>
                            <td>
                              <code className="text-info bg-light px-2 py-1 rounded">{b.slug}</code>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border px-2 py-1">
                                <i className="bi bi-box-seam me-1 text-primary"></i>
                                {linkedCount} sản phẩm
                              </span>
                            </td>
                            <td>
                              {b.status === 'ACTIVE' ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                  ● ACTIVE
                                </span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  ○ INACTIVE
                                </span>
                              )}
                            </td>
                            <td className="text-end pe-4">
                              <div className="btn-group btn-group-sm">
                                <button
                                  onClick={() => handleOpenEditBrand(b)}
                                  className="btn btn-light text-primary border"
                                  title="Chỉnh sửa thương hiệu"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteBrand(b.id, b.name)}
                                  className="btn btn-light text-danger border"
                                  title="Xóa thương hiệu"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="card-footer bg-white py-3 border-top d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Hiển thị <strong>{filteredBrands.length}</strong> / <strong>{brands.length}</strong> thương hiệu
                </small>
                <small className="text-muted">
                </small>
              </div>
            </div>
          )}

          {/* ================= 7. BẢNG USERS (TAB QUẢN LÝ TÀI KHOẢN THEO CSDL) ================= */}
          {activeTab === 'users' && (
            <div className="card border-0 shadow-sm rounded-3 bg-white mb-4">
              <div className="card-header bg-white py-3 border-bottom">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="bi bi-people-fill me-2 text-warning"></i>
                      Tài Khoản Người Dùng & Phân Quyền
                    </h5>
                    <small className="text-muted">
                      Đồng bộ bảng users và user_roles (Admin, Staff, Customer)
                    </small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={handleOpenAddUser}
                      className="btn btn-warning text-dark btn-sm rounded-pill px-3 fw-bold shadow-sm"
                    >
                      <i className="bi bi-person-plus-fill me-1"></i>Thêm Tài Khoản
                    </button>
                  </div>
                </div>
              </div>

              {/* Users Filter Strip */}
              <div className="card-body border-bottom bg-light bg-opacity-50 py-3">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-4">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-white border-start-0"
                        placeholder="Tìm email, họ tên, số điện thoại, ID..."
                        value={userSearchKeyword}
                        onChange={(e) => setUserSearchKeyword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                    >
                      <option value="ALL">Tất cả vai trò</option>
                      <option value="ADMIN">ADMIN - Quản trị viên</option>
                      <option value="STAFF">STAFF - Nhân viên</option>
                      <option value="CUSTOMER">CUSTOMER - Khách hàng</option>
                    </select>
                  </div>

                  <div className="col-6 col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                      <option value="INACTIVE">Đã khóa (INACTIVE)</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-2 text-md-end">
                    <span className="text-muted small">
                      Tìm thấy: <strong>{filteredUsers.length}</strong> tài khoản
                    </span>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4" style={{ width: '60px' }}>ID</th>
                      <th>Họ và Tên</th>
                      <th>Email / Đăng nhập</th>
                      <th>Số Điện Thoại</th>
                      <th>Vai Trò (Role)</th>
                      <th>Trạng Thái</th>
                      <th>Ngày Tạo</th>
                      <th className="text-end pe-4" style={{ width: '130px' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted">
                          <i className="bi bi-person-x fs-1 d-block mb-2 text-secondary"></i>
                          Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        return (
                          <tr key={u.id}>
                            <td className="ps-4 fw-bold text-secondary">#{u.id}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${
                                    u.role === 'ADMIN'
                                      ? 'bg-danger'
                                      : u.role === 'STAFF'
                                      ? 'bg-warning text-dark'
                                      : 'bg-secondary'
                                  }`}
                                  style={{ width: '32px', height: '32px', fontSize: '12px' }}
                                >
                                  {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="fw-semibold text-dark">{u.full_name}</span>
                              </div>
                            </td>
                            <td className="font-monospace text-primary">{u.email}</td>
                            <td>{u.phone || <span className="text-muted fst-italic">Chưa có</span>}</td>
                            <td>
                              {u.role === 'ADMIN' && (
                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                  <i className="bi bi-shield-fill me-1"></i>ADMIN
                                </span>
                              )}
                              {u.role === 'STAFF' && (
                                <span className="badge bg-warning-subtle text-dark border border-warning-subtle fw-bold">
                                  <i className="bi bi-person-badge-fill me-1"></i>STAFF
                                </span>
                              )}
                              {u.role === 'CUSTOMER' && (
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  <i className="bi bi-person me-1"></i>CUSTOMER
                                </span>
                              )}
                            </td>
                            <td>
                              {u.status === 'ACTIVE' ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                  ● ACTIVE
                                </span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  ○ INACTIVE
                                </span>
                              )}
                            </td>
                            <td className="small text-muted">{u.created_at}</td>
                            <td className="text-end pe-4">
                              <div className="btn-group btn-group-sm">
                                <button
                                  onClick={() => handleToggleUserStatus(u.id)}
                                  className={`btn btn-light border ${u.status === 'ACTIVE' ? 'text-warning' : 'text-success'}`}
                                  title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                >
                                  <i className={`bi ${u.status === 'ACTIVE' ? 'bi-lock-fill' : 'bi-unlock-fill'}`}></i>
                                </button>
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  className="btn btn-light text-primary border"
                                  title="Chỉnh sửa tài khoản"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  className="btn btn-light text-danger border"
                                  title="Xóa tài khoản"
                                  disabled={u.id === 1}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="card-footer bg-white py-3 border-top d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Hiển thị <strong>{filteredUsers.length}</strong> / <strong>{users.length}</strong> tài khoản
                </small>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= 8. MODAL THÊM / SỬA PRODUCTS ================= */}
      {showProductModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-light py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
                  <i className={`bi ${isEditingProduct ? 'bi-pencil-square text-primary' : 'bi-plus-circle-fill text-success'} me-2`}></i>
                  {isEditingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProductModal(false)}
                ></button>
              </div>

              <form noValidate className={validated ? 'was-validated' : ''} onSubmit={handleSubmitProduct}>
                <div className="modal-body p-4">
                  {/* Mã SKU & Tên sản phẩm */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">
                      <label className="form-label fw-semibold small">Mã SKU <span className="text-danger">*</span></label>
                      </label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="VD: IP16PM-256"
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      />
                      <div className="invalid-feedback">Vui lòng nhập SKU (duy nhất).</div>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold small">
                      <label className="form-label fw-semibold small">Tên sản phẩm <span className="text-danger">*</span></label>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="VD: iPhone 16 Pro Max 256GB"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <div className="invalid-feedback">Vui lòng nhập tên sản phẩm.</div>
                    </div>
                  </div>

                  {/* Category FK & Brand FK */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                      <label className="form-label fw-semibold small">Danh mục <span className="text-danger">*</span></label>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            ID #{c.id} - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                      <label className="form-label fw-semibold small">Thương hiệu <span className="text-danger">*</span></label>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.brand_id}
                        onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                      >
                        {brands.map((b) => (
                          <option key={b.id} value={String(b.id)}>
                            ID #{b.id} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Giá bán & Trạng thái */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                      <label className="form-label fw-semibold small">Đơn giá <span className="text-danger">*</span></label>
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="1000"
                          placeholder="34990000"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        <span className="input-group-text">₫</span>
                        <div className="invalid-feedback">Giá tiền phải lớn hơn hoặc bằng 0.</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                      <label className="form-label fw-semibold small">Trạng thái <span className="text-danger">*</span></label>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="ACTIVE">Đang kinh doanh</option>
                        <option value="INACTIVE">Tạm ngưng</option>
                      </select>
                    </div>
                  </div>

                  {/* Đường dẫn hình ảnh */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Đường dẫn hình ảnh</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/images/product.png"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    <div className="form-text small">Độ dài tối đa 500 ký tự.</div>
                  </div>

                  {/* Mô tả chi tiết TEXT */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Mô tả sản phẩm</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Nhập thông số kỹ thuật, cấu hình chi tiết của sản phẩm..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm px-3"
                    onClick={() => setShowProductModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold shadow-sm">
                    <i className="bi bi-check-lg me-1"></i>
                    {isEditingProduct ? 'Cập Nhật Bản Ghi' : 'Lưu Vào Database'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= 9. MODAL THÊM / SỬA CATEGORIES ================= */}
      {showCategoryModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-success-subtle py-3">
                <h5 className="modal-title fw-bold text-success d-flex align-items-center">
                  <i className={`bi ${isEditingCategory ? 'bi-pencil-square' : 'bi-folder-plus'} me-2`}></i>
                  {isEditingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCategoryModal(false)}
                ></button>
              </div>

              <form noValidate className={categoryValidated ? 'was-validated' : ''} onSubmit={handleSubmitCategory}>
                <div className="modal-body p-4">
                  {/* Tên Danh Mục */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                    <label className="form-label fw-semibold small">Tên danh mục <span className="text-danger">*</span></label>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Thiết bị đeo thông minh"
                      maxLength={100}
                      required
                      value={categoryFormData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategoryFormData((prev) => ({
                          ...prev,
                          name: val,
                          slug: isEditingCategory ? prev.slug : generateSlug(val),
                        }));
                      }}
                    />
                    <div className="invalid-feedback">Vui lòng nhập tên danh mục.</div>
                  </div>

                  {/* Slug */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                    <label className="form-label fw-semibold small">Đường dẫn Slug <span className="text-danger">*</span></label>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted small">/category/</span>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="thiet-bi-deo"
                        maxLength={120}
                        required
                        value={categoryFormData.slug}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                      />
                    </div>
                    <div className="form-text small">Đường dẫn tĩnh duy nhất.</div>
                  </div>

                  {/* Mô tả */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Mô Tả</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      maxLength={500}
                      placeholder="Mô tả về nhóm danh mục này..."
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    ></textarea>
                    <div className="form-text text-end small">{categoryFormData.description.length}/500 ký tự</div>
                  </div>

                  {/* Trạng thái */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                    <label className="form-label fw-semibold small">Trạng thái <span className="text-danger">*</span></label>
                    </label>
                    <select
                      className="form-select"
                      value={categoryFormData.status}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, status: e.target.value })}
                    >
                      <option value="ACTIVE">Kích hoạt</option>
                      <option value="INACTIVE">Tạm ngưng</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm px-3"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-success btn-sm px-4 fw-bold shadow-sm">
                    <i className="bi bi-check-lg me-1"></i>
                    {isEditingCategory ? 'Cập Nhật Danh Mục' : 'Lưu Danh Mục'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= 10. MODAL THÊM / SỬA BRANDS ================= */}
      {showBrandModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-info-subtle py-3">
                <h5 className="modal-title fw-bold text-info-emphasis d-flex align-items-center">
                  <i className={`bi ${isEditingBrand ? 'bi-pencil-square' : 'bi-award-fill'} me-2`}></i>
                  {isEditingBrand ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBrandModal(false)}
                ></button>
              </div>

              <form noValidate className={brandValidated ? 'was-validated' : ''} onSubmit={handleSubmitBrand}>
                <div className="modal-body p-4">
                  {/* Tên Thương Hiệu */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                    <label className="form-label fw-semibold small">Tên thương hiệu <span className="text-danger">*</span></label>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Dell"
                      maxLength={100}
                      required
                      value={brandFormData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBrandFormData((prev) => ({
                          ...prev,
                          name: val,
                          slug: isEditingBrand ? prev.slug : generateSlug(val),
                        }));
                      }}
                    />
                    <div className="invalid-feedback">Vui lòng nhập tên thương hiệu.</div>
                  </div>

                  {/* Slug */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                    <label className="form-label fw-semibold small">Đường dẫn Slug <span className="text-danger">*</span></label>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted small">/brand/</span>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="dell"
                        maxLength={120}
                        required
                        value={brandFormData.slug}
                        onChange={(e) => setBrandFormData({ ...brandFormData, slug: e.target.value })}
                      />
                    </div>
                    <div className="form-text small">Đường dẫn tĩnh duy nhất.</div>
                  </div>

                  {/* Logo URL */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Đường Dẫn Logo
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/logo.svg"
                      maxLength={500}
                      value={brandFormData.logo_url}
                      onChange={(e) => setBrandFormData({ ...brandFormData, logo_url: e.target.value })}
                    />
                    {brandFormData.logo_url && (
                      <div className="mt-2 p-2 border rounded bg-light text-center">
                        <small className="text-muted d-block mb-1">Xem trước logo:</small>
                        <img
                          src={brandFormData.logo_url}
                          alt="Preview"
                          style={{ maxHeight: '50px', maxWidth: '120px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Trạng thái */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                    <label className="form-label fw-semibold small">Trạng thái <span className="text-danger">*</span></label>
                    </label>
                    <select
                      className="form-select"
                      value={brandFormData.status}
                      onChange={(e) => setBrandFormData({ ...brandFormData, status: e.target.value })}
                    >
                      <option value="ACTIVE">Kích hoạt</option>
                      <option value="INACTIVE">Tạm ngưng</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm px-3"
                    onClick={() => setShowBrandModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-info text-white btn-sm px-4 fw-bold shadow-sm">
                    <i className="bi bi-check-lg me-1"></i>
                    {isEditingBrand ? 'Cập Nhật Thương Hiệu' : 'Lưu Thương Hiệu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= 10. MODAL THÊM / SỬA USERS ================= */}
      {showUserModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-light py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
                  <i className={`bi ${isEditingUser ? 'bi-pencil-square text-primary' : 'bi-person-plus-fill text-warning'} me-2`}></i>
                  {isEditingUser ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUserModal(false)}
                ></button>
              </div>

              <form noValidate className={userValidated ? 'was-validated' : ''} onSubmit={handleSubmitUser}>
                <div className="modal-body p-4">
                  {/* Họ và tên */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Họ và Tên <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Nguyễn Văn A"
                      required
                      value={userFormData.full_name}
                      onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                    />
                    <div className="invalid-feedback">Vui lòng nhập họ và tên.</div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Email Đăng Nhập <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control font-monospace"
                      placeholder="VD: staff01@techmart.vn"
                      required
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    />
                    <div className="invalid-feedback">Vui lòng nhập email hợp lệ.</div>
                  </div>

                  {/* Mật khẩu */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      {isEditingUser ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : <>Mật khẩu <span className="text-danger">*</span></>}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      required={!isEditingUser}
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    />
                    <div className="invalid-feedback">Vui lòng nhập mật khẩu.</div>
                  </div>

                  {/* Số điện thoại */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Số Điện Thoại</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="VD: 0988123456"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    />
                  </div>

                  {/* Vai trò (Role) & Trạng thái */}
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Vai Trò (Role) <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                      >
                        <option value="STAFF">STAFF (Nhân viên)</option>
                        <option value="ADMIN">ADMIN (Quản trị viên)</option>
                        <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold small">Trạng Thái <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={userFormData.status}
                        onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                      >
                        <option value="ACTIVE">Kích hoạt (ACTIVE)</option>
                        <option value="INACTIVE">Khóa (INACTIVE)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm px-3"
                    onClick={() => setShowUserModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-warning text-dark btn-sm px-4 fw-bold shadow-sm">
                    <i className="bi bi-check-lg me-1"></i>
                    {isEditingUser ? 'Cập Nhật Tài Khoản' : 'Lưu Tài Khoản'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
