# Pre-Build Checklist

## ✅ Code Quality

- [x] All console.log removed/disabled in production (using logger utility)
- [x] No hardcoded credentials or secrets
- [ ] All TypeScript errors fixed
- [ ] All ESLint warnings resolved
- [ ] No unused imports or variables

## ✅ App Configuration

- [x] App name set: "EduCare Connect"
- [x] App icon configured: `./assets/images/icon.png`
- [x] Splash screen configured
- [x] Package name: `com.educare.connect`
- [x] Scheme: `educare-connect://`
- [x] Version: 1.0.0
- [x] Permissions listed (Camera, Storage)

## ✅ Environment & API

- [ ] Supabase URL configured
- [ ] Supabase Anon Key configured
- [ ] All API endpoints tested
- [ ] Deep links tested
- [ ] Email auth flow tested

## ✅ Supabase Configuration

- [ ] RLS enabled on all tables
- [ ] RLS policies applied
- [ ] Redirect URLs configured in Supabase
- [ ] Email templates updated
- [ ] Storage buckets created
- [ ] Storage policies set

## ✅ Features Testing

### Authentication

- [ ] Login works (teacher & parent)
- [ ] Register works
- [ ] First-time password change works
- [ ] Forgot password works
- [ ] Logout works
- [ ] Session persists on app restart

### Teacher Features

- [ ] Student CRUD operations
- [ ] Session creation
- [ ] Session logging
- [ ] Goal evaluations
- [ ] Behavior tracking
- [ ] Parent invitations
- [ ] Reports generation

### Parent Features

- [ ] View children list
- [ ] View sessions
- [ ] View evaluations
- [ ] View behavior logs
- [ ] View progress/goals
- [ ] Profile editing

## ✅ UI/UX

- [ ] All screens render correctly
- [ ] Navigation works smoothly
- [ ] Forms validate inputs
- [ ] Error messages are user-friendly
- [ ] Loading states show properly
- [ ] Images load correctly
- [ ] Tabs work properly
- [ ] Back button works as expected

## ✅ Performance

- [ ] App loads in < 3 seconds
- [ ] No memory leaks detected
- [ ] Images are optimized
- [ ] Lists use pagination/virtualization
- [ ] No unnecessary re-renders

## ✅ Error Handling

- [ ] Network errors handled
- [ ] Database errors handled
- [ ] Auth errors handled
- [ ] Validation errors shown
- [ ] Offline mode handled gracefully

## ✅ Data & Cache

- [ ] TanStack Query cache working
- [ ] User-specific cache isolation (userId in keys)
- [ ] Cache cleared on logout
- [ ] Data refreshes properly

## ✅ Security

- [ ] No sensitive data in logs
- [ ] API keys not exposed
- [ ] User data protected by RLS
- [ ] Input validation on all forms
- [ ] XSS prevention measures

## ✅ Documentation

- [x] SUPABASE_SETUP.md created
- [x] BUILD_APK.md created
- [ ] README.md updated
- [ ] API documentation complete
- [ ] User guide for teachers/parents

## Build Commands

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Login

```bash
eas login
```

### Configure

```bash
eas build:configure
```

### Build Preview APK

```bash
eas build --platform android --profile preview
```

### Build Production APK

```bash
eas build --platform android --profile production
```

## Post-Build Testing

After APK is built:

1. **Install on physical device**
2. **Test all critical flows**
3. **Check deep links work**
4. **Verify email confirmations**
5. **Test offline behavior**
6. **Monitor for crashes**
7. **Collect feedback**

## Ready to Build?

If all items are checked, you're ready to build! 🚀

Run:

```bash
eas build --platform android --profile preview
```
