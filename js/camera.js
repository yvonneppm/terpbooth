// constants
const WIDTH = 1100;          // width of photo strip
const HEIGHT = 1600;         // enough height for 3 tall photos + gaps
const FRAME_COUNT = 3;       // number of photos to take
const GAP = 15;              // gap between stacked photos

let elements = {};
let photoStage = 0;
let frames = [];

// countdown
const startCountdown = callback => {
  let count = 3;
  const { countdownEl } = elements;
  countdownEl.textContent = count;
  countdownEl.style.display = 'flex';

  const intervalId = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else {
      clearInterval(intervalId);
      countdownEl.style.display = 'none';
      callback();
    }
  }, 1000);
};

// update progress indicator
const updateProgress = () => {
  const el = document.querySelector('.photo-progress');
  if (!el) return;
  const next = Math.min(photoStage + 1, FRAME_COUNT);
  el.textContent = `Photo ${next} of ${FRAME_COUNT}`;
};

// capture photo
/*const capturePhoto = () => {
  const { video, takePhotoBtn } = elements;
  const vW = video.videoWidth, vH = video.videoHeight;

  // offscreen canvas for one photo slot
  const tmp = document.createElement('canvas');
  tmp.width = WIDTH;
  tmp.height = (HEIGHT - GAP * (FRAME_COUNT - 1)) / FRAME_COUNT;
  const tctx = tmp.getContext('2d');

  // aspect-fit scaling
  const scale = Math.min(tmp.width / vW, tmp.height / vH);
  const drawW = vW * scale;
  const drawH = vH * scale;
  const dx = (tmp.width - drawW) / 2;
  const dy = (tmp.height - drawH) / 2;

  // mirror and draw
  tctx.save();
  tctx.translate(tmp.width, 0);
  tctx.scale(-1, 1);
  tctx.drawImage(video, 0, 0, vW, vH, tmp.width - dx - drawW, dy, drawW, drawH);
  tctx.restore();

  const dataURL = tmp.toDataURL('image/png');
  frames.push(dataURL);

  try {
    localStorage.setItem(`photo${photoStage + 1}`, dataURL);
  } catch (e) {
    console.warn('Could not save individual photo', e);
  }

  photoStage++;
  if (photoStage < FRAME_COUNT) {
    takePhotoBtn.disabled = false;
    updateProgress();
  } else {
    finalizePhotoStrip();
  }
};*/

// Robust capturePhoto (replace your old capturePhoto)
const capturePhoto = () => {
  const { video, takePhotoBtn } = elements;
  const vW = video.videoWidth, vH = video.videoHeight;
  console.log('capturePhoto called, video dims:', vW, vH);

  if (!vW || !vH) {
    console.error('Video metadata not ready (zero size). Try waiting for onloadedmetadata to fire.');
    takePhotoBtn.disabled = false;
    return;
  }

  // offscreen canvas for one photo slot
  const tmp = document.createElement('canvas');
  tmp.width = WIDTH;
  tmp.height = Math.round((HEIGHT - GAP * (FRAME_COUNT - 1)) / FRAME_COUNT);
  const tctx = tmp.getContext('2d');

  // aspect-fit scaling
  const scale = Math.min(tmp.width / vW, tmp.height / vH);
  const drawW = vW * scale;
  const drawH = vH * scale;
  const dx = (tmp.width - drawW) / 2;
  const dy = (tmp.height - drawH) / 2;

  // mirror and draw
  tctx.save();
  tctx.translate(tmp.width, 0);
  tctx.scale(-1, 1);
  // use drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh) to avoid source dimension issues
  tctx.drawImage(video, 0, 0, vW, vH, tmp.width - dx - drawW, dy, drawW, drawH);
  tctx.restore();

  const dataURL = tmp.toDataURL('image/png');
  // sanity check: dataURL must start with "data:image"
  if (!dataURL || !dataURL.startsWith('data:image')) {
    console.error('capture produced invalid dataURL', dataURL);
    takePhotoBtn.disabled = false;
    return;
  }

  frames.push(dataURL);

  try {
    localStorage.setItem(`photo${photoStage + 1}`, dataURL);
    console.log('Saved individual photo to localStorage:', `photo${photoStage + 1}`, 'len=', dataURL.length);
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


// Robust finalizePhotoStrip (replace your old finalize)
const finalizePhotoStrip = () => {
  const { canvas } = elements;
  if (!canvas) {
    console.error('Canvas element not found -- make sure <canvas id="finalCanvas"></canvas> is in this page');
    alert('Internal error: canvas missing. Check console.');
    return;
  }

  if (!frames || frames.length === 0) {
    console.error('No frames to compose! frames=', frames);
    alert('No photos captured. Try again.');
    return;
  }

  canvas.style.display = "block";
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  // load images but never reject the whole Promise if one fails
  const loaders = frames.map((src, idx) => new Promise(resolve => {
    if (!src) return resolve({ idx, img: null, ok: false, reason: 'no-src' });
    const img = new Image();
    img.onload = () => resolve({ idx, img, ok: true });
    img.onerror = (ev) => {
      console.warn('Image failed to load for frame', idx, ev);
      resolve({ idx, img: null, ok: false, reason: 'error' });
    };
    img.src = src;
  }));

  Promise.all(loaders)
    .then(results => {
      const good = results.filter(r => r.ok).map(r => r.img);
      console.log('Image load results:', results);
      if (good.length === 0) {
        throw new Error('All frame images failed to load');
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      const slotH = (HEIGHT - GAP * (FRAME_COUNT - 1)) / FRAME_COUNT;

      good.forEach((img, idx) => {
        const scale = Math.min(WIDTH / img.width, slotH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (WIDTH - w) / 2;
        const y = idx * (slotH + GAP) + (slotH - h) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);
      });

      // try to save as PNG; if quota error, fallback to JPEG compression
      try {
        const data = canvas.toDataURL('image/png');
        localStorage.setItem('photoStrip', data);
        console.log('Photo strip saved (png), length=', data.length);
        canvas.style.display = "none";
        window.location.href = 'final.html';
      } catch (e) {
        console.warn('Saving PNG failed, trying compressed JPEG', e);
        try {
          const dataJ = canvas.toDataURL('image/jpeg', 0.75);
          localStorage.setItem('photoStrip', dataJ);
          console.log('Photo strip saved (jpeg fallback), length=', dataJ.length);
          canvas.style.display = "none";
          window.location.href = 'final.html';
        } catch (e2) {
          console.error('Could not save photoStrip after JPEG fallback', e2);
          canvas.style.display = "none";
          alert('Failed to save photo to localStorage. See console for details.');
        }
      }
    })
    .catch(err => {
      console.error('Error creating photo strip', err);
      alert('Error creating photo strip — check console for details.');
      canvas.style.display = "none";
    });
};



// setup camera
const setupCamera = () => {
  navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
    audio: false
  })
  .then(stream => {
    elements.video.srcObject = stream;
    elements.video.onloadedmetadata = () => {
      elements.video.play();
      if (!elements.video.classList.contains('mirrored')) {
        elements.video.classList.add('mirrored');
      }
      updateProgress();
    };
  })
  .catch(err => alert('Camera access failed: ' + err));
};

// setup events
const setupEventListeners = () => {
  const { takePhotoBtn } = elements;
  if (takePhotoBtn) {
    takePhotoBtn.addEventListener('click', () => {
      if (photoStage >= FRAME_COUNT) return;
      takePhotoBtn.disabled = true;
      startCountdown(capturePhoto);
    });
  }
};

// init
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

document.addEventListener('DOMContentLoaded', initPhotoBooth);
