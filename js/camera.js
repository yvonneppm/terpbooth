// constants
const WIDTH = 1176, HEIGHT = 1470;
const FRAME_COUNT = 3; // number of photos to take
const FRAME_H = Math.floor(HEIGHT / FRAME_COUNT);

// dom elements
const elements = {
  video: document.getElementById('liveVideo'),
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas').getContext('2d'),
  takePhotoBtn: document.getElementById('takePhoto'),
  downloadBtn: document.getElementById('downloadBtn'),
  countdownEl: document.querySelector('.countdown-timer')
};

let photoStage = 0; // 0..FRAME_COUNT-1, then done
let frames = []; // store each captured frame as dataURL

// move video to frame position (top, middle, bottom depending on index)
const moveVideoToFrame = i => {
  const { video } = elements;
  video.style.display = 'block';
  const topPercent = (i * 100) / FRAME_COUNT;
  const heightPercent = 100 / FRAME_COUNT;
  video.style.top = topPercent + '%';
  video.style.left = '0';
  video.style.width = '100%';
  video.style.height = heightPercent + '%';
};

// keep the live video fixed and filling the container
const setVideoFull = () => {
  const { video } = elements;
  video.style.display = 'block';
  video.style.top = '0';
  video.style.left = '0';
  video.style.width = '100%';
  video.style.height = '100%';
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

// capture photo
const capturePhoto = () => {
  const { video, ctx, takePhotoBtn } = elements;
  const yOffset = photoStage * FRAME_H;
  const vW = video.videoWidth, vH = video.videoHeight;
  const targetAspect = WIDTH / FRAME_H, vAspect = vW / vH;
  let sx, sy, sw, sh;

  if (vAspect > targetAspect) { sh = vH; sw = vH * targetAspect; sx = (vW - sw) / 2; sy = 0; }
  else { sw = vW; sh = vW / targetAspect; sx = 0; sy = (vH - sh) / 2; }

  // capture this frame into an offscreen canvas and save as dataURL
  const tmp = document.createElement('canvas');
  tmp.width = WIDTH;
  tmp.height = FRAME_H;
  const tctx = tmp.getContext('2d');
  // draw non-mirrored for saved images so they appear natural
  tctx.drawImage(video, sx, sy, sw, sh, 0, 0, WIDTH, FRAME_H);
  const dataURL = tmp.toDataURL('image/png');
  frames.push(dataURL);

  // save each individual photo separately in localStorage (photo1, photo2, ...)
  try {
    localStorage.setItem(`photo${photoStage + 1}`, dataURL);
  } catch (e) {
    console.warn('Could not save individual photo to localStorage', e);
  }

  photoStage++;
  if (photoStage < FRAME_COUNT) {
    // keep preview fixed; simply re-enable the capture button for next shot
    takePhotoBtn.disabled = false;
  } else {
    finalizePhotoStrip();
  }
};

// finalize photo strip
const finalizePhotoStrip = () => {
  const { video, ctx, canvas } = elements;
  video.style.display = 'none';

  // load each captured frame into an Image and draw in order
  const imgPromises = frames.map(src => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  }));

  Promise.all(imgPromises).then(images => {
    // clear canvas then draw each image at its slot
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    images.forEach((img, idx) => {
      ctx.save();
      // mirror final strip so it matches previous behavior
      ctx.translate(WIDTH, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, WIDTH, FRAME_H, 0, idx * FRAME_H, WIDTH, FRAME_H);
      ctx.restore();
    });

    // draw decorative frame overlay if available
    const frame = new Image();
    frame.src = 'Assets/fish-photobooth/camerapage/frame.png';
    frame.onload = () => {
      ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
      localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
      setTimeout(() => window.location.href = 'final.html', 50);
    };
    frame.onerror = () => {
      // even if frame missing, save and continue
      localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
      setTimeout(() => window.location.href = 'final.html', 50);
    };
    frame.complete && frame.onload();
  }).catch(err => {
    console.error('Error loading captured images', err);
    // fallback: save whatever is on canvas
    localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
    setTimeout(() => window.location.href = 'final.html', 50);
  });
};

// download photo
const downloadPhoto = () => {
  elements.canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'photo-strip.png';
    a.click();
  }, 'image/png');
};

// setup camera
const setupCamera = () => {
  navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 2560 }, height: { ideal: 1440 }, facingMode: 'user' }, audio: false })
    .then(stream => { elements.video.srcObject = stream; elements.video.play(); setVideoFull(); })
    .catch(err => alert('Camera access failed: ' + err));
};

// setup events
const setupEventListeners = () => {
  const { takePhotoBtn, downloadBtn } = elements;

  if (takePhotoBtn) {
    takePhotoBtn.addEventListener('click', () => {
      if (photoStage >= FRAME_COUNT) return;
      takePhotoBtn.disabled = true;
      startCountdown(capturePhoto);
    });
  }

  // downloadBtn is optional on this page; only attach if present
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPhoto);
  }

  window.addEventListener('resize', () => {
    // keep the live preview full-size on resize
    setVideoFull();
  });
};

// initialize photo booth
const initPhotoBooth = () => { setupCamera(); setupEventListeners(); };
initPhotoBooth();

// logo redirect
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});