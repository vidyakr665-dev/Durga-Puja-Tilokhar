# श्री श्री दुर्गा पूजा महोत्सव — GitHub Website

## इसमें क्या है
- 3 अलग poster slides; केवल एक समय पर दिखता है और हर 7 सेकंड में बदलता है
- Header: मुख्य पृष्ठ, चंदा सहयोग, आय-व्यय, संपर्क करें, जय माता दी
- समिति: छात्र नवयुवक संघ, तिलोखर (रोहतास)
- अधिकारी: अध्यक्ष विद्यासागर कुमार; सचिव अमरजीत कुमार; कोषाध्यक्ष सुरेन्द्र कुमार उर्फ गोरख
- Online donation form + Razorpay integration scaffold
- Successful payment के बाद receipt page
- Public donation list: donor name, amount, date/time, receipt number
- Month/year income, expense और balance view
- Admin login + expense entry
- Footer with committee, location, phone/email placeholders

## GitHub पर तुरंत चलाना
1. `index.html`, `style.css`, `app.js`, `config.js`, `receipt.html`, `admin.html` और `assets` folder upload करें.
2. GitHub Pages में branch/root publish करें.
3. `config.js` में अपना phone/email डालें. Demo mode में website UI चलेगा, लेकिन real payment नहीं.

## Real payment + receipt + ledger
Supabase project बनाकर `supabase/schema.sql` चलाएँ. फिर तीन Edge Functions deploy करें:
- create-order
- verify-payment
- razorpay-webhook

Secrets:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET
- SUPABASE_SERVICE_ROLE_KEY

फिर `config.js` में SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, RAZORPAY_KEY_ID डालें और `DEMO_MODE:false` करें.

**सुरक्षा:** Razorpay secret और Supabase service-role key को कभी GitHub frontend files में न डालें.
