'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  ChevronRight,
  Send,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export function ContactContent() {
  const { data: publicSettings } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: async () => apiClient('/settings/public'),
    staleTime: 5 * 60 * 1000,
  });
  const whatsappNumber =
    publicSettings?.whatsappNumber || process.env.NEXT_PUBLIC_STORE_WHATSAPP || '';
  const whatsappDigits = String(whatsappNumber).replace(/\D/g, '');
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        'Assalam o Alaikum, I have an inquiry regarding Nakaam'
      )}`
    : null;
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'order_status',
    message: '',
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error('Please fill in your name, contact phone, and message.');
      return;
    }

    const subject = `Nakaam support inquiry: ${formData.topic}`;
    const body = [
      `Name: ${formData.name.trim()}`,
      `Phone: ${formData.phone.trim()}`,
      `Email: ${formData.email.trim() || 'Not provided'}`,
      `Topic: ${formData.topic}`,
      '',
      formData.message.trim(),
    ].join('\n');

    window.location.href =
      `mailto:support@nakaam.pk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.info('Your email app will open with a draft. Send it there to submit your inquiry.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* Breadcrumb Path */}
        <nav className="text-xs text-[#6B6B6B] flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#151515]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="text-[#151515] font-semibold">Contact & Support</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6E1DA] text-[#151515] inline-flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#D12C2F]" />
            Customer Care & Support
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#151515]">
            Contact & Customer Support
          </h1>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Whether you require sizing guidance, have questions about an order in transit, or wish to visit our Lahore studio, we are here to assist.
          </p>
        </div>

        {/* Main Grid: Info Cards + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contacts & Hours (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Atelier Studio Card */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F6F2EC] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#D12C2F]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">Flagship Studio</span>
                  <h3 className="font-serif text-lg font-bold text-[#151515]">Lahore Flagship Studio</h3>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">
                    12-C / 1, Off MM Alam Road, Gulberg III,<br />
                    Lahore 54660, Punjab, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-3 border-t border-[#E6E1DA]">
                <div className="w-10 h-10 rounded-xl bg-[#F6F2EC] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#D12C2F]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">Visiting & Order Hours</span>
                  <h4 className="font-semibold text-xs text-[#151515]">Monday – Saturday</h4>
                  <p className="text-xs text-[#6B6B6B]">10:00 AM – 8:00 PM PKT</p>
                  <h4 className="font-semibold text-xs text-[#151515] pt-1">Sunday</h4>
                  <p className="text-xs text-[#6B6B6B]">1:00 PM – 7:00 PM PKT</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-3 border-t border-[#E6E1DA]">
                <div className="w-10 h-10 rounded-xl bg-[#F6F2EC] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#D12C2F]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">Direct Phone & WhatsApp</span>
                  <p className="text-xs text-[#151515] font-semibold">+92 42 3578 9400 (Landline)</p>
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-[#151515] font-semibold hover:text-[#D12C2F]"
                    >
                      {whatsappNumber} (WhatsApp)
                    </a>
                  ) : (
                    <p className="text-xs text-[#6B6B6B]">WhatsApp contact is temporarily unavailable.</p>
                  )}
                  <p className="text-xs text-[#6B6B6B]">support@nakaam.pk</p>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Concierge Button */}
            <div className="bg-[#151515] text-white rounded-2xl p-6 space-y-3">
              <span className="text-[11px] font-bold text-[#D12C2F] uppercase tracking-wider block">
                Instant Response
              </span>
              <h3 className="font-serif text-lg font-bold">Prefer WhatsApp?</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Send photos of your measurements or ask our dispatch team directly for immediate status updates.
              </p>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full pt-1"
                >
                  <Button className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs py-2.5">
                    Chat on WhatsApp
                  </Button>
                </a>
              ) : (
                <p className="pt-1 text-xs text-white/70">
                  WhatsApp contact is temporarily unavailable. Please call our studio.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Contact Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="space-y-1">
                <h2 className="font-serif text-2xl font-bold text-[#151515]">Send a Message</h2>
                <p className="text-xs text-[#6B6B6B]">
                  This opens a prefilled email draft. Send it from your email app to submit your inquiry.
                </p>
              </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="contact-name" className="text-xs font-semibold text-[#151515]">
                        Your Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ayesha Khan"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-[#151515] focus:outline-none focus:border-[#151515]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-phone" className="text-xs font-semibold text-[#151515]">
                        WhatsApp / Mobile Number *
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0300 1234567"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-[#151515] focus:outline-none focus:border-[#151515]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="contact-email" className="text-xs font-semibold text-[#151515]">
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ayesha@example.com"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-[#151515] focus:outline-none focus:border-[#151515]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-topic" className="text-xs font-semibold text-[#151515]">
                        Inquiry Topic *
                      </label>
                      <select
                        id="contact-topic"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-[#151515] focus:outline-none focus:border-[#151515]"
                      >
                        <option value="order_status">Order Status & Delivery Inquiry</option>
                        <option value="size_advice">Sizing & Darzi Measurement Help</option>
                        <option value="exchange_return">Doorstep Size Exchange Request</option>
                        <option value="studio_fitting">Studio Fitting Appointment (Lahore)</option>
                        <option value="custom_darzi">Bespoke Bridal / Custom Inquiry</option>
                        <option value="wholesale">Corporate & Bulk Inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="contact-message" className="text-xs font-semibold text-[#151515]">
                      Your Message or Order Number *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Include your order number if your message is about an existing shipment..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-[#151515] focus:outline-none focus:border-[#151515]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#151515] hover:bg-black text-white text-xs font-bold py-3 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Open Email Draft
                  </Button>
                </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
