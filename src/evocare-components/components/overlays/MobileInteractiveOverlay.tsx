import { useCallback, useEffect, useState } from "react";
import { scrollToSection, type SectionId } from "../../site/sections";
import { openDemoDashboard } from "../../site/demoDashboard";
import { setSiteToastListener } from "../../site/toast";
import {
  Hotspot,
  MobileNavMenu,
  ToastBanner,
  useFeedbackForm,
  VideoModal,
} from "../interactive/common";

export function MobileInteractiveOverlay({ scale, showAllCards }: { scale: number; showAllCards: boolean }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { form, setForm, submitting, toast, handleSubmit, showToast } =
    useFeedbackForm();

  const go = useCallback(
    (section: SectionId) => {
      scrollToSection(section, scale, "mobile");
    },
    [scale],
  );

  useEffect(() => {
    setSiteToastListener(showToast);
    return () => setSiteToastListener(null);
  }, [showToast]);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Header */}
        <Hotspot
          x={23}
          y={68}
          w={90}
          h={30}
          label="Evocare home"
          variant="nav"
          onClick={() => window.location.assign("/")}
        />
        <Hotspot
          x={344}
          y={73}
          w={33}
          h={20}
          label="Open menu"
          variant="nav"
          onClick={() => setMenuOpen(true)}
        />

        {/* Hero CTAs */}
        <Hotspot
          x={18}
          y={455}
          w={365}
          h={47}
          label="Get Started For Free"
          variant="cta-primary"
          onClick={() => window.location.assign("/evocare/login")}
        />
        <Hotspot
          x={18}
          y={514}
          w={365}
          h={47}
          label="Our Upcoming Features"
          variant="cta-secondary"
          onClick={() => go("upcoming-features")}
        />

        {/* Three Things card actions */}
        <Hotspot
          x={52}
          y={1495}
          w={301}
          h={39}
          label="Upload Records"
          variant="card"
          onClick={() => go("contact")}
        />
        <Hotspot
          x={51}
          y={1948}
          w={301}
          h={39}
          label="Organize Records"
          variant="card"
          onClick={() => go("contact")}
        />
        <Hotspot
          x={52}
          y={2404}
          w={301}
          h={39}
          label="Share Securely"
          variant="card"
          onClick={() => go("contact")}
        />

        {/* Contact form */}
        <form
          className="pointer-events-auto absolute"
          style={{ left: 52, top: showAllCards ? 10254 : 8799, width: 301 }}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="site-input mb-[20px] h-[48px] w-full text-[12px]"
            aria-label="Name"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="site-input mb-[20px] h-[48px] w-full text-[12px]"
            aria-label="Email"
          />
          <button
            type="submit"
            disabled={submitting}
            className="site-submit h-[48px] w-full text-[12px]"
          >
            {submitting ? "Logging in…" : "Login now"}
          </button>
        </form>
      </div>
      <MobileNavMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(section) => go(section as SectionId)}
      />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
      <ToastBanner toast={toast} />
    </>
  );
}
