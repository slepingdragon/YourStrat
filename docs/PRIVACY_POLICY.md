# YourStrat Privacy Policy

_Last updated: 2026-05-20_

This Privacy Policy describes how the YourStrat mobile application ("YourStrat", "we", "us") collects, uses, and protects your information when you use the app.

## 1. Information We Collect

When you create an account and use YourStrat, we collect the following:

- **Account information.** Your email address and password (managed by Supabase Auth). Passwords are never stored in plaintext.
- **Profile information you provide.** Height, weight, age, sex, activity level, and fitness goal. This is used solely to calculate your daily calorie and macronutrient targets.
- **Meal photos and nutrition data.** Photos you capture or upload to log meals, plus the nutrition values (calories, protein, carbs, fat, fiber, sugar, sodium) extracted from them.
- **Workout data.** Routines you create, exercises you log, session start/end times, sets, reps, and duration.
- **Usage metadata.** Timestamps of scans and sessions, and counters used to enforce free-tier scan limits.

We do **not** collect: location, contacts, device identifiers for advertising, biometric data, audio, or browsing activity outside the app.

## 2. How We Use Your Information

- To authenticate your account and keep your data tied to you.
- To calculate personalized daily nutrition targets.
- To send meal photos to Google's Gemini API for nutrition estimation. Photos are transmitted over HTTPS and are not used by Google to train their models when sent via the Gemini API per Google's API data policy.
- To display your meal history, workout sessions, and daily snapshot back to you.
- To enforce free-tier limits and trial periods.

We do **not** sell your data, share it with advertisers, or use it for any purpose other than operating the YourStrat service.

## 3. Third-Party Services

YourStrat relies on the following third parties:

- **Supabase** — authentication, database, and encrypted storage of meal photos. See https://supabase.com/privacy
- **Google Gemini API** — nutrition estimation from meal photos. See https://ai.google.dev/terms
- **Railway** — hosting for our backend API. See https://railway.app/legal/privacy

## 4. Data Retention and Deletion

Your data is retained for as long as your account exists. You can request deletion of your account and all associated data (profile, meals, photos, workout sessions) at any time by emailing **baniabradyy@gmail.com**. We will delete your data within 30 days of receiving a verified request.

## 5. Security

- All traffic between the app, our backend, and Supabase is encrypted in transit (HTTPS/TLS).
- Meal photos are stored in a private Supabase storage bucket with per-user access policies — only you can read your own photos.
- Database rows are protected by row-level security policies — only you can read or modify your own profile, meals, and sessions.

## 6. Children's Privacy

YourStrat is not directed at children under 13. We do not knowingly collect information from children under 13. If you believe a child has provided us information, contact us and we will delete it.

## 7. Changes to This Policy

We may update this policy from time to time. Material changes will be reflected in the "Last updated" date at the top. Continued use of the app after a change constitutes acceptance.

## 8. Contact

Questions about this policy or your data:

**Brady Bania** — baniabradyy@gmail.com
