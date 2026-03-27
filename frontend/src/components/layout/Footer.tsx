import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Globe, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brutal-black text-white border-t-5 border-brutal-yellow">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 border-3 border-brutal-yellow bg-brutal-yellow shadow-brutal-sm">
                <BookOpen size={24} className="text-brutal-black" />
              </div>
              <span className="font-heading font-bold text-2xl uppercase text-brutal-yellow">
                LibraVault
              </span>
            </div>
            <p className="text-brutal-gray text-sm leading-relaxed mb-4">
              Your gateway to knowledge. A modern public library system serving the community
              with over 50,000 books, digital resources, and community programs.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer"
                className="p-2 border-2 border-brutal-yellow text-brutal-yellow hover:bg-brutal-yellow hover:text-brutal-black transition-colors"
                aria-label="GitHub">
                <Globe size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer"
                className="p-2 border-2 border-brutal-yellow text-brutal-yellow hover:bg-brutal-yellow hover:text-brutal-black transition-colors"
                aria-label="Twitter">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-lg uppercase text-brutal-yellow mb-4 border-b-3 border-brutal-yellow pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/books', label: 'Browse Catalog' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/login', label: 'Member Login' },
                { to: '/register', label: 'Join Library' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-brutal-gray hover:text-brutal-yellow transition-colors font-medium text-sm brutal-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Library Hours */}
          <div>
            <h3 className="font-heading font-bold text-lg uppercase text-brutal-yellow mb-4 border-b-3 border-brutal-yellow pb-2">
              Library Hours
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { day: 'Monday - Friday', hours: '8:00 AM - 9:00 PM' },
                { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
                { day: 'Sunday', hours: '10:00 AM - 4:00 PM' },
                { day: 'Holidays', hours: 'Closed' },
              ].map((schedule) => (
                <div key={schedule.day} className="flex justify-between border-b border-brutal-dark-gray pb-1">
                  <span className="text-brutal-gray">{schedule.day}</span>
                  <span className="font-bold text-brutal-yellow">{schedule.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-bold text-lg uppercase text-brutal-yellow mb-4 border-b-3 border-brutal-yellow pb-2">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm">
              <a href="mailto:info@libravault.org" className="flex items-center gap-2 text-brutal-gray hover:text-brutal-yellow transition-colors">
                <Mail size={16} className="text-brutal-yellow shrink-0" />
                libravault@gmail.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-2 text-brutal-gray hover:text-brutal-yellow transition-colors">
                <Phone size={16} className="text-brutal-yellow shrink-0" />
                (+91) 81221 23455
              </a>
              <p className="flex items-start gap-2 text-brutal-gray">
                <MapPin size={16} className="text-brutal-yellow shrink-0 mt-0.5" />
                Thillai Ganga Nagar, 35th Street, Nanganullur, Chennai - 88
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-3 border-brutal-yellow bg-brutal-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-brutal-black font-heading font-bold text-sm uppercase">
              © 2026 LibraVault Public Library. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link to="/about" className="text-brutal-black font-bold text-sm hover:underline">Privacy Policy</Link>
              <Link to="/about" className="text-brutal-black font-bold text-sm hover:underline">Terms of Use</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
