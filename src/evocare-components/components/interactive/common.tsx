import { useCallback, useState, useEffect } from "react";
import { openDemoDashboard } from "../../site/demoDashboard";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { shared } from "../../assets/images";

export type Toast = { message: string; type: "success" | "info" } | null;

export type HotspotProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  onClick: () => void;
  variant?: "nav" | "cta-primary" | "cta-secondary" | "cta-cyan" | "card" | "link" | "plain";
};

export function Hotspot({
  x,
  y,
  w,
  h,
  label,
  onClick,
  variant = "link",
}: HotspotProps) {
  const variantClass = {
    nav: "site-hotspot--nav",
    "cta-primary": "site-hotspot--cta-primary",
    "cta-secondary": "site-hotspot--cta-secondary",
    "cta-cyan": "site-hotspot--cta-cyan",
    card: "site-hotspot--card",
    link: "site-hotspot--link",
    plain: "site-hotspot--plain",
  }[variant];

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`site-hotspot ${variantClass}`}
      style={{ left: x, top: y, width: w, height: h }}
      whileHover={{ scale: variant === "plain" ? 1 : variant.startsWith("cta") ? 1.03 : 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    />
  );
}

export function VideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-raleway text-xl font-extrabold text-[#141414]">
                How EvoCare Works
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-gradient-to-br from-[#429ff4] to-[#aff2fb] p-8">
              <div className="flex h-full flex-col items-center justify-center rounded-xl bg-white/90 text-center">
                <p className="font-raleway text-2xl font-extrabold text-[#141414]">
                  Product demo coming soon
                </p>
                <p className="mt-2 max-w-md text-sm text-[#6e6e6e]">
                  Upload, organize, and share your health records in one secure
                  place. Join early access to be first when the full video
                  launches.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-[13px] bg-[#429ff4] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#3a8fe0]"
                >
                  Get Early Access
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ToastBanner({ toast }: { toast: Toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className={`fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-[#429ff4] text-white"
              : "bg-[#141414] text-white"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useFeedbackForm() {
  const [form, setForm] = useState({ name: "", email: "", feedback: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = useCallback((message: string, type: "success" | "info" = "info") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Please fill in your name and email.", "info");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showToast("Please enter a valid email address.", "info");
      return;
    }
    setSubmitting(true);
    window.location.assign("/evocare/login");
  };

  return { form, setForm, submitting, toast, handleSubmit, showToast };
}

export type MobileNavMenuProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
};

const MOBILE_LOGO_SRC = shared.mobileNavLogo;

export function MobileNavMenu({
  open,
  onClose,
  onNavigate,
}: MobileNavMenuProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLink = (label: string, section: string) => (
    <button
      type="button"
      key={label}
      onClick={() => {
        onNavigate(section);
        onClose();
      }}
      className="w-full rounded-[14px] border border-[#aff2fb] bg-white px-4 py-4 text-center text-[16px] font-medium text-[#141414] transition hover:bg-[#f8feff]"
    >
      {label}
    </button>
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[120] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[121] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
          >
            <motion.nav
              className="relative w-full max-w-[320px] rounded-[24px] bg-white px-6 pb-8 pt-6 shadow-2xl"
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              aria-label="Main navigation"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="h-[30px] w-[90px] overflow-hidden">
                  <img
                    alt="EvoCare"
                    className="h-full w-full object-contain"
                    src={MOBILE_LOGO_SRC}
                  />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="px-1 text-[28px] font-bold leading-none text-[#141414] transition hover:opacity-70"
                >
                  ×
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <a href="/evocare/about" className="block w-full rounded-[14px] border border-[#aff2fb] bg-white px-4 py-4 text-center text-[16px] font-medium text-[#141414] transition hover:bg-[#f8feff]">About Us</a>
                <a href="/evodoc/contact" className="block w-full rounded-[14px] border border-[#aff2fb] bg-white px-4 py-4 text-center text-[16px] font-medium text-[#141414] transition hover:bg-[#f8feff]">Contact Us</a>
                {navLink("Features", "upcoming-features")}
                <a href="/evodoc/privacy" className="block w-full rounded-[14px] border border-[#aff2fb] bg-white px-4 py-4 text-center text-[16px] font-medium text-[#141414] transition hover:bg-[#f8feff]">Privacy</a>
                <a href="/evocare/blog" className="block w-full rounded-[14px] border border-[#aff2fb] bg-white px-4 py-4 text-center text-[16px] font-medium text-[#141414] transition hover:bg-[#f8feff]">Blogs</a>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.assign("/evocare/login");
                  }}
                  className="w-full rounded-[14px] bg-[#aff2fb] px-4 py-4 text-center text-[16px] font-bold text-[#141414] transition hover:bg-[#9de8f2]"
                >
                  Login/ Sign up
                </button>
              </div>
            </motion.nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
