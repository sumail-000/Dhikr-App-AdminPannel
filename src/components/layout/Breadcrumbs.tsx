import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
// import { cn } from '../../utils';

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

// Map of routes to breadcrumb names
const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/groups': 'Groups',
  '/groups/khitma': 'Khitma Groups',
  '/groups/dhikr': 'Dhikr Groups',
  '/verses': 'Motivational Verses',
  '/notifications': 'Notifications',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Generate breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      current: location.pathname === '/',
    },
  ];

  // Build breadcrumbs from path segments
  let currentPath = '';
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathnames.length - 1;
    
    breadcrumbs.push({
      name: routeNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : currentPath,
      current: isLast,
    });
  });

  // Don't show breadcrumbs on dashboard
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="flex py-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={item.name} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            )}
            
            {index === 0 ? (
              <Link
                to={item.href!}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <HomeIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ) : item.current ? (
              <span className="text-sm font-medium text-gray-900" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                to={item.href!}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Hook to update page title based on current route
export function usePageTitle() {
  const location = useLocation();
  
  useEffect(() => {
    const title = routeNames[location.pathname] || 'Admin Panel';
    document.title = `${title} - Wered Admin`;
  }, [location.pathname]);
}