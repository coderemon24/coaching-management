(function ($) {
  const App = {
    init() {
      this.initGsapPlugins();
      this.initThemeFromStorage();
      this.initHeader();
      this.markActiveNav();
      this.initForms();
      this.initInteractiveWidgets();
      this.initFilterTabs();
      this.initNoticeFilters();
      this.initAccordion();
      this.initTestimonialSlider();
      this.initTeacherModal();
      this.initGalleryLightbox();
      this.initCountUp();
      this.initRevealAnimations();
      this.initCardTilt();
      this.initAutoMarquees();
      this.bindGlobalEvents();
    },

    initGsapPlugins() {
      if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }
    },

    initThemeFromStorage() {
      const savedTheme = localStorage.getItem("cc_theme");
      if (savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    },

    toggleTheme() {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("cc_theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("cc_theme", "dark");
      }
    },

    initHeader() {
      const drawer = $("#mobileDrawer");
      const backdrop = $("#drawerBackdrop");
      const toggleBtn = $("#openDrawer");

      const setDrawerState = (isOpen) => {
        drawer.toggleClass("open", isOpen);
        backdrop.toggleClass("show", isOpen);
        $("body").css("overflow", isOpen ? "hidden" : "");
        toggleBtn.attr("aria-expanded", String(isOpen));
        toggleBtn.toggleClass("is-open", isOpen);
      };

      $(document).on("click", "[data-theme-toggle]", () => {
        this.toggleTheme();
      });

      $(document).on("click", "#openDrawer", () => {
        setDrawerState(!drawer.hasClass("open"));
      });

      $(document).on("click", "#closeDrawer, #drawerBackdrop, #mobileDrawer a", () => {
        setDrawerState(false);
      });
    },

    markActiveNav() {
      const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
      $("[data-nav]").removeClass("active");
      const activeLink = $(`[data-nav='${file}']`);
      activeLink.addClass("active");

      if (activeLink.closest(".desktop-dropdown-menu").length) {
        activeLink.closest(".desktop-dropdown").find(".desktop-dropdown-trigger").addClass("active");
      }
    },

    initRevealAnimations() {
      if (!window.gsap) {
        $(".reveal").css({ opacity: 1, transform: "none" });
        return;
      }

      gsap.from(".hero-reveal", {
        y: 26,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power2.out"
      });

      if (window.ScrollTrigger) {
        gsap.utils.toArray(".reveal").forEach((item) => {
          gsap.to(item, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              once: true
            }
          });
        });
      }
    },

    initCountUp() {
      const counters = document.querySelectorAll("[data-counter]");
      if (!counters.length) return;

      const runCounter = (el) => {
        const target = Number(el.getAttribute("data-counter")) || 0;
        if (!window.gsap) {
          el.textContent = target.toLocaleString();
          return;
        }
        const countObj = { value: 0 };
        gsap.to(countObj, {
          value: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.floor(countObj.value).toLocaleString();
          }
        });
      };

      if (window.ScrollTrigger && window.gsap) {
        counters.forEach((counter) => {
          ScrollTrigger.create({
            trigger: counter,
            start: "top 85%",
            once: true,
            onEnter: () => runCounter(counter)
          });
        });
      } else {
        counters.forEach((counter) => runCounter(counter));
      }
    },

    initTestimonialSlider() {
      const slides = $(".testimonial-slide");
      if (slides.length < 2) return;

      let index = 0;
      slides.hide().eq(index).show();

      setInterval(() => {
        const current = slides.eq(index);
        index = (index + 1) % slides.length;
        const next = slides.eq(index);

        if (window.gsap) {
          gsap.to(current, {
            opacity: 0,
            duration: 0.35,
            onComplete: () => {
              current.hide();
              next.css({ opacity: 0, display: "block" });
              gsap.to(next, { opacity: 1, duration: 0.45 });
            }
          });
        } else {
          current.fadeOut(300, () => next.fadeIn(300));
        }
      }, 5200);
    },

    initCardTilt() {
      const cards = document.querySelectorAll(".card-tilt");
      cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rotateY = ((x / rect.width) - 0.5) * 5;
          const rotateX = ((y / rect.height) - 0.5) * -5;
          card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener("mouseleave", () => {
          card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
        });
      });
    },

    initAutoMarquees() {
      if (!window.gsap) return;

      const tracks = document.querySelectorAll("[data-marquee]");
      tracks.forEach((track) => {
        if (track.dataset.marqueeInited === "true") return;

        const items = Array.from(track.children);
        if (items.length < 2) return;

        const viewport = document.createElement("div");
        viewport.className = "marquee-viewport";
        track.parentNode.insertBefore(viewport, track);
        viewport.appendChild(track);

        track.classList.add("marquee-track");

        const duration = Number(track.getAttribute("data-marquee-duration")) || 22;
        const state = {
          minX: 0,
          maxX: 0,
          dir: track.getAttribute("data-marquee") === "ltr" ? 1 : -1,
          hasInitialPosition: false,
          tween: null,
          dragging: false,
          pointerId: null,
          startClientX: 0,
          lastClientX: 0,
          startX: 0,
          moved: false,
          justDragged: false
        };

        const clamp = (value) => Math.min(state.maxX, Math.max(state.minX, value));

        const stopTween = () => {
          if (state.tween) {
            state.tween.kill();
            state.tween = null;
          }
        };

        const animateToEdge = () => {
          const currentX = Number(gsap.getProperty(track, "x")) || 0;
          const targetX = state.dir > 0 ? state.maxX : state.minX;
          const distance = Math.abs(targetX - currentX);
          const fullDistance = Math.max(1, state.maxX - state.minX);

          if (distance < 1) {
            state.dir *= -1;
            requestAnimationFrame(animateToEdge);
            return;
          }

          const segmentDuration = Math.max(0.55, (distance / fullDistance) * duration);
          stopTween();
          state.tween = gsap.to(track, {
            x: targetX,
            duration: segmentDuration,
            ease: "none",
            onComplete: () => {
              state.dir *= -1;
              animateToEdge();
            }
          });
        };

        const refresh = () => {
          const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
          state.minX = -overflow;
          state.maxX = 0;

          if (!state.hasInitialPosition) {
            const initialX = state.dir > 0 ? state.minX : state.maxX;
            gsap.set(track, { x: clamp(initialX) });
            state.hasInitialPosition = true;
          } else {
            const currentX = Number(gsap.getProperty(track, "x")) || 0;
            gsap.set(track, { x: clamp(currentX) });
          }

          if (overflow > 0) {
            animateToEdge();
          } else {
            stopTween();
          }
        };

        const onPointerDown = (e) => {
          if (state.maxX === state.minX) return;
          state.dragging = true;
          state.pointerId = e.pointerId;
          state.startClientX = e.clientX;
          state.lastClientX = e.clientX;
          state.startX = Number(gsap.getProperty(track, "x")) || 0;
          state.moved = false;
          state.justDragged = false;
          stopTween();
          viewport.classList.add("is-dragging");
          if (viewport.setPointerCapture) {
            viewport.setPointerCapture(e.pointerId);
          }
        };

        const onPointerMove = (e) => {
          if (!state.dragging) return;
          if (state.pointerId !== null && e.pointerId !== state.pointerId) return;

          const delta = e.clientX - state.startClientX;
          if (Math.abs(delta) > 3) {
            state.moved = true;
          }

          const nextX = clamp(state.startX + delta);
          gsap.set(track, { x: nextX });

          if (e.clientX !== state.lastClientX) {
            state.dir = e.clientX > state.lastClientX ? 1 : -1;
            state.lastClientX = e.clientX;
          }
        };

        const onPointerEnd = (e) => {
          if (!state.dragging) return;
          if (state.pointerId !== null && e.pointerId !== state.pointerId) return;

          state.dragging = false;
          state.pointerId = null;
          state.justDragged = state.moved;
          viewport.classList.remove("is-dragging");
          if (viewport.releasePointerCapture) {
            viewport.releasePointerCapture(e.pointerId);
          }
          animateToEdge();
        };

        const onMouseEnter = () => {
          stopTween();
        };

        const onMouseLeave = () => {
          if (state.dragging) return;
          if (state.maxX === state.minX) return;
          animateToEdge();
        };

        track.querySelectorAll("img").forEach((img) => {
          img.setAttribute("draggable", "false");
        });

        viewport.addEventListener("pointerdown", onPointerDown);
        viewport.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerEnd);
        window.addEventListener("pointercancel", onPointerEnd);
        viewport.addEventListener("mouseenter", onMouseEnter);
        viewport.addEventListener("mouseleave", onMouseLeave);
        viewport.addEventListener(
          "click",
          (e) => {
            if (state.justDragged) {
              e.preventDefault();
              e.stopPropagation();
              state.justDragged = false;
            }
          },
          true
        );

        refresh();
        window.addEventListener("resize", () => {
          clearTimeout(track.__marqueeResizeTimer);
          track.__marqueeResizeTimer = setTimeout(refresh, 140);
        });

        track.dataset.marqueeInited = "true";
      });
    },

    initFilterTabs() {
      $(document).on("click", "[data-filter-btn]", function () {
        const group = $(this).data("group");
        const value = $(this).data("filterBtn");

        $(`[data-group='${group}'][data-filter-btn]`).removeClass("btn-primary").addClass("btn-outline");
        $(this).removeClass("btn-outline").addClass("btn-primary");

        $(`[data-group='${group}'][data-filter-item]`).each(function () {
          const itemType = $(this).data("filterItem");
          const show = value === "all" || itemType === value;
          $(this).toggleClass("hidden", !show);
        });
      });
    },

    initNoticeFilters() {
      $(document).on("input change", "#noticeSearch, #noticeCategory", function () {
        const query = ($("#noticeSearch").val() || "").toString().toLowerCase();
        const category = ($("#noticeCategory").val() || "all").toString().toLowerCase();

        $(".notice-item").each(function () {
          const text = ($(this).data("search") || "").toString().toLowerCase();
          const tag = ($(this).data("category") || "").toString().toLowerCase();
          const matchText = text.includes(query);
          const matchCat = category === "all" || tag === category;
          $(this).toggleClass("hidden", !(matchText && matchCat));
        });
      });
    },

    initAccordion() {
      $(document).on("click", "[data-accordion-btn]", function () {
        const body = $(this).closest(".faq-item").find("[data-accordion-body]");
        const expanded = $(this).attr("aria-expanded") === "true";
        $(this).attr("aria-expanded", (!expanded).toString());
        body.stop(true, true).slideToggle(180);
      });
    },

    initTeacherModal() {
      const modal = $("#teacherModal");
      if (!modal.length) return;

      $(document).on("click", "[data-teacher-btn]", function () {
        const name = $(this).data("name");
        const subject = $(this).data("subject");
        const bio = $(this).data("bio");
        const exp = $(this).data("experience");

        $("#teacherModalName").text(name || "Teacher");
        $("#teacherModalSubject").text(subject || "Subject Faculty");
        $("#teacherModalBio").text(bio || "Details will be updated soon.");
        $("#teacherModalExp").text(exp || "N/A");

        modal.removeClass("hidden").addClass("flex");
      });

      $(document).on("click", "#closeTeacherModal, #teacherModal", function (e) {
        if (e.target.id === "teacherModal" || e.target.id === "closeTeacherModal") {
          modal.removeClass("flex").addClass("hidden");
        }
      });
    },

    initGalleryLightbox() {
      const lightbox = $("#lightbox");
      const lightboxImg = $("#lightboxImg");
      if (!lightbox.length) return;

      $(document).on("click", "[data-lightbox]", function () {
        const src = $(this).attr("src");
        const alt = $(this).attr("alt") || "Gallery image";
        lightboxImg.attr({ src, alt });
        lightbox.fadeIn(160).css("display", "flex");
      });

      $(document).on("click", "#lightbox, #closeLightbox", function (e) {
        if (e.target.id === "lightbox" || e.target.id === "closeLightbox") {
          lightbox.fadeOut(160);
        }
      });
    },

    initForms() {
      $(document).on("submit", ".needs-validation", (e) => {
        e.preventDefault();
        let valid = true;

        $(e.currentTarget)
          .find("[required]")
          .each(function () {
            const hasValue = ($(this).val() || "").toString().trim().length > 0;
            $(this).toggleClass("is-invalid", !hasValue);
            if (!hasValue) valid = false;
          });

        if (!valid) {
          this.showToast("Please পূরণ করুন required field গুলো");
          return;
        }

        this.showToast("Submitted! টিম শীঘ্রই যোগাযোগ করবে");
        e.currentTarget.reset();
      });
    },

    showToast(message) {
      const toast = $("#toast");
      if (!toast.length) return;
      $("#toastMessage").text(message);
      toast.addClass("show");
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        toast.removeClass("show");
      }, 2200);
    },

    initInteractiveWidgets() {
      $("[data-current-year]").text(new Date().getFullYear());
    },

    bindGlobalEvents() {
      $(document).on("keydown", (e) => {
        if (e.key === "Escape") {
          $("#closeDrawer").trigger("click");
          $("#teacherModal").removeClass("flex").addClass("hidden");
          $("#lightbox").fadeOut(120);
        }
      });
    }
  };

  $(function () {
    App.init();
  });
})(jQuery);
