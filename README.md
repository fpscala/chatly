# 💬 Chatly v2 - Advanced Firebase Chat App

React Native (Expo) va Firebase bilan yaratilgan kengaytirilgan real-time chat ilovasi.

## ⚙️ Texnologiyalar

- React Native (Expo)
- TypeScript
- Firebase Authentication (Email/Password)
- Firebase Firestore (Database + Ban system)
- Firebase Storage (Profil va chat rasmlari)
- Expo Notifications (Push xabarlar)
- Expo ImagePicker (Rasm yuborish)
- React Navigation

## 🚀 Boshlash

### 1. Kerakli dasturlarni o'rnatish

Node.js va npm o'rnatilgan bo'lishi kerak.

### 2. Dependencies o'rnatish

```bash
npm install
```

### 3. Firebase sozlash

1. [Firebase Console](https://console.firebase.google.com/)ga kiring
2. Yangi loyiha yarating
3. Authentication'ni yoqing (Email/Password)
4. Firestore Database yarating (test mode)
5. Storage'ni yoqing

### 4. Firebase konfiguratsiyasi

`app/firebaseConfig.ts` faylini oching va o'z Firebase ma'lumotlaringizni kiriting:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Ilovani ishga tushirish

```bash
npm start
```

yoki

```bash
npx expo start
```

## 📱 Funksiyalar

### Asosiy funksiyalar:
- ✅ Email bilan ro'yxatdan o'tish va kirish
- ✅ Gender va yosh bilan ro'yxat (13+ yosh)
- ✅ Kengaytirilgan profil (avatar, bio, age, interests, location)
- ✅ Real-time chat (matn + rasm)
- ✅ Online/Offline holat ko'rsatkichi
- ✅ Push notifications

### Yangi v2 funksiyalari:
- 🆕 **Gender Filter**: Erkaklar default ayollarni, ayollar erkaklarni ko'radi
- 🆕 **Filterni o'zgartirish**: Hammasi, faqat erkaklar yoki faqat ayollar
- 🆕 **Ban/Block funksiyasi**: Istalgan foydalanuvchini bloklash
- 🆕 **Chat'da rasm yuborish**: Expo ImagePicker orqali
- 🆕 **Sozlamalar ekrani**: Filter va bildirishnomalarni boshqarish
- 🆕 **Kengaytirilgan profil**: Yosh, qiziqishlar, manzil
- ✅ Chiroyli va zamonaviy Material Design UI

## 📁 Loyiha tuzilmasi

```
/app
  /screens          - Barcha ekranlar
  /components       - Qayta ishlatiladigan komponentlar
  /navigation       - Navigation konfiguratsiyasi
  /services         - Firebase xizmatlari
  /types            - TypeScript tiplari
  firebaseConfig.ts - Firebase sozlamalari
App.tsx             - Asosiy fayl
```

## 🔥 Firebase Firestore tuzilmasi

### Users Collection
```
users/{userId}
  - name: string
  - bio: string
  - gender: 'male' | 'female'
  - age: number (optional)
  - interests: string[] (optional)
  - location: string (optional)
  - photoURL: string
  - isOnline: boolean
  - lastSeen: timestamp
  - email: string
  - preferences:
      - showGender: 'male' | 'female' | 'all'
      - notificationsEnabled: boolean
```

### Chats Collection
```
chats/{chatId}
  - members: [userId1, userId2]
  - createdAt: timestamp

  messages/{messageId}
    - senderId: string
    - text: string (optional)
    - imageURL: string (optional)
    - createdAt: timestamp
```

### Bans Collection (New in v2)
```
bans/{banId}
  - bannedBy: userId
  - bannedUser: userId
  - createdAt: timestamp
```

## 📦 Build qilish

### Android uchun

```bash
eas build -p android
```

### iOS uchun

```bash
eas build -p ios
```

## 🎨 Rangli palitra

- Primary: #6200EE (Binafsha)
- Background: #FFFFFF (Oq)
- Text: #000000 (Qora)
- Secondary Text: #666666
- Online: #4CAF50 (Yashil)
- Error: #F44336 (Qizil)

## 📝 Muhim eslatmalar

1. Firebase Console'da Firestore Security Rules'ni sozlang
2. Storage Rules'ni ham sozlang
3. Push notifications faqat real qurilmalarda ishlaydi
4. Google Play'ga joylashtirish uchun Privacy Policy kerak

## 🔒 Security Rules

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /chats/{chatId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.members;

      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_pictures/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## 🐛 Muammolarni hal qilish

1. **Firebase connection error**: firebaseConfig.ts faylini tekshiring
2. **Push notifications ishlamayapti**: Real qurilmada sinab ko'ring
3. **Rasmlar yuklanmayapti**: Storage rules'ni tekshiring

## 📄 License

MIT License

## 👨‍💻 Muallif

Chatly - Firebase asosidagi chat ilovasi

---

Qo'shimcha savol va takliflar uchun issue oching! 🚀
