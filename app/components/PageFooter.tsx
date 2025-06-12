import Link from 'next/link';

export function PageFooter({ className = '' }: { className?: string }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-white border-t border-gray-200 py-4 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Luminaires Map. All rights reserved.
          </p>
          <div className="mt-2 md:mt-0 flex space-x-6">
            <Link 
              href="/privacy" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Terms
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PageFooter;
