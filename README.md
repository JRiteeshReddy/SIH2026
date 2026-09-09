# EcoDex 🌿
> **Explore Nature. Collect Wildlife. Stay Fit.**

EcoDex is a cross-platform mobile and web application combining outdoor fitness tracking, wildlife field journaling, real-time AI species recognition, and robust Firebase cloud synchronization.

---

## 🎨 Theme & Visual Style

* **Primary Color**: `#2E7D32` (Forest Green)
* **Secondary Color**: `#66BB6A` (Leaf Green)
* **Accent Color**: `#FFD54F` (Golden XP)
* **Background**: Soft off-white with botanical green gradients (`#F4F7F4` to `#E8F5E9`)
* **Design Language**: Modern mobile-first UI with a field journal aesthetic
* **Cards**: Rounded cards (20–24px radius) with subtle organic shadows
* **Modals**: Glassmorphism specifically tailored for achievement unlocks and discovery fanfares
* **Navigation**: Responsive bottom navigation bar on mobile and centered responsive journal frame

---

## 📱 Platforms & Mobile Compatibility

1. **Responsive Web Application**: Built with React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, and Web Audio API synthesized nature soundscapes.
2. **Native Android Application**: Powered by Capacitor 8 with a full native Gradle project (`android/`) ready for Android Studio, APK compilation, and device deployment.
   * Includes camera, GPS geolocation, internet, and network status permissions in `AndroidManifest.xml`.
   * Pre-configured with Capacitor Android plugins (`@capacitor/android`, `@capacitor/core`, `@capacitor/cli`).

---

## 🔒 Authentication & Onboarding Flow

EcoDex implements an explicit 4-state authentication gate to protect app progression and user state:

1. `AUTH_LOADING`: Displays an EcoDex splash animation while resolving Firebase auth state.
2. `UNAUTHENTICATED`: Directs unauthenticated users to the responsive `AuthView` (Email/Password login, Sign Up, Google OAuth, and Password Reset).
3. `AUTHENTICATED_PROFILE_MISSING`: Directs authenticated users without a profile document in Firestore to `OnboardingView` to set up handle, college, avatar, and region.
4. `AUTHENTICATED_PROFILE_EXISTS`: Unlocks full application access.

---

## 🧭 Core Modules & Features

### 1. Auth & Onboarding Gate
* **Firebase Auth**: Supports Email & Password, Google OAuth, and Password Reset.
* **Explorer Profile Setup**: Username, College / Institution, Avatar selection, and City / State.
* **Strict UID Security**: All profile documents use `users/{firebaseAuth.uid}` for security boundary enforcement.

### 2. Home Tab
* **Explorer Profile Badge**: Avatar, Explorer Handle, Level, and College affiliation.
* **Daily Outdoor Streak**: Flame counter tracking consecutive days outdoors.
* **Level & EcoXP Bar**: Dynamic experience progress bar with rank title.
* **Quick Expedition & Scanner Launch**: One-tap access to live trekking or camera scanning.
* **Daily Eco Quests**: Interactive fitness and wildlife observation objectives.
* **Recent Discoveries Carousel**: Horizontal card reel of recent field encounters.
* **Campus Ecological Health Index**: Local biodiversity status meter.

### 3. Expedition Tab (Stay Fit + Explore Nature)
* **Live GPS Fitness Tracking**: Real-time distance in km, elapsed timer, step counter, estimated calories burned, and trek pace.
* **Field Terrain Radar**: Topographic map view with rotating radar sweep, explorer beacon, and discovered species pins.
* **Wildlife Encounter Radar Alerts**: Proximity notifications when moving outdoors.
* **Expedition Banking**: Completing a trek awards EcoXP and saves the expedition log to Firestore.

### 4. EcoDex Tab (Collect Wildlife)
* **20 Native Species Catalog**: Comprehensive Indian biodiversity field guide:
  1. *House Crow* (`Corvus splendens`)
  2. *Rock Pigeon* (`Columba livia`)
  3. *Indian Palm Squirrel* (`Funambulus palmarum`)
  4. *Indian Pariah Dog* (`Canis lupus familiaris`)
  5. *Feral & Domestic Cat* (`Felis catus`)
  6. *Emerald Swallowtail Butterfly* (`Papilionoidea`)
  7. *Indian Bullfrog* (`Hoplobatrachus tigerinus`)
  8. *Indian Black Turtle* (`Melanochelys trijuga`)
  9. *Indian Peafowl* (`Pavo cristatus`)
  10. *Spotted Owlet* (`Athene brama`)
  11. *Rose-ringed Parakeet* (`Psittacula krameri`)
  12. *Spotted Chital Deer* (`Axis axis`)
  13. *Indian Black-naped Hare* (`Lepus nigricollis`)
  14. *Bengal Fox* (`Vulpes bengalensis`)
  15. *Gray Langur* (`Semnopithecus entellus`)
  16. *Mugger Marsh Crocodile* (`Crocodylus palustris`)
  17. *Spectacled Indian Cobra* (`Naja naja`)
  18. *Indian Grey Wolf* (`Canis lupus pallipes`)
  19. *Royal Bengal Tiger* (`Panthera tigris tigris`)
  20. *Indian Leopard* (`Panthera pardus fusca`)
* **Category Filters**: All, Avian (Birds), Mammals, Reptiles, Amphibians, Insects.
* **Specimen Guide**: Detailed taxonomy, conservation status, habitat notes, diet, description, fun facts, and field photos.
* **AI Field Scanner**: Camera viewfinder / photo upload / specimen test gallery with confidence score and latency meter.

### 5. Leaderboard Tab (Rank)
* **Scope Filters**: National (Global), College / Institution, and City / Region.
* **Ranking Metrics**: Most EcoXP, Trek Distance, Species Found, and Daily Streak.
* **Top 3 Podium**: Crowned 1st place with Gold, 2nd with Silver, and 3rd with Bronze laurels.

### 6. Profile Tab (Explorer Dossier)
* **Naturalist Identification Card**: Field handle, avatar, college, city, joined date, and reputation index.
* **Key Statistics**: 4-stat metrics grid for XP, Distance, Species, and Streak.
* **Field Medals Showcase**: Glassmorphic achievement popups.
* **Sign Out Control**: Instant Firebase session termination.

---

## 🛠️ Environment Setup

Create `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_app.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"
```

---

## 🚀 Running Locally & Building for Android

### 1. Web Development & Production Build

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build
```

### 2. Android Native Synchronization & Build

```bash
# Build web app and sync Capacitor Android assets
npm run cap:build

# Open project in Android Studio
npm run cap:open

# Or build debug APK directly via Gradle
cd android
$env:JAVA_HOME="C:\Program Files\Java\jdk-21" # Windows PowerShell
.\gradlew.bat assembleDebug
```

The compiled Android debug APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`
