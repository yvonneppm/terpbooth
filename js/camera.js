// constants
const WIDTH = 1176, HEIGHT = 1470;
<<<<<<< HEAD
const FRAME_COUNT = 3; // number of photos to take
const FRAME_H = Math.floor(HEIGHT / FRAME_COUNT);
=======
const TOTAL_PHOTOS = 3;
>>>>>>> af5472c4292870b1b7d8ac03b463a808e8eb15d7

// dom elements
const elements = {
  video: document.getElementById('liveVideo'),
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas').getContext('2d'),
  takePhotoBtn: document.getElementById('takePhoto'),
  readyButton: document.getElementById('readyButton'),
  countdownEl: document.querySelector('.countdown-timer')
};

<<<<<<< HEAD
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
=======
let capturedPhotos = []; // Array to store all captured photos
let currentPhotoCount = 0;

// Initialize video positioning
const setupVideo = () => {
  const { video } = elements;
  video.style.display = 'block';
  video.style.position = 'absolute';
  video.style.top = '0';
  video.style.left = '0';
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';
>>>>>>> af5472c4292870b1b7d8ac03b463a808e8eb15d7
};

// Countdown function
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

// Capture individual photo
const capturePhoto = () => {
<<<<<<< HEAD
  const { video, ctx, takePhotoBtn } = elements;
  const yOffset = photoStage * FRAME_H;
  const vW = video.videoWidth, vH = video.videoHeight;
  const targetAspect = WIDTH / FRAME_H, vAspect = vW / vH;
=======
  const { video, ctx } = elements;
  
  // Create a temporary canvas for the individual photo
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  // Set temp canvas size
  tempCanvas.width = WIDTH;
  tempCanvas.height = HEIGHT;
  
  const vW = video.videoWidth, vH = video.videoHeight;
  const targetAspect = WIDTH / HEIGHT, vAspect = vW / vH;
>>>>>>> af5472c4292870b1b7d8ac03b463a808e8eb15d7
  let sx, sy, sw, sh;

  // Calculate cropping to fit our desired aspect ratio
  if (vAspect > targetAspect) { 
    sh = vH; 
    sw = vH * targetAspect; 
    sx = (vW - sw) / 2; 
    sy = 0; 
  } else { 
    sw = vW; 
    sh = vW / targetAspect; 
    sx = 0; 
    sy = (vH - sh) / 2; 
  }

<<<<<<< HEAD
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
=======
  // Draw mirrored image to temp canvas
  tempCtx.save();
  tempCtx.translate(WIDTH, 0);
  tempCtx.scale(-1, 1);
  tempCtx.drawImage(video, sx, sy, sw, sh, 0, 0, WIDTH, HEIGHT);
  tempCtx.restore();

  // Save the photo data URL to our array
  const photoData = tempCanvas.toDataURL('image/png');
  capturedPhotos.push(photoData);
  
  currentPhotoCount++;
  
  // Update UI to show progress
  updateProgress();
  
  // Check if we've captured all photos
  if (currentPhotoCount >= TOTAL_PHOTOS) {
    finalizeCaptureSession();
  } else {
    // Re-enable button for next photo
    elements.takePhotoBtn.disabled = false;
    elements.takePhotoBtn.textContent = `Capture Photo ${currentPhotoCount + 1}/${TOTAL_PHOTOS}`;
>>>>>>> af5472c4292870b1b7d8ac03b463a808e8eb15d7
  }
};

// Update progress display
const updateProgress = () => {
  console.log(`Captured ${currentPhotoCount}/${TOTAL_PHOTOS} photos`);
  // You could add a visual progress indicator here
  const progress = document.getElementById('progress') || createProgressIndicator();
  progress.textContent = `Photo ${currentPhotoCount}/${TOTAL_PHOTOS}`;
};

// Create progress indicator
const createProgressIndicator = () => {
  const progress = document.createElement('div');
  progress.id = 'progress';
  progress.style.cssText = `
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 18px;
    z-index: 100;
  `;
  document.querySelector('.photobooth-container').appendChild(progress);
  return progress;
};

