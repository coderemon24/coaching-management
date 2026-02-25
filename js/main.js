(function ($) {
  const App = {
    init() {
      this.loadSharedLayout();
      this.initGsapPlugins();
      this.initThemeFromStorage();
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
      this.bindGlobalEvents();
    },

    loadSharedLayout() {
      const loads = [];
      if ($("#site-header").length) {
        loads.push(
          new Promise((resolve) => {
            $("#site-header").load("components/header.html", () => {
              this.initHeader();
              resolve();
            });
          })
        );
      }
      if ($("#site-footer").length) {
        loads.push(
          new Promise((resolve) => {
            $("#site-footer").load("components/footer.html", () => {
              resolve();
            });
          })
        );
      }
      Promise.all(loads).then(() => {
        this.markActiveNav();
      });
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

      $(document).on("click", "[data-theme-toggle]", () => {
        this.toggleTheme();
      });

      $(document).on("click", "#openDrawer", () => {
        drawer.addClass("open");
        backdrop.addClass("show");
        $("body").css("overflow", "hidden");
      });

      $(document).on("click", "#closeDrawer, #drawerBackdrop, #mobileDrawer a", () => {
        drawer.removeClass("open");
        backdrop.removeClass("show");
        $("body").css("overflow", "");
      });
    },

    markActiveNav() {
      const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
      $("[data-nav]").removeClass("active");
      $(`[data-nav='${file}']`).addClass("active");
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
          $("#mobileDrawer").removeClass("open");
          $("#drawerBackdrop").removeClass("show");
          $("#teacherModal").removeClass("flex").addClass("hidden");
          $("#lightbox").fadeOut(120);
          $("body").css("overflow", "");
        }
      });
    }
  };

  $(function () {
    App.init();
  });
})(jQuery);
