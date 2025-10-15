import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  RefreshCcw, 
  Car, 
  Users, 
  Map, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: '儀表板' },
    { path: '/refunds', icon: RefreshCcw, label: '退款管理' },
    { path: '/vehicles', icon: Car, label: '車輛管理' },
    { path: '/users', icon: Users, label: '使用者管理' },
    { path: '/trips', icon: Map, label: '行程管理' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/login');
  };

  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const isDesktop = windowWidth >= 1024;

  return (
    <header style={{
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1800px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '75px',
        gap: '2rem'
      }}>
        {/* Logo */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          flexShrink: 0
        }}>
          <div style={{
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '14px',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Shield size={30} color="white" />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '900',
              color: 'white',
              lineHeight: '1.2',
              marginBottom: '2px'
            }}>
              自駕計程車
            </h1>
            <p style={{ 
              fontSize: '0.75rem', 
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: '600'
            }}>
              管理系統
            </p>
          </div>
        </div>

        {/* Desktop Navigation - 只在桌面顯示 */}
        {isDesktop && (
          <nav style={{
            display: 'flex',
            flex: 1,
            justifyContent: 'center'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.875rem 1.5rem',
                      borderRadius: '14px',
                      transition: 'all 0.2s ease',
                      background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                      backdropFilter: isActive ? 'blur(10px)' : 'none',
                      fontWeight: isActive ? '800' : '600',
                      fontSize: '1rem',
                      textDecoration: 'none',
                      color: 'white',
                      border: isActive ? '2px solid rgba(255, 255, 255, 0.4)' : '2px solid transparent',
                      boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <Icon size={22} strokeWidth={2.5} />
                    <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* Desktop User Info & Logout - 只在桌面顯示 */}
        {isDesktop && (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.125rem',
                fontWeight: '900',
                color: '#1e40af',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}>
                {adminData.name?.charAt(0) || 'A'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ 
                  fontWeight: '800',
                  fontSize: '0.9375rem',
                  lineHeight: '1.2',
                  color: 'white'
                }}>
                  {adminData.name || '管理員'}
                </p>
                <p style={{ 
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginTop: '2px'
                }}>
                  {adminData.email || ''}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span>登出系統</span>
            </button>
          </div>
        )}

        {/* Mobile Menu Button - 只在移動設備顯示 */}
        {!isDesktop && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            {mobileMenuOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
          </button>
        )}
      </div>

      {/* Mobile Menu - 只在移動設備顯示 */}
      {!isDesktop && mobileMenuOpen && (
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          borderTop: '2px solid rgba(255, 255, 255, 0.15)',
          padding: '1.5rem',
          animation: 'slideInDown 0.3s ease'
        }}>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.125rem 1.25rem',
                    borderRadius: '14px',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    fontWeight: isActive ? '800' : '600',
                    fontSize: '1.0625rem',
                    textDecoration: 'none',
                    color: 'white',
                    border: isActive ? '2px solid rgba(255, 255, 255, 0.4)' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={24} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.375rem',
                fontWeight: '900',
                color: '#1e40af',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}>
                {adminData.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p style={{ 
                  fontWeight: '800',
                  fontSize: '1.0625rem',
                  color: 'white',
                  marginBottom: '4px'
                }}>
                  {adminData.name || '管理員'}
                </p>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.85)'
                }}>
                  {adminData.email || ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '1.0625rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              }}
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span>登出系統</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;