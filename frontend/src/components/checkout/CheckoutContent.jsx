'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { useSession } from '@/lib/authClient';
import { formatPKR } from '@/lib/format';
import { apiClient } from '@/lib/apiClient';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  Banknote,
  Copy,
  Check,
  Tag,
  ArrowRight,
  Lock,
  ChevronRight,
  Info,
  Phone,
  MapPin,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

const MAJOR_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Sialkot',
  'Gujranwala',
  'Peshawar',
  'Quetta',
];

const BANK_DETAILS = {
  bankName: 'Meezan Bank Limited',
  accountTitle: 'Nakaam Store',
  accountNumber: '02010108923412',
  iban: 'PK45MEZN0002010108923412',
  raastId: '03001234567',
};

const PHONE_COUNTRIES = [
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', callingCode: '92', nationalLength: 10, prefix: /^3/ },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', callingCode: '971', nationalLength: 9, prefix: /^5/ },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', callingCode: '966', nationalLength: 9, prefix: /^5/ },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', callingCode: '44', nationalLength: 10, prefix: /^7/ },
  { code: 'US', name: 'United States', flag: '🇺🇸', callingCode: '1', nationalLength: 10, prefix: /^[2-9]/ },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', callingCode: '1', nationalLength: 10, prefix: /^[2-9]/ },
  { code: 'IN', name: 'India', flag: '🇮🇳', callingCode: '91', nationalLength: 10, prefix: /^[6-9]/ },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', callingCode: '61', nationalLength: 9, prefix: /^4/ },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', callingCode: '974', nationalLength: 8, prefix: /^[3567]/ },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', callingCode: '965', nationalLength: 8, prefix: /^[4569]/ },
];

