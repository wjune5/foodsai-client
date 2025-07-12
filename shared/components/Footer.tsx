import Link from 'next/link';

export default function Footer() {
  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Settings', href: '/cookie-settings' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  return (
    <footer className="glass border-t border-white/20 md:mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex justify-center space-x-6 mb-6">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-gray-300 hover:text-white text-sm transition-colors duration-200 hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Butlo AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
