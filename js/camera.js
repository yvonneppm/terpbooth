 // constants
const WIDTH = 1100, HEIGHT = 900;
const FRAME_COUNT = 3; // number of photos to take
const FRAME_H = Math.floor(HEIGHT / FRAME_COUNT);

// dom elements (will be initialized when DOM is ready)
let elements = {};

let photoStage = 0; // 0..FRAME_COUNT-1, then done
let frames = []; // store each captured frame as dataURL

// keep the live video fixed and filling the container
const setVideoFull = () => {
  const { video } = elements;
  if (!video) return;
  video.style.display = 'block';
};

// countdown
const startCountdown = callback => {
  let count = 3;
  const { countdownEl } = elements;
  countdownEl.textContent = count;
  countdownEl.style.display = 'flex';
  const intervalId = setInterval(() => {
    count--;
    if (count > 0) countdownEl.textContent = count;
    else {
      clearInterval(intervalId);
      countdownEl.style.display = 'none';
      callback();
    }
  }, 1000);
};

// update the small progress indicator (Photo X of N)
const updateProgress = () => {
  const el = document.querySelector('.photo-progress');
  if (!el) return;
  const next = Math.min(photoStage + 1, FRAME_COUNT);
  el.textContent = `Photo ${next} of ${FRAME_COUNT}`;
};

// capture photo
const capturePhoto = () => {
  const { video, takePhotoBtn } = elements;
  const vW = video.videoWidth, vH = video.videoHeight;
  
  // Use center crop with consistent aspect ratio
  const targetAspect = WIDTH / FRAME_H;
  const vAspect = vW / vH;
  
  let sx, sy, sw, sh;
  if (vAspect > targetAspect) {
    // Video is wider - crop sides
    sh = vH;
    sw = vH * targetAspect;
    sx = (vW - sw) / 2;
    sy = 0;
  } else {
    // Video is taller - crop top/bottom
    sw = vW;
    sh = vW / targetAspect;
    sx = 0;
    sy = (vH - sh) / 2;
  }

  // capture this frame into an offscreen canvas
  const tmp = document.createElement('canvas');
  tmp.width = WIDTH;
  tmp.height = FRAME_H;
  const tctx = tmp.getContext('2d', { 
    alpha: false,
    colorSpace: 'srgb',
    willReadFrequently: false
  });
  
  // Fill with black background first to ensure proper color rendering
  tctx.fillStyle = '#000000';
  tctx.fillRect(0, 0, WIDTH, FRAME_H);
  
  // draw mirrored into the offscreen canvas
  tctx.save();
  tctx.translate(WIDTH, 0);
  tctx.scale(-1, 1);
  tctx.drawImage(video, sx, sy, sw, sh, 0, 0, WIDTH, FRAME_H);
  tctx.restore();
  
  const dataURL = tmp.toDataURL('image/jpeg', 0.95); // Use JPEG with high quality
  frames.push(dataURL);

  // save each individual photo separately in localStorage
  try {
    localStorage.setItem(`photo${photoStage + 1}`, dataURL);
  } catch (e) {
    console.warn('Could not save individual photo to localStorage', e);
  }

  photoStage++;
  if (photoStage < FRAME_COUNT) {
    takePhotoBtn.disabled = false;
    updateProgress();
  } else {
    finalizePhotoStrip();
  }
};

// finalize photo strip
const finalizePhotoStrip = () => {
  const { canvas } = elements;
  
  // Set canvas to proper photo strip dimensions
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d', { 
    alpha: true,
    colorSpace: 'srgb',
    willReadFrequently: false
  });

  // load each captured frame into an Image
  const imgPromises = frames.map(src => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  }));

  Promise.all(imgPromises).then(images => {
    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Draw each image stacked vertically with gaps
    const gap = 15; // Gap between photos
    const totalGapSpace = gap * (FRAME_COUNT - 1);
    const photoHeight = (HEIGHT - totalGapSpace) / FRAME_COUNT;
    
    images.forEach((img, idx) => {
      const yPos = idx * (photoHeight + gap);
      ctx.drawImage(img, 0, yPos, WIDTH, photoHeight);
    });

    // Save photo strip without frame
    try {
      localStorage.setItem('photoStrip', canvas.toDataURL('image/jpeg', 0.95));
    } catch (e) {
      console.warn('Could not save photoStrip', e);
    }
    
    // Automatically navigate to the final page
    setTimeout(() => {
      window.location.href = 'final.html';
    }, 100);
    
  }).catch(err => {
    console.error('Error loading captured images', err);
    alert('Error creating photo strip. Please try again.');
  });
};

// setup camera
const setupCamera = () => {
  navigator.mediaDevices.getUserMedia({ 
    video: { 
      width: { ideal: 1920 }, 
      height: { ideal: 1080 }, 
      facingMode: 'user' 
    }, 
    audio: false 
  })
  .then(stream => { 
    elements.video.srcObject = stream; 
    elements.video.play(); 
    setVideoFull();
    
    // mirror the live preview
    if (elements.video && !elements.video.classList.contains('mirrored')) {
      elements.video.classList.add('mirrored');
    }
    updateProgress(); 
  })
  .catch(err => alert('Camera access failed: ' + err));
};

// setup events
const setupEventListeners = () => {
  const { takePhotoBtn } = elements;

  if (takePhotoBtn) {
    takePhotoBtn.addEventListener('click', () => {
      console.log('Capture button clicked, stage:', photoStage);
      if (photoStage >= FRAME_COUNT) return;
      takePhotoBtn.disabled = true;
      startCountdown(capturePhoto);
    });
  }

  window.addEventListener('resize', () => {
    setVideoFull();
  });
};

// initialize photo booth
const initPhotoBooth = () => {
  elements = {
    video: document.getElementById('liveVideo'),
    canvas: document.getElementById('finalCanvas'),
    takePhotoBtn: document.getElementById('takePhoto'),
    countdownEl: document.querySelector('.countdown-timer'),
    booth: document.getElementById('booth')
  };

  setupCamera();
  setupEventListeners();
};

// wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initPhotoBooth);

// logo redirect
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});