# ⚡ PRAKASH 3D ADVENTURE ⚡

A modern, high-octane 3D endless runner and adventure browser game featuring **Prakash**!

Explore a cyberpunk metropolis at warp speed, collect glowing diamonds, weave through laser barriers and energy monoliths, and view giant 3D holographic billboards of Prakash towering above the neon skyline!

---

## 🎮 Game Highlights & Features

- **Personal Photos in Full 3D**:
  - **Start Archway**: Massive 3D entrance archway displaying both portraits of Prakash.
  - **3D Highway Monoliths**: Towering roadside billboards featuring Prakash on left and right pylons with custom neon spotlights.
  - **Overhead Skybridges**: Elevated cyberbridges spanning across all lanes with giant holographic photo displays.
  - **Interactive Pilot Showcase**: Choose between *Bridge Explorer* (Photo 1) and *Skyline Master* (Photo 2) as your active HUD pilot!
- **Endless 3D Cyber City**:
  - High-speed 3-lane highway with glowing cyan grid lines and magenta neon guardrails.
  - Procedurally generated skyscrapers with illuminated office windows and roof beacons.
  - Flying hovercrafts streaking across the starfield.
- **Juicy Runner Mechanics**:
  - Smooth lane switching with dynamic roll banking tilt.
  - Full jump and ground slide physics.
  - **Power-Ups**:
    - 🧲 **Diamond Magnet**: Draws all diamonds from all lanes toward Prakash.
    - 🛡️ **Energy Shield**: Absorbs obstacle collisions.
    - ⚡ **Hyper Nitro**: Invincible turbo speed dash that smashes obstacles.
- **Built-in Synthesizer Audio**:
  - 100% synthesized sound effects & cyberpunk synthwave music via Web Audio API. Zero external audio downloads needed!
- **Cross-Platform Responsive Controls**:
  - **Desktop**: Keyboard arrows, WASD, Space to jump, ESC to pause.
  - **Mobile**: Touch swipe gestures (swipe left/right/up/down) + on-screen neon touch buttons.

---

## 🕹️ Controls Guide

| Action | Desktop Keyboard | Mobile Touch |
| :--- | :--- | :--- |
| **Move Left** | `◀ Left Arrow` or `A` | Swipe Left or Tap `◀` button |
| **Move Right** | `▶ Right Arrow` or `D` | Swipe Right or Tap `▶` button |
| **Jump** | `Space`, `▲ Up Arrow`, or `W` | Swipe Up or Tap `▲ JUMP` button |
| **Roll / Slide** | `▼ Down Arrow` or `S` | Swipe Down |
| **Pause / Resume** | `Escape` or `P` | Tap `⏸️` button |

---

## 📁 Project Structure

```text
Prakash/
├── index.html         # Main HTML5 semantic structure & UI overlays
├── style.css          # Futuristic cyberpunk styling & mobile responsive rules
├── script.js          # Three.js 3D engine, gameplay physics, and Web Audio synth
├── start_game.bat     # One-click local web server launcher
├── README.md          # Complete documentation & GitHub Pages deployment guide
└── assets/
    ├── prakash1.jpg   # Photo 1 (Prakash on bridge in blue shirt)
    ├── prakash2.jpg   # Photo 2 (Prakash in Dubai skyline in maroon shirt)
    ├── photos.js      # Base64 fallback helper for local file preview
    └── three.min.js   # Three.js r128 offline library
```

---

## 🚀 How to Run Locally

### Option 1: One-Click Launcher (Windows)
Simply double-click `start_game.bat` inside the folder. It will start a local server and automatically open the game in your default browser!

### Option 2: Using Node.js or Python
Open your terminal in the `Prakash` directory and run:

**Using Python:**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

**Using Node.js:**
```bash
npx serve .
```

---

## 🌐 How to Publish for Free to GitHub Pages

You can host **PRAKASH 3D ADVENTURE** online for free using GitHub Pages so your friends and family can play it on their phones and computers anywhere!

### Step 1: Create a GitHub Repository
1. Log in to [GitHub](https://github.com).
2. Click the **+** icon in the top-right corner and select **New repository**.
3. Name your repository (e.g., `prakash-3d-adventure`).
4. Set the visibility to **Public**.
5. Do **NOT** check "Initialize this repository with a README" (we already have one).
6. Click **Create repository**.

### Step 2: Push the Files to GitHub
Open your terminal inside this folder (`c:\Users\bhada\OneDrive\Desktop\Prakash`) and run the following commands (replace `YOUR-USERNAME` with your actual GitHub username):

```bash
git init
git add .
git commit -m "Initial commit - PRAKASH 3D ADVENTURE"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/prakash-3d-adventure.git
git push -u origin main
```

*(Alternatively, if you prefer not using git commands, you can click **"uploading an existing file"** on your GitHub repository page and drag-and-drop all files and folders directly!)*

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub.
2. Click **Settings** (tab on the top right).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - Source: Select **Deploy from a branch**.
   - Branch: Select **main** and folder **/(root)**.
   - Click **Save**.
5. Wait 1–2 minutes, then refresh the page.
6. GitHub will display a banner with your live URL:
   `https://YOUR-USERNAME.github.io/prakash-3d-adventure/`

**You're live!** Share the link and enjoy the adventure!
