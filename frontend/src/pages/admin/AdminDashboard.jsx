import AdminLayout from '../../components/admin/AdminLayout';

export { default as Dashboard } from '../../components/admin/Dashboard';
export { default as ProductManager } from '../../components/admin/ProductManager';
export { default as CategoryManager } from '../../components/admin/CategoryManager';
export { default as OrderManager } from '../../components/admin/OrderManager';
export { default as CustomOrderManager } from '../../components/admin/CustomOrderManager';
export { default as CraftCatalogManager } from '../../components/admin/CraftCatalogManager';
export { default as AdminUserManager } from '../../components/admin/AdminUserManager';
export { default as SiteSettingsManager } from '../../components/admin/SiteSettingsManager';
export { default as PageContentManager } from '../../components/admin/PageContentManager';
export { default as TestimonialsManager } from '../../components/admin/TestimonialsManager';

export default function AdminDashboard() {
  return <AdminLayout />;
}
