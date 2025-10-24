// LitInvestorBlog-frontend/src/components/GlassCardForm.jsx
// ✅ ORIGINALE RIPRISTINATO

import React, { useRef, useEffect } from 'react';
import { Landmark } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import FadeInOnScroll from './FadeInOnScroll';

const DefaultCardLogo = () => <Landmark color="white" size={55} />;

const GlassCardForm = ({
  paymentButtons,
  donorInfo,
  onDonorInfoChange,
  customAmount,
  onCustomAmountChange,
}) => {
  const [currentMethodIndex, setCurrentMethodIndex] = React.useState(0);
  
  // Carousel automatico: cambia icona ogni 3 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMethodIndex((prevIndex) => 
        (prevIndex + 1) % paymentButtons.length
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, [paymentButtons.length]);
  
  const currentMethodDetails = paymentButtons[currentMethodIndex];
  const Icon = currentMethodDetails ? currentMethodDetails.icon : null;

  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.rows = 1;
      const computedStyle = window.getComputedStyle(textarea);
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);
      const lineHeight = parseFloat(computedStyle.lineHeight);

      // Mobile: 1 riga, Desktop: 2 righe
      const isMobile = window.innerWidth < 1024;
      const maxLines = isMobile ? 1 : 2;
      const maxHeight = (lineHeight * maxLines) + paddingTop + paddingBottom;
      textarea.style.maxHeight = `${maxHeight}px`;

      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;

      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [donorInfo.message]);

  const displayLogo = Icon ? (
    <Icon style={{ color: 'white', width: '55px', height: '55px' }} />
  ) : (
    <DefaultCardLogo />
  );

  return (
    <FadeInOnScroll delay={100}>
      <div className="payment-page-background">
        <div className="payment-form-wrapper">
          <div className="payment-module relative">
            <div className="circles">
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
            </div>

          <GlassCard
            className="flex flex-col justify-between p-[27.4px] pt-[114px] lg:p-[34.4px] lg:pt-[143px]"
          >
            <div className="logo" key={currentMethodIndex}>
              {displayLogo}
            </div>

            <div className="absolute top-[1.82rem] right-[1.82rem] lg:top-[2.29rem] lg:right-[2.29rem]">
              <div className="flex items-baseline justify-end">
                {customAmount.length < 7 ? (
                  <>
                    <span
                      className={`text-lg lg:text-2xl font-mono transition-colors duration-300 ${customAmount && parseFloat(customAmount) > 0 ? 'text-white' : 'text-white/50'}`}
                    >
                      €
                    </span>
                    <input
                      id="card-custom-amount"
                      type="text"
                      value={customAmount}
                      onChange={onCustomAmountChange}
                      placeholder="0"
                      className="bg-transparent border-none outline-none p-[0rem] text-right font-mono text-5xl lg:text-6xl font-bold text-white ml-[0.23rem] lg:ml-[0.29rem] w-auto focus:ring-0"
                      style={{
                        width: `${customAmount.length + 1}ch`,
                        minWidth: '2ch',
                      }}
                    />
                  </>
                ) : (
                  <div
                    key={customAmount}
                    className="font-mono text-3xl lg:text-4xl font-bold text-white ml-[0.46rem] lg:ml-[0.57rem] animate-pulse cursor-pointer"
                    onClick={() =>
                      onCustomAmountChange({ target: { value: '' } })
                    }
                  >
                    Se vabbè...
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="form-group card-number">
                <label>Messaggio (Opzionale)</label>
                <textarea
                ref={textareaRef}
                id="message"
                name="message"
                placeholder="Leave a supportive message..."
                value={donorInfo.message}
                onChange={onDonorInfoChange}
                rows="1"
                className="custom-scrollbar bg-transparent border-none outline-none focus:ring-0 p-0 text-white w-full font-mono text-sm sm:text-lg lg:text-2xl resize-none leading-snug"
                />
                <span className="underline"></span>
              </div>

              <div className="group mt-[1.2rem] sm:mt-[1.5rem] lg:mt-[2.29rem]">
                <div
                  className="form-group"
                  style={{ width: '40%', marginRight: '4%' }}
                >
                  <label>Nome</label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Your Username"
                    type="text"
                    required
                    value={donorInfo.anonymous ? 'Anonymous' : donorInfo.name}
                    onChange={onDonorInfoChange}
                    disabled={donorInfo.anonymous || !!donorInfo.name}
                    className="focus:ring-0"
                  />
                  <span className="underline"></span>
                </div>

                <div className="form-group" style={{ width: '56%' }}>
                  <label>Email</label>
                  <input
                    id="email"
                    name="email"
                    placeholder="your-email@example.com"
                    type="email"
                    required
                    value={donorInfo.email}
                    onChange={onDonorInfoChange}
                    disabled={!!donorInfo.email}
                    className="focus:ring-0"
                  />
                  <span className="underline"></span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
    </FadeInOnScroll>
  );
};

export default GlassCardForm;
