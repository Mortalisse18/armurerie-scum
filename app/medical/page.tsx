"use client"

import { useEffect, useMemo, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore"

export default function MedicalPage(){
 const [tab,setTab]=useState("shop")
 const [online]=useState(3)
 const [alerts,setAlerts]=useState(12)
 const [messages,setMessages]=useState<any[]>([{user:'Medic',text:'Nous arrivons sur zone.'},{user:'Joueur',text:'Merci !'}])
 const [chatText,setChatText]=useState('')
 const [sosSent,setSosSent]=useState(false)
 const items=[
  {name:"Bandage Compressif",price:900,stock:32},
  {name:"Garrot",price:1800,stock:16},
  {name:"Plaquette Antibiotique",price:2160,stock:10},
  {name:"Pot Antalgique",price:4320,stock:6},
  {name:"Bandage",price:450,stock:24},
  {name:"Alcool",price:900,stock:12},
  {name:"Antibiotique",price:3780,stock:4},
  {name:"Seringue",price:525,stock:9},
  {name:"Kit Trauma",price:5400,stock:2},
 ]
 const totalStock=useMemo(()=>items.reduce((a,b)=>a+b.stock,0),[])
 useEffect(()=>{
 const q=query(collection(db,'medicalChat'),orderBy('createdAt','asc'))
 const unsub=onSnapshot(q,(snap)=>setMessages(snap.docs.map((d:any)=>d.data())))
 return ()=>unsub()
},[])
 return (
 <main style={styles.page}>
  <div style={styles.wrap}>
   <header style={styles.header}>
    <div>
      <div style={styles.logo}>⚕️ TRAUMA TEAM</div>
      <h1 style={styles.title}>TRAUMA TEAM MEDICAL CENTER</h1>
      <p style={styles.sub}>Urgences SCUM • Réanimation • Extraction • Vente médicale</p>
    </div>
    <div style={styles.badge}>🚑 UNITÉ ACTIVE • {online} MÉDICS</div>
   </header>

   <div style={styles.stats}><div style={styles.mini}>🚨 Alertes: {alerts}</div><div style={styles.mini}>👨‍⚕️ En ligne: {online}</div><div style={styles.mini}>📦 Stock: {totalStock}</div></div>

   <div style={styles.nav}>
    <button style={styles.btn} onClick={()=>setTab('shop')}>🏥 Boutique</button>
    <button style={styles.btn} onClick={()=>setTab('urgence')}>🚑 Urgence</button>
    <button style={styles.btn} onClick={()=>setTab('chat')}>💬 Chat</button>
    <button style={styles.btn} onClick={()=>setTab('map')}>🗺 Carte</button>
   </div>

   {tab==='shop' && <section style={styles.card}>
    <h2>Armurerie Médicale / Pharmacie</h2>
    <table style={styles.table}><thead><tr><th>Produit</th><th>Prix</th><th>Stock</th><th></th></tr></thead><tbody>
    {items.map((it,i)=><tr key={i}><td>{it.name}</td><td>{it.price}$</td><td>{it.stock}</td><td><button style={styles.buy}>Acheter</button></td></tr>)}
    </tbody></table>
    <p>Stock total : {totalStock}</p>
   </section>}

   {tab==='urgence' && <section style={styles.card}>
    <h2>Appel d'Urgence Trauma Team</h2>
    <input style={styles.input} placeholder='Pseudo joueur'/>
    <input style={styles.input} placeholder='Zone / Ville'/>
    <select style={styles.input}><option>Blessure légère</option><option>Blessure grave</option><option>Combat actif</option></select>
    <button style={styles.sos}>🚨 SOS PRIORITAIRE</button>
    <button style={styles.buy} onClick={async()=>{await addDoc(collection(db,'medicalAlerts'),{type:'SOS',createdAt:Date.now()});setAlerts(v=>v+1);setSosSent(true)}}>📡 Envoyer SOS</button>
    {sosSent && <p>✅ SOS transmis à l'équipe médicale</p>}
   </section>}

   {tab==='chat' && <section style={styles.card}><h2>Radio / Chat Direct</h2><div style={styles.chat}>{messages.map((m:any,i:number)=><div key={i}>{m.user}: {m.text}</div>)}</div><input value={chatText} onChange={(e)=>setChatText(e.target.value)} style={styles.input} placeholder='Votre message...' /><button style={styles.buy} onClick={async()=>{if(!chatText.trim())return;await addDoc(collection(db,'medicalChat'),{user:'Joueur',text:chatText,createdAt:Date.now()});setChatText('')}}>Envoyer</button></section>}

   {tab==='map' && <section style={styles.card}><h2>Carte Opérationnelle SCUM</h2><div style={styles.map}>📍 Joueur blessé<br/>🚑 Ambulance Alpha<br/>🚑 Ambulance Bravo<br/>🏥 Base Trauma Team</div></section>}
  </div>
 </main>)
}

const styles:any={
page:{minHeight:'100vh',padding:30,background:'linear-gradient(180deg,#07111f,#0f2747,#163d6e)',fontFamily:'Arial',color:'#fff'},
wrap:{maxWidth:1200,margin:'0 auto'},
header:{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,background:'rgba(255,255,255,.08)',padding:24,borderRadius:18,border:'2px solid #60a5fa',backdropFilter:'blur(8px)'},
logo:{fontWeight:'bold',color:'#1d4ed8'},title:{margin:'8px 0',fontSize:42,color:'#123ea8'},sub:{margin:0,color:'#dc2626'},badge:{padding:'10px 14px',background:'#e8fff0',borderRadius:12,color:'#15803d',fontWeight:'bold'},
stats:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:20},
mini:{padding:12,borderRadius:12,background:'rgba(255,255,255,.08)',border:'1px solid #60a5fa',fontWeight:'bold'},
nav:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginTop:20},
btn:{padding:12,borderRadius:12,border:'1px solid #60a5fa',background:'rgba(255,255,255,.06)',color:'#fff',cursor:'pointer',fontWeight:'bold'},
card:{marginTop:20,background:'rgba(255,255,255,.08)',padding:24,borderRadius:18,border:'1px solid #60a5fa',backdropFilter:'blur(8px)'},
table:{width:'100%',borderCollapse:'collapse'},
input:{width:'100%',padding:12,margin:'8px 0',borderRadius:10,border:'1px solid #93c5fd'},
buy:{padding:'10px 14px',background:'#2563eb',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:'bold'},
sos:{padding:'14px 18px',background:'#dc2626',color:'#fff',border:'none',borderRadius:12,cursor:'pointer',fontWeight:'bold',marginRight:10,boxShadow:'0 0 20px rgba(255,0,0,.35)'}, 
chat:{minHeight:180,padding:14,background:'#eff6ff',borderRadius:12},
map:{minHeight:280,display:'grid',placeItems:'center',background:'repeating-linear-gradient(45deg,#eff6ff,#eff6ff 10px,#dbeafe 10px,#dbeafe 20px)',borderRadius:14,fontSize:28,fontWeight:'bold',color:'#1e3a8a'}
}
