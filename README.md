# EcoDex 🌿
> **Explore Nature. Collect Wildlife. Stay Fit.**

EcoDex is a cross-platform mobile and web application combining outdoor fitness tracking, wildlife field journaling, and real-time AI species recognition.

---

## 🎨 Theme & Visual Style

* **Primary Color**: `#2E7D32` (Forest Green)
* **Secondary Color**: `#66BB6A` (Leaf Green)
* **Accent Color**: `#FFD54F` (Golden XP)
* **Background**: Soft off-white with botanical green gradients (`#F4F7F4` to `#E8F5E9`)
* **Design Language**: Modern mobile-first UI with a field journal aesthetic
* **Cards**: Rounded cards (20–24px radius) with subtle organic shadow
* **Modals**: Glassmorphism specifically tailored for achievement unlocks and discovery fanfares
* **Navigation**: Responsive bottom navigation bar on mobile and centered responsive journal frame

---

## 📱 Platforms

1. **Responsive Web Application**: Built with React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, and Web Audio API synthesized nature soundscapes.
2. **Native Android Application**: Powered by Capacitor 6 with a full native Gradle project (`android/`) ready for Android Studio, APK compilation, and device deployment.

---

## 🧭 Core Modules & Navigation

### 1. Splash Screen
* Animated EcoDex emblem with floating upward leaf particles.
* Brand typography:
  ```
  EcoDex
  Explore Nature. Collect Wildlife. Stay Fit.
  ```
* Smooth spring transition automatically navigating into the application.

### 2. Home Tab
* **Explorer Profile Badge**: Avatar, Explorer Handle, and College affiliation.
* **Daily Outdoor Streak**: Flame counter tracking consecutive days outdoors.
* **Level & EcoXP Bar**: Dynamic experience progress bar with rank title.
* **Quick Expedition & Scanner Launch**: One-tap access to live trekking or camera scanning.
* **Daily Eco Quests**: Interactive fitness and wildlife observation objectives.
* **Recent Discoveries Carousel**: Horizontal card reel of recent field encounters.
* **Campus Ecological Health Index**: Local biodiversity status meter.

### 3. Expedition Tab (Stay Fit + Explore Nature)
* **Live GPS Fitness Tracking**: Real-time distance in km, elapsed timer, step counter, estimated calories burned, and trek pace.
* **Field Terrain Radar**: Topographic map view with rotating radar sweep, explorer beacon, and discovered species pins.
* **Wildlife Encounter Radar Alerts**: Proximity notifications when moving (e.g. *“Wildlife Scent In Vicinity: Indian Palm Squirrel (~45m away)”*).
* **Expedition Banking**: Completing a trek awards EcoXP and saves the expedition log to Firestore.

### 4. EcoDex Tab (Collect Wildlife)
* **23 Native Species Catalog**: Comprehensive biodiversity field guide built directly from the model labels:
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
  21. *Asian Elephant* (`Elephas maximus indicus`)
  22. *Asiatic Lion* (`Panthera leo leo`)
  23. *Himalayan Red Panda* (`Ailurus fulgens`)
* **Category Filters**: All, Avian (Birds), Mammals, Reptiles, Amphibians, Insects.
* **Specimen Guide**: Detailed taxonomy, conservation status, habitat notes, diet, description, fun facts, and field photo.
* **AI Field Scanner**: Camera viewfinder / photo upload / specimen test gallery with confidence score and latency meter.

### 5. Leaderboard Tab (Rank)
* **Scope Filters**: National (Global), College / Institution, and City / Region.
* **Ranking Metrics**: Most EcoXP, Trek Distance, Species Found, and Daily Streak.
* **Top 3 Podium**: Crowned 1st place with Gold, 2nd with Silver, and 3rd with Bronze laurels.
* **Explorer Standings**: Displays explorer avatars, college tags, and highlights the active user.

### 6. Profile Tab (Explorer Dossier)
* **Naturalist Identification Card**: Field handle, avatar, college, city, joined date, and reputation index.
* **Key Statistics**: 4-stat metrics grid for XP, Distance, Species, and Streak.
* **Field Medals Showcase**: Glassmorphic achievement popups (e.g. *First Sighting*, *Avian Watcher*, *Trailblazer 5K*, *Apex Sovereign*).
* **Firebase Cloud Sync Settings**: In-app configuration modal to connect custom Firebase project credentials.

---

## 🔥 Firebase Authentication & Cloud Firestore

### Authentication
* **Google Sign-In**: Seamless one-tap OAuth login.
* **Email & Password**: Registration and login.
* **First-Login Onboarding**: Automatically requests:
  * Username
  * College / Institution
  * Avatar Selection
  * City / State
* **Quick Explorer Demo Mode**: Instant zero-config access for offline testing and evaluation.

### Firestore Data Model
```typescript
// Collections configured:
users: {
  uid: string,
  username: string,
  college: string,
  avatar: string,
  cityState: string,
  level: number,
  ecoXP: number,
  totalDistance: number,
  speciesFound: number,
  streak: number,
  achievements: string[],
  reputation: number,
  joinedDate: string
}

expeditions: {
  id: string,
  userId: string,
  startTime: number,
  endTime: number,
  distanceKm: number,
  steps: number,
  durationSeconds: number,
  caloriesBurned: number,
  speciesEncountered: string[],
  ecoXPEarned: number,
  path: [number, number][],
  active: boolean
}

discoveries: {
  id: string,
  userId: string,
  speciesId: string,
  speciesName: string,
  timestamp: string,
  locationName: string,
  confidence: number,
  xpAwarded: number,
  photoUrl: string
}

leaderboard: { ... }
achievements: { ... }
reports: { ... }
```

---

## 🚀 Running Locally

### 1. Web Application
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build production bundle
npm run build
```

### 2. Android Native Application
```bash
# Build the web assets
npm run build

# Synchronize with the Android platform
npx cap sync android

# Open in Android Studio
npx cap open android

# Or build APK directly via Gradle wrapper
cd android
./gradlew assembleDebug
```
The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`
