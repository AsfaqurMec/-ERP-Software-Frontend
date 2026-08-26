'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSiteSettings } from '../hooks/use-site-settings';
import { useCurrentUser } from '../hooks/use-auth';
import { useTranslation } from '../provider';
import { LanguageSwitcher } from './language-switcher';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Calendar,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Coins,
  DollarSign,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackagePlus,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  ReceiptText,
  RotateCcw,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tags,
  TrendingUp,
  Undo2,
  Users,
  X,
} from 'lucide-react';
import { api } from '../lib/api';

interface SubNavItem {
  name: string;
  nameKey?: string;
  href: string;
  badge?: string;
}

interface AccordionNavGroup {
  id: string;
  label: string;
  labelKey?: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  defaultHref?: string;
  subItems?: SubNavItem[];
}

const DashboardShellContext = React.createContext<boolean>(false);

const navSections: AccordionNavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    labelKey: 'nav.overview',
    icon: LayoutDashboard,
    subItems: [
      { name: 'Executive Dashboard', nameKey: 'nav.executive_dashboard', href: '/dashboard' },
      { name: 'Live Alerts & Warnings', nameKey: 'nav.live_alerts', href: '/dashboard/notifications' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales & Orders',
    labelKey: 'nav.sales_orders',
    icon: ShoppingCart,
    subItems: [
      { name: 'Sales Invoices', nameKey: 'nav.sales_invoices', href: '/dashboard/sales' },
      { name: '+ Create New Sale', nameKey: 'nav.create_sale', href: '/dashboard/sales/create' },
      { name: 'Sales Returns', nameKey: 'nav.sales_returns', href: '/dashboard/sales/returns' },
      { name: '+ Record Sales Return', nameKey: 'nav.record_sales_return', href: '/dashboard/sales/returns/create' },
    ],
  },
  {
    id: 'purchases',
    label: 'Procurement',
    labelKey: 'nav.procurement',
    icon: PackagePlus,
    subItems: [
      { name: 'Purchase Orders', nameKey: 'nav.purchase_orders', href: '/dashboard/purchases' },
      { name: '+ Create Purchase', nameKey: 'nav.create_purchase', href: '/dashboard/purchases/create' },
      { name: 'Purchase Returns', nameKey: 'nav.purchase_returns', href: '/dashboard/purchases/returns' },
      { name: '+ Record Purchase Return', nameKey: 'nav.record_purchase_return', href: '/dashboard/purchases/returns/create' },
    ],
  },
  {
    id: 'inventory',
    label: 'Catalog & Stock',
    labelKey: 'nav.catalog_stock',
    icon: Boxes,
    subItems: [
      { name: 'Products Catalog', nameKey: 'nav.products_catalog', href: '/dashboard/products' },
      { name: '+ Add New Product', nameKey: 'nav.add_product', href: '/dashboard/products/create' },
      { name: 'Product Categories', nameKey: 'nav.categories', href: '/dashboard/categories' },
      { name: '+ Add Category', nameKey: 'nav.add_category', href: '/dashboard/categories/create' },
      { name: 'Stock Position', nameKey: 'nav.stock_position', href: '/dashboard/inventory' },
      { name: 'Stock Movement Ledger', nameKey: 'nav.stock_movements', href: '/dashboard/inventory/movements' },
      { name: 'Stock Adjustments', nameKey: 'nav.adjust_stock', href: '/dashboard/inventory/adjustments' },
    ],
  },
  {
    id: 'contacts',
    label: 'Customer & Supplier',
    labelKey: 'nav.finance_parties',
    icon: Users,
    subItems: [
      { name: 'Customers Directory', nameKey: 'nav.customers_directory', href: '/dashboard/customers' },
      { name: '+ Add Customer', nameKey: 'nav.add_customer', href: '/dashboard/customers/create' },
      { name: 'Suppliers Directory', nameKey: 'nav.suppliers_directory', href: '/dashboard/suppliers' },
      { name: '+ Add Supplier', nameKey: 'nav.add_supplier', href: '/dashboard/suppliers/create' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance & Accounts',
    labelKey: 'nav.finance_accounts',
    icon: Coins,
    subItems: [
      { name: 'Payments Ledger', nameKey: 'nav.payments_ledger', href: '/dashboard/payments' },
      { name: 'Customer Due', nameKey: 'nav.accounts_receivable', href: '/dashboard/payments/receivable' },
      { name: 'Purchase Due', nameKey: 'nav.accounts_payable', href: '/dashboard/payments/payable' },
      { name: 'Operating Expenses', nameKey: 'nav.expense_manager', href: '/dashboard/expenses' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    labelKey: 'nav.analytics_reports',
    icon: ChartNoAxesCombined,
    subItems: [
      { name: 'Profit & Loss (P&L)', nameKey: 'nav.profit_loss', href: '/dashboard/reports/profit' },
      { name: 'Sales Revenue Report', nameKey: 'nav.sales_analytics', href: '/dashboard/reports/sales' },
      { name: 'Procurement Report', nameKey: 'nav.purchase_analytics', href: '/dashboard/reports/purchases' },
      { name: 'Inventory Valuation Report', nameKey: 'nav.inventory_valuation', href: '/dashboard/reports/inventory' },
      { name: 'Daily Operational Report', nameKey: 'nav.daily_summary', href: '/dashboard/reports/daily' },
      { name: 'Monthly Financial Report', nameKey: 'nav.monthly_summary', href: '/dashboard/reports/monthly' },
      { name: 'Annual Fiscal Statement', nameKey: 'nav.yearly_summary', href: '/dashboard/reports/yearly' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    labelKey: 'nav.administration',
    icon: ShieldCheck,
    subItems: [
      { name: 'Users Directory', nameKey: 'nav.user_management', href: '/dashboard/users' },
      { name: '+ Add New User', nameKey: 'nav.add_user', href: '/dashboard/users/create' },
      { name: 'Roles & Permissions', nameKey: 'nav.roles_permissions', href: '/dashboard/roles' },
      { name: 'My Profile & Security', nameKey: 'nav.my_profile', href: '/dashboard/profile' },
      { name: 'Activity & Audit Trail', nameKey: 'nav.activity_logs', href: '/dashboard/activity-logs' },
      { name: 'System Settings', nameKey: 'nav.system_settings', href: '/dashboard/settings' },
    ],
  },
];

function ShellRoot({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<{ name: string; email: string; role: string; avatar?: string | null } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<{ id: string; top: number } | null>(null);
  const flyoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Determine initial open accordion states based on current route
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {
      overview: true,
      sales: false,
      purchases: false,
      inventory: false,
      contacts: false,
      finance: false,
      analytics: false,
      admin: false,
    };

    for (const section of navSections) {
      if (section.subItems?.some((sub) => sub.href === path || (sub.href !== '/dashboard' && path.startsWith(sub.href)))) {
        initialState[section.id] = true;
      }
    }
    return initialState;
  });

  const { data: alertsData } = useQuery({
    queryKey: ['notifications-badge'],
    queryFn: () => api<any>('/notifications'),
    refetchInterval: 60000,
  });

  const criticalAlertsCount = alertsData?.summary?.critical || 0;
  const totalAlertsCount = alertsData?.summary?.total || 0;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      const savedCollapse = localStorage.getItem('sidebar_collapsed');
      if (savedCollapse !== null) {
        setIsCollapsed(savedCollapse === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapse]);

  // Auto-expand accordion when route changes
  useEffect(() => {
    for (const section of navSections) {
      if (section.subItems?.some((sub) => sub.href === path || (sub.href !== '/dashboard' && path.startsWith(sub.href)))) {
        setOpenSections((prev) => ({ ...prev, [section.id]: true }));
      }
    }
    setMobileMenuOpen(false);
    setHoveredSection(null);
  }, [path]);

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  const handleSectionMouseEnter = (sectionId: string, e: React.MouseEvent<HTMLElement>) => {
    if (!isCollapsed) return;
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredSection({ id: sectionId, top: rect.top });
  };

  const handleSectionMouseLeave = () => {
    if (!isCollapsed) return;
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    flyoutTimerRef.current = setTimeout(() => {
      setHoveredSection(null);
    }, 120);
  };

  const handleFlyoutMouseEnter = () => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
  };

  const handleFlyoutMouseLeave = () => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    flyoutTimerRef.current = setTimeout(() => {
      setHoveredSection(null);
    }, 120);
  };

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  }

  const { data: settings } = useSiteSettings();
  const { data: currentUser } = useCurrentUser();

  const activeUser = currentUser || user;

  const currentDateStr = new Date().toLocaleDateString('en-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).toUpperCase();

  // Find active item title
  let activeTitle = t('common.dashboard');
  for (const section of navSections) {
    const found = section.subItems?.find((sub) =>
      sub.href === '/dashboard' ? path === '/dashboard' : path === sub.href || (sub.href !== '/dashboard/reports' && path.startsWith(sub.href))
    );
    if (found) {
      const rawTitle = found.nameKey ? t(found.nameKey) : found.name;
      activeTitle = rawTitle.replace(/^\+\s*/, '');
      break;
    }
  }

  return (
    <div className={`app ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 90,
          }}
        />
      )}

      {/* Modern Collapsible Accordion Sidebar */}
      <aside
        style={{
          width: isCollapsed ? 72 : 270,
          minWidth: isCollapsed ? 72 : 270,
          background: 'linear-gradient(180deg, #131728 0%, #181d33 100%)',
          color: '#b4bbd5',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transform: mobileMenuOpen ? 'translateX(0)' : undefined,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: isCollapsed ? '14px 10px 12px' : '18px 14px 15px',
            display: 'flex',
            flexDirection: isCollapsed ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: isCollapsed ? 10 : 8,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: isCollapsed ? 92 : 70,
            boxSizing: 'border-box',
          }}
        >
          <Link
            className="brand"
            href="/dashboard"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 0,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {settings?.business_logo ? (
              <img
                src={settings.business_logo}
                alt={settings?.business_name || 'Logo'}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  objectFit: 'cover',
                  padding: 0,
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              />
            ) : (
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 15,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                {settings?.business_name ? settings.business_name.substring(0, 2).toUpperCase() : 'SP'}
              </span>
            )}
            <div
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                maxWidth: isCollapsed ? 0 : 135,
                opacity: isCollapsed ? 0 : 1,
                transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
                transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, transform 0.2s ease',
                pointerEvents: isCollapsed ? 'none' : 'auto',
              }}
            >
              <div style={{ font: '800 16px Manrope, sans-serif', color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.15, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {settings?.business_name || 'StockPilot'}
              </div>
              <small style={{ font: '700 8.5px Manrope, sans-serif', letterSpacing: '1.2px', color: '#818cf8', display: 'block', marginTop: 2, whiteSpace: 'nowrap' }}>
                {t('nav.enterprise_erp')}
              </small>
            </div>
          </Link>

          {/* Sidebar-Only Collapse / Expand Toggle Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                cursor: 'pointer',
                width: isCollapsed ? 34 : 30,
                height: isCollapsed ? 34 : 30,
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.background = 'rgba(99,102,241,0.25)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#cbd5e1';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            {mobileMenuOpen && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 0, color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Workspace Selector */}
        <div
          style={{
            padding: isCollapsed ? '8px 10px 4px' : '12px 14px 8px',
            transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            title={`${t('nav.main_headquarters')} - ${t('status.active')}`}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: isCollapsed ? '7px 0' : '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'rgba(99,102,241,0.2)',
                  color: '#818cf8',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                NT
                {isCollapsed && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -1,
                      right: -1,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 6px #4ade80',
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  maxWidth: isCollapsed ? 0 : 130,
                  opacity: isCollapsed ? 0 : 1,
                  transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                  transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, transform 0.2s ease',
                  pointerEvents: isCollapsed ? 'none' : 'auto',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.1 }}>{t('nav.main_headquarters')}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{t('nav.all_branches')}</div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                background: 'rgba(34,197,94,0.15)',
                color: '#4ade80',
                padding: isCollapsed ? 0 : '2px 6px',
                borderRadius: 4,
                fontWeight: 700,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                maxWidth: isCollapsed ? 0 : 60,
                opacity: isCollapsed ? 0 : 1,
                transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, padding 0.3s ease',
              }}
            >
              {t('status.active')}
            </span>
          </div>
        </div>

        {/* Accordion Navigation Groups */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isCollapsed ? '8px 8px' : '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {navSections.map((section) => {
            const isOpen = Boolean(openSections[section.id]);
            const SectionIcon = section.icon;

            // Check if any sub-item is active
            const hasActiveChild = section.subItems?.some((sub) =>
              sub.href === '/dashboard' ? path === '/dashboard' : path === sub.href || (sub.href !== '/dashboard/reports' && path.startsWith(sub.href))
            );

            const sectionLabel = section.labelKey ? t(section.labelKey) : section.label;
            const isFlyoutOpen = hoveredSection?.id === section.id;

            return (
              <div
                key={section.id}
                onMouseEnter={(e) => handleSectionMouseEnter(section.id, e)}
                onMouseLeave={handleSectionMouseLeave}
                style={{ position: 'relative', marginBottom: 2 }}
              >
                {/* Accordion / Nav Header Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isCollapsed) {
                      const target = section.subItems?.[0]?.href || '/dashboard';
                      router.push(target);
                    } else {
                      toggleSection(section.id);
                    }
                  }}
                  title={isCollapsed ? sectionLabel : undefined}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    padding: isCollapsed ? '10px 0' : '8px 10px',
                    borderRadius: 8,
                    background: hasActiveChild
                      ? isCollapsed
                        ? 'rgba(99,102,241,0.22)'
                        : 'rgba(99,102,241,0.12)'
                      : isOpen && !isCollapsed
                      ? 'rgba(255,255,255,0.04)'
                      : isFlyoutOpen && isCollapsed
                      ? 'rgba(255,255,255,0.06)'
                      : 'transparent',
                    border: isCollapsed && hasActiveChild ? '1px solid rgba(129,140,248,0.35)' : '1px solid transparent',
                    color: hasActiveChild ? '#ffffff' : '#cbd5e1',
                    fontSize: '0.84rem',
                    fontWeight: hasActiveChild ? 700 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'left',
                    position: 'relative',
                    boxShadow: isCollapsed && hasActiveChild ? '0 0 12px rgba(99,102,241,0.25)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <SectionIcon size={18} color={hasActiveChild ? '#818cf8' : '#94a3b8'} />
                      {isCollapsed && section.id === 'overview' && totalAlertsCount > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: criticalAlertsCount > 0 ? '#ef4444' : '#f59e0b',
                            border: '1.5px solid #131728',
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        maxWidth: isCollapsed ? 0 : 160,
                        opacity: isCollapsed ? 0 : 1,
                        transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                        transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, transform 0.2s ease',
                      }}
                    >
                      {sectionLabel}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: isCollapsed ? 0 : 60,
                      opacity: isCollapsed ? 0 : 1,
                      transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
                    }}
                  >
                    {section.id === 'overview' && totalAlertsCount > 0 && (
                      <span
                        style={{
                          background: criticalAlertsCount > 0 ? '#ef4444' : '#f59e0b',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 8,
                        }}
                      >
                        {totalAlertsCount}
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      color="#64748b"
                      style={{
                        transform: isOpen && !isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                </button>

                {/* Accordion Sub-items (smooth max-height accordion) */}
                <div
                  style={{
                    maxHeight: !isCollapsed && isOpen ? 400 : 0,
                    opacity: !isCollapsed && isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
                    marginLeft: 14,
                    paddingLeft: 10,
                    borderLeft: !isCollapsed && isOpen ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    marginTop: !isCollapsed && isOpen ? 2 : 0,
                  }}
                >
                  {section.subItems?.map((sub) => {
                    const isSubActive =
                      sub.href === '/dashboard'
                        ? path === '/dashboard'
                        : path === sub.href || (sub.href !== '/dashboard/reports' && sub.href !== '/dashboard/sales' && sub.href !== '/dashboard/purchases' && sub.href !== '/dashboard/products' && path.startsWith(sub.href));

                    const subTitle = sub.nameKey ? t(sub.nameKey) : sub.name;
                    const isAction = sub.name.startsWith('+');

                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: 6,
                          textDecoration: 'none',
                          fontSize: '0.78rem',
                          fontWeight: isSubActive ? 700 : isAction ? 600 : 500,
                          color: isSubActive ? '#ffffff' : isAction ? '#818cf8' : '#94a3b8',
                          background: isSubActive ? 'linear-gradient(90deg, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.08) 100%)' : 'transparent',
                          transition: 'all 0.12s ease',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              background: isSubActive ? '#818cf8' : 'rgba(255,255,255,0.2)',
                              flexShrink: 0,
                            }}
                          />
                          <span>{subTitle}</span>
                        </div>
                        {sub.name.includes('Alerts') && totalAlertsCount > 0 && (
                          <span
                            style={{
                              background: criticalAlertsCount > 0 ? '#ef4444' : '#f59e0b',
                              color: '#fff',
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: 6,
                            }}
                          >
                            {totalAlertsCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Session Drawer */}
        <div
          style={{
            padding: isCollapsed ? '12px 8px' : '12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            background: 'rgba(0,0,0,0.15)',
            transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flexDirection: isCollapsed ? 'column' : 'row',
            gap: isCollapsed ? 8 : 10,
          }}
        >
          <Link
            href="/dashboard/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              minWidth: 0,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
            title={`${activeUser?.name || 'Administrator'} (${activeUser?.role || 'SUPER_ADMIN'})`}
          >
            {activeUser?.avatar ? (
              <img
                src={activeUser.avatar}
                alt={activeUser?.name || 'Avatar'}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #6366f1',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                  flexShrink: 0,
                }}
              >
                {activeUser?.name ? activeUser.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
            )}
            <div
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                maxWidth: isCollapsed ? 0 : 120,
                opacity: isCollapsed ? 0 : 1,
                transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, transform 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeUser?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeUser?.role || 'SUPER_ADMIN'}
              </div>
            </div>
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexDirection: isCollapsed ? 'column' : 'row',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <LanguageSwitcher variant="dark" showLabel={false} />
            <button
              type="button"
              onClick={handleLogout}
              title={t('nav.logout')}
              style={{
                background: 'transparent',
                border: 0,
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Interactive Flyout Popover for Collapsed Navigation */}
      {isCollapsed && hoveredSection && (() => {
        const section = navSections.find((s) => s.id === hoveredSection.id);
        if (!section) return null;
        const sectionLabel = section.labelKey ? t(section.labelKey) : section.label;
        const SectionIcon = section.icon;

        return (
          <div
            className="nav-flyout-menu"
            onMouseEnter={handleFlyoutMouseEnter}
            onMouseLeave={handleFlyoutMouseLeave}
            style={{
              position: 'fixed',
              left: 78,
              top: Math.max(12, Math.min(typeof window !== 'undefined' ? window.innerHeight - 380 : 500, hoveredSection.top - 6)),
              background: 'linear-gradient(160deg, #191f37 0%, #121627 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              boxShadow: '0 20px 45px -10px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)',
              padding: '10px 8px',
              minWidth: 220,
              maxWidth: 260,
              zIndex: 9999,
            }}
          >
            {/* Flyout Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                marginBottom: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SectionIcon size={16} color="#818cf8" />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
                  {sectionLabel}
                </span>
              </div>
              {section.id === 'overview' && totalAlertsCount > 0 && (
                <span
                  style={{
                    background: criticalAlertsCount > 0 ? '#ef4444' : '#f59e0b',
                    color: '#fff',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 6,
                  }}
                >
                  {totalAlertsCount}
                </span>
              )}
            </div>

            {/* Flyout Sub-links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.subItems?.map((sub) => {
                const isSubActive =
                  sub.href === '/dashboard'
                    ? path === '/dashboard'
                    : path === sub.href || (sub.href !== '/dashboard/reports' && sub.href !== '/dashboard/sales' && sub.href !== '/dashboard/purchases' && sub.href !== '/dashboard/products' && path.startsWith(sub.href));

                const subTitle = sub.nameKey ? t(sub.nameKey) : sub.name;
                const isAction = sub.name.startsWith('+');

                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setHoveredSection(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 7,
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: isSubActive ? 700 : isAction ? 600 : 500,
                      color: isSubActive ? '#ffffff' : isAction ? '#818cf8' : '#cbd5e1',
                      background: isSubActive
                        ? 'linear-gradient(90deg, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.1) 100%)'
                        : 'transparent',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: isSubActive ? '#818cf8' : 'rgba(255,255,255,0.25)',
                        }}
                      />
                      <span>{subTitle}</span>
                    </div>
                    {sub.name.includes('Alerts') && totalAlertsCount > 0 && (
                      <span
                        style={{
                          background: criticalAlertsCount > 0 ? '#ef4444' : '#f59e0b',
                          color: '#fff',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 6,
                        }}
                      >
                        {totalAlertsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Main Content Area */}
      <main
        style={{
          marginLeft: isCollapsed ? 72 : 270,
          width: isCollapsed ? 'calc(100% - 72px)' : 'calc(100% - 270px)',
          maxWidth: isCollapsed ? 'calc(100% - 72px)' : 'calc(100% - 270px)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 26,
            padding: '4px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile Drawer Button */}
            <button
              type="button"
              className="ghost mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'none',
                padding: '8px',
                borderRadius: 6,
              }}
            >
              <Menu size={18} />
            </button>

            <div>
              <p className="eyebrow" style={{ margin: '0 0 4px', fontSize: '0.68rem', letterSpacing: '0.1em' }}>
                {currentDateStr}
              </p>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.4px', color: '#0f172a' }}>
                {activeTitle}
              </h1>
            </div>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Language Switcher */}
            <LanguageSwitcher variant="light" showLabel={true} />

            {/* Quick Actions Shortcuts */}
            <Link
              href="/dashboard/sales/create"
              className="primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                textDecoration: 'none',
                fontSize: '0.8rem',
                padding: '7px 12px',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              <PlusCircle size={14} />
              <span>{t('nav.create_sale').replace('+', '').trim()}</span>
            </Link>

            {/* Notification Bell Badge */}
            <Link
              href="/dashboard/notifications"
              className="ghost"
              title="System Alerts & Warnings"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: 36,
                height: 36,
                padding: 0,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
              }}
            >
              <Bell size={17} color="#475569" />
              {totalAlertsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: criticalAlertsCount > 0 ? '#ef4444' : '#f59e0b',
                    border: '1.5px solid #ffffff',
                  }}
                />
              )}
            </Link>

            {/* Quick Financial Reports Link */}
            <Link
              href="/dashboard/reports"
              className="ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                fontSize: '0.82rem',
                padding: '7px 12px',
                borderRadius: 6,
                color: '#334155',
                fontWeight: 600,
                border: '1px solid #e2e8f0',
              }}
            >
              <BarChart3 size={15} color="#6366f1" />
              <span>{t('nav.analytics_reports')}</span>
            </Link>

            {/* User Profile Avatar */}
            <Link
              href="/dashboard/profile"
              style={{ textDecoration: 'none' }}
              title={`${activeUser?.name || 'Admin'} — My Profile & Security`}
            >
              {activeUser?.avatar ? (
                <img
                  src={activeUser.avatar}
                  alt={activeUser?.name || 'Avatar'}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid #6366f1',
                    boxShadow: '0 2px 6px rgba(99,102,241,0.25)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    boxShadow: '0 2px 6px rgba(99,102,241,0.25)',
                  }}
                >
                  {activeUser?.name ? activeUser.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const isInside = React.useContext(DashboardShellContext);
  if (isInside) {
    return <>{children}</>;
  }

  return (
    <DashboardShellContext.Provider value={true}>
      <ShellRoot>{children}</ShellRoot>
    </DashboardShellContext.Provider>
  );
}

export const AppShell = Shell;



