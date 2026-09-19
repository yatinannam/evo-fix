import { useCallback, useEffect, useState } from "react";
import { scrollToSection, type SectionId } from "../../site/sections";
import { DESKTOP_POST_ROCKET_LIFT } from "../../site/desktopLayout";
import { openDemoDashboard } from "../../site/demoDashboard";
import { setSiteToastListener } from "../../site/toast";
import {
  Hotspot,
  ToastBanner,
  useFeedbackForm,
  VideoModal,
} from "../interactive/common";

export function DesktopInteractiveOverlay({ scale }: { scale: number }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const { form, setForm, submitting, toast, handleSubmit, showToast } =
    useFeedbackForm();

  const go = useCallback(
    (section: SectionId) => {
      scrollToSection(section, scale, "desktop");
    },
    [scale],
  );

  useEffect(() => {
    setSiteToastListener(showToast);
    return () => setSiteToastListener(null);
  }, [showToast]);

  const postRocketY = (y: number) =>
    y >= 3087 ? y - DESKTOP_POST_ROCKET_LIFT : y;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Header */}
        <Hotspot
          x={89}
          y={42}
          w={126}
          h={42}
          label="Evocare home"
          variant="nav"
          onClick={() => window.location.assign("/")}
        />
        <Hotspot
          x={590}
          y={48}
          w={90}
          h={28}
          label="About Us"
          variant="nav"
          onClick={() => window.location.assign("/evocare/about")}
        />
        <Hotspot
          x={705}
          y={48}
          w={100}
          h={28}
          label="Contact Us"
          variant="nav"
          onClick={() => window.location.assign("/evodoc/contact")}
        />
        <Hotspot
          x={835}
          y={48}
          w={80}
          h={28}
          label="Features"
          variant="nav"
          onClick={() => go("upcoming-features")}
        />
        <Hotspot
          x={940}
          y={48}
          w={70}
          h={28}
          label="Privacy"
          variant="nav"
          onClick={() => window.location.assign("/evodoc/privacy")}
        />
        <Hotspot
          x={1030}
          y={48}
          w={50}
          h={28}
          label="Blogs"
          variant="nav"
          onClick={() => window.location.assign("/evocare/blog")}
        />
        <Hotspot
          x={1290}
          y={43}
          w={135}
          h={39}
          label="Login/ Sign up"
          variant="cta-cyan"
          onClick={() => window.location.assign("/evocare/login")}
        />

        {/* Hero CTAs */}
        <Hotspot
          x={366}
          y={406}
          w={377}
          h={56}
          label="Get Started For Free"
          variant="cta-primary"
          onClick={() => window.location.assign("/evocare/login")}
        />
        <Hotspot
          x={769}
          y={406}
          w={377}
          h={56}
          label="Our Upcoming Features"
          variant="cta-secondary"
          onClick={() => go("upcoming-features")}
        />

        {/* Contact form */}
        <form
          className="pointer-events-auto absolute"
          style={{ left: 740, top: postRocketY(7775), width: 574 }}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="site-input mb-[21px] h-[48px] w-full"
            aria-label="Name"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="you@email.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="site-input mb-[21px] h-[48px] w-full"
            aria-label="Email"
          />
          <button
            type="submit"
            disabled={submitting}
            className="site-submit h-[48px] w-full"
          >
            {submitting ? "Logging in…" : "Login now"}
          </button>
        </form>
      </div>
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
      <ToastBanner toast={toast} />
    </>
  );
}