// Finalize the capture session
const finalizeCaptureSession = () => {
  const { video, takePhotoBtn, readyButton } = elements;
  
  // Hide video, show ready button
  video.style.display = 'none';
<<<<<<< HEAD

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
=======
  takePhotoBtn.style.display = 'none';
  readyButton.style.display = 'inline-block';
  readyButton.disabled = false;
  
  // Save all photos to localStorage
  savePhotosToStorage();
  
  console.log('All photos captured:', capturedPhotos);
>>>>>>> af5472c4292870b1b7d8ac03b463a808e8eb15d7
};

// Save photos to localStorage
const savePhotosToStorage = () => {
  // Save each photo individually
  capturedPhotos.forEach((photoData, index) => {
    localStorage.setItem(`capturedPhoto_${index}`, photoData);
  });
  
  // Save the count and timestamp
  localStorage.setItem('totalCapturedPhotos', capturedPhotos.length);
  localStorage.setItem('captureSession', Date.now().toString());
  
  console.log('Photos saved to localStorage');
};

// Reset for new session
const resetCaptureSession = () => {
  const { video, takePhotoBtn, readyButton } = elements;
  
  capturedPhotos = [];
  currentPhotoCount = 0;
  
  // Reset UI
  video.style.display = 'block';
  takePhotoBtn.style.display = 'inline-block';
  takePhotoBtn.disabled = false;
  takePhotoBtn.textContent = `Capture Photo 1/${TOTAL_PHOTOS}`;
  readyButton.style.display = 'none';
  readyButton.disabled = true;
  
  // Clear progress
  const progress = document.getElementById('progress');
  if (progress) progress.remove();
};

// Setup camera
const setupCamera = () => {
<<<<<<< HEAD
  navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 2560 }, height: { ideal: 1440 }, facingMode: 'user' }, audio: false })
    .then(stream => { elements.video.srcObject = stream; elements.video.play(); setVideoFull(); })
    .catch(err => alert('Camera access failed: ' + err));
=======
  navigator.mediaDevices.getUserMedia({ 
    video: { 
      width: { ideal: 2560 }, 
      height: { ideal: 1440 }, 
      facingMode: 'user' 
    }, 
    audio: false 
  })
  .then(stream => { 
    elements.video.srcObject = stream; 
    elements.video.play(); 
    setupVideo(); 
  })
  .catch(err => {
    console.error('Camera access failed:', err);
    alert('Camera access failed: ' + err.message);
  });
>>>>>>> af5472c4292870b1b7d8ac03b463a808e8eb15d7
};

// Setup event listeners
const setupEventListeners = () => {
  const { takePhotoBtn, readyButton } = elements;

<<<<<<< HEAD
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
=======
  takePhotoBtn.addEventListener('click', () => {
    if (currentPhotoCount >= TOTAL_PHOTOS) return;
    takePhotoBtn.disabled = true;
    startCountdown(capturePhoto);
  });

  readyButton.addEventListener('click', () => {
    // Navigate to frame selection page
    window.location.href = 'frames.html'; // or whatever your next page is
  });

  // Handle page refresh/close - save progress
  window.addEventListener('beforeunload', () => {
    if (capturedPhotos.length > 0) {
      savePhotosToStorage();
    }
>>>>>>> af5472c4292870b1b7d8ac03b463a808e8eb15d7
  });
};

// Initialize photo booth
const initPhotoBooth = () => { 
  // Check for existing session
  const savedCount = localStorage.getItem('totalCapturedPhotos');
  if (savedCount && savedCount > 0) {
    if (confirm('You have unsaved photos. Start new session?')) {
      clearPhotoStorage();
    } else {
      window.location.href = 'frames.html';
      return;
    }
  }
  
  setupCamera(); 
  setupEventListeners(); 
  
  // Initialize button text
  elements.takePhotoBtn.textContent = `Capture Photo 1/${TOTAL_PHOTOS}`;
};

// Clear stored photos
const clearPhotoStorage = () => {
  for (let i = 0; i < TOTAL_PHOTOS; i++) {
    localStorage.removeItem(`capturedPhoto_${i}`);
  }
  localStorage.removeItem('totalCapturedPhotos');
  localStorage.removeItem('captureSession');
};

// Initialize when ready
document.addEventListener('DOMContentLoaded', initPhotoBooth);