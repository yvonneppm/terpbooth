// constants
const WIDTH = 1176, HEIGHT = 1470;
const TOTAL_PHOTOS = 3;

// dom elements
const elements = {
  video: document.getElementById('liveVideo'),
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas').getContext('2d'),
  takePhotoBtn: document.getElementById('takePhoto'),
  readyButton: document.getElementById('readyButton'),
  countdownEl: document.querySelector('.countdown-timer')
};

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
  const { video, ctx } = elements;
  
  // Create a temporary canvas for the individual photo
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  // Set temp canvas size
  tempCanvas.width = WIDTH;
  tempCanvas.height = HEIGHT;
  
  const vW = video.videoWidth, vH = video.videoHeight;
  const targetAspect = WIDTH / HEIGHT, vAspect = vW / vH;
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
  takePhotoBtn.style.display = 'none';
  readyButton.style.display = 'inline-block';
  readyButton.disabled = false;
  
  // Save all photos to localStorage
  savePhotosToStorage();
  
  console.log('All photos captured:', capturedPhotos);
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
};

// Setup event listeners
const setupEventListeners = () => {
  const { takePhotoBtn, readyButton } = elements;

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