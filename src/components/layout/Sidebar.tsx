// React import not needed with new JSX transform
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { config } from '../../utils/config';
import { cn } from '../../utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
    description: 'Overview and metrics',
  },
  {
    name: 'Users',
    href: '/users',
    icon: UsersIcon,
    description: 'Manage user accounts',
  },
  {
    name: 'Groups',
    href: '/groups',
    icon: UserGroupIcon,
    description: 'Khitma and Dhikr groups',
  },
  {
    name: 'Verses',
    href: '/verses',
    icon: BookOpenIcon,
    description: 'Motivational verses',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    description: 'Reports and insights',
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent onClose={onClose} isMobile />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:shadow-sm lg:border-r lg:border-gray-200">
        <SidebarContent />
      </div>
    </>
  );
}

interface SidebarContentProps {
  onClose?: () => void;
  isMobile?: boolean;
}

function SidebarContent({ onClose, isMobile = false }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand and close button */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 bg-primary-600/90 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-primary-500/30">
              <BookOpenIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-base font-semibold text-gray-900 leading-tight">
              Wered Admin
            </h1>
            <p className="text-[11px] text-gray-500 -mt-0.5">Control Panel</p>
          </div>
        </div>
        {isMobile && (
          <button
            type="button"
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 text-[11px] uppercase tracking-wider text-gray-400">Main</div>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              cn(
                'relative group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ring-1',
                isActive
                  ? 'bg-primary-50 text-primary-700 ring-primary-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 ring-transparent'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                <span
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-md',
                    isActive ? 'bg-primary-600' : 'bg-transparent group-hover:bg-gray-200'
                  )}
                  aria-hidden
                />
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {item.description}
                  </div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-200 p-4 bg-white/60">
        <div className="text-xs text-gray-500 text-center">
          <div className="font-medium">{config.appName}</div>
          <div className="text-[11px]">Version {config.appVersion}</div>
        </div>
      </div>
    </div>
  );
}