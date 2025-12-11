document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initMiniHistogram();
  initShowcaseHover();
});

const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

function initNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove("active");
      }
    });
  }
}

function initMiniHistogram() {
  const canvas = document.getElementById("miniHistogram");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = "#0e0e10";
  ctx.fillRect(0, 0, width, height);

  const redData = generateRandomHistogramData();
  const greenData = generateRandomHistogramData();
  const blueData = generateRandomHistogramData();

  drawHistogramChannel(ctx, redData, "rgba(255, 68, 68, 0.5)", width, height);
  drawHistogramChannel(ctx, greenData, "rgba(68, 255, 68, 0.5)", width, height);
  drawHistogramChannel(ctx, blueData, "rgba(68, 68, 255, 0.5)", width, height);

  ctx.strokeStyle = "#2b2b2d";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function generateRandomHistogramData() {
  const data = [];
  const segments = 256;

  let value = Math.random() * 0.3;

  for (let i = 0; i < segments; i++) {
    value += (Math.random() - 0.5) * 0.1;
    value = Math.max(0, Math.min(1, value));

    if (i > segments * 0.3 && i < segments * 0.7) {
      value += Math.random() * 0.3;
    }

    data.push(value);
  }

  return data;
}

function drawHistogramChannel(ctx, data, color, width, height) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color.replace("0.5", "0.8");
  ctx.lineWidth = 1;

  const barWidth = width / data.length;

  ctx.beginPath();
  ctx.moveTo(0, height);

  data.forEach((value, index) => {
    const x = index * barWidth;
    const barHeight = value * height;
    const y = height - barHeight;

    if (index === 0) {
      ctx.lineTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
}

function initShowcaseHover() {
  const showcaseItems = document.querySelectorAll(".showcase-item");

  showcaseItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      const exifData = item.dataset.exif;
      if (exifData) {
        item.classList.add("active");
      }
    });

    item.addEventListener("mouseleave", () => {
      item.classList.remove("active");
    });
  });
}

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(14, 14, 16, 0.98)";
  } else {
    navbar.style.background = "rgba(14, 14, 16, 0.95)";
  }
});
