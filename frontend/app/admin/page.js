'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { DEMO_ORDERS, DEMO_ORDER_ITEMS, DEMO_ORDER_STATUS_HISTORY, DEMO_VOUCHERS, ORDER_STATUS_LABELS, ORDER_STATUS_BADGES, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, formatOrderDate, loadDemoOrderData, saveDemoOrderData } from '../lib/demo-orders';
import BrandLogo from '../../components/BrandLogo';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const mapProductFromApi = (product) => ({
  ...product,
  category_id: product.categoryId,
  brand_id: product.brandId,
  image_url: product.imageUrl,
  created_at: product.createdAt,
  updated_at: product.updatedAt,
});

const mapBrandFromApi = (brand) => ({
  ...brand,
  logo_url: brand.logoUrl,
});
const mapUserFromApi = (user) => ({
  ...user,
  full_name: user.fullName,
  role: user.roles?.[0] || 'CUSTOMER',
  created_at: user.createdAt,
  updated_at: user.updatedAt,
});
export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tab điều hướng: 'products' (chính), 'categories', 'brands', 'users'
  const [activeTab, setActiveTab] = useState('products');

  // Products, categories và brands được tải từ Catalog API thật.

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [orderHistory, setOrderHistory] = useState(DEMO_ORDER_STATUS_HISTORY);
  const [orderItems, setOrderItems] = useState(DEMO_ORDER_ITEMS);
  const [vouchers, setVouchers] = useState(DEMO_VOUCHERS);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearchKeyword, setOrderSearchKeyword] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('ALL');

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
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
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
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
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
  const [isSubmittingBrand, setIsSubmittingBrand] = useState(false);
  const [brandFormData, setBrandFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    status: 'ACTIVE',
  });

  // Thông báo Toast alert
  const [alertNotice, setAlertNotice] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const syncOrders = () => {
      const data = loadDemoOrderData();
      setOrders(data.orders);
      setOrderItems(data.items);
      setOrderHistory(data.history);
      setVouchers(data.vouchers);
    };
    syncOrders();
    window.addEventListener('orders-updated', syncOrders);
    window.addEventListener('storage', syncOrders);
    return () => {
      window.removeEventListener('orders-updated', syncOrders);
      window.removeEventListener('storage', syncOrders);
    };
  }, []);

  // Nạp phiên đăng nhập và dữ liệu quản trị Catalog bằng JWT.
  useEffect(() => {
    const initializeAdminPage = async () => {
      const savedUser =
        localStorage.getItem('currentUser') ||
        localStorage.getItem('adminUser');
      const accessToken = localStorage.getItem('accessToken');

      if (!savedUser || !accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const user = JSON.parse(savedUser);
        const roles = Array.isArray(user.roles) ? user.roles : [];
        const hasAdminRole = user.role === 'ADMIN' || roles.includes('ADMIN');
        const hasStaffRole = user.role === 'STAFF' || roles.includes('STAFF');

        if (hasStaffRole && !hasAdminRole) {
          setCurrentUser(user);
          router.replace('/staff/orders');
          return;
        }

        if (!hasAdminRole) {
          return;
        }

        setCurrentUser(user);

        const [productsResponse, categoriesResponse, brandsResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/admin/products`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch(`${API_BASE_URL}/api/admin/categories`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch(`${API_BASE_URL}/api/admin/brands`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }),
          ]);

        if (
          [productsResponse, categoriesResponse, brandsResponse].some(
            (response) => response.status === 401 || response.status === 403
          )
        ) {
          localStorage.removeItem('adminUser');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('accessToken');
          setCurrentUser(null);
          router.replace('/login');
          return;
        }

        if (!productsResponse.ok || !categoriesResponse.ok || !brandsResponse.ok) {
          throw new Error('Không thể tải dữ liệu Catalog.');
        }

        const [productData, categoryData, brandData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
          brandsResponse.json(),
        ]);

        setProducts(productData.map(mapProductFromApi));
        setCategories(categoryData);
        setBrands(brandData.map(mapBrandFromApi));
      } catch (error) {
        console.error('Lỗi tải dữ liệu Catalog:', error);
        setAlertNotice({
          show: true,
          message: 'Không thể tải dữ liệu sản phẩm từ máy chủ.',
          type: 'danger',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdminPage();
  }, [router]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('currentUser') || localStorage.getItem('adminUser');
    if (!accessToken || !savedUser) return;

    let admin;
    try {
      admin = JSON.parse(savedUser);
    } catch {
      return;
    }
    if (admin.role !== 'ADMIN' && !admin.roles?.includes('ADMIN')) return;

    let cancelled = false;
    const loadUsers = async () => {
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/roles`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);
        if (!usersResponse.ok || !rolesResponse.ok) {
          throw new Error(await getApiErrorMessage(!usersResponse.ok ? usersResponse : rolesResponse));
        }
        const [userData, roleData] = await Promise.all([usersResponse.json(), rolesResponse.json()]);
        if (!cancelled) {
          setUsers(userData.map(mapUserFromApi));
          setRoles(roleData);
        }
      } catch (error) {
        if (!cancelled) {
          setAlertNotice({ show: true, message: error.message || 'Không thể tải tài khoản.', type: 'danger' });
        }
      }
    };
    loadUsers();
    return () => { cancelled = true; };
  }, []);

  const userRoles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const isAdmin = currentUser?.role === 'ADMIN' || userRoles.includes('ADMIN');
  const isStaff = currentUser?.role === 'STAFF' || userRoles.includes('STAFF');

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    router.replace('/login');
  };

  const showAlert = (message, type = 'success') => {
    setAlertNotice({ show: true, message, type });
    setTimeout(() => setAlertNotice({ show: false, message: '', type: 'success' }), 4000);
  };

  const getApiErrorMessage = async (response) => {
    try {
      const data = await response.json();
      if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
        return Object.values(data.fieldErrors).join(', ');
      }
      return data.message || data.error || 'Đã xảy ra lỗi khi gọi API.';
    } catch {
      return 'Không thể đọc phản hồi từ máy chủ.';
    }
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

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      router.replace('/login');
      return;
    }

    const productRequest = {
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      imageUrl: formData.image_url.trim(),
      categoryId: Number(formData.category_id),
      brandId: Number(formData.brand_id),
      status: formData.status,
    };

    const url = isEditingProduct
        ? `${API_BASE_URL}/api/admin/products/${currentEditId}`
        : `${API_BASE_URL}/api/admin/products`;

    try {
      setIsSubmittingProduct(true);

      const response = await fetch(url, {
        method: isEditingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(productRequest),
      });

      if (response.status === 401) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        router.replace('/login');
        return;
      }

      if (response.status === 403) {
        throw new Error('Bạn không có quyền quản lý sản phẩm.');
      }

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      const savedProduct = mapProductFromApi(await response.json());

      if (isEditingProduct) {
        setProducts((previousProducts) =>
            previousProducts.map((product) =>
                product.id === savedProduct.id ? savedProduct : product
            )
        );

        showAlert(
            `Đã cập nhật sản phẩm "${savedProduct.name}" thành công.`,
            'success'
        );
      } else {
        setProducts((previousProducts) => [
          savedProduct,
          ...previousProducts,
        ]);

        showAlert(
            `Đã thêm sản phẩm "${savedProduct.name}" thành công.`,
            'success'
        );
      }

      setShowProductModal(false);
      setValidated(false);
    } catch (error) {
      console.error('Lỗi lưu sản phẩm:', error);
      showAlert(error.message, 'danger');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

    const handleDeleteProduct = async (id, sku, name) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn ngừng kinh doanh sản phẩm "${name}" (${sku}) không?`
        );

        if (!confirmed) {
            return;
        }

        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            router.replace('/login');
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/admin/products/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.status === 401) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('accessToken');
                router.replace('/login');
                return;
            }

            if (response.status === 403) {
                throw new Error('Bạn không có quyền ngừng kinh doanh sản phẩm.');
            }

            if (!response.ok) {
                throw new Error(await getApiErrorMessage(response));
            }

            setProducts((previousProducts) =>
                previousProducts.map((product) =>
                    product.id === id
                        ? {
                            ...product,
                            status: 'INACTIVE',
                            updated_at: new Date().toISOString(),
                        }
                        : product
                )
            );

            showAlert(
                `Sản phẩm "${name}" đã chuyển sang trạng thái INACTIVE.`,
                'success'
            );
        } catch (error) {
            console.error('Lỗi ngừng kinh doanh sản phẩm:', error);
            showAlert(error.message, 'danger');
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
    link.setAttribute('download', `san-pham_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Đã xuất dữ liệu danh sách sản phẩm thành công (file CSV)!', 'success');
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

  const handleSubmitCategory = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setCategoryValidated(true);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      router.replace('/login');
      return;
    }

    const categoryRequest = {
      name: categoryFormData.name.trim(),
      slug:
          categoryFormData.slug.trim() ||
          generateSlug(categoryFormData.name),
      description: categoryFormData.description.trim(),
      status: categoryFormData.status,
    };

    const url = isEditingCategory
        ? `${API_BASE_URL}/api/admin/categories/${currentEditCategoryId}`
        : `${API_BASE_URL}/api/admin/categories`;

    try {
      setIsSubmittingCategory(true);

      const response = await fetch(url, {
        method: isEditingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(categoryRequest),
      });

      if (response.status === 401) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        router.replace('/login');
        return;
      }

      if (response.status === 403) {
        throw new Error('Bạn không có quyền quản lý danh mục.');
      }

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      const savedCategory = await response.json();

      if (isEditingCategory) {
        setCategories((previousCategories) =>
            previousCategories.map((category) =>
                category.id === savedCategory.id
                    ? savedCategory
                    : category
            )
        );

        showAlert(
            `Đã cập nhật danh mục "${savedCategory.name}".`,
            'success'
        );
      } else {
        setCategories((previousCategories) => [
          ...previousCategories,
          savedCategory,
        ]);

        showAlert(
            `Đã thêm danh mục "${savedCategory.name}".`,
            'success'
        );
      }

      setShowCategoryModal(false);
      setCategoryValidated(false);
    } catch (error) {
      console.error('Lỗi lưu danh mục:', error);
      showAlert(error.message, 'danger');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const confirmed = window.confirm(
        `Bạn có chắc muốn ngừng hoạt động danh mục "${name}" không?`
    );

    if (!confirmed) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      router.replace('/login');
      return;
    }

    try {
      const response = await fetch(
          `${API_BASE_URL}/api/admin/categories/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
      );

      if (response.status === 401) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        router.replace('/login');
        return;
      }

      if (response.status === 403) {
        throw new Error('Bạn không có quyền quản lý danh mục.');
      }

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      setCategories((previousCategories) =>
          previousCategories.map((category) =>
              category.id === id
                  ? {
                    ...category,
                    status: 'INACTIVE',
                  }
                  : category
          )
      );

      showAlert(
          `Danh mục "${name}" đã chuyển sang INACTIVE.`,
          'success'
      );
    } catch (error) {
      console.error('Lỗi ngừng hoạt động danh mục:', error);
      showAlert(error.message, 'danger');
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
    link.setAttribute('download', `danh-muc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Đã xuất dữ liệu danh mục thành công (file CSV)!', 'success');
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

  const handleSubmitBrand = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setBrandValidated(true);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      router.replace('/login');
      return;
    }

    const brandRequest = {
      name: brandFormData.name.trim(),
      slug:
          brandFormData.slug.trim() ||
          generateSlug(brandFormData.name),
      logoUrl: brandFormData.logo_url.trim(),
      status: brandFormData.status,
    };

    const url = isEditingBrand
        ? `${API_BASE_URL}/api/admin/brands/${currentEditBrandId}`
        : `${API_BASE_URL}/api/admin/brands`;

    try {
      setIsSubmittingBrand(true);

      const response = await fetch(url, {
        method: isEditingBrand ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(brandRequest),
      });

      if (response.status === 401) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        router.replace('/login');
        return;
      }

      if (response.status === 403) {
        throw new Error('Bạn không có quyền quản lý thương hiệu.');
      }

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      const savedBrand = mapBrandFromApi(await response.json());

      if (isEditingBrand) {
        setBrands((previousBrands) =>
            previousBrands.map((brand) =>
                brand.id === savedBrand.id ? savedBrand : brand
            )
        );

        showAlert(
            `Đã cập nhật thương hiệu "${savedBrand.name}".`,
            'success'
        );
      } else {
        setBrands((previousBrands) => [
          ...previousBrands,
          savedBrand,
        ]);

        showAlert(
            `Đã thêm thương hiệu "${savedBrand.name}".`,
            'success'
        );
      }

      setShowBrandModal(false);
      setBrandValidated(false);
    } catch (error) {
      console.error('Lỗi lưu thương hiệu:', error);
      showAlert(error.message, 'danger');
    } finally {
      setIsSubmittingBrand(false);
    }
  };

  const handleDeleteBrand = async (id, name) => {
    const confirmed = window.confirm(
        `Bạn có chắc muốn ngừng hoạt động thương hiệu "${name}" không?`
    );

    if (!confirmed) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      router.replace('/login');
      return;
    }

    try {
      const response = await fetch(
          `${API_BASE_URL}/api/admin/brands/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
      );

      if (response.status === 401) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        router.replace('/login');
        return;
      }

      if (response.status === 403) {
        throw new Error('Bạn không có quyền quản lý thương hiệu.');
      }

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      setBrands((previousBrands) =>
          previousBrands.map((brand) =>
              brand.id === id
                  ? {
                    ...brand,
                    status: 'INACTIVE',
                  }
                  : brand
          )
      );

      showAlert(
          `Thương hiệu "${name}" đã chuyển sang INACTIVE.`,
          'success'
      );
    } catch (error) {
      console.error('Lỗi ngừng hoạt động thương hiệu:', error);
      showAlert(error.message, 'danger');
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
    link.setAttribute('download', `thuong-hieu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Đã xuất dữ liệu thương hiệu thành công (file CSV)!', 'success');
  };

  // Quản lý tài khoản qua Identity Service.
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

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Xóa vĩnh viễn tài khoản [${email}] (ID: ${userId}) khỏi database?`)) return;
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) { router.replace('/login'); return; }
    setBusyUserId(userId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.status === 401) { router.replace('/login'); return; }
      if (!response.ok) throw new Error(await getApiErrorMessage(response));
      setUsers((previous) => previous.filter((user) => user.id !== userId));
      showAlert(`Đã xóa tài khoản [${email}] khỏi database.`, 'success');
    } catch (error) {
      showAlert(error.message || 'Không thể xóa tài khoản.', 'danger');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    const status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`${status === 'INACTIVE' ? 'Khóa' : 'Mở khóa'} tài khoản [${user.email}]?`)) return;
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) { router.replace('/login'); return; }
    setBusyUserId(userId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ status }),
      });
      if (response.status === 401) { router.replace('/login'); return; }
      if (!response.ok) throw new Error(await getApiErrorMessage(response));
      const saved = mapUserFromApi(await response.json());
      setUsers((previous) => previous.map((item) => item.id === userId ? saved : item));
      showAlert(`Tài khoản [${user.email}] đã ${status === 'ACTIVE' ? 'mở khóa' : 'khóa'}.`, 'success');
    } catch (error) {
      showAlert(error.message || 'Không thể đổi trạng thái.', 'danger');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setUserValidated(true);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) { router.replace('/login'); return; }
    const body = {
      fullName: userFormData.full_name.trim(),
      phone: userFormData.phone.trim(),
      role: userFormData.role,
      status: userFormData.status,
      ...(!isEditingUser && {
        email: userFormData.email.trim(),
        password: userFormData.password,
      }),
    };
    setIsSubmittingUser(true);
    try {
      const response = await fetch(
        isEditingUser
          ? `${API_BASE_URL}/api/admin/users/${currentEditUserId}`
          : `${API_BASE_URL}/api/admin/users`,
        {
          method: isEditingUser ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(body),
        }
      );
      if (response.status === 401) { router.replace('/login'); return; }
      if (!response.ok) throw new Error(await getApiErrorMessage(response));
      const saved = mapUserFromApi(await response.json());
      setUsers((previous) => isEditingUser
        ? previous.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...previous]);
      showAlert(`Đã ${isEditingUser ? 'cập nhật' : 'thêm'} tài khoản [${saved.email}].`, 'success');
      setShowUserModal(false);
      setUserValidated(false);
    } catch (error) {
      showAlert(error.message || 'Không thể lưu tài khoản.', 'danger');
    } finally {
      setIsSubmittingUser(false);
    }
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
    link.setAttribute('download', `tai-khoan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Đã xuất dữ liệu tài khoản thành công (file CSV)!', 'success');
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
  const filteredOrders = useMemo(() => {
    const keyword = orderSearchKeyword.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch = !keyword || order.order_code.toLowerCase().includes(keyword) || order.customer_name.toLowerCase().includes(keyword) || order.customer_phone.includes(keyword) || (order.customer_email || '').toLowerCase().includes(keyword);
      const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
      const matchesPayment = orderPaymentFilter === 'ALL' || order.payment_method === orderPaymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, orderSearchKeyword, orderStatusFilter, orderPaymentFilter]);
  const handleOrderStatusChange = (orderId, status) => {
    const currentOrder = orders.find((order) => order.id === orderId);
    if (!currentOrder || currentOrder.status === status) return;
    const now = new Date().toISOString();
    const nextOrders = orders.map((order) => order.id === orderId ? { ...order, status, updated_at: now } : order);
    const nextHistory = [...orderHistory, { id: Math.max(0, ...orderHistory.map((item) => item.id)) + 1, order_id: orderId, previous_status: currentOrder.status, current_status: status, action_event: 'UPDATE_STATUS', reason: null, changed_by: currentUser?.email || 'ADMIN', created_at: now }];
    setOrders(nextOrders);
    setOrderHistory(nextHistory);
    saveDemoOrderData({ orders: nextOrders, items: orderItems, history: nextHistory, vouchers });
    setSelectedOrder((order) => order?.id === orderId ? { ...order, status, updated_at: now } : order);
    showAlert(`Đã cập nhật đơn ${currentOrder.order_code}: ${ORDER_STATUS_LABELS[status]}.`, 'success');
  };

  const orderStatusClass = ORDER_STATUS_BADGES;

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

  // Chỉ Admin được vào khu vực quản trị.
  if (currentUser && isStaff && !isAdmin) {
    return <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light text-muted">Đang chuyển đến trang nhân viên...</div>;
  }
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
        <div className="card shadow border-0 rounded-4 p-4 text-center" style={{ maxWidth: '480px' }}>
          <div className="mb-3 text-warning">
            <i className="bi bi-shield-lock-fill fs-1"></i>
          </div>
          <h4 className="fw-bold text-dark">Yêu Cầu Quyền Quản Trị</h4>
          <p className="text-secondary small mb-4">
            Vui lòng đăng nhập bằng tài khoản Admin để tiếp tục.
          </p>
          <div className="d-flex justify-content-center">
            <Link href="/login" className="btn btn-primary px-4 fw-semibold">
              <i className="bi bi-box-arrow-in-right me-1"></i> Đăng nhập Admin
            </Link>
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
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <BrandLogo tone="dark" showText={sidebarOpen} />
          </div>
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
            {isAdmin && (
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
            )}

            {isAdmin && (
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
            )}

            {isAdmin && (
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
            )}

            {isAdmin && (
              <li className="nav-item">
              <button
                onClick={() => setActiveTab('users')}
                className={`nav-link rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 ${
                  activeTab === 'users' ? 'active bg-warning-subtle text-dark' : 'text-secondary bg-transparent hover-primary'
                }`}
              >
                <i className={`bi bi-people-fill fs-5 ${activeTab === 'users' ? 'text-warning' : 'text-secondary'}`}></i>
                {sidebarOpen && <span>Tài khoản ({users.length})</span>}
              </button>
            </li>
            )}
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('orders')}
                className={`nav-link rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-3 w-100 text-start border-0 ${
                  activeTab === 'orders' ? 'active bg-danger-subtle text-danger' : 'text-secondary bg-transparent hover-primary'
                }`}
              >
                <i className="bi bi-receipt fs-5"></i>
                {sidebarOpen && <span>Đơn hàng ({orders.length})</span>}
              </button>
            </li>
            {isAdmin && (
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
                <i className="bi bi-plus-circle fs-5"></i>
                {sidebarOpen && <span>+ Thêm Tài Khoản</span>}
              </button>
            </li>
            )}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-top d-flex align-items-center justify-content-between">
          {sidebarOpen && (
            <div className="d-flex align-items-center gap-2">
            </div>
          )}
        </div>
      </aside>

      {/* ================= 2. MAIN CONTENT WRAPPER ================= */}
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-bottom px-4 py-2 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-light text-dark border px-3 py-2 fw-semibold">
              <i className="bi bi-database me-2 text-primary"></i>
                {isAdmin ? 'Sản phẩm - Danh mục - Thương hiệu - Tài khoản' : 'Khu vực quản lý đơn hàng'}
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Nút Xem Cửa Hàng màu đỏ theo yêu cầu */}
            <Link href="/" className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold">
              <i className="bi bi-shop me-1"></i>Xem Cửa Hàng
            </Link>

            {/* Nút đăng xuất */}
            <div className="border-start ps-3">
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline-danger fw-semibold d-flex align-items-center gap-2"
                title="Đăng xuất khỏi hệ thống"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Đăng xuất</span>
              </button>
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
                {activeTab === 'products' && 'Quản Lý Sản phẩm'}
                {activeTab === 'categories' && 'Quản Lý Danh mục'}
                {activeTab === 'brands' && 'Quản Lý Thương hiệu'}
                {activeTab === 'users' && 'Quản Lý Tài Khoản'}
                {activeTab === 'orders' && 'Quản lý đơn hàng'}
              </h4>

            </div>

            <div className="d-flex align-items-center gap-2">
              {activeTab === 'products' && (
                <>

                </>
              )}

              {activeTab === 'categories' && (
                <>

                </>
              )}

              {activeTab === 'brands' && (
                <>

                </>
              )}

              {activeTab === 'users' && (
                <>

                </>
              )}


            </div>
          </div>

          {/* ================= 3. STATS STRIP ================= */}
                    {isAdmin && (
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
                  <span className="text-muted small fw-semibold text-uppercase">Sản phẩm</span>
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
                  <span className="text-muted small fw-semibold text-uppercase">Danh mục</span>
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
                  <span className="text-muted small fw-semibold text-uppercase">Thương hiệu</span>
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
                  <span className="text-muted small fw-semibold text-uppercase">Tài khoản</span>
                  <div className="rounded-3 d-flex align-items-center justify-content-center text-warning" style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7' }}>
                    <i className="bi bi-people-fill fs-5"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">{users.length} Tài khoản</h4>
                <span className="text-warning-emphasis small fw-semibold">
                  <i className="bi bi-person-badge me-1"></i>{users.filter((u) => u.role === 'STAFF').length} nhân viên
                </span>
              </div>
            </div>
          </div>

          )}

          {/* ================= 4. TAB NAVIGATION ================= */}
                    {isAdmin && (
<ul className="nav nav-pills mb-3 bg-white p-2 rounded-3 shadow-sm border">
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('products')}
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'products' ? 'active' : 'text-secondary'}`}
              >
                <i className="bi bi-box-seam me-2"></i>Sản phẩm ({products.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('categories')}
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'categories' ? 'active bg-success text-white' : 'text-secondary'}`}
              >
                <i className="bi bi-grid-fill me-2"></i>Danh mục ({categories.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('brands')}
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'brands' ? 'active bg-info text-white' : 'text-secondary'}`}
              >
                <i className="bi bi-award-fill me-2"></i>Thương hiệu ({brands.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('users')}
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'users' ? 'active bg-warning text-dark' : 'text-secondary'}`}
              >
                <i className="bi bi-people-fill me-2"></i>Tài khoản & Phân quyền ({users.length})
              </button>
            </li>
          </ul>
          )}

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
                      <option value="ALL">Tất cả danh mục</option>
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
                      <option value="ALL">Tất cả hãng</option>
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
                      <option value="ALL">Tất cả trạng thái</option>
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
                      <th className="text-end">Đơn Giá </th>
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
                                ● Đang hoạt động
                              </span>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                ○ Ngừng hoạt động
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
                  Hiển thị <strong>{filteredProducts.length}</strong> / <strong>{products.length}</strong> sản phẩm 
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
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
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
                                  ● Đang hoạt động
                                </span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  ○ Ngừng hoạt động
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
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
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
                                  ● Đang hoạt động
                                </span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  ○ Ngừng hoạt động
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

          {/* Bảng người dùng tạm dùng dữ liệu demo cho đến khi có API Identity Admin. */}
          {activeTab === 'users' && (
            <div className="card border-0 shadow-sm rounded-3 bg-white mb-4">
              <div className="card-header bg-white py-3 border-bottom">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="bi bi-people-fill me-2 text-warning"></i>
                      Tài Khoản Người Dùng & Phân Quyền
                    </h5>
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
                      <option value="ADMIN">Quản trị viên</option>
                      <option value="STAFF">Nhân viên</option>
                      <option value="CUSTOMER">Khách hàng</option>
                    </select>
                  </div>

                  <div className="col-6 col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Đã khóa</option>
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
                                  ● Đang hoạt động
                                </span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  ○ Ngừng hoạt động
                                </span>
                              )}
                            </td>
                            <td className="small text-muted">{u.created_at}</td>
                            <td className="text-end pe-4">
                              <div className="btn-group btn-group-sm">
                                <button
                                  onClick={() => handleToggleUserStatus(u.id)}
                                  disabled={busyUserId !== null || u.id === currentUser?.id}
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
                                  disabled={busyUserId !== null || u.id === currentUser?.id}
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

          {activeTab === 'orders' && (
            <section className="card border-0 shadow-sm rounded-3 bg-white mb-4 overflow-hidden">
              <div className="card-header bg-white py-3 px-3 px-lg-4 border-bottom">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-1"><i className="bi bi-receipt me-2 text-primary"></i>Quản lý đơn hàng</h5>
                    <span className="small text-muted">Theo dõi và xử lý các đơn hàng của cửa hàng</span>
                  </div>
                  <span className="badge bg-primary-subtle text-primary px-3 py-2">{orders.length} đơn hàng</span>
                </div>
              </div>

              <div className="d-flex overflow-auto bg-white border-bottom px-2 px-lg-3" role="tablist" aria-label="Lọc đơn hàng theo trạng thái">
                {[
                  { value: 'ALL', label: 'Tất cả' },
                  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
                ].map((tab) => {
                  const count = tab.value === 'ALL' ? orders.length : orders.filter((order) => order.status === tab.value).length;
                  const selected = orderStatusFilter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setOrderStatusFilter(tab.value)}
                      className={`btn rounded-0 border-0 border-bottom border-3 px-3 py-3 text-nowrap ${selected ? 'border-primary text-primary fw-bold' : 'border-transparent text-secondary'}`}
                    >
                      <span className="d-block">{tab.label}</span>
                      <small className={selected ? 'text-primary' : 'text-muted'}>{count} đơn</small>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 p-lg-4 bg-white border-bottom">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-lg-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                      <input type="search" className="form-control" placeholder="Tìm mã đơn hàng, tên hoặc số điện thoại khách..." value={orderSearchKeyword} onChange={(event) => setOrderSearchKeyword(event.target.value)} />
                    </div>
                  </div>
                  <div className="col-8 col-lg-3">
                    <select className="form-select" value={orderPaymentFilter} onChange={(event) => setOrderPaymentFilter(event.target.value)} aria-label="Lọc theo phương thức thanh toán">
                      <option value="ALL">Tất cả thanh toán</option>
                      {[...new Set(orders.map((order) => order.payment_method))].map((payment) => <option key={payment} value={payment}>{PAYMENT_METHOD_LABELS[payment] || payment}</option>)}
                    </select>
                  </div>
                  
                </div>
                <div className="small text-muted mt-3"><i className="bi bi-info-circle me-1"></i>Đang hiển thị {filteredOrders.length} đơn hàng phù hợp</div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Mã đơn hàng</th>
                      <th>Ngày đặt</th>
                      <th>Khách hàng</th>
                      <th>Sản phẩm</th>
                      <th className="text-center">Số lượng</th>
                      <th>Thanh toán</th>
                      <th className="text-end">Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="9" className="text-center py-5 text-muted"><i className="bi bi-inbox fs-2 d-block mb-2"></i>Không tìm thấy đơn hàng phù hợp.</td></tr>
                    ) : filteredOrders.map((order) => {
                      const items = orderItems.filter((item) => item.order_id === order.id);
                      const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <tr key={order.id}>
                          <td className="ps-3"><button type="button" className="btn btn-link p-0 fw-semibold text-primary text-decoration-none" onClick={() => setSelectedOrder(order)}>{order.order_code}</button></td>
                          <td className="text-nowrap">{formatOrderDate(order.created_at)}</td>
                          <td><div className="fw-semibold">{order.customer_name}</div><small className="text-muted">{order.customer_phone}</small></td>
                          <td style={{ minWidth: '210px' }}>{items.map((item) => item.product_name).join(', ') || '—'}</td>
                          <td className="text-center">{quantity}</td>
                          <td><div>{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</div><small className={order.payment_status === 'PAID' ? 'text-success' : 'text-secondary'}>{PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}</small></td>
                          <td className="text-end fw-bold text-nowrap">{order.final_amount.toLocaleString('vi-VN')} ₫</td>
                          <td style={{ minWidth: '165px' }}><select className={`form-select form-select-sm ${orderStatusClass[order.status]}`} value={order.status} onChange={(event) => handleOrderStatusChange(order.id, event.target.value)} aria-label={`Cập nhật trạng thái đơn ${order.order_code}`}>{Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                          <td className="text-center text-nowrap"><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setSelectedOrder(order)} title="Xem chi tiết đơn hàng"><i className="bi bi-eye me-1"></i>Chi tiết</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="card-footer bg-white py-3 px-3 px-lg-4 small text-muted d-flex justify-content-between">
                <span>Đang xem {filteredOrders.length} / {orders.length} đơn hàng</span>
                <span>Trang 1 / 1</span>
              </div>
            </section>
          )}
        </main>
      </div>

      {selectedOrder && (() => {
        const items = orderItems.filter((item) => item.order_id === selectedOrder.id);
        const events = orderHistory.filter((item) => item.order_id === selectedOrder.id);
        const voucher = vouchers.find((item) => item.code === selectedOrder.voucher_code);
        return (
          <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby="order-detail-title" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }} onClick={() => setSelectedOrder(null)}>
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable" onClick={(event) => event.stopPropagation()}>
              <div className="modal-content border-0 shadow rounded-4">
                <div className="modal-header"><div><h5 className="modal-title fw-bold" id="order-detail-title">Chi tiết đơn hàng</h5><span className="text-primary fw-semibold">{selectedOrder.order_code}</span></div><button type="button" className="btn-close" aria-label="Đóng" onClick={() => setSelectedOrder(null)}></button></div>
                <div className="modal-body">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6"><div className="p-3 bg-light rounded-3 h-100"><div className="small text-muted">Khách hàng · user_id {selectedOrder.user_id}</div><strong>{selectedOrder.customer_name}</strong><div>{selectedOrder.customer_phone}</div><div>{selectedOrder.customer_email || '—'}</div></div></div>
                    <div className="col-md-6"><div className="p-3 bg-light rounded-3 h-100"><div className="small text-muted">Trạng thái đơn</div><span className={`badge ${orderStatusClass[selectedOrder.status]}`}>{ORDER_STATUS_LABELS[selectedOrder.status]}</span><div className="small text-muted mt-2">Tạo {formatOrderDate(selectedOrder.created_at)} · Cập nhật {formatOrderDate(selectedOrder.updated_at)}</div></div></div>
                    <div className="col-12"><div className="p-3 bg-light rounded-3"><div className="small text-muted">Địa chỉ giao hàng</div><strong>{selectedOrder.shipping_address}</strong><div className="small text-muted mt-2">Chi nhánh: {selectedOrder.branch_name || '—'}{selectedOrder.branch_id ? ` (ID: ${selectedOrder.branch_id})` : ''}</div></div></div>
                  </div>
                  <h6 className="fw-bold">Chi tiết sản phẩm</h6><div className="table-responsive border rounded-3 mb-4"><table className="table align-middle mb-0"><thead className="table-light"><tr><th>Sản phẩm</th><th>SKU</th><th>Phân loại / IMEI</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="d-flex align-items-center gap-2">{item.product_image && <img src={item.product_image} alt={item.product_name} width="48" height="48" className="object-fit-contain" />}<strong>{item.product_name}</strong></div></td><td>{item.sku}</td><td>{item.variant_name || '—'}<small className="d-block text-muted">IMEI: {item.imei || '—'}</small></td><td>{item.unit_price.toLocaleString('vi-VN')}₫</td><td>{item.quantity}</td><td>{item.total_price.toLocaleString('vi-VN')}₫</td></tr>)}</tbody></table></div>
                  <div className="row g-4"><div className="col-md-6"><h6 className="fw-bold">Thanh toán & ghi chú</h6><div className="d-flex justify-content-between border-bottom py-2"><span>Phương thức</span><strong>{PAYMENT_METHOD_LABELS[selectedOrder.payment_method] || selectedOrder.payment_method}</strong></div><div className="d-flex justify-content-between border-bottom py-2"><span>Trạng thái thanh toán</span><strong>{PAYMENT_STATUS_LABELS[selectedOrder.payment_status] || selectedOrder.payment_status}</strong></div><div className="d-flex justify-content-between border-bottom py-2"><span>Voucher</span><strong>{voucher ? `${voucher.code} · ${voucher.title}` : 'Không áp dụng'}</strong></div><div className="small mt-2">Ghi chú: {selectedOrder.note || '—'}</div></div><div className="col-md-6"><h6 className="fw-bold">Tổng kết đơn hàng</h6><div className="d-flex justify-content-between py-1"><span>Tổng tiền hàng</span><span>{selectedOrder.total_amount.toLocaleString('vi-VN')}₫</span></div><div className="d-flex justify-content-between py-1 text-success"><span>Giảm giá</span><span>− {selectedOrder.discount_amount.toLocaleString('vi-VN')}₫</span></div><div className="d-flex justify-content-between border-top mt-2 pt-2 fw-bold"><span>Thành tiền</span><span className="text-danger">{selectedOrder.final_amount.toLocaleString('vi-VN')}₫</span></div></div></div>
                  <h6 className="fw-bold mt-4">Lịch sử trạng thái</h6>{events.map((event) => <div className="border-start border-3 ps-3 py-1 mb-2" key={event.id}><strong>{ORDER_STATUS_LABELS[event.current_status] || event.current_status}</strong><small className="text-muted ms-2">{formatOrderDate(event.created_at)} · {event.changed_by}</small><div className="small text-secondary">{event.action_event}{event.reason ? ` — ${event.reason}` : ''}</div></div>)}
                </div><div className="modal-footer"><button type="button" className="btn btn-secondary rounded-pill" onClick={() => setSelectedOrder(null)}>Đóng</button></div>
              </div>
            </div>
          </div>
        );
      })()}
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
                      <label className="form-label fw-semibold small">Mã SKU <span className="text-danger">*</span></label>
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
                      <label className="form-label fw-semibold small">Tên sản phẩm <span className="text-danger">*</span></label>
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
                      <label className="form-label fw-semibold small">Danh mục <span className="text-danger">*</span></label>
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
                      <label className="form-label fw-semibold small">Thương hiệu <span className="text-danger">*</span></label>
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
                      <label className="form-label fw-semibold small">Đơn giá <span className="text-danger">*</span></label>
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
                      <label className="form-label fw-semibold small">Trạng thái <span className="text-danger">*</span></label>
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
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 fw-bold shadow-sm"
                    disabled={isSubmittingProduct}
                  >
                    <i className={`bi ${isSubmittingProduct ? 'bi-hourglass-split' : 'bi-check-lg'} me-1`}></i>
                    {isSubmittingProduct
                      ? 'Đang lưu...'
                      : isEditingProduct
                        ? 'Cập Nhật Bản Ghi'
                        : 'Lưu sản phẩm'}
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
                    <label className="form-label fw-semibold small">Tên danh mục <span className="text-danger">*</span></label>
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
                    <label className="form-label fw-semibold small">Đường dẫn Slug <span className="text-danger">*</span></label>
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
                    <label className="form-label fw-semibold small">Trạng thái <span className="text-danger">*</span></label>
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
                  <button
                    type="submit"
                    className="btn btn-success btn-sm px-4 fw-bold shadow-sm"
                    disabled={isSubmittingCategory}
                  >
                    <i className={`bi ${isSubmittingCategory ? 'bi-hourglass-split' : 'bi-check-lg'} me-1`}></i>
                    {isSubmittingCategory
                      ? 'Đang lưu...'
                      : isEditingCategory
                        ? 'Cập Nhật Danh Mục'
                        : 'Lưu Danh Mục'}
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
                    <label className="form-label fw-semibold small">Tên thương hiệu <span className="text-danger">*</span></label>
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
                    <label className="form-label fw-semibold small">Đường dẫn Slug <span className="text-danger">*</span></label>
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
                    <label className="form-label fw-semibold small">Trạng thái <span className="text-danger">*</span></label>
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
                  <button
                    type="submit"
                    className="btn btn-info text-white btn-sm px-4 fw-bold shadow-sm"
                    disabled={isSubmittingBrand}
                  >
                    <i className={`bi ${isSubmittingBrand ? 'bi-hourglass-split' : 'bi-check-lg'} me-1`}></i>
                    {isSubmittingBrand
                      ? 'Đang lưu...'
                      : isEditingBrand
                        ? 'Cập Nhật Thương Hiệu'
                        : 'Lưu Thương Hiệu'}
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
                      disabled={isEditingUser}
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    />
                    <div className="invalid-feedback">Vui lòng nhập email hợp lệ.</div>
                  </div>

                  {/* Mật khẩu chỉ dùng khi tạo tài khoản. */}
                  {!isEditingUser && <div className="mb-3">
                    <label className="form-label fw-semibold small">Mật khẩu <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      minLength={8}
                      maxLength={72}
                      required
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    />
                    <div className="invalid-feedback">Mật khẩu cần ít nhất 8 ký tự.</div>
                  </div>}

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
                        {roles.map((role) => (
                          <option key={role.id} value={role.code}>{role.name} ({role.code})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold small">Trạng Thái <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={userFormData.status}
                        onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                      >
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Đã khóa</option>
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
                  <button type="submit" disabled={isSubmittingUser || roles.length === 0} className="btn btn-warning text-dark btn-sm px-4 fw-bold shadow-sm">
                    <i className="bi bi-check-lg me-1"></i>
                    {isSubmittingUser ? 'Đang lưu...' : isEditingUser ? 'Cập Nhật Tài Khoản' : 'Lưu Tài Khoản'}
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


















