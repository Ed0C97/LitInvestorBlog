// LitInvestorBlog-frontend/src/pages/ContactPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Send, User, Mail, FileText } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import RelatedArticles from '@/components/RelatedArticles.jsx';
import FadeInOnScroll from '../components/FadeInOnScroll';
import GlassCard from '../components/ui/GlassCard';

const ContactPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (user) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
      setFormData(prev => ({
        ...prev,
        name: fullName || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Error sending message.');
      }
    } catch {
      toast.error('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenitore principale che avvolge tutto
    <div>
      <SEO 
        title="Contact Us"
        description="Get in touch with Lit Investor. Have questions or proposals? Fill out our contact form and we'll get back to you."
        keywords={['contact', 'get in touch', 'support', 'questions']}
      />
      {/* --- SEZIONE SUPERIORE CON SFONDO SCURO --- */}
      <div className="relative bg-login-texture-dark_1 bg-cover bg-center bg-fixed px-[2rem] md:px-[1rem] pt-[3rem] pb-[32rem] smooth-padding">
        <div className="flex flex-col items-center">

          {/* --- Titolo "Contacts" --- */}
          <FadeInOnScroll className="w-full max-w-[1012px] mb-[10rem]">
            <div className="border-b border-input-gray my-[0.5rem]"></div>
            <h2 className="text-2xl font-regular text-white">Contacts</h2>
          </FadeInOnScroll>

          {/* --- Contenitore per la GlassCard --- */}
          <FadeInOnScroll className="w-full max-w-[700px]" delay={100}>
            <GlassCard
              as="form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-[2rem] w-full max-w-[700px] p-[2rem] md:p-[2.5rem] mb-[20rem]"
            >
            {/* --- Header del Form --- */}
            <div className="text-center mb-[2rem]">
              <h1 className="text-4xl font-bold mb-[0.5rem] text-white">Get in Touch <br/> <br/> </h1>
              <p className="text-white/80 text-base max-w-md mx-auto">
                Have a question or proposal? Fill out the form and we'll get back to you.
              </p>
            </div>

            {/* --- Campi Nome e Email --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
              <div className="flex flex-col gap-[0.5rem]">
                <Label htmlFor="name" className="text-white/80 font-medium">Name *</Label>
                <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                  <User size={20} className="text-white/50" />
                  <input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={!!user}
                    className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light disabled:opacity-75"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-[0.5rem]">
                <Label htmlFor="email" className="text-white/80 font-medium">Email *</Label>
                <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                  <Mail size={20} className="text-white/50" />
                  <input
                    id="email"
                    name="email"
                    placeholder="your.email@example.com"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={!!user}
                    className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light disabled:opacity-75"
                  />
                </div>
              </div>
            </div>

            {/* --- Campo Oggetto --- */}
            <div className="flex flex-col gap-[0.5rem]">
              <Label htmlFor="subject" className="text-white/80 font-medium">Subject *</Label>
              <div className="flex items-center border-b border-white/20 h-[3rem] px-[0.75rem] transition-colors focus-within:border-white">
                <FileText size={20} className="text-white/50" />
                <input
                  id="subject"
                  name="subject"
                  placeholder="Subject of your message"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="ml-[0.75rem] w-full bg-transparent border-0 outline-none text-white placeholder:text-white/50 font-light"
                />
              </div>
            </div>

            {/* --- Campo Messaggio --- */}
            <div className="flex flex-col gap-[0.5rem]">
              <Label htmlFor="message" className="text-white/80 font-medium">Message *</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                required
                className="bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-0 transition-colors"              />
            </div>

            {/* --- Pulsante di Invio --- */}
            <div className="flex justify-center pt-[1rem]">
              <Button
                type="submit"
                disabled={loading}
                variant="outline-white"
                size="lg"
                className="w-full md:w-auto"
              >
                <Send className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </GlassCard>
          </FadeInOnScroll>
        </div>
      </div>

      {/* --- SEZIONE INFERIORE CON SFONDO BIANCO E MARGINE NEGATIVO --- */}
      <div className="bg-white -mt-[24rem] relative z-10">
        <FadeInOnScroll>
          <div className="w-full max-w-[1012px] mx-auto px-[2rem] md:px-[1rem] pb-[6rem] smooth-padding">
            <RelatedArticles
              title="Most Popular"
              fetchUrl="/api/articles/?per_page=4"
              variant="compact"
            />
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  );
};

export default ContactPage;