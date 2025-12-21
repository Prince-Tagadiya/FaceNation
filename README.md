# FaceNation | Identity Architecture

An immersive, high-performance web experience designed for identity compliance and biometric verification systems. This project leverages advanced 3D rendering and smooth animations to create a futuristic user interface.

## 🚀 Technologies

*   **Core**: React 19, TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **Animations**: GSAP (ScrollTrigger), Framer Motion
*   **3D Graphics**: Three.js, React Three Fiber, Drei

## 🛠️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Prince-Tagadiya/FaceNation.git
    cd FaceNation
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will launch at `http://localhost:3000`.

## 📁 Project Structure

This project follows a scalable architecture:

```
src/
├── components/
│   ├── 3d/        # Three.js scenes and particle systems
│   └── ui/        # Reusable UI elements (Cursor, Magnetic, etc.)
├── pages/         # Application pages (e.g., LandingPage)
├── lib/           # Configuration and utilities (Firebase ready)
└── App.tsx        # Main application entry
```

## 📦 Deployment

To deploy to Vercel:
```bash
npx vercel
```
