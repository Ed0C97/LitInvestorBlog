// LitInvestorBlog-frontend/src/components/Footer.jsx
// 🍎 STILE APPLE NEWSROOM
// ✅ COLONNE DISTRIBUITE CORRETTAMENTE

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';

import LitInvestorLogo from '../assets/litinvestor_logo.ico';

const Footer = () => {
  const [email, setEmail] = React.useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Newsletter subscription successful!');
        setEmail('');
      } else {
        const data = await response.json();
        alert(data.error || 'Error during subscription');
      }
    } catch {
      alert('Connection error');
    }
  };

  return (
    <footer className="bg-light-gray">
      {/* Main Footer Content */}
      <div className="max-w-[1012px] mx-auto px-[1.5rem] md:px-[1rem] py-[3rem] md:py-[2.125rem] smooth-padding">

        <div className="flex flex-col md:flex-row md:justify-between gap-y-[2.5rem]">

          {/* Logo & Description (rimane invariato all'interno) */}
          <div>
            <div className="flex items-center gap-[0.5rem] mb-[0.75rem]">
              <Link to="/" className="inline-block">
                <img
                  src={LitInvestorLogo}
                  alt="Lit Investor Logo"
                  className="h-[1.5rem] w-auto opacity-90"
                />
              </Link>
              <span className="text-sm font-medium text-antracite">Lit Investor Blog</span>
            </div>
          </div>

          {/* Navigation (rimane invariato all'interno) */}
          <div>
            <h3 className="text-xs font-semibold text-antracite mb-[1rem]">
              Navigation
            </h3>
            <nav className="flex flex-col space-y-[0.5rem]">
              <Link to="/" className="text-xs text-gray hover:text-antracite transition-colors">Home</Link>
              <Link to="/about-us" className="text-xs text-gray hover:text-antracite transition-colors">About Us</Link>
              <Link to="/archive" className="text-xs text-gray hover:text-antracite transition-colors">Archive</Link>
              <Link to="/contact" className="text-xs text-gray hover:text-antracite transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Resources (rimane invariato all'interno) */}
          <div>
            <h3 className="text-xs font-semibold text-antracite mb-[1rem]">
              Resources
            </h3>
            <nav className="flex flex-col space-y-[0.5rem]">
              <Link to="/termini-e-condizioni" className="text-xs text-gray hover:text-antracite transition-colors">Terms & Conditions</Link>
              <Link to="/privacy-policy" className="text-xs text-gray hover:text-antracite transition-colors">Privacy Policy</Link>
            </nav>
          </div>

          {/* Newsletter (rimane invariato all'interno, manteniamo la larghezza massima) */}
          <div className="md:max-w-[200px]">
            <h3 className="text-xs font-semibold text-antracite mb-[1rem]">
              Newsletter
            </h3>
            <p className="text-xs text-gray mb-[0.875rem] leading-relaxed">
              Stay updated with our weekly analyses
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-[0.75rem]">
              <div className="flex items-center border-b border-input-gray pb-[0.5rem] transition-colors focus-within:border-antracite max-w-[200px]">
                <Mail className="text-gray w-[0.875rem] h-[0.875rem] flex-shrink-0" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ml-[0.5rem] w-full bg-transparent border-0 outline-none text-xs text-antracite placeholder:text-gray focus:ring-0"
                />
              </div>
              <button
                type="submit"
                className="group inline-flex items-center gap-1 text-xs text-blue hover:text-blue/80 font-medium transition-all"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-input-gray/50 mt-[2.5rem] pt-[1.25rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[0.75rem]">
          <p className="text-xs text-gray">
            © {new Date().getFullYear()} Lit Investor. All rights reserved.
          </p>
          <div className="flex gap-[1.5rem]">
            <Link to="/privacy-policy" className="text-xs text-gray hover:text-antracite transition-colors">
              Privacy
            </Link>
            <Link to="/termini-e-condizioni" className="text-xs text-gray hover:text-antracite transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;