import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`bg-white shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 sm:flex sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions && (
          <div className="mt-4 flex sm:mt-0 sm:ml-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