export function CheckoutContent() {
  const router = useRouter();
  const { items, subtotal, resetCart, cartStatus } = useCart();
  const { data: session, isPending } = useSession();

  // Form State
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState(null);
  const [phoneCountryOverride, setPhoneCountryOverride] = useState(null);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [storeWhatsappNumber, setStoreWhatsappNumber] = useState(
    process.env.NEXT_PUBLIC_STORE_WHATSAPP || ''
  );
  const storeWhatsappDigits = String(storeWhatsappNumber || '').replace(/\D/g, '');

  const fullName = nameInput || session?.user?.name || '';
  const email = emailInput || session?.user?.email || '';
  const phone = phoneInput ?? session?.user?.phone ?? '';
  const savedPhoneDigits = session?.user?.phone?.replace(/\D/g, '') || '';
  const savedPhoneCountry = PHONE_COUNTRIES.find((country) =>
    savedPhoneDigits.startsWith(country.callingCode) &&
    savedPhoneDigits.length === country.callingCode.length + country.nationalLength
  );
  const phoneCountryCode = phoneCountryOverride || savedPhoneCountry?.code || 'PK';

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login?next=/checkout');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([apiClient('/payments/accounts'), apiClient('/settings/public')])
      .then(([accountsResult, settingsResult]) => {
        if (!isMounted) return;
        if (accountsResult.status === 'fulfilled') {
          if (Array.isArray(accountsResult.value) && accountsResult.value.length > 0) {
            setPaymentAccounts(accountsResult.value);
          }
        } else {
          console.error('Unable to load checkout payment accounts', accountsResult.reason);
        }
        if (settingsResult.status === 'fulfilled') {
          if (settingsResult.value?.whatsappNumber) {
            setStoreWhatsappNumber(settingsResult.value.whatsappNumber);
          }
        } else {
          console.error('Unable to load public store settings', settingsResult.reason);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Delivery & Payment
  const [deliverySpeed, setDeliverySpeed] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [inspectionAcknowledged, setInspectionAcknowledged] = useState(true);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const idempotencyKeyRef = useRef(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isPending && session && cartStatus === 'ready' && items.length === 0) {
      router.replace('/cart');
    }
  }, [items.length, cartStatus, isPending, session, router]);

  // Calculations
  const shippingFee = deliverySpeed === 'express' ? 500 : subtotal >= 5000 ? 0 : 250;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const prepaidDiscount = paymentMethod === 'MANUAL' ? Math.round(subtotal * 0.05) : 0;
  const grandTotal = Math.max(1, subtotal + shippingFee - couponDiscount - prepaidDiscount);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const result = await apiClient('/coupons/validate', {
        method: 'POST',
        body: {
          code: couponCode.trim().toUpperCase(),
          subtotal,
        },
      });

      if (!result?.valid || !Number.isFinite(result.discount)) {
        throw new Error('The server returned an invalid coupon response.');
      }

      setAppliedCoupon({
        code: result.code,
        discount: result.discount,
        label: 'Coupon savings',
      });
      toast.success(`Coupon applied! Saved ${formatPKR(result.discount)}`);
    } catch (error) {
      setAppliedCoupon(null);
      toast.error(error?.message || 'Unable to validate this coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim()) {
      toast.error('Please fill in your name, phone number, and street address');
      return;
    }

    const selectedCountry = PHONE_COUNTRIES.find((country) => country.code === phoneCountryCode);
    let nationalNumber = phone.replace(/\D/g, '');
    if (nationalNumber.startsWith(selectedCountry.callingCode) &&
      nationalNumber.length === selectedCountry.callingCode.length + selectedCountry.nationalLength) {
      nationalNumber = nationalNumber.slice(selectedCountry.callingCode.length);
    }
    if (nationalNumber.startsWith('0') && nationalNumber.length === selectedCountry.nationalLength + 1) {
      nationalNumber = nationalNumber.slice(1);
    }
    if (nationalNumber.length !== selectedCountry.nationalLength || !selectedCountry.prefix.test(nationalNumber)) {
      toast.error(`Enter a valid ${selectedCountry.name} mobile number.`);
      return;
    }

    const normalizedPhone = `+${selectedCountry.callingCode}${nationalNumber}`;

    if (!inspectionAcknowledged) {
      toast.error('Please confirm the Doorstep Inspection acknowledgment');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
      const idempotencyKey = idempotencyKeyRef.current;

      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku,
          name: i.name,
          image: i.image,
          size: i.size,
          color: i.color,
          unitPrice: i.unitPrice,
          originalPrice: i.originalPrice,
          quantity: i.quantity,
          lineTotal: i.lineTotal,
        })),
        shippingAddress: {
          fullName,
          email,
          phone: normalizedPhone,
          city,
          area: area || city,
          street: `${houseNo ? `House ${houseNo}, ` : ''}${street}`,
          houseNo,
          landmark,
        },
        deliveryOptionCode: deliverySpeed,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        customerNote,
        inspectionAcknowledged,
        idempotencyKey,
      };

      const res = await apiClient('/orders', {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderNumber = res?.orderNumber;
      if (!orderNumber) {
        throw new Error(
          'The server did not return an order number. Do not submit again; contact support to confirm your order.'
        );
      }

      resetCart();
      toast.success('Order placed successfully!');
      router.push(`/checkout/success/${orderNumber}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to place order. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending || !session || cartStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#141413] border-t-transparent animate-spin" />
        <p className="font-serif text-sm font-semibold text-[#141413]">Securing Checkout Session...</p>
      </div>
    );
  }

  if (cartStatus === 'error') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <p role="alert" className="font-serif text-lg font-semibold text-[#141413]">
          Your shopping bag is unavailable until the database reconnects.
        </p>
        <Link href="/cart" className="text-sm font-semibold text-[#B82A2E] underline">
          Return to shopping bag
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="min-h-screen bg-[#FAF8F5]" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Path */}
        <nav className="text-xs text-[#78736B] mb-6 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#141413]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A6A095]" />
          <Link href="/cart" className="hover:text-[#141413]">Shopping Bag</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A6A095]" />
          <span className="text-[#141413] font-semibold">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-semibold font-jakarta tracking-tight text-[#141413] mb-8 pb-4 border-b border-[#EAE5DD]">
          Checkout & Dispatch Order
        </h1>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Details & Steps (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Customer & Contact Information */}
              <div className="p-6 rounded-xl bg-white border border-[#EAE5DD] shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE5DD]">
                  <span className="w-5 h-5 rounded-full bg-[#141413] text-white text-[11px] font-semibold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-base font-semibold font-jakarta text-[#141413]">
                    Customer & Contact Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#151515] flex items-center gap-1">
                      Full Name <span className="text-[#D12C2F]">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Fatima Zahra"
                      value={fullName}
                      onChange={(e) => setNameInput(e.target.value)}
                      required
                      className="h-11 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#151515] flex items-center gap-1">
                      Email Address <span className="text-[#6B6B6B] text-[11px]">(For receipt & tracking)</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="fatima@example.com"
                      value={email}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="h-11 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#151515] flex items-center gap-1">
                    Mobile Phone <span className="text-[#D12C2F]">*</span>
                    <span className="text-[#6B6B6B] text-[11px] font-normal">(Used by rider for doorstep delivery)</span>
                  </label>
                  <div className="flex h-11 w-full overflow-hidden rounded-lg border border-[#EAE5DD] bg-white focus-within:border-[#141413]">
                    <select
                      aria-label="Phone country code"
                      value={phoneCountryCode}
                      onChange={(event) => setPhoneCountryOverride(event.target.value)}
                      className="max-w-[150px] shrink-0 border-r border-[#E6E1DA] bg-[#FAF8F5] px-2 text-xs font-semibold text-[#3A3A3A] focus:outline-none"
                    >
                      {PHONE_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name} +{country.callingCode}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder={phoneCountryCode === 'PK' ? '300 1234567' :
                        phoneCountryCode === 'AE' || phoneCountryCode === 'SA' ? '50 123 4567' :
                          phoneCountryCode === 'GB' ? '7400 123456' :
                            phoneCountryCode === 'US' || phoneCountryCode === 'CA' ? '555 123 4567' :
                              'Enter mobile number'}
                      value={phone}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      required
                      aria-label="Mobile phone number"
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[#151515] outline-none placeholder:text-[#9A9A9A]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Destination */}
              <div className="p-6 rounded-xl bg-white border border-[#EAE5DD] shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE5DD]">
                  <span className="w-5 h-5 rounded-full bg-[#141413] text-white text-[11px] font-semibold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-base font-semibold font-jakarta text-[#141413]">
                    Shipping Destination
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#141413]">City *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-lg border border-[#EAE5DD] bg-white text-[#141413] focus:outline-none focus:border-[#141413]"
                    >
                      {MAJOR_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c} {c === 'Lahore' ? '(Lahore Hub)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#141413]">Area / Colony / Sector</label>
                    <Input
                      type="text"
                      placeholder="e.g. DHA Phase 5 / Gulberg III"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="h-10 text-xs rounded-lg border-[#EAE5DD]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-medium text-[#141413]">House / Flat No.</label>
                    <Input
                      type="text"
                      placeholder="e.g. 42-A"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      className="h-10 text-xs rounded-lg border-[#EAE5DD]"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-[#141413]">Street Address *</label>
                    <Input
                      type="text"
                      placeholder="e.g. Street 14, Main Commercial Boulevard"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      className="h-10 text-xs rounded-lg border-[#EAE5DD]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#141413]">Nearby Landmark / Rider Instructions</label>
                  <Input
                    type="text"
                    placeholder="e.g. Near Jalal Sons / Call before arriving"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="h-10 text-xs rounded-lg border-[#EAE5DD]"
                  />
                </div>
              </div>

              {/* Step 3: Delivery Speed */}
              <div className="p-6 rounded-xl bg-white border border-[#EAE5DD] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE5DD]">
                  <span className="w-5 h-5 rounded-full bg-[#141413] text-white text-[11px] font-semibold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-base font-semibold font-jakarta text-[#141413]">
                    Delivery Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Standard Option */}
                  <label
                    className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      deliverySpeed === 'standard'
                        ? 'border-[#141413] bg-[#FAF8F5] ring-1 ring-[#141413]'
                        : 'border-[#EAE5DD] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="deliverySpeed"
                          checked={deliverySpeed === 'standard'}
                          onChange={() => setDeliverySpeed('standard')}
                          className="w-4 h-4 text-[#141413] focus:ring-[#141413]"
                        />
                        <span className="text-xs font-semibold text-[#141413]">Standard Courier</span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-[#141413]">
                        {subtotal >= 5000 ? 'FREE' : formatPKR(250)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78736B] mt-2 pl-6.5 leading-relaxed">
                      3–4 business days via TCS / Leopards. Doorstep inspection guaranteed.
                    </p>
                  </label>

                  {/* Express Option */}
                  <label
                    className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      deliverySpeed === 'express'
                        ? 'border-[#141413] bg-[#FAF8F5] ring-1 ring-[#141413]'
                        : 'border-[#EAE5DD] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="deliverySpeed"
                          checked={deliverySpeed === 'express'}
                          onChange={() => setDeliverySpeed('express')}
                          className="w-4 h-4 text-[#141413] focus:ring-[#141413]"
                        />
                        <span className="text-xs font-semibold text-[#141413]">Express Priority</span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-[#141413]">
                        {formatPKR(500)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78736B] mt-2 pl-6.5 leading-relaxed">
                      1–2 business days express store dispatch with real-time SMS alerts.
                    </p>
                  </label>
                </div>
              </div>

              {/* Step 4: Payment Method */}
              <div className="p-6 rounded-xl bg-white border border-[#EAE5DD] shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE5DD]">
                  <span className="w-5 h-5 rounded-full bg-[#141413] text-white text-[11px] font-semibold flex items-center justify-center">
                    4
                  </span>
                  <h2 className="text-base font-semibold font-jakarta text-[#141413]">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* COD Option */}
                  <label
                    className={`p-4 rounded-xl border block cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#151515] bg-[#F6F2EC] ring-1 ring-[#151515]'
                        : 'border-[#E6E1DA] bg-white hover:bg-[#F6F2EC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="w-4 h-4 text-[#151515] focus:ring-[#151515]"
                        />
                        <Banknote className="w-5 h-5 text-[#151515]" />
                        <span className="text-sm font-bold text-[#151515]">Cash on Delivery (COD)</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Doorstep Inspection
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-2 pl-7 leading-relaxed">
                      Pay cash directly to the courier rider after opening and checking your parcel. Doorstep inspection is 100% permitted before cash handover, with no extra courier inspection surcharge; the delivery fee shown in your order total is the only delivery charge.
                    </p>
                  </label>

                  {/* Manual Transfer Option */}
                  <label
                    className={`p-4 rounded-xl border block cursor-pointer transition-all ${
                      paymentMethod === 'MANUAL'
                        ? 'border-[#151515] bg-[#F6F2EC] ring-1 ring-[#151515]'
                        : 'border-[#E6E1DA] bg-white hover:bg-[#F6F2EC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'MANUAL'}
                          onChange={() => setPaymentMethod('MANUAL')}
                          className="w-4 h-4 text-[#151515] focus:ring-[#151515]"
                        />
                        <CreditCard className="w-5 h-5 text-[#151515]" />
                        <span className="text-sm font-bold text-[#151515]">
                          Direct Bank Transfer / Raast P2P
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FCEEEE] text-[#8F1A1E]">
                        5% Prepaid Discount
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-2 pl-7 leading-relaxed">
                      Transfer directly via Meezan Bank, HBL, or Raast instant ID. Upload your receipt or send it to our atelier on WhatsApp for immediate dispatch.
                    </p>
                  </label>
                </div>

                {/* Bank Details Display Card (When Manual is Selected) */}
                {paymentMethod === 'MANUAL' && (
                  <div className="p-5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] space-y-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#151515]">
                        Store Bank Account Details
                      </span>
                      <span className="text-[11px] text-[#8F1A1E] font-semibold">
                        Instant Raast & IBAN Enabled
                      </span>
                    </div>

                    <div className="space-y-3">
                      {storeWhatsappDigits && (
                        <a
                          href={`https://wa.me/${storeWhatsappDigits}?text=${encodeURIComponent('Assalam-o-Alaikum! I have sent payment for my Nakaam order and would like to share the transfer slip.')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#128C7E] px-3 py-2 text-xs font-bold text-white hover:bg-[#0f756a]"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Open WhatsApp to Send Slip · {storeWhatsappNumber}
                        </a>
                      )}
                      {(paymentAccounts.length > 0 ? paymentAccounts : [BANK_DETAILS]).map((acc, idx) => {
                        const bankName = acc.providerName || acc.bankName || 'Bank';
                        const title = acc.accountTitle || 'Nakaam Studio';
                        const num = acc.accountNumber || '';
                        const iban = acc.iban || '';
                        const raast = acc.raastId || acc.instructions || '';

                        return (
                          <div key={idx} className="p-3.5 bg-white rounded-xl border border-[#E6E1DA] space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
                              <span className="text-xs font-bold text-[#151515]">{bankName}</span>
                              <span className="text-[11px] font-semibold text-[#8F1A1E]">Prepaid Account</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                              <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#EAE5DD]">
                                <p className="text-[10px] text-[#78736B]">Account Title</p>
                                <p className="font-bold text-[#151515]">{title}</p>
                              </div>

                              <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#EAE5DD] flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] text-[#78736B]">Account Number</p>
                                  <p className="font-bold font-mono text-[#151515]">{num}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(num, `${bankName} Account`)}
                                  className="p-1 text-[#78736B] hover:text-[#151515] rounded"
                                >
                                  {copiedField === `${bankName} Account` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              {iban && (
                                <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#EAE5DD] flex items-center justify-between sm:col-span-2">
                                  <div>
                                    <p className="text-[10px] text-[#78736B]">IBAN</p>
                                    <p className="font-bold font-mono text-[#151515] text-[11px]">{iban}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(iban, 'IBAN')}
                                    className="p-1 text-[#78736B] hover:text-[#151515] rounded"
                                  >
                                    {copiedField === 'IBAN' ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              )}

                              {raast && (
                                <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#EAE5DD] flex items-center justify-between sm:col-span-2">
                                  <div>
                                    <p className="text-[10px] text-[#78736B]">Raast Instant ID / Details</p>
                                    <p className="font-bold font-mono text-[#151515]">{raast}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(raast, 'Raast ID')}
                                    className="p-1 text-[#78736B] hover:text-[#151515] rounded"
                                  >
                                    {copiedField === 'Raast ID' ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Doorstep Inspection Acknowledgment Checkbox */}
                <label className="p-4 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inspectionAcknowledged}
                    onChange={(e) => setInspectionAcknowledged(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#151515] focus:ring-[#151515]"
                  />
                  <div className="text-xs leading-relaxed text-[#3A3A3A]">
                    <strong className="text-[#151515] block font-bold mb-0.5">
                      Doorstep Inspection Acknowledgment
                    </strong>
                    I confirm that I may inspect my parcel at the doorstep before handing over cash, with no extra courier inspection surcharge. The delivery fee shown in my order total still applies. If dissatisfied, I may return it on the spot with the courier rider.
                  </div>
                </label>
              </div>
            </div>

            {/* Right Column: Sticky Order Review (5 cols) */}
            <div className="lg:col-span-5 sticky top-28 space-y-6">
              <div className="bg-white rounded-xl border border-[#EAE5DD] p-6 shadow-xs space-y-6">
                <h2 className="text-base font-semibold font-jakarta text-[#141413] pb-3 border-b border-[#EAE5DD]">
                  Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h2>

                {/* Items Mini List */}
                <div className="divide-y divide-[#EAE5DD] max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.variantSku} className="py-3 flex gap-3 items-center first:pt-0 last:pb-0">
                      <div className="relative w-12 h-16 rounded-lg bg-[#FAF8F5] border border-[#EAE5DD] overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs space-y-0.5">
                        <p className="font-medium text-[#141413] truncate">{item.name}</p>
                        <p className="text-[#78736B] text-[11px]">Size: {item.size} • Qty: {item.quantity}</p>
                        <p className="font-semibold text-[#141413] tabular-nums">
                          {formatPKR(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2 border-t border-[#EAE5DD]">
                  {appliedCoupon ? (
                    <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F5C2C4] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#8A1A1E]" />
                        <span className="font-semibold text-[#8A1A1E]">{appliedCoupon.code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="text-[#8A1A1E] hover:underline font-medium text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Voucher code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="text-xs uppercase h-10 border-[#EAE5DD]"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleApplyCoupon}
                        isLoading={isApplyingCoupon}
                        className="h-10 text-xs px-3.5 rounded-lg"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                {/* Totals Breakdown */}
                <div className="space-y-2.5 pt-3 border-t border-[#EAE5DD] text-xs">
                  <div className="flex justify-between text-[#4A4742]">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-[#141413] tabular-nums">{formatPKR(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[#4A4742]">
                    <span>Delivery Fee ({deliverySpeed})</span>
                    <span className="font-medium text-[#141413] tabular-nums">
                      {shippingFee === 0 ? 'FREE' : formatPKR(shippingFee)}
                    </span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#8A1A1E] font-medium">
                      <span>Voucher Discount</span>
                      <span className="tabular-nums">- {formatPKR(couponDiscount)}</span>
                    </div>
                  )}

                  {prepaidDiscount > 0 && (
                    <div className="flex justify-between text-[#15803D] font-medium">
                      <span>5% Direct Transfer Incentive</span>
                      <span className="tabular-nums">- {formatPKR(prepaidDiscount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#EAE5DD] flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-semibold font-jakarta text-[#141413]">Total Due</span>
                      <p className="text-[10px] text-[#78736B]">All taxes included</p>
                    </div>
                    <span className="text-xl sm:text-2xl font-semibold font-jakarta text-[#141413] tabular-nums">
                      {formatPKR(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-12 rounded-xl bg-[#141413] hover:bg-[#262624] text-white font-medium text-xs sm:text-sm tracking-wide shadow-sm"
                  isLoading={isSubmitting}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {paymentMethod === 'COD' ? 'Confirm Order with COD' : 'Confirm Order & Pay via Bank'}
                </Button>

                <p className="text-[11px] text-center text-[#78736B] flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
                  Protected by Nakaam Doorstep Open-Box Inspection Policy.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
