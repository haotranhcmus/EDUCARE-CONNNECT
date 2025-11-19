# Build APK Guide

## Prerequisites

1. **Install EAS CLI**:

   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:

   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

## Build Configuration

### Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Build Commands

### 1. Build Preview APK (for testing)

```bash
eas build --platform android --profile preview
```

### 2. Build Production APK

```bash
eas build --platform android --profile production
```

### 3. Build Locally (faster, requires Android Studio)

```bash
eas build --platform android --local --profile preview
```

## Download APK

After build completes:

1. Visit: https://expo.dev/accounts/[your-username]/projects/educare-connect/builds
2. Download the APK file
3. Transfer to Android device
4. Install the APK

## Test APK Before Release

### Manual Testing Checklist:

- [ ] **Login Flow**

  - [ ] Teacher login works
  - [ ] Parent login works
  - [ ] First-time login requires password change
  - [ ] Profile data displays correctly

- [ ] **Teacher Features**

  - [ ] Can view student list
  - [ ] Can create sessions
  - [ ] Can log session activities
  - [ ] Can add evaluations
  - [ ] Can invite parents
  - [ ] Can generate reports

- [ ] **Parent Features**

  - [ ] Can view children list
  - [ ] Can view sessions
  - [ ] Can view evaluations
  - [ ] Can view behavior logs
  - [ ] Can view goals/progress

- [ ] **Deep Links**

  - [ ] Email confirmation works
  - [ ] Password reset works
  - [ ] App opens from email links

- [ ] **Performance**

  - [ ] App loads quickly
  - [ ] No crashes on navigation
  - [ ] Images load properly
  - [ ] Forms submit successfully

- [ ] **Offline Behavior**
  - [ ] Shows error when offline
  - [ ] Handles network errors gracefully

## Build Production-Ready APK

### 1. Update Version

Edit `app.json`:

```json
{
  "expo": {
    "version": "1.0.0"
  }
}
```

### 2. Generate Keystore (for Play Store)

```bash
eas credentials
```

Select:

- Android
- Production
- Build credentials
- Keystore: Set up a new keystore

### 3. Build Production APK

```bash
eas build --platform android --profile production
```

### 4. Build AAB for Play Store

Create `eas.json` with AAB config:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Then build:

```bash
eas build --platform android --profile production
```

## Troubleshooting

### Build fails with "out of memory"

Add to `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "gradleCommand": ":app:assembleRelease",
        "withoutCredentials": false,
        "env": {
          "NODE_OPTIONS": "--max-old-space-size=4096"
        }
      }
    }
  }
}
```

### Deep links not working

1. Check `app.json` has correct `scheme`
2. Verify Supabase redirect URLs
3. Test with: `adb shell am start -W -a android.intent.action.VIEW -d "educare-connect://"`

### App crashes on startup

1. Check logs: `adb logcat`
2. Verify environment variables
3. Check Supabase connection

## Next Steps After Build

1. **Internal Testing**

   - Share APK with team
   - Test all features
   - Collect feedback

2. **Beta Testing**

   - Create Google Play Internal Test
   - Add beta testers
   - Monitor crash reports

3. **Production Release**
   - Build AAB (app bundle)
   - Upload to Play Store
   - Fill in store listing
   - Submit for review

## Useful Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Cancel build
eas build:cancel [build-id]

# Update app without new build (for JS changes only)
eas update

# Submit to Play Store
eas submit --platform android
```
