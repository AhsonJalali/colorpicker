# 🎨 Chic Color Picker

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

**The modern, aesthetic way to extract colors from the web.**

[Features](#-features) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Overview

Gone are the days of clunky browser extensions and low-res screenshots. **Chic Color Picker** brings the browser *inside* your color tool. Navigate to any URL, get a high-fidelity snapshot, and use our pixel-perfect loupe to extract the exact hex code you need. All wrapped in a beautiful, minimal interface powered by **shadcn/ui**.

## 🚀 Features

- **🌍 Internal Browser Engine**: Seamlessly load and render any website URL directly within the app using Puppeteer.
- **🔍 Pixel-Perfect Loupe**: Precision magnifier tool that lets you inspect pixels and grab colors with accuracy.
- **💾 Smart History**: Automatically tracks your picked colors so you never lose that perfect shade.
- **📋 One-Click Copy**: Instant clipboard integration with beautiful toast notifications.
- **💎 Modern UI**: A clean, distraction-free interface built with Tailwind CSS v4 and polished animations.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Browser Automation**: [Puppeteer](https://pptr.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Type Safety**: TypeScript

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AhsonJalali/colorpicker.git
   cd colorpicker
   ```

2. **Install dependencies**
   ```bash
   cd app
   pnpm install
   ```

3. **Install Browser Binary** (Required for the internal browser)
   ```bash
   npx puppeteer browsers install chrome
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and start picking!

## 📸 Usage

1. **Enter URL**: Type `github.com` (or any site) into the chic search bar.
2. **Explore**: Wait for the snapshot to render.
3. **Pick**: Hover over the design elements you love. The loupe appears automatically.
4. **Click**: Click to save the color to your history and copy the HEX code.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License.

---

<div align="center">
  Built with ❤️ by Amir H. Jalali
</div>
