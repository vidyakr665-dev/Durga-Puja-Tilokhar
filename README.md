# श्री श्री दुर्गा पूजा महोत्सव — Working Website Package

यह पैकेज poster-style 3-image automatic slider के साथ online donation, automatic receipt, public income/expense ledger और admin expense entry के लिए तैयार किया गया starter है।

## Stack
- Frontend: HTML/CSS/JavaScript — GitHub Pages पर चल सकता है
- Database/Auth: Supabase
- Backend: Supabase Edge Functions
- Payment: Razorpay Standard Checkout
- Receipt: payment confirmation के बाद receipt page; browser से Print → Save as PDF

Razorpay का secret frontend में नहीं रखना है। Razorpay के payment flow में backend order creation और signed verification/webhooks रखें। Razorpay की security guidance भी backend/trusted source से payment status लेने और webhook HMAC validate करने की सलाह देती है.

## 1) Supabase बनाएं
1. Supabase project बनाएं.
2. SQL Editor में `supabase/schema.sql` चलाएं.
3. Authentication → Users में committee admin user बनाएं.
4. उस user का UUID लेकर schema की अंतिम `insert into public.admin_users...` query चलाएं.

## 2) Secrets सेट करें
Supabase Edge Function secrets में:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

Secret/service-role key को GitHub/frontend में कभी न रखें.

## 3) Edge Functions deploy करें
Supabase CLI से:
- `supabase functions deploy create-order`
- `supabase functions deploy verify-payment`
- `supabase functions deploy razorpay-webhook`

`razorpay-webhook` को Razorpay Dashboard में webhook URL दें:
`https://YOUR_PROJECT.supabase.co/functions/v1/razorpay-webhook`

Webhook events में कम-से-कम:
- `payment.captured`
- `payment.failed`

Webhook secret वही रखें जो Supabase secret में `RAZORPAY_WEBHOOK_SECRET` के रूप में रखा है.

## 4) Frontend configure करें
`config.example.js` को कॉपी करके `config.js` बनाएं और:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `DEMO_MODE: false`

भरें.

फिर `index.html`, `receipt.html`, `admin.html`, `app.js`, `style.css`, `config.js`, `assets/` को GitHub repository में upload करें.

## 5) GitHub Pages
Repository → Settings → Pages → Deploy from branch → `main` / root.

## 6) Important privacy choice
Public हिसाब में donor का mobile number नहीं दिखाया गया है; receipt page पर masked mobile दिखता है. Public ledger में income/expense, date/time और amount दिखते हैं.

## 7) आगे जोड़ा जा सकता है
- Email receipt
- WhatsApp receipt
- PDF file को Supabase Storage में save करना
- Expense bill/photo upload
- CSV/Excel export
- Year/month filters
- Committee member roles
- Anonymous donor option

### Security
Supabase RLS policies रखें. Publishable key browser में इस्तेमाल की जा सकती है जब RLS सही तरीके से configured हो; secret/service-role key केवल backend/Edge Function में रखें.
