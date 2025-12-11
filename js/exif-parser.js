class EXIFParser {
  constructor() {
    this.exifData = {};
  }

  //   async parseFile(file) {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();

  //       reader.onload = (e) => {
  //         try {
  //           const arrayBuffer = e.target.result;
  //           const dataView = new DataView(arrayBuffer);

  //           const exifData = this.extractBasicEXIF(dataView);

  //           this.exifData = exifData;
  //           resolve(exifData);
  //         } catch (error) {
  //           console.error("EXIF parsing error:", error);
  //           resolve(this.generateMockEXIF());
  //         }
  //       };

  //       reader.onerror = () => {
  //         resolve(this.generateMockEXIF());
  //       };

  //       reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
  //     });
  //   }

  async parseFile(file) {
    return new Promise((resolve, reject) => {
      EXIF.getData(file, () => {
        const exif = EXIF.getAllTags(file);

        if (!exif || Object.keys(exif).length === 0) {
          console.warn("No EXIF data found, using fallback.");
          const mock = this.generateMockEXIF();
          this.exifData = mock;
          resolve(mock);
          return;
        }

        const parsed = this.normalizeEXIF(exif);
        this.exifData = parsed;
        resolve(parsed);
      });
    });
  }

  //   extractBasicEXIF(dataView) {
  //     const jpegMarker = dataView.getUint16(0, false);

  //     if (jpegMarker === 0xffd8) {
  //       return this.parseJPEGEXIF(dataView);
  //     }

  //     return this.generateMockEXIF();
  //   }

  //   parseJPEGEXIF(dataView) {
  //     return this.generateMockEXIF();
  //   }

  normalizeEXIF(raw) {
    return {
      make: raw.Make || "Unknown",
      model: raw.Model || "Unknown",
      focalLength: raw.FocalLength ? raw.FocalLength + "mm" : "Unknown",
      aperture: raw.FNumber ? `f/${raw.FNumber}` : "Unknown",
      shutterSpeed: raw.ExposureTime
        ? this.formatShutter(raw.ExposureTime)
        : "Unknown",
      iso: raw.ISOSpeedRatings || "Unknown",
      exposureBias: raw.ExposureBiasValue
        ? raw.ExposureBiasValue + " EV"
        : "0 EV",
      whiteBalance: raw.WhiteBalance === 0 ? "Auto" : "Manual",
      flash: raw.Flash ? (raw.Flash === 1 ? "Fired" : "Not Fired") : "Unknown",
      meteringMode: this.mapMeteringMode(raw.MeteringMode),
      dateTime: raw.DateTimeOriginal || raw.DateTime || "Unknown",
      lens: raw.LensModel || "Unknown Lens",
    };
  }

  formatShutter(value) {
    if (value >= 1) return value + "s";
    return `1/${Math.round(1 / value)}s`;
  }

  mapMeteringMode(mode) {
    const table = {
      1: "Average",
      2: "Center-weighted",
      3: "Spot",
      5: "Matrix",
    };
    return table[mode] || "Unknown";
  }

  // generateMockEXIF() {
  //     const cameras = [
  //         { make: 'Canon', model: 'EOS R5' },
  //         { make: 'Sony', model: 'A7 III' },
  //         { make: 'Nikon', model: 'Z6 II' },
  //         { make: 'Fujifilm', model: 'X-T4' }
  //     ];

  //     const focalLengths = ['24mm', '35mm', '50mm', '85mm', '100mm'];
  //     const apertures = ['f/1.4', 'f/1.8', 'f/2.8', 'f/4', 'f/5.6', 'f/8'];
  //     const shutterSpeeds = ['1/30s', '1/60s', '1/125s', '1/250s', '1/500s', '1/1000s'];
  //     const isos = ['100', '200', '400', '800', '1600', '3200'];

  //     const camera = cameras[Math.floor(Math.random() * cameras.length)];

  //     return {
  //         make: camera.make,
  //         model: camera.model,
  //         focalLength: focalLengths[Math.floor(Math.random() * focalLengths.length)],
  //         aperture: apertures[Math.floor(Math.random() * apertures.length)],
  //         shutterSpeed: shutterSpeeds[Math.floor(Math.random() * shutterSpeeds.length)],
  //         iso: isos[Math.floor(Math.random() * isos.length)],
  //         exposureBias: (Math.random() * 2 - 1).toFixed(1) + ' EV',
  //         whiteBalance: ['Auto', 'Daylight', 'Cloudy', 'Tungsten'][Math.floor(Math.random() * 4)],
  //         flash: Math.random() > 0.5 ? 'Fired' : 'Not Fired',
  //         meteringMode: ['Matrix', 'Center-weighted', 'Spot'][Math.floor(Math.random() * 3)],
  //         dateTime: new Date().toISOString().split('T')[0],
  //         lens: `${camera.make} 24-70mm f/2.8`
  //     };
  // }

  generateMockEXIF() {
    return {
      make: "Unknown",
      model: "Unknown",
      focalLength: "Unknown",
      aperture: "Unknown",
      shutterSpeed: "Unknown",
      iso: "Unknown",
      exposureBias: "0 EV",
      whiteBalance: "Auto",
      flash: "Unknown",
      meteringMode: "Unknown",
      dateTime: "Unknown",
      lens: "Unknown Lens",
    };
  }

  getEXIFData() {
    return this.exifData;
  }
}

class HistogramGenerator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  async generateFromImage(imageElement) {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    const maxSize = 800;
    let width = imageElement.naturalWidth;
    let height = imageElement.naturalHeight;

    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = width * ratio;
      height = height * ratio;
    }

    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.drawImage(imageElement, 0, 0, width, height);

    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const red = new Array(256).fill(0);
    const green = new Array(256).fill(0);
    const blue = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      red[data[i]]++;
      green[data[i + 1]]++;
      blue[data[i + 2]]++;
    }

    const maxValue = Math.max(...red, ...green, ...blue);

    for (let i = 0; i < 256; i++) {
      red[i] = red[i] / maxValue;
      green[i] = green[i] / maxValue;
      blue[i] = blue[i] / maxValue;
    }

    this.drawHistogram(red, green, blue);

    return { red, green, blue };
  }

  drawHistogram(red, green, blue) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.fillStyle = "#0e0e10";
    this.ctx.fillRect(0, 0, width, height);

    this.drawGrid(width, height);

    this.drawChannel(red, "rgba(255, 68, 68, 0.5)", width, height);
    this.drawChannel(green, "rgba(68, 255, 68, 0.5)", width, height);
    this.drawChannel(blue, "rgba(68, 68, 255, 0.5)", width, height);
  }

  drawGrid(width, height) {
    this.ctx.strokeStyle = "#2b2b2d";
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    for (let i = 0; i <= 5; i++) {
      const x = (width / 5) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
  }

  drawChannel(data, color, width, height) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color.replace("0.5", "0.8");
    this.ctx.lineWidth = 1.5;

    const barWidth = width / data.length;

    this.ctx.beginPath();
    this.ctx.moveTo(0, height);

    data.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.9;
      const y = height - barHeight;

      if (index === 0) {
        this.ctx.lineTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });

    this.ctx.lineTo(width, height);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }
}

class SmartTipsEngine {
  constructor(exifData, histogramData) {
    this.exif = exifData;
    this.histogram = histogramData;
    this.tips = [];
  }

  generateTips() {
    this.tips = [];

    this.analyzeExposure();
    this.analyzeISO();
    this.analyzeAperture();
    this.analyzeShutterSpeed();
    this.analyzeHistogram();

    return this.tips;
  }

  analyzeExposure() {
    const exposureBias = parseFloat(this.exif.exposureBias);

    if (exposureBias > 0.5) {
      this.tips.push({
        title: "Exposure Compensation Detected",
        description: `Your image has +${exposureBias} EV compensation. This brightens the overall exposure. Great for high-key photography or preventing underexposure in backlit scenes.`,
        type: "info",
      });
    } else if (exposureBias < -0.5) {
      this.tips.push({
        title: "Negative Exposure Compensation",
        description: `You used ${exposureBias} EV compensation. This darkens the image, useful for preserving highlights or creating moody, dramatic shots.`,
        type: "info",
      });
    }
  }

