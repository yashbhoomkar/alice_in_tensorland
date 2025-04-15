import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  Shield,
  BarChart,
  Cpu,
  MessageSquare,
  Database,
  RefreshCw,
  AlertTriangle,
  Check,
  Star,
  BadgeCheck
} from 'lucide-react';

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHoveringCta, setIsHoveringCta] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const parallaxRef = useRef(null);

  // Features data with descriptions and icons
  const features = [
    {
      title: 'Bill Splitting via Gemini LLM',
      description:
        'Our AI-powered bill splitting uses Gemini LLM API to intelligently divide expenses among friends and family, understanding context and preferences.',
      icon: (
        <motion.div
          whileHover={{ rotate: 15 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <CreditCard size={32} className="text-teal-500" />
        </motion.div>
      ),
      bgColor: 'bg-gradient-to-br from-teal-500/10 to-teal-600/5',
      borderColor: 'border-teal-500/20',
      buttonColor: 'bg-teal-500'
    },
    {
      title: 'Payment Classification & Auto Budgeting',
      description:
        'Machine learning algorithms automatically categorize your transactions and suggest personalized budgets based on your spending patterns.',
      icon: (
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <BarChart size={32} className="text-indigo-500" />
        </motion.div>
      ),
      bgColor: 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/5',
      borderColor: 'border-indigo-500/20',
      buttonColor: 'bg-indigo-500'
    },
    {
      title: 'Fraud Detection & User Confirmation',
      description:
        'AI-powered systems detect suspicious activities and verify with you via email, SMS, WhatsApp or Telegram before processing transactions.',
      icon: (
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Shield size={32} className="text-rose-500" />
        </motion.div>
      ),
      bgColor: 'bg-gradient-to-br from-rose-500/10 to-rose-600/5',
      borderColor: 'border-rose-500/20',
      buttonColor: 'bg-rose-500'
    },
    {
      title: 'Kubernetes-based Express.js API',
      description:
        'Our scalable infrastructure handles millions of transactions with fault tolerance and load balancing for lightning-fast performance.',
      icon: (
        <motion.div
          animate={{
            rotate: [0, 0, 180, 180, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: 'easeInOut'
          }}
        >
          <Cpu size={32} className="text-blue-500" />
        </motion.div>
      ),
      bgColor: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/20',
      buttonColor: 'bg-blue-500'
    },
    {
      title: 'Webhook Listener & Bot Integration',
      description:
        'Stay updated with real-time notifications about your transactions and budget status through Telegram and WhatsApp bots.',
      icon: (
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <MessageSquare size={32} className="text-emerald-500" />
        </motion.div>
      ),
      bgColor: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5',
      borderColor: 'border-emerald-500/20',
      buttonColor: 'bg-emerald-500'
    },
    {
      title: 'Payment Gateway Management',
      description:
        'Secure integration with payment services and immutable audit logs ensure your financial data is always protected and traceable.',
      icon: (
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <RefreshCw size={32} className="text-amber-500" />
        </motion.div>
      ),
      bgColor: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5',
      borderColor: 'border-amber-500/20',
      buttonColor: 'bg-amber-500'
    },
    {
      title: 'Database & Logging Services',
      description:
        'Comprehensive logging tracks all activities while database replication ensures your data is always intact and secure.',
      icon: (
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Database size={32} className="text-violet-500" />
        </motion.div>
      ),
      bgColor: 'bg-gradient-to-br from-violet-500/10 to-violet-600/5',
      borderColor: 'border-violet-500/20',
      buttonColor: 'bg-violet-500'
    },
    {
      title: 'Monitoring & Alert System',
      description:
        'Real-time monitoring prevents system failures and immediately alerts about suspicious activities or errors.',
      icon: (
        <motion.div
          animate={{
            scale: [1, 1.2, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut'
          }}
        >
          <AlertTriangle size={32} className="text-fuchsia-500" />
        </motion.div>
      ),
      bgColor: 'bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-600/5',
      borderColor: 'border-fuchsia-500/20',
      buttonColor: 'bg-fuchsia-500'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  // For intersection observer animation control
  const useInView = (ref, threshold = 0.1) => {
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
        },
        { threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      };
    }, [ref, threshold]);

    return isInView;
  };

  // Animation refs
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const showcaseRef = useRef(null);
  const techRef = useRef(null);
  const integrationRef = useRef(null);
  const ctaRef = useRef(null);

  // Check if elements are in view
  const heroInView = useInView(heroRef);
  const featuresInView = useInView(featuresRef);
  const showcaseInView = useInView(showcaseRef);
  const techInView = useInView(techRef);
  const integrationInView = useInView(integrationRef);
  const ctaInView = useInView(ctaRef);

  // Animation controls
  const heroControls = useAnimation();
  const featuresControls = useAnimation();
  const showcaseControls = useAnimation();
  const techControls = useAnimation();
  const integrationControls = useAnimation();
  const ctaControls = useAnimation();

  // Start animations when elements come into view
  useEffect(() => {
    if (heroInView) heroControls.start('visible');
    if (featuresInView) featuresControls.start('visible');
    if (showcaseInView) showcaseControls.start('visible');
    if (techInView) techControls.start('visible');
    if (integrationInView) integrationControls.start('visible');
    if (ctaInView) ctaControls.start('visible');
  }, [
    heroInView,
    featuresInView,
    showcaseInView,
    techInView,
    integrationInView,
    ctaInView
  ]);

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Animated Navbar */}
      <motion.nav
        className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/50 bg-white/80 shadow-sm backdrop-blur-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <motion.div
                className="flex items-center text-xl font-bold text-blue-600"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white"
                  animate={{
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  F
                </motion.div>
                FinTech
              </motion.div>
            </div>

            <div className="hidden space-x-8 md:flex">
              {[
                'Features',
                'Technology',
                'Integrations',
                'Pricing',
                'About'
              ].map((item, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="relative font-medium text-slate-600 hover:text-blue-600"
                  whileHover={{ scale: 1.05 }}
                >
                  {item}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-blue-600"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white shadow-md transition-shadow hover:shadow-lg">
                Get Started
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Advanced Background Animation */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/10 to-teal-500/10"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight
                ],
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 20 + Math.random() * 30,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          ))}
        </div>

        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient
                id="gradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
              <pattern
                id="pattern1"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 20 L40 20 M20 0 L20 40"
                  stroke="rgba(59, 130, 246, 0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gradient1)" />
            <rect width="100%" height="100%" fill="url(#pattern1)" />
          </svg>
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-50/95 to-blue-50/90"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`
          }}
        ></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-6 lg:px-8">
          <motion.div
            ref={heroRef}
            initial="hidden"
            animate={heroControls}
            variants={staggerContainer}
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
          >
            <div>
              <motion.div
                variants={staggerItem}
                className="mb-6 inline-block rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-sm font-medium text-teal-700"
              >
                Next Generation Finance
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="mb-6 text-5xl font-bold leading-tight md:text-6xl"
              >
                <span className="text-blue-600">Smart</span> Financial
                Management{' '}
                <span className="relative">
                  <span className="relative z-10">Reimagined</span>
                  <motion.span
                    className="absolute bottom-1 left-0 right-0 -z-10 h-3 bg-blue-200/50"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 1 }}
                  ></motion.span>
                </span>
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="mb-10 text-xl text-slate-600"
              >
                Revolutionizing personal finance with AI-powered tools,
                real-time insights, and cutting-edge security.
              </motion.p>

              <motion.div
                variants={staggerItem}
                className="flex flex-wrap gap-4"
              >
                <motion.button
                  className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-3 font-medium text-white shadow-xl transition-all duration-300 hover:shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">Get Started</span>
                  <motion.span
                    className="absolute inset-0 z-0 bg-gradient-to-r from-teal-500 to-blue-600"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  <motion.span
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2"
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </motion.button>

                <motion.button
                  className="relative overflow-hidden rounded-lg border border-blue-600 bg-white px-8 py-3 font-medium text-blue-600 shadow-md transition-all duration-300 hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">Watch Demo</span>
                  <motion.span
                    className="absolute inset-0 z-0 bg-blue-50"
                    initial={{ y: '100%' }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.button>
              </motion.div>
            </div>

            <motion.div variants={fadeInLeft} className="relative">
              {/* 3D Platform Visualization */}
              <div className="relative h-96 md:h-full">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-br from-blue-600/20 to-teal-500/20 md:h-80 md:w-80"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 0, 360]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                <motion.div
                  className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-dashed border-blue-400/30 md:h-60 md:w-60"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                {/* Feature Icons Orbiting */}
                {features.slice(0, 6).map((feature, index) => {
                  const angle = index * (360 / 6) * (Math.PI / 180);
                  const radius = 130;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.div
                      key={index}
                      className="absolute left-1/2 top-1/2 flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-lg"
                      initial={{
                        x: x,
                        y: y,
                        rotate: 0
                      }}
                      animate={{
                        x: x,
                        y: y,
                        rotate: 360
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: -index * (20 / 6)
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                  );
                })}

                {/* Center Platform */}
                <motion.div
                  className="absolute left-1/2 top-1/2 z-10 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-2xl bg-white shadow-2xl"
                  animate={{
                    boxShadow: [
                      '0px 0px 20px rgba(0,0,0,0.1)',
                      '0px 0px 30px rgba(59,130,246,0.3)',
                      '0px 0px 20px rgba(0,0,0,0.1)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <motion.div
                    className="text-xl font-bold text-blue-600"
                    animate={{
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    FinTech
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-1/2 flex -translate-x-1/2 transform flex-col items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <span className="mb-2 text-slate-500">Discover Features</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <ChevronDown size={24} className="text-blue-500" />
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Feature Showcase with Glassmorphism */}
      <section className="relative bg-white px-4 py-24 sm:px-6 lg:px-8">
        {/* ... (feature showcase content remains the same until the Link component) */}
        <div className="absolute right-0 top-0 h-1/3 w-1/3 rounded-bl-full bg-gradient-to-br from-blue-100 to-teal-100 opacity-30"></div>
        <div className="absolute bottom-0 left-0 h-1/4 w-1/4 rounded-tr-full bg-gradient-to-tr from-indigo-100 to-purple-100 opacity-30"></div>
        <motion.div
          ref={featuresRef}
          initial="hidden"
          animate={featuresControls}
          variants={fadeInUp}
          className="mx-auto mb-16 max-w-7xl text-center"
        >
          <div className="mb-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
            Powerful Features
          </div>
          <h2 className="mb-6 text-4xl font-bold">
            Transform Your Financial Experience
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600">
            Our cutting-edge technology combines AI, machine learning, and
            secure infrastructure to revolutionize your finances.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-8">
          <a
            href="/features"
            className="inline-flex items-center font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            <span>See all features</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </motion.div>

        {/* Testimonials Section */}
        <div className="mt-32">
          {/* ... (testimonials content remains the same) */}
        </div>

        {/* Pricing Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative z-10 mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              custom={index}
              className={`rounded-2xl border bg-white p-8 shadow-sm ${
                plan.popular
                  ? 'border-blue-300 ring-2 ring-blue-200/50'
                  : 'border-slate-200'
              } transition-shadow hover:shadow-md`}
            >
              {/* ... (pricing card content remains the same) */}
              <motion.button
                className={`w-full rounded-lg px-6 py-3 font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : 'border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Get started
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <div className="mx-auto mt-24 max-w-4xl">
          {/* ... (FAQ content remains the same) */}
        </div>

        {/* Final CTA Section */}
        <section className="relative mt-32 overflow-hidden">
          {/* ... (CTA content remains the same) */}
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 py-16 text-slate-400">
          {/* ... (footer content remains the same) */}
        </footer>
      </section>
      {/* Testimonials Section */}
      <div className="mt-32">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-slate-900 md:text-4xl"
          >
            Trusted by teams worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-slate-600"
          >
            See what our customers have to say about how our expense management
            solution has transformed their financial workflows.
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              custom={index}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center space-x-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>

              <div className="mb-3 flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>

              <p className="italic text-slate-700">"{testimonial.quote}"</p>

              <div className="mt-4 flex items-center text-sm text-slate-500">
                <CheckBadgeIcon className="mr-1 h-4 w-4 text-green-500" />
                <span>Verified customer</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-lg bg-slate-900 px-8 py-3 font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Read all customer stories
          </motion.button>
        </div>
      </div>

      {/* Pricing Cards */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            custom={index}
            className={`rounded-2xl border bg-white p-8 shadow-sm ${
              plan.popular
                ? 'border-blue-300 ring-2 ring-blue-200/50'
                : 'border-slate-200'
            } transition-shadow hover:shadow-md`}
          >
            {plan.popular && (
              <div className="absolute right-6 top-0 -translate-y-1/2 transform rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-slate-600">{plan.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-end">
                <span className="text-4xl font-bold text-slate-900">
                  $
                  {billingCycle === 'yearly'
                    ? plan.price.yearly
                    : plan.price.monthly}
                </span>
                <span className="ml-1 text-slate-500">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="mt-1 text-sm text-slate-500">
                  Billed annually, $
                  {Math.round((plan.price.yearly / 12) * 100) / 100} per month
                </p>
              )}
            </div>

            <div className="mb-8 space-y-3">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start">
                  <CheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="ml-2 text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <motion.button
              className={`w-full rounded-lg px-6 py-3 font-medium transition-colors ${
                plan.popular
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Get started
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
      {/* FAQ Section */}
      <div className="mx-auto mt-24 max-w-4xl">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-slate-900 md:text-4xl"
          >
            Frequently asked questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-slate-600"
          >
            Everything you need to know about our product and billing.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="overflow-hidden rounded-xl border border-slate-200"
            >
              <button
                className={`flex w-full items-center justify-between p-6 text-left ${
                  activeFaq === index ? 'bg-slate-50' : 'hover:bg-slate-50'
                } transition-colors`}
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <span className="font-medium text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-500 transition-transform ${
                    activeFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-slate-600">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Final CTA Section */}
      <section className="relative mt-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 to-teal-500"></div>
        <div className="absolute inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.6))]"></div>

        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to transform your financial management?
            </h2>
            <p className="mx-auto max-w-2xl text-blue-100">
              Join thousands of businesses already using our platform to
              streamline their expenses.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <motion.button
              className="rounded-lg bg-white px-8 py-3 font-medium text-blue-600 shadow-lg transition-colors hover:bg-blue-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Get started for free
            </motion.button>
            <motion.button
              className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-medium text-white transition-colors hover:bg-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Talk to sales
            </motion.button>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-slate-900 py-16 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2">
              <div className="mb-6 flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                  F
                </div>
                <span className="text-xl font-bold text-white">FinTech</span>
              </div>
              <p className="mb-6 text-slate-400">
                The most advanced financial management platform for modern
                businesses.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'LinkedIn', 'GitHub', 'Facebook'].map(social => (
                  <a
                    key={social}
                    href="#"
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    <span className="sr-only">{social}</span>
                    <SocialIcon platform={social} className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {footerLinks.map((column, index) => (
              <div key={index}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-between border-t border-slate-800 pt-8 md:flex-row">
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} FinTech, Inc. All rights
              reserved.
            </p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <a href="#" className="text-sm text-slate-400 hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-slate-400 hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-slate-400 hover:text-white">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
// Mock data for testimonials
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CFO, TechStart Inc.',
    avatar: '/avatars/sarah.jpg',
    rating: 5,
    quote:
      'This platform has completely transformed how we manage expenses. The AI-powered categorization saves us dozens of hours each month.'
  },
  {
    name: 'Michael Chen',
    role: 'Finance Director, Global Corp',
    avatar: '/avatars/michael.jpg',
    rating: 5,
    quote:
      'The fraud detection system caught a suspicious transaction that our previous system missed. Worth every penny for the security alone.'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Founder, Startup Ventures',
    avatar: '/avatars/emma.jpg',
    rating: 4,
    quote:
      'Incredibly intuitive interface combined with powerful features. Our team adopted it with almost no training required.'
  }
];

// Mock data for pricing plans
const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small teams',
    price: {
      monthly: 29,
      yearly: 24
    },
    features: [
      'Basic expense tracking',
      'Up to 5 users',
      'Email support',
      'Standard reporting',
      '100 transactions/month'
    ],
    popular: false
  },
  {
    name: 'Professional',
    description: 'For growing businesses with more needs',
    price: {
      monthly: 79,
      yearly: 63
    },
    features: [
      'Advanced expense tracking',
      'Up to 20 users',
      'Priority support',
      'Advanced reporting',
      '1000 transactions/month',
      'AI categorization',
      'Basic fraud detection'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: {
      monthly: 199,
      yearly: 159
    },
    features: [
      'Unlimited users',
      '24/7 premium support',
      'Custom reporting',
      'Unlimited transactions',
      'Advanced AI features',
      'Enterprise-grade security',
      'Dedicated account manager',
      'API access'
    ],
    popular: false
  }
];

// Mock data for FAQs
const faqs = [
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes, we offer a 14-day free trial for all our plans. No credit card required to start.'
  },
  {
    question: 'How does the AI categorization work?',
    answer:
      'Our machine learning models analyze transaction patterns and merchant information to automatically categorize expenses with over 95% accuracy.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      "Absolutely. You can cancel your subscription at any time and you'll continue to have access until the end of your billing period."
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans.'
  },
  {
    question: 'How secure is my financial data?',
    answer:
      "We use bank-level 256-bit encryption, regular security audits, and never store your banking credentials. Your data's security is our top priority."
  }
];

// Mock data for footer links
const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Integrations', href: '#' },
      { name: 'Roadmap', href: '#' },
      { name: 'Changelog', href: '#' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Contact', href: '#' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Status', href: '#' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR', href: '#' }
    ]
  }
];

// Helper component for social icons
function SocialIcon({ platform, className }) {
  const icons = {
    Twitter: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
    LinkedIn: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    GitHub: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    Facebook: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    )
  };

  return icons[platform] || null;
}

// Helper icons (you would import these from your icon library)
function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckBadgeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
