# رفيقة

تطبيق موبايل للمرأة المسلمة، معمول بـ Expo (React Native). شوفي الوصف الكامل في [PROMPT.md](PROMPT.md).

## تجربته على موبايلك
1. نزّلي تطبيق **Expo Go** من Google Play أو App Store.
2. على الكمبيوتر، بعد ما تثبتي Node.js:
   ```bash
   npm install
   npx expo start
   ```
3. صوّري الـ QR code اللي هيظهر بتطبيق Expo Go (على الآيفون صوّريه بالكاميرا).

ملحوظة: التنبيهات المجدولة شغالة في Expo Go، لكن عشان تتأكدي منها بشكل كامل، اعملي نسخة APK.

## نسخة APK للأندرويد
```bash
npx eas-cli@latest build -p android --profile preview
```
(محتاجة حساب مجاني على expo.dev)

## تنظيم الكود
| الملف | المحتوى |
|---|---|
| `src/cycle.js` | حسابات الدورة والتوقع والتأخير |
| `src/content.js` | الأعراض والنصائح وعلامات الطهر والصحة |
| `src/fiqh.js` | الأحكام الفقهية |
| `src/seerah1.js`، `src/seerah2.js` | السير |
| `src/status.js` | مكانة المرأة والرد على الشبهات |
| `src/parenting.js` | التربية والبر والميراث (ومعاه الحاسبة) |
| `src/pregnancy.js` | الحمل والكشوفات وما بعد الولادة |
| `src/exercises.js` | التمارين والوضعيات والبرامج |
| `src/life.js` | مراحل حياة المرأة |
| `src/library.js` | المكتبة والمراجع (بتجمع الآيات والأحاديث تلقائيًا) |
| `src/notifications.js` | جدولة الإشعارات |
| `src/store.js` | حفظ البيانات على الموبايل |
| `src/screens/` | الشاشات |

تعديل أي محتوى بيكون من ملفه في `src/` بس.
