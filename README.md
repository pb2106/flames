# 💘 FLAMES Crush Lab — Valentine Edition

> A playful, nostalgic, and delightfully romantic web application themed around Valentine's Day and the classic 90s/2000s playground relationship-forecasting game **FLAMES**!

![FLAMES Crush Lab Preview](https://img.shields.io/badge/FLAMES-Valentine%20Edition-ff3366?style=for-the-badge&logo=heart)
![Vercel Compatible](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

---

## 💕 What is FLAMES?

**FLAMES** is a nostalgic schoolyard game used to calculate romantic chemistry between two people by striking common letters in their names and eliminating outcomes through cyclic modulo arithmetic:

* **F** — **Friends** (The Platonic Soulmate 🤝)
* **L** — **Lovers** (Electric Sparks & Stolen Glances 🎯)
* **A** — **Affection** (Warm Hugs & Chocolate Boxes 🍫)
* **M** — **Marriage** (Forever Bound 💍)
* **E** — **Enemies** (Spicy Rivals & Enemies-to-Lovers ⚡)
* **S** — **Siblings** (The Ultimate Chaos Duo 🤪)

---

## ✨ Features & Highlights

* **🏹 Authentic FLAMES Engine**: Real mathematical character-striking and cyclic modulo reduction algorithm.
* **📸 Love Photo Collage Studio**:
  * **14 Aesthetic Templates**: Scattered Polaroid scrapbooks, Heart grids, Love story splits, Sunset masonry, Vintage filmstrips, Vogue magazine covers, and Retro vinyl layouts.
  * **100% Client-Side Privacy**: Photos are processed entirely within the browser (`FileReader` + HTML5 Canvas). Zero photo uploads or server storage.
  * **Interactive Editing**: Add custom text, romantic fonts (*Dancing Script, Playfair Display, Great Vibes*), photo frames (Polaroid, Scalloped, Filmstrip, Circle), filter presets, aspect ratios (`1:1`, `4:5`, `9:16`, `3:4`), and HD PNG download.
* **💖 Candy Valentine Aesthetics**: Vibrant candy blush (`#ff3366`, `#e040a0`), floating ambient hearts, glowing drop shadows, and rose petal confetti explosions.
* **📸 Instagram & TikTok Story Exporter**:
  * One-click 9:16 high-resolution story card generator for social media.
  * **Privacy Mode**: Includes a toggle (`🙈 Censor crush name`) so users can share their verdict on Instagram without revealing their crush's name!
  * **Viral Watermark**: Includes the site URL link on the exported card so friends can test their crush too.
* **🎵 Web Audio Synthesizer**: Built-in sound effects (Cupid harp arpeggios, heartbeat thumps, and confetti pops) using zero-dependency Web Audio API.
* **✨ Cupid Aura & Status Pills**: Quick-select personality pills (*Rose Quartz*, *Leo Love*, *Head Over Heels*, *Secret Admirer*).
* **💌 Secret Valentine Invite Copy**: One-click copy tool to draft a sweet invitation for DMs.
* **⚡ Ultra-Fast & Responsive**: Built with HTML5, Vanilla JS, and Tailwind CSS. Deploys seamlessly on Vercel or any static host.

---

## 🚀 Quick Start & Deployment

### 1. Clone & Run Locally
Simply open `index.html` in any web browser! No npm build step required.

```bash
git clone https://github.com/your-username/flames-crush-lab.git
cd flames-crush-lab
# Open index.html in browser or use Live Server
```

### 2. Deploy to Vercel

Deploys automatically with Vercel Serverless Function support:

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository directly to [Vercel](https://vercel.com) for instant auto-deployments!

---

## 🛠️ Project Structure

```text
├── index.html       # Single-page responsive UI & Web Audio Engine
├── css/
│   └── collage.css  # Photo Collage Studio layout & template styles
├── js/
│   └── collage.js   # Client-side collage renderer & privacy image processor
├── api/
│   ├── log.js       # Vercel Serverless Function background handler
│   └── crushes.js   # Serverless metrics route
├── vercel.json      # Routing & Vercel deployment configuration
└── README.md        # Project documentation
```

---

## 💌 License

Distributed under the MIT License. Built with love for Valentine's Day! ✨