  analyzeISO() {
    const iso = parseInt(this.exif.iso);

    if (iso >= 1600) {
      this.tips.push({
        title: "High ISO Warning",
        description: `ISO ${iso} may introduce visible noise. Consider using a wider aperture, slower shutter speed, or additional lighting to lower ISO. Use noise reduction in post-processing.`,
        type: "warning",
      });
    } else if (iso <= 200) {
      this.tips.push({
        title: "Optimal ISO Range",
        description: `ISO ${iso} is excellent for image quality with minimal noise. Perfect for well-lit conditions and when maximum detail is required.`,
        type: "success",
      });
    }
  }

  analyzeAperture() {
    const aperture = this.exif.aperture;
    const fNumber = parseFloat(aperture.replace("f/", ""));

    if (fNumber <= 2.0) {
      this.tips.push({
        title: "Wide Aperture Benefits",
        description: `${aperture} creates beautiful bokeh and shallow depth of field. Great for portraits and isolating subjects. Watch for sharp focus on your subject's eyes.`,
        type: "success",
      });
    } else if (fNumber >= 11) {
      this.tips.push({
        title: "Deep Depth of Field",
        description: `${aperture} provides extensive focus range, ideal for landscapes and architecture. Be aware of potential diffraction at very small apertures (f/16+).`,
        type: "info",
      });
    }
  }

  analyzeShutterSpeed() {
    const shutter = this.exif.shutterSpeed;
    const speed = this.parseShutterSpeed(shutter);

    if (speed < 1 / 60) {
      this.tips.push({
        title: "Slow Shutter Speed",
        description: `${shutter} risks camera shake. Use a tripod or increase ISO/aperture. As a rule of thumb, use 1/focal_length minimum for handheld shots.`,
        type: "warning",
      });
    } else if (speed >= 1 / 1000) {
      this.tips.push({
        title: "Fast Shutter Speed",
        description: `${shutter} freezes motion perfectly. Excellent for sports, wildlife, and action photography. Ensure adequate light to maintain proper exposure.`,
        type: "success",
      });
    }
  }

  analyzeHistogram() {
    if (!this.histogram) return;

    const { red, green, blue } = this.histogram;

    const leftClipping = this.checkClipping(red, green, blue, 0, 10);
    const rightClipping = this.checkClipping(red, green, blue, 245, 255);

    if (leftClipping > 0.05) {
      this.tips.push({
        title: "Shadow Clipping Detected",
        description:
          "Your histogram shows clipped shadows (pure black areas). Consider increasing exposure or using fill light to recover shadow detail.",
        type: "warning",
      });
    }

    if (rightClipping > 0.05) {
      this.tips.push({
        title: "Highlight Clipping Detected",
        description:
          "Blown highlights detected in your image. Reduce exposure or use graduated filters to preserve highlight detail, especially in skies.",
        type: "warning",
      });
    }

    const midtoneBalance = this.analyzeMidtones(red, green, blue);
    if (midtoneBalance === "centered") {
      this.tips.push({
        title: "Well-Balanced Exposure",
        description:
          "Your histogram shows excellent tonal distribution with good midtone balance. This indicates proper exposure for the scene.",
        type: "success",
      });
    }
  }

  checkClipping(red, green, blue, start, end) {
    let total = 0;
    let clipped = 0;

    for (let i = 0; i < 256; i++) {
      total += red[i] + green[i] + blue[i];
      if (i >= start && i <= end) {
        clipped += red[i] + green[i] + blue[i];
      }
    }

    return clipped / total;
  }

  analyzeMidtones(red, green, blue) {
    let midtoneSum = 0;
    for (let i = 85; i < 170; i++) {
      midtoneSum += red[i] + green[i] + blue[i];
    }

    let totalSum = 0;
    for (let i = 0; i < 256; i++) {
      totalSum += red[i] + green[i] + blue[i];
    }

    const ratio = midtoneSum / totalSum;

    if (ratio > 0.4) {
      return "centered";
    } else {
      return "skewed";
    }
  }

  parseShutterSpeed(shutter) {
    const match = shutter.match(/1\/(\d+)/);
    if (match) {
      return 1 / parseInt(match[1]);
    }
    return parseFloat(shutter);
  }
}
