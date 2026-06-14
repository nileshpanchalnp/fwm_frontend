/**
 * App Constants
 */

export const APP_NAME = "The Language Hunter";
export const TUTOR_NAME = "Maitri";

export const CONTACT_INFO = {
  PHONE: "+91 XXXXX XXXXX",
  EMAIL: "hello@learnfrenchatzenith.com",
  WHATSAPP: "91XXXXXXXXXX",
  WHATSAPP_MESSAGE: encodeURIComponent("Bonjour! I'd like to inquire about your French batches."),
  LOCATION: "Online Classes Available",
};

export const SOCIAL_LINKS = {
  INSTAGRAM: "https://instagram.com/thelanguagehunter",
  WHATSAPP_CHAT: `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent("Bonjour! I am interested in French classes.")}`,
};

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440,
};

export const ANIMATION_VARIANTS = {
  FADE_UP: {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  },
};