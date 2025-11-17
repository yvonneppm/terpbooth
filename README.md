#The TerpBooth#

The TerpBooth is a UMD-themed digital photobooth that lets users take photos directly from their browser, place them inside custom UMD-style photo frames, and download the final image. Built with HTML, CSS, and JavaScript, it recreates the interactive photobooth experience in a simple and accessible web app.

⭐ Features

📸 Live camera preview using the browser’s getUserMedia API

🔴 Capture photos with one click

🎨 UMD-themed photo frames for a Terp-inspired design

🖼️ Automatically inserts your pictures into the frame layout

💾 Download your photo strip with a single button

🖥️ Works fully in-browser — no backend needed

🛠️ How We Built It

TerpBooth is built using:

HTML — page structure and interface layout

CSS — styling, positioning, and UI polish

JavaScript — camera access, canvas image generation, frame placement, and download logic

Canvas API — combines user photos + frames into one downloadable image

Local assets — custom UMD-themed frames and UI graphics

We kept the project lightweight and dependency-free so it can run in any modern browser.

🚧 Challenges We Ran Into

One challenge was positioning images inside the photo frame borders. Different screen sizes changed how the camera feed scaled, so getting the pictures to sit perfectly inside the design took careful CSS adjustments.

Another issue was the download format. When exporting using <canvas>, the final image sometimes appeared squished or stretched, depending on the aspect ratio. Fixing this required us to manually calculate scaling, preserve proportions, and ensure the canvas size matched the design exactly.

🎉 Accomplishments We’re Proud Of

We’re proud that we built a fully functional photobooth from scratch in a short period — including camera capture, frame graphics, animations, and a clean UI. The project feels fun, interactive, and very UMD-coded.

📚 What We Learned

How to work with browser cameras and real-time video

How to draw images onto a canvas and export them

How important aspect ratios are when mixing images

How to structure a multi-page web project
