# Prime Scholar Coaching Website (Dhaka-Focused)

Premium multi-page static template using:
- HTML + CSS
- TailwindCSS (CDN)
- jQuery (interactions)
- GSAP + ScrollTrigger (animations)

## Folder Structure

```text
/
  index.html
  about.html
  programs.html
  schedule.html
  teachers.html
  admission.html
  results.html
  notice.html
  notice-single.html
  gallery.html
  blog.html
  blog-single.html
  faq.html
  contact.html
  pricing.html
  terms.html
  portal.html
  /css
    main.css
  /js
    main.js
  /assets
    /images
      gallery-1.svg ... gallery-8.svg
```

## Design + Content Notes

- Brand tone: trustworthy, energetic, academic excellence.
- Microcopy mix: Bangla + English (Bangladesh guardian/student friendly).
- Live Unsplash images are used across hero, programs, gallery, results, teachers, and blog.
- Dhaka context placeholders included:
  - Branches: Dhanmondi, Mirpur, Uttara, Farmgate
  - Hotline placeholders: +880 1700-xxxxxx
  - Payment methods: bKash, Nagad

## Shared Layout

- Sticky navbar with CTA: `Admission`, `Call Now`
- Mobile drawer menu
- Light/Dark toggle (CSS variable theme tokens)
- Shared footer with newsletter + map placeholder
- Toast component
- Form validation states
- Badge styles: Open / Few Seats / Closed

## GSAP + jQuery Interactions

- Hero stagger fade-up
- Section reveal on scroll
- Stats count-up on view
- Testimonial fade slider
- Subtle card tilt hover
- Filter tabs (Programs/Results)
- Notice search + category filter
- FAQ accordion
- Teacher profile modal
- Gallery lightbox

## Run Locally

Run with a local server for best compatibility (routing, assets, and browser security policies).

Example:

```powershell
# If Python is installed
python -m http.server 5500
```

Then open: `http://localhost:5500/index.html`
