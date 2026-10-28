# Litre Ledger - Android WebView APK Project

This folder contains the complete, production-ready Android Studio project that wraps `https://litterledger-mu.vercel.app/` into an Android APK with offline support, DOM storage persistence, and native file download/upload support.

## Key Features in this WebView Wrapper

1. **Target URL**:
   - Pre-configured to `https://litterledger-mu.vercel.app/`.
2. **Offline-First & Device Persistence**:
   - `domStorageEnabled = true` & `databaseEnabled = true`: Guarantees `localStorage` and `IndexedDB` persist on the phone across app closes and phone restarts.
   - Intelligent Cache Mode: When offline, automatically falls back to `WebSettings.LOAD_CACHE_ELSE_NETWORK` to launch instantly without an internet connection.
3. **Backup Import / File Upload**:
   - Implements `WebChromeClient.onShowFileChooser` connected to the native Android document picker so staff can import JSON backups.
4. **Backup Export / File Download**:
   - Implements `DownloadListener` to save exported JSON backups and CSV reports directly to the Android device's **Downloads** folder.
5. **Native Android Navigation**:
   - Hardware / Gesture Back Button handling keeps users inside the ledger tabs rather than closing the app.
   - Pull-to-refresh with `SwipeRefreshLayout`.
   - External phone calls (`tel:`) and WhatsApp (`whatsapp:`) launch native apps.

---

## How to Build the APK (2 Simple Methods)

### Method 1: Using Android Studio (Recommended)

1. Open **Android Studio**.
2. Click **Open** and select the `/android` folder inside this repository.
3. Wait for Gradle sync to complete (Android Studio will automatically download the Android Gradle Plugin and Gradle wrapper).
4. In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
5. Once built, Android Studio will show a popup with a **locate** link to your ready-to-install `app-debug.apk` (located at `android/app/build/outputs/apk/debug/app-debug.apk`).
6. Copy the `.apk` file to any Android phone and tap to install!

### Method 2: Command Line (CLI)

From the `android` directory in your terminal:

```bash
cd android

# Build debug APK
./gradlew assembleDebug

# Output APK path:
# app/build/outputs/apk/debug/app-debug.apk
```

To build a release APK:
```bash
./gradlew assembleRelease
# Output APK path:
# app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## Project Structure

```
android/
├── build.gradle.kts          # Root build configuration
├── settings.gradle.kts       # Project name and repository settings
└── app/
    ├── build.gradle.kts      # App module configuration (SDK 35, dependencies)
    └── src/
        └── main/
            ├── AndroidManifest.xml
            ├── java/com/technologistic/litreledger/
            │   └── MainActivity.kt    # Full WebView logic & offline cache handling
            └── res/
                ├── layout/
                │   └── activity_main.xml
                ├── values/
                │   ├── colors.xml
                │   ├── strings.xml
                │   └── themes.xml
                └── xml/
                    ├── backup_rules.xml
                    └── data_extraction_rules.xml
```
