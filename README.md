# 🏗️ Project Blueprint: E-Chowk (AI-Powered)

## 1. Project Vision (उद्देश्य)
एक ऐसा प्लेटफॉर्म जो असंगठित क्षेत्र के मजदूरों (Laborers) और काम देने वालों (Individuals/Companies) को जोड़ता है। यह Voice-First है ताकि अनपढ़ मजदूर भी बिना किसी ऐप को चलाए सिर्फ कॉल करके अपना रजिस्ट्रेशन करा सकें।

## 2. The Three Pillars (तीन मुख्य रास्ते)
सिस्टम एक ही डेटाबेस से जुड़ा होगा, लेकिन तीन अलग-अलग इंटरफेस होंगे:
- **AI Voice Agent (For Unskilled/Non-Smartphone Users)**: कॉल पर बात करके प्रोफाइल बनाना।
- **WhatsApp Bot (For Updates)**: काम की उपलब्धता (Availability) और लोकेशन अपडेट के लिए।
- **Mobile App (For Skilled Workers & Requirers)**: बुकिंग, रेटिंग, और पेमेंट मैनेजमेंट के लिए।

## 3. Professional Tech Stack (Scalable & Student-Friendly)
| Layer | Technology | Reason |
| --- | --- | --- |
| Frontend | Flutter (Dart) | एक ही कोड से Android और iOS दोनों के लिए। |
| Backend | Node.js (NestJS) | हाई ट्रैफिक और रियल-टाइम कॉल्स को संभालने के लिए। |
| Database | Supabase (PostgreSQL) | मोबाइल OTP लॉगिन और डेटा स्टोरेज के लिए फ्री टियर। |
| Voice AI | Vapi.ai + Gemini Flash | मजदूरों से बात करने और डेटा एक्सट्रैक्ट करने के लिए। |
| Telephony | Twilio / Exotel | कॉल रिसीव करने और रिकॉर्ड करने के लिए। |
| Messaging | Meta WhatsApp Cloud API | फ्री 1000 मैसेज/महीना के लिए। |

## 4. AI Voice Agent: System Prompt (The Logic)
जब मजदूर कॉल करेगा, तो AI को यह निर्देश (Instruction) मिलेगा:
> "You are an AI assistant for 'Labour Chowk'. Your goal is to register workers in a friendly, respectful tone.
> Ask their Full Name.
> Ask their Primary Skill (e.g., Painter, Plumber, Helper).
> Ask their Location/Area.
> Ask their Daily Wage (Per day rate).
> Confirm the details and tell them their profile is live.
> Constraint: Use simple Hindi/Regional language. Keep responses short."

## 5. Database Schema (Unique ID Connection)
तीनों प्लेटफॉर्म को जोड़ने के लिए Mobile Number को Primary Key बनाया जाएगा:

**Table: Workers**
- id (Unique UUID)
- phone_number (Unique - Connection Point)
- name (String)
- skill_category (Dropdown: Mistry, Plumber, etc.)
- verification_status (Boolean)
- rating (Float)
- registration_source (Enum: Voice, App, WhatsApp)

## 6. Execution Roadmap (30 Days)
- **Days 1-7**: Setup Supabase and Mobile OTP Login. Create the database table.
- **Days 8-15**: Integrate Vapi.ai for Voice Registration. Test if data is saving to Supabase.
- **Days 16-23**: Build the Flutter App for 'Requirers' to search and book workers.
- **Days 24-30**: Add WhatsApp notifications for booking alerts.

## 7. Business & Scalability
- **Revenue**: 5-10% commission on every successful booking.
- **Scale**: Use AWS Auto-scaling to handle 2 Lakh+ concurrent users.
- **Safety**: Aadhaar-based KYC integration for verified worker badges.