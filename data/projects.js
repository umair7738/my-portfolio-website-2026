(function (root, factory) {
  "use strict";

  const projects = factory();
  if (typeof module === "object" && module.exports) module.exports = projects;
  if (root) {
    root.Portfolio = root.Portfolio || {};
    root.Portfolio.projectData = projects;
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const publicSiteAudits = {
    "infinity-learning-academy": { auditedOn: "2026-08-20", technologies: [{ name: "Bootstrap", confidence: "HIGH" }] },
    "creative-engross": { auditedOn: "2026-08-20", technologies: [{ name: "Bootstrap", confidence: "HIGH" }, { name: "GSAP", confidence: "HIGH" }] },
    "motiwala-jewels": { auditedOn: "2026-08-20", technologies: [{ name: "Laravel", confidence: "HIGH" }] },
    "atyaf-al-majd": { auditedOn: "2026-08-20", technologies: [{ name: "Bootstrap", confidence: "HIGH" }, { name: "jQuery", confidence: "HIGH" }, { name: "WordPress", confidence: "MEDIUM" }] },
    "primepips-academy": { auditedOn: "2026-08-20", technologies: [{ name: "Bootstrap", confidence: "HIGH" }, { name: "jQuery", confidence: "HIGH" }] },
    "azeem-dayani": { auditedOn: "2026-08-20", technologies: [{ name: "Laravel", confidence: "HIGH" }, { name: "Bootstrap", confidence: "HIGH" }, { name: "jQuery", confidence: "HIGH" }] },
    "poonam-shah-art": { auditedOn: "2026-08-20", technologies: [{ name: "Laravel", confidence: "HIGH" }, { name: "Bootstrap", confidence: "HIGH" }, { name: "jQuery", confidence: "HIGH" }] },
    "adonia-offshore": { auditedOn: "2026-08-20", technologies: [{ name: "Laravel", confidence: "HIGH" }, { name: "Bootstrap", confidence: "HIGH" }, { name: "GSAP", confidence: "HIGH" }, { name: "WordPress media", confidence: "MEDIUM" }] },
    "treasure-motiwala-jewels": { auditedOn: "2026-08-20", technologies: [{ name: "Laravel", confidence: "HIGH" }, { name: "Bootstrap", confidence: "HIGH" }, { name: "jQuery", confidence: "HIGH" }] },
    "lijjat": { auditedOn: "2026-08-20", technologies: [{ name: "jQuery", confidence: "HIGH" }, { name: "Laravel-like application", confidence: "MEDIUM" }] },
    "sagar-speciality-chemicals": { auditedOn: "2026-08-20", technologies: [], note: "Audit signals unavailable — automated HTTP review was blocked." },
    "ccie-security-training": { auditedOn: "2026-08-20", technologies: [{ name: "Bootstrap", confidence: "HIGH" }, { name: "jQuery", confidence: "HIGH" }] },
    "octa-diwali-sale-2023": { auditedOn: "2026-08-20", technologies: [{ name: "Bootstrap", confidence: "HIGH" }, { name: "jQuery", confidence: "HIGH" }] },
    "octa-christmas-page": { auditedOn: "2026-08-20", technologies: [{ name: "Bootstrap", confidence: "HIGH" }, { name: "jQuery", confidence: "HIGH" }] },
    "bride-is-pride": { auditedOn: "2026-08-20", technologies: [], note: "Audit unavailable — archived domain." },
    "equity-exchange-academy": { auditedOn: "2026-08-20", technologies: [], note: "Audit unavailable — archived domain." },
    "utc-india": { auditedOn: "2026-08-20", technologies: [{ name: "WordPress", confidence: "HIGH" }, { name: "WooCommerce", confidence: "HIGH" }, { name: "Elementor", confidence: "HIGH" }] }
  };

  // Authoritative delivery records supplied directly by the project owner.
  const ownerProjectRecords = {
    "utc-india": { technologies: ["WordPress"] },
    "infinity-learning-academy": { technologies: ["HTML", "CSS", "Bootstrap", "JavaScript", "AOS"], role: "Independent design and development" },
    "primepips-academy": { technologies: ["HTML", "CSS", "Bootstrap", "jQuery", "AOS", "Slick Carousel", "Fancybox"], role: "Independent design and development" },
    "creative-engross": { technologies: ["HTML", "CSS", "Bootstrap", "JavaScript", "GSAP", "Google Translate"], role: "Independent design and development" },
    "azeem-dayani": { technologies: ["HTML", "CSS", "Bootstrap", "JavaScript", "GSAP"] },
    "poonam-shah-art": { technologies: ["HTML", "CSS", "Bootstrap", "JavaScript", "GSAP"] },
    "adonia-offshore": { technologies: ["HTML", "CSS", "Bootstrap", "JavaScript", "GSAP", "Locomotive Scroll", "Laravel", "PHP"] },
    "treasure-motiwala-jewels": { technologies: ["HTML", "CSS", "Bootstrap", "JavaScript", "Laravel", "PHP"] },
    "lijjat": { technologies: ["HTML", "CSS", "Bootstrap", "jQuery", "Laravel", "PHP"] },
    "motiwala-jewels": { technologies: ["HTML", "CSS", "Bootstrap", "jQuery", "Laravel", "PHP"] },
    "sagar-speciality-chemicals": { technologies: ["HTML", "CSS", "Bootstrap", "JavaScript", "Laravel", "PHP", "Google Translate"] },
    "atyaf-al-majd": { technologies: ["HTML", "CSS", "Bootstrap", "jQuery", "JavaScript", "Swiper", "PHP"] },
    "ccie-security-training": { technologies: ["HTML", "CSS", "Bootstrap", "jQuery", "Yii Framework"], role: "Independent design and development" },
    "octa-diwali-sale-2023": { technologies: ["HTML", "CSS", "Bootstrap", "jQuery", "Yii Framework"], role: "Independent design and development" },
    "octa-christmas-page": { technologies: ["HTML", "CSS", "Bootstrap", "jQuery", "Yii Framework"], role: "Independent design and development" },
    "bride-is-pride": { technologies: ["WordPress"] },
    "equity-exchange-academy": { technologies: ["HTML", "CSS", "Bootstrap", "JavaScript", "AOS"], role: "Independent design and development" }
  };

  const projects = [
    {
      slug: "infinity-learning-academy",
      title: "Infinity Learning Academy",
      description: "A learning academy website presenting education programmes and online access for prospective students.",
      descriptionEvidence: ["public-infinity-2026-08-20"],
      category: "education",
      categoryLabel: "Education",
      type: "website",
      typeLabel: "Academy website",
      tags: ["Education", "Academy", "Learning"],
      role: null,
      year: null,
      url: "https://infinitylearningacademy.io/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: {
          avif960: "assets/images/projects/infinity-learning-academy/infinity-learning-academy-desktop-960.avif",
          avif1440: "assets/images/projects/infinity-learning-academy/infinity-learning-academy-desktop-1440.avif",
          webp960: "assets/images/projects/infinity-learning-academy/infinity-learning-academy-desktop-960.webp",
          webp1440: "assets/images/projects/infinity-learning-academy/infinity-learning-academy-desktop-1440.webp",
          width: 1440,
          height: 960
        },
        mobile: {
          avif: "assets/images/projects/infinity-learning-academy/infinity-learning-academy-mobile-780.avif",
          webp: "assets/images/projects/infinity-learning-academy/infinity-learning-academy-mobile-780.webp",
          width: 780,
          height: 1040
        },
        alt: "Infinity Learning Academy homepage snapshot"
      },
      featuredRank: 1,
      caseStudy: null,
      auditRef: "audit-infinity-2026-08-20"
    },
    {
      slug: "creative-engross",
      title: "Creative Engross",
      description: "A creative agency website presenting branding, content, campaign, production, and digital services.",
      descriptionEvidence: ["public-creative-engross-2026-08-20"],
      category: "creative",
      categoryLabel: "Creative & Portfolio",
      type: "website",
      typeLabel: "Agency website",
      tags: ["Creative", "Branding", "Agency"],
      role: null,
      year: null,
      url: "https://creativeengross.com/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: {
          avif960: "assets/images/projects/creative-engross/creative-engross-desktop-960.avif",
          avif1440: "assets/images/projects/creative-engross/creative-engross-desktop-1440.avif",
          webp960: "assets/images/projects/creative-engross/creative-engross-desktop-960.webp",
          webp1440: "assets/images/projects/creative-engross/creative-engross-desktop-1440.webp",
          width: 1440,
          height: 960
        },
        mobile: {
          avif: "assets/images/projects/creative-engross/creative-engross-mobile-780.avif",
          webp: "assets/images/projects/creative-engross/creative-engross-mobile-780.webp",
          width: 780,
          height: 1040
        },
        alt: "Creative Engross agency homepage snapshot"
      },
      featuredRank: 2,
      caseStudy: null,
      auditRef: "audit-creative-engross-2026-08-20"
    },
    {
      slug: "motiwala-jewels",
      title: "Motiwala Jewels",
      description: "A luxury jewellery storefront offering catalogue-led browsing across gold and jewellery collections.",
      descriptionEvidence: ["public-motiwala-2026-08-20"],
      category: "commerce",
      categoryLabel: "Commerce",
      type: "storefront",
      typeLabel: "Jewellery storefront",
      tags: ["Commerce", "Jewellery", "Storefront"],
      role: null,
      year: null,
      url: "https://www.motiwalajewels.in/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: {
          avif960: "assets/images/projects/motiwala-jewels/motiwala-jewels-desktop-960.avif",
          avif1440: "assets/images/projects/motiwala-jewels/motiwala-jewels-desktop-1440.avif",
          webp960: "assets/images/projects/motiwala-jewels/motiwala-jewels-desktop-960.webp",
          webp1440: "assets/images/projects/motiwala-jewels/motiwala-jewels-desktop-1440.webp",
          width: 1440,
          height: 960
        },
        mobile: {
          avif: "assets/images/projects/motiwala-jewels/motiwala-jewels-mobile-780.avif",
          webp: "assets/images/projects/motiwala-jewels/motiwala-jewels-mobile-780.webp",
          width: 780,
          height: 1040
        },
        alt: "Motiwala Jewels storefront homepage snapshot"
      },
      featuredRank: 3,
      caseStudy: null,
      auditRef: "audit-motiwala-2026-08-20"
    },
    {
      slug: "atyaf-al-majd",
      title: "Atyaf Al-Majd",
      description: "A custom business website delivered from scratch with a responsive frontend.",
      descriptionEvidence: ["resume-2024-atyaf"],
      category: "corporate",
      categoryLabel: "Corporate",
      type: "website",
      typeLabel: "Business website",
      tags: ["Corporate", "Business website", "Responsive UI"],
      role: "Frontend development",
      year: null,
      url: "https://www.atyafalmajd.com/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: {
          avif960: "assets/images/projects/atyaf-al-majd/atyaf-al-majd-desktop-960.avif",
          avif1440: "assets/images/projects/atyaf-al-majd/atyaf-al-majd-desktop-1440.avif",
          webp960: "assets/images/projects/atyaf-al-majd/atyaf-al-majd-desktop-960.webp",
          webp1440: "assets/images/projects/atyaf-al-majd/atyaf-al-majd-desktop-1440.webp",
          width: 1440,
          height: 960
        },
        mobile: {
          avif: "assets/images/projects/atyaf-al-majd/atyaf-al-majd-mobile-780.avif",
          webp: "assets/images/projects/atyaf-al-majd/atyaf-al-majd-mobile-780.webp",
          width: 780,
          height: 1040
        },
        alt: "Atyaf Al-Majd current website homepage snapshot"
      },
      featuredRank: 4,
      caseStudy: { href: "case-studies.html#atyaf-al-majd", label: "Atyaf Al-Majd case study" },
      auditRef: "audit-atyaf-2026-08-20"
    },
    {
      slug: "primepips-academy",
      title: "PrimePips Academy",
      description: "A forex education website with learning paths, market insights, trading signals, and mentorship information.",
      descriptionEvidence: ["public-primepips-2026-08-20"],
      category: "education",
      categoryLabel: "Education",
      type: "website",
      typeLabel: "Academy website",
      tags: ["Education", "Forex", "Academy"],
      role: null,
      year: null,
      url: "https://www.primepipsacademy.in/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/primepips-academy/primepips-academy-desktop-960.avif", avif1440: "assets/images/projects/primepips-academy/primepips-academy-desktop-1440.avif", webp960: "assets/images/projects/primepips-academy/primepips-academy-desktop-960.webp", webp1440: "assets/images/projects/primepips-academy/primepips-academy-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/primepips-academy/primepips-academy-mobile-780.avif", webp: "assets/images/projects/primepips-academy/primepips-academy-mobile-780.webp", width: 780, height: 1040 },
        alt: "PrimePips Academy homepage snapshot"
      },
      featuredRank: null,
      caseStudy: null,
      auditRef: "audit-primepips-2026-08-20"
    },
    {
      slug: "azeem-dayani",
      title: "Azeem Dayani",
      description: "A professional portfolio presenting the work, achievements, and film credits of music supervisor Azeem Dayani.",
      descriptionEvidence: ["public-azeem-2026-08-20"],
      category: "creative",
      categoryLabel: "Creative & Portfolio",
      type: "portfolio",
      typeLabel: "Professional portfolio",
      tags: ["Portfolio", "Music", "Film"],
      role: null,
      year: null,
      url: "https://azeemdayani.com/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/azeem-dayani/azeem-dayani-desktop-960.avif", avif1440: "assets/images/projects/azeem-dayani/azeem-dayani-desktop-1440.avif", webp960: "assets/images/projects/azeem-dayani/azeem-dayani-desktop-960.webp", webp1440: "assets/images/projects/azeem-dayani/azeem-dayani-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/azeem-dayani/azeem-dayani-mobile-780.avif", webp: "assets/images/projects/azeem-dayani/azeem-dayani-mobile-780.webp", width: 780, height: 1040 },
        alt: "Azeem Dayani portfolio homepage snapshot"
      },
      featuredRank: null,
      caseStudy: null,
      auditRef: "audit-azeem-2026-08-20"
    },
    {
      slug: "poonam-shah-art",
      title: "Poonam Shah Art",
      description: "An artist portfolio presenting Poonam Shah's artwork and creative practice online.",
      descriptionEvidence: ["public-poonam-2026-08-20"],
      category: "creative",
      categoryLabel: "Creative & Portfolio",
      type: "portfolio",
      typeLabel: "Artist portfolio",
      tags: ["Portfolio", "Art", "Creative"],
      role: null,
      year: null,
      url: "https://www.poonamshahart.com/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/poonam-shah-art/poonam-shah-art-desktop-960.avif", avif1440: "assets/images/projects/poonam-shah-art/poonam-shah-art-desktop-1440.avif", webp960: "assets/images/projects/poonam-shah-art/poonam-shah-art-desktop-960.webp", webp1440: "assets/images/projects/poonam-shah-art/poonam-shah-art-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/poonam-shah-art/poonam-shah-art-mobile-780.avif", webp: "assets/images/projects/poonam-shah-art/poonam-shah-art-mobile-780.webp", width: 780, height: 1040 },
        alt: "Poonam Shah Art homepage snapshot"
      },
      featuredRank: null,
      caseStudy: null,
      auditRef: "audit-poonam-2026-08-20"
    },
    {
      slug: "adonia-offshore",
      title: "Adonia Offshore",
      description: "A corporate website presenting offshore, maritime, logistics, and related business services.",
      descriptionEvidence: ["public-adonia-2026-08-20"],
      category: "corporate",
      categoryLabel: "Corporate",
      type: "website",
      typeLabel: "Corporate website",
      tags: ["Corporate", "Offshore", "Maritime"],
      role: null,
      year: null,
      url: "https://adoniaoffshore.com/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/adonia-offshore/adonia-offshore-desktop-960.avif", avif1440: "assets/images/projects/adonia-offshore/adonia-offshore-desktop-1440.avif", webp960: "assets/images/projects/adonia-offshore/adonia-offshore-desktop-960.webp", webp1440: "assets/images/projects/adonia-offshore/adonia-offshore-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/adonia-offshore/adonia-offshore-mobile-780.avif", webp: "assets/images/projects/adonia-offshore/adonia-offshore-mobile-780.webp", width: 780, height: 1040 },
        alt: "Adonia Offshore homepage snapshot"
      },
      featuredRank: null,
      caseStudy: null,
      auditRef: "audit-adonia-2026-08-20"
    },
    {
      slug: "treasure-motiwala-jewels",
      title: "Treasure — Motiwala Jewels",
      description: "A jewellery storefront focused on browsing luxury jewellery and gold collections online.",
      descriptionEvidence: ["public-treasure-2026-08-20"],
      category: "commerce",
      categoryLabel: "Commerce",
      type: "storefront",
      typeLabel: "Jewellery storefront",
      tags: ["Commerce", "Jewellery", "Storefront"],
      role: null,
      year: null,
      url: "https://treasure.motiwalajewels.in/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/treasure-motiwala-jewels/treasure-motiwala-jewels-desktop-960.avif", avif1440: "assets/images/projects/treasure-motiwala-jewels/treasure-motiwala-jewels-desktop-1440.avif", webp960: "assets/images/projects/treasure-motiwala-jewels/treasure-motiwala-jewels-desktop-960.webp", webp1440: "assets/images/projects/treasure-motiwala-jewels/treasure-motiwala-jewels-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/treasure-motiwala-jewels/treasure-motiwala-jewels-mobile-780.avif", webp: "assets/images/projects/treasure-motiwala-jewels/treasure-motiwala-jewels-mobile-780.webp", width: 780, height: 1040 },
        alt: "Treasure Motiwala Jewels storefront homepage snapshot"
      },
      featuredRank: null,
      caseStudy: null,
      auditRef: "audit-treasure-2026-08-20"
    },
    {
      slug: "lijjat",
      title: "Lijjat",
      description: "A brand and organisation website presenting Lijjat's story, products, activity, and public information.",
      descriptionEvidence: ["public-lijjat-2026-08-20"],
      category: "corporate",
      categoryLabel: "Corporate",
      type: "website",
      typeLabel: "Brand website",
      tags: ["Corporate", "Brand", "Products"],
      role: null,
      year: null,
      url: "https://www.lijjat.com/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/lijjat/lijjat-desktop-960.avif", avif1440: "assets/images/projects/lijjat/lijjat-desktop-1440.avif", webp960: "assets/images/projects/lijjat/lijjat-desktop-960.webp", webp1440: "assets/images/projects/lijjat/lijjat-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/lijjat/lijjat-mobile-780.avif", webp: "assets/images/projects/lijjat/lijjat-mobile-780.webp", width: 780, height: 1040 },
        alt: "Lijjat homepage snapshot"
      },
      featuredRank: null,
      caseStudy: null,
      auditRef: "audit-lijjat-2026-08-20"
    },
    {
      slug: "sagar-speciality-chemicals",
      title: "Sagar Speciality Chemicals",
      description: "An industrial business website presenting speciality chemical products and company information.",
      descriptionEvidence: ["public-sagar-2026-08-20"],
      category: "industrial",
      categoryLabel: "Industrial",
      type: "website",
      typeLabel: "Industrial website",
      tags: ["Industrial", "Chemicals", "Corporate"],
      role: null,
      year: null,
      url: "https://sagarspecialitychemicals.com/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: "Automated capture may require manual review." },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/sagar-speciality-chemicals/sagar-speciality-chemicals-desktop-960.avif", avif1440: "assets/images/projects/sagar-speciality-chemicals/sagar-speciality-chemicals-desktop-1440.avif", webp960: "assets/images/projects/sagar-speciality-chemicals/sagar-speciality-chemicals-desktop-960.webp", webp1440: "assets/images/projects/sagar-speciality-chemicals/sagar-speciality-chemicals-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/sagar-speciality-chemicals/sagar-speciality-chemicals-mobile-780.avif", webp: "assets/images/projects/sagar-speciality-chemicals/sagar-speciality-chemicals-mobile-780.webp", width: 780, height: 1040 },
        alt: "Sagar Speciality Chemicals homepage snapshot"
      },
      featuredRank: null,
      caseStudy: null,
      auditRef: "audit-sagar-2026-08-20"
    },
    {
      slug: "ccie-security-training",
      title: "Octa Networks — CCIE Security v6.1 Training",
      description: "A focused training landing page for Octa Networks' CCIE Security v6.1 programme.",
      descriptionEvidence: ["resume-2024-octa-pages"],
      category: "education",
      categoryLabel: "Education",
      type: "landing-page",
      typeLabel: "Training landing page",
      tags: ["Education", "Training", "Landing page"],
      role: "Landing page development",
      year: null,
      url: "https://octanetworks.com/ccie-security_v6.1_training",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/ccie-security-training/ccie-security-training-desktop-960.avif", avif1440: "assets/images/projects/ccie-security-training/ccie-security-training-desktop-1440.avif", webp960: "assets/images/projects/ccie-security-training/ccie-security-training-desktop-960.webp", webp1440: "assets/images/projects/ccie-security-training/ccie-security-training-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/ccie-security-training/ccie-security-training-mobile-780.avif", webp: "assets/images/projects/ccie-security-training/ccie-security-training-mobile-780.webp", width: 780, height: 1040 },
        alt: "Octa Networks CCIE Security training page snapshot"
      },
      featuredRank: null,
      caseStudy: { href: "case-studies.html#campaign-pages", label: "Octa Networks campaign pages case study" },
      auditRef: "audit-octa-ccie-2026-08-20"
    },
    {
      slug: "octa-diwali-sale-2023",
      title: "Octa Networks — Diwali Sale 2023",
      description: "A seasonal campaign landing page designed and developed for Octa Networks' Diwali Sale 2023.",
      descriptionEvidence: ["resume-2024-octa-pages"],
      category: "campaign",
      categoryLabel: "Campaigns",
      type: "campaign",
      typeLabel: "Seasonal campaign",
      tags: ["Campaign", "Landing page", "Diwali"],
      role: "Design and development",
      year: "2023",
      url: "https://octanetworks.com/diwali-sale-2023",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/octa-diwali-sale-2023/octa-diwali-sale-2023-desktop-960.avif", avif1440: "assets/images/projects/octa-diwali-sale-2023/octa-diwali-sale-2023-desktop-1440.avif", webp960: "assets/images/projects/octa-diwali-sale-2023/octa-diwali-sale-2023-desktop-960.webp", webp1440: "assets/images/projects/octa-diwali-sale-2023/octa-diwali-sale-2023-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/octa-diwali-sale-2023/octa-diwali-sale-2023-mobile-780.avif", webp: "assets/images/projects/octa-diwali-sale-2023/octa-diwali-sale-2023-mobile-780.webp", width: 780, height: 1040 },
        alt: "Octa Networks Diwali Sale 2023 campaign page snapshot"
      },
      featuredRank: null,
      caseStudy: { href: "case-studies.html#campaign-pages", label: "Octa Networks campaign pages case study" },
      auditRef: "audit-octa-diwali-2026-08-20"
    },
    {
      slug: "octa-christmas-page",
      title: "Octa Networks — Christmas Page",
      description: "A festive campaign landing page designed and developed for an Octa Networks seasonal promotion.",
      descriptionEvidence: ["resume-2024-octa-pages"],
      category: "campaign",
      categoryLabel: "Campaigns",
      type: "campaign",
      typeLabel: "Seasonal campaign",
      tags: ["Campaign", "Landing page", "Christmas"],
      role: "Design and development",
      year: null,
      url: "https://octanetworks.com/christmas-page",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/octa-christmas-page/octa-christmas-page-desktop-960.avif", avif1440: "assets/images/projects/octa-christmas-page/octa-christmas-page-desktop-1440.avif", webp960: "assets/images/projects/octa-christmas-page/octa-christmas-page-desktop-960.webp", webp1440: "assets/images/projects/octa-christmas-page/octa-christmas-page-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/octa-christmas-page/octa-christmas-page-mobile-780.avif", webp: "assets/images/projects/octa-christmas-page/octa-christmas-page-mobile-780.webp", width: 780, height: 1040 },
        alt: "Octa Networks Christmas campaign page snapshot"
      },
      featuredRank: null,
      caseStudy: { href: "case-studies.html#campaign-pages", label: "Octa Networks campaign pages case study" },
      auditRef: "audit-octa-christmas-2026-08-20"
    },
    {
      slug: "bride-is-pride",
      title: "Bride Is Pride",
      description: "Archived internal WordPress pages designed and developed as part of a wider wedding website experience.",
      descriptionEvidence: ["resume-2024-bride"],
      category: "creative",
      categoryLabel: "Creative & Portfolio",
      type: "internal-pages",
      typeLabel: "Internal website pages",
      tags: ["Archived", "Wedding", "Internal pages"],
      role: "Internal page development",
      year: null,
      url: "https://brideispride.com/",
      status: { value: "ARCHIVED", verifiedOn: "2026-08-20", note: "The original website is closed and the domain does not resolve." },
      deliveryTechnologies: [],
      media: {
        kind: "ARCHIVE_TREATMENT",
        capturedOn: null,
        desktop: { webp960: "assets/images/project-bride.webp", width: 1200, height: 800 },
        mobile: null,
        alt: "Portfolio-made archive visual for the Bride Is Pride WordPress project"
      },
      featuredRank: null,
      caseStudy: { href: "case-studies.html#other-work", label: "Bride Is Pride archive note" },
      auditRef: "audit-bride-2026-08-20"
    },
    {
      slug: "equity-exchange-academy",
      title: "Equity Exchange Academy",
      description: "An archived financial education website designed and developed to present the academy online.",
      descriptionEvidence: ["resume-2024-equity"],
      category: "education",
      categoryLabel: "Education",
      type: "website",
      typeLabel: "Academy website",
      tags: ["Archived", "Education", "Academy"],
      role: "Design and development",
      year: null,
      url: "https://equityexchangeacademy.in/",
      status: { value: "ARCHIVED", verifiedOn: "2026-08-20", note: "The original website is closed and the domain does not resolve." },
      deliveryTechnologies: [],
      media: {
        kind: "ARCHIVE_TREATMENT",
        capturedOn: null,
        desktop: { webp960: "assets/images/project-equity.webp", width: 1200, height: 800 },
        mobile: null,
        alt: "Portfolio-made archive visual for Equity Exchange Academy"
      },
      featuredRank: null,
      caseStudy: { href: "case-studies.html#other-work", label: "Equity Exchange Academy archive note" },
      auditRef: "audit-equity-2026-08-20"
    },
    {
      slug: "utc-india",
      title: "UTC India",
      description: "A WordPress product catalogue for UTC India's insulated ware and kitchen product ranges.",
      descriptionEvidence: ["resume-2024-utc"],
      category: "commerce",
      categoryLabel: "Commerce",
      type: "product-catalogue",
      typeLabel: "Product catalogue",
      tags: ["Commerce", "Product catalogue", "Kitchenware"],
      role: "WordPress build",
      year: null,
      url: "https://utcindia.co/",
      status: { value: "LIVE", verifiedOn: "2026-08-20", note: null },
      deliveryTechnologies: [],
      media: {
        kind: "LIVE_SNAPSHOT",
        capturedOn: "2026-08-20",
        desktop: { avif960: "assets/images/projects/utc-india/utc-india-desktop-960.avif", avif1440: "assets/images/projects/utc-india/utc-india-desktop-1440.avif", webp960: "assets/images/projects/utc-india/utc-india-desktop-960.webp", webp1440: "assets/images/projects/utc-india/utc-india-desktop-1440.webp", width: 1440, height: 960 },
        mobile: { avif: "assets/images/projects/utc-india/utc-india-mobile-780.avif", webp: "assets/images/projects/utc-india/utc-india-mobile-780.webp", width: 780, height: 1040 },
        alt: "UTC India current product catalogue homepage snapshot"
      },
      featuredRank: null,
      caseStudy: { href: "case-studies.html#utc-india", label: "UTC India case study" },
      auditRef: "audit-utc-2026-08-20"
    }
  ];

  return projects.map(function (project) {
    const ownerRecord = ownerProjectRecords[project.slug];
    project.deliveryTechnologies = ownerRecord.technologies.map(function (name) {
      return { name: name, confidence: "HIGH", evidenceRefs: ["owner-project-record-2026-08-20"] };
    });
    if (ownerRecord.role) project.role = ownerRecord.role;
    project.publicSiteAudit = publicSiteAudits[project.slug];
    return project;
  });
});
