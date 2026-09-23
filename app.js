const CFG = window.DURGA_CONFIG || {};
const hasBackend = Boolean(CFG.SUPABASE_URL && CFG.SUPABASE_PUBLISHABLE_KEY && !CFG.DEMO_MODE);

let slides = [...document.querySelectorAll(".slide")], dotsBox = document.querySelector(".dots"), current = 0, timer;
slides.forEach((_, i) => { const d=document.createElement("button"); d.className="dot"+(i===0?" active":""); d.setAttribute("aria-label",`पोस्टर ${i+1}`); d.onclick=()=>showSlide(i,true); dotsBox.appendChild(d); });
const dots=[...document.querySelectorAll(".dot")];
function showSlide(i, manual=false){ current=(i+slides.length)%slides.length; slides.forEach((s,n)=>s.classList.toggle("active",n===current)); dots.forEach((d,n)=>d.classList.toggle("active",n===current)); if(manual)restart(); }
function restart(){clearInterval(timer);timer=setInterval(()=>showSlide(current+1),4500)}
document.querySelector(".prev").onclick=()=>showSlide(current-1,true);
document.querySelector(".next").onclick=()=>showSlide(current+1,true);
restart();

const money = n => "₹"+Number(n||0).toLocaleString("en-IN");
function setStatus(msg, ok=false){const e=document.querySelector("#payStatus");e.textContent=msg;e.style.color=ok?"#137333":"#8e1600"}

async function api(path, body){
  const url = `${CFG.SUPABASE_URL}/functions/v1/${path}`;
  const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","apikey":CFG.SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(body)});
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error||"Server error");
  return data;
}

async function loadLedger(){
  if(!hasBackend){
    const demo=[
      {created_at:new Date(Date.now()-86400000).toISOString(),type:"income",description:"ऑनलाइन सहयोग (डेमो)",amount:501},
      {created_at:new Date(Date.now()-43200000).toISOString(),type:"expense",description:"पूजा सामग्री (डेमो)",amount:250}
    ];
    renderLedger(demo); renderStats(501,250); return;
  }
  try{
    const r=await fetch(`${CFG.SUPABASE_URL}/rest/v1/public_ledger?select=*&order=created_at.desc&limit=100`,{headers:{apikey:CFG.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${CFG.SUPABASE_PUBLISHABLE_KEY}`}});
    if(!r.ok) throw new Error("Ledger load failed");
    const rows=await r.json();
    renderLedger(rows);
    const income=rows.filter(x=>x.type==="income").reduce((a,x)=>a+Number(x.amount),0);
    const expense=rows.filter(x=>x.type==="expense").reduce((a,x)=>a+Number(x.amount),0);
    // Stats endpoint is more accurate for totals beyond the 100 visible rows.
    try{
      const s=await fetch(`${CFG.SUPABASE_URL}/rest/v1/public_totals?select=*`,{headers:{apikey:CFG.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${CFG.SUPABASE_PUBLISHABLE_KEY}`}});
      const totals=await s.json(); renderStats(Number(totals.total_income||income),Number(totals.total_expense||expense));
    }catch{renderStats(income,expense)}
  }catch(e){document.querySelector("#ledgerBody").innerHTML=`<tr><td colspan="4" class="center">हिसाब अभी उपलब्ध नहीं है।</td></tr>`}
}
function renderLedger(rows){
  const body=document.querySelector("#ledgerBody");
  if(!rows.length){body.innerHTML=`<tr><td colspan="4" class="center">अभी कोई रिकॉर्ड नहीं है।</td></tr>`;return}
  body.innerHTML=rows.map(x=>{
    const d=new Date(x.created_at).toLocaleString("hi-IN",{dateStyle:"medium",timeStyle:"short"});
    const income=x.type==="income";
    return `<tr><td>${d}</td><td class="${income?"income":"expense"}">${income?"आय":"खर्च"}</td><td>${escapeHtml(x.description||"")}</td><td class="${income?"income":"expense"}">${income?"+":"-"}${money(x.amount)}</td></tr>`;
  }).join("");
}
function renderStats(income,expense){document.querySelector("#totalIncome").textContent=money(income);document.querySelector("#totalExpense").textContent=money(expense);document.querySelector("#balance").textContent=money(income-expense)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}

document.querySelector("#refreshLedger").onclick=loadLedger;

document.querySelector("#donationForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const name=document.querySelector("#donorName").value.trim(), mobile=document.querySelector("#donorMobile").value.trim();
  const email=document.querySelector("#donorEmail").value.trim(), amount=Number(document.querySelector("#amount").value);
  const note=document.querySelector("#note").value.trim();
  if(!/^[0-9]{10}$/.test(mobile)) return setStatus("कृपया सही 10 अंकों का मोबाइल नंबर दें।");
  if(!(amount>0)) return setStatus("कृपया सही राशि दर्ज करें।");
  if(!hasBackend) return setStatus("डेमो मोड: Supabase और Razorpay की keys जोड़ने के बाद ऑनलाइन भुगतान चालू होगा।");
  try{
    setStatus("भुगतान तैयार हो रहा है…");
    const order=await api("create-order",{name,mobile,email,amount,note});
    const options={
      key:order.key_id, order_id:order.order_id, amount:order.amount, currency:"INR",
      name:"श्री श्री दुर्गा पूजा महोत्सव", description:"पूजा सहयोग राशि",
      prefill:{name,email,contact:mobile},
      theme:{color:"#b51d00"},
      handler:async response=>{
        try{
          setStatus("भुगतान सत्यापित हो रहा है…");
          const result=await api("verify-payment",{receipt_no:order.receipt_no,...response});
          if(result.status==="paid"){
            window.location.href=`receipt.html?receipt=${encodeURIComponent(order.receipt_no)}`;
          }else setStatus("भुगतान अभी सत्यापित नहीं हुआ। कृपया थोड़ी देर बाद रसीद देखें।");
        }catch(err){setStatus("भुगतान हुआ हो तो भी रसीद webhook से अपने-आप बनेगी। रसीद संख्या: "+order.receipt_no)}
      },
      modal:{ondismiss:()=>setStatus("भुगतान विंडो बंद कर दी गई।")}
    };
    new Razorpay(options).open();
  }catch(err){setStatus(err.message||"भुगतान शुरू नहीं हो सका।")}
});

loadLedger();