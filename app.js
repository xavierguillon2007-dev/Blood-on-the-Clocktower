const $ = s => document.querySelector(s);
let roleData = [];
let state = {players:[], phase:"Nuit", day:1, notes:"", tokens:[]};
let selectedId = null;
const teams = ["Villageois","Outsider","Sbire","Démon"];
const teamColor = {"Villageois":"#9d83c9","Outsider":"#7fae9a","Sbire":"#c77d83","Démon":"#d8a35f"};
const uid = () => Math.random().toString(36).slice(2,10);
async function init(){
  try { const r=await fetch("roles.json"); roleData=await r.json(); } catch(e) { roleData=[]; }
  const saved=localStorage.getItem("clocktower-game-v1");
  if(saved){try{state={...state,...JSON.parse(saved)}}catch(e){}}
  $("#gameNotes").value=state.notes||"";
  populateRoleSelect(); render(); bind();
}
function save(){localStorage.setItem("clocktower-game-v1",JSON.stringify(state));$("#saveState").textContent="● Sauvegardé localement";}
function populateRoleSelect(){
  const groups={}; roleData.forEach(r=>(groups[r[2]]??=[]).push(r));
  $("#playerRole").innerHTML='<option value="">— Aucun rôle attribué —</option>'+Object.entries(groups).map(([g,rs])=>`<optgroup label="${esc(g)}">${rs.map(r=>`<option value="${esc(r[0])}">${esc(r[0])} · ${r[1]}</option>`).join("")}</optgroup>`).join("");
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function roleInfo(name){return roleData.find(r=>r[0]===name)||[name||"Rôle non attribué","—","Personnalisé"];}
function render(){
  const alive=state.players.filter(p=>!p.dead).length, dead=state.players.length-alive, votes=state.players.filter(p=>!p.dead&&!p.voted).length;
  $("#aliveCount").textContent=alive;$("#deadCount").textContent=dead;$("#votesCount").textContent=votes;$("#totalCount").textContent=state.players.length;$("#centerCounts").textContent=`${alive} vivants · ${dead} morts`;
  $("#roundLabel").textContent=state.phase==="Nuit"?`NUIT ${state.day}`:`JOUR ${state.day}`;
  $("#phaseText").textContent=state.phase;$("#phaseIcon").textContent=state.phase==="Nuit"?"☾":"☀";$("#phaseBtn").className=`phase ${state.phase==="Jour"?"day":"night"}`;
  renderSeats();renderPlayers();renderBreakdown();renderTokens();$("#gameNotes").value=state.notes||"";
  $("#tokenPlayer").innerHTML='<option value="">Choisir un joueur</option>'+state.players.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
}
function renderSeats(){
 const wrap=$("#seats");wrap.innerHTML="";const n=state.players.length;if(!n)return;
 state.players.forEach((p,i)=>{
   const a=(2*Math.PI*i/n)-Math.PI/2, radius=40;
   const x=p.position?.x ?? 50+radius*Math.cos(a), y=p.position?.y ?? 50+radius*Math.sin(a);
   const b=document.createElement("button");b.className="seat"+(p.dead?" dead":"")+(p.poisoned?" poisoned":"");
   b.style.left=x+"%";b.style.top=y+"%";
   b.innerHTML=`<span class="seat-number">${String(i+1).padStart(2,"0")}</span><strong>${esc(p.name)}</strong><small>${p.dead?"✝ Mort":esc(p.role||"Rôle à définir")}</small>${p.poisoned?'<span class="poison-marker" title="Empoisonné jusqu’au début de la prochaine nuit">☠ Empoisonné</span>':''}`;
   b.title="Déplacer par glisser-déposer · Cliquer pour ouvrir la fiche de "+p.name;
   let startX=0,startY=0, moved=false, dragging=false, pointerId=null;
   const moveSeat = e => {
     if(!dragging || (pointerId!==null && e.pointerId!==undefined && e.pointerId!==pointerId))return;
     const dx=e.clientX-startX,dy=e.clientY-startY;
     if(Math.hypot(dx,dy)>4)moved=true;
     if(!moved)return;
     const rect=wrap.getBoundingClientRect();
     const px=Math.max(6,Math.min(94,((e.clientX-rect.left)/rect.width)*100));
     const py=Math.max(7,Math.min(93,((e.clientY-rect.top)/rect.height)*100));
     b.style.left=px+"%";b.style.top=py+"%";
   };
   const finishDrag = e => {
     if(!dragging)return;
     if(e && pointerId!==null && e.pointerId!==undefined && e.pointerId!==pointerId)return;
     dragging=false;b.classList.remove("dragging");
     if(moved){
       const rect=wrap.getBoundingClientRect();
       p.position={
         x:Math.max(6,Math.min(94,((e.clientX-rect.left)/rect.width)*100)),
         y:Math.max(7,Math.min(93,((e.clientY-rect.top)/rect.height)*100))
       };
       b.dataset.dragged="true";save();
       setTimeout(()=>delete b.dataset.dragged,120);
     }
     pointerId=null;
     window.removeEventListener("pointermove",moveSeat);
     window.removeEventListener("pointerup",finishDrag);
     window.removeEventListener("pointercancel",finishDrag);
   };
   b.addEventListener("pointerdown",e=>{
     if(e.button!==undefined && e.button!==0)return;
     e.preventDefault();
     startX=e.clientX;startY=e.clientY;moved=false;dragging=true;pointerId=e.pointerId;
     b.classList.add("dragging");
     window.addEventListener("pointermove",moveSeat);
     window.addEventListener("pointerup",finishDrag);
     window.addEventListener("pointercancel",finishDrag);
   });
   b.addEventListener("click",e=>{
     if(moved || b.dataset.dragged==="true"){e.preventDefault();e.stopPropagation();return;}
     openDetail(p.id);
   });
   wrap.appendChild(b);
 });
}
function renderPlayers(){
 const q=$("#playerSearch").value.toLowerCase(),f=$("#filterTeam").value;
 const list=state.players.filter(p=>p.name.toLowerCase().includes(q)&&(!f||roleInfo(p.role)[1]===f));
 $("#playerList").innerHTML=list.length?list.map(p=>`<div class="player-card" data-id="${p.id}"><div class="avatar">${esc(p.name.slice(0,1).toUpperCase())}</div><div><strong>${esc(p.name)}</strong><small>${esc(p.role||"Aucun rôle")} · ${esc(roleInfo(p.role)[1])}</small></div><span class="status-dot ${p.dead?"dead":""}"></span></div>`).join(""):'<p class="muted">Aucun joueur pour le moment. Ajoute les participants pour commencer.</p>';
 document.querySelectorAll(".player-card").forEach(el=>el.onclick=()=>openDetail(el.dataset.id));
}
function renderBreakdown(){
 $("#breakdown").innerHTML=teams.map(t=>`<div class="break-row"><span>${t}</span><span>${state.players.filter(p=>roleInfo(p.role)[1]===t).length}</span></div>`).join("");
}
function renderTokens(){
 const all=state.tokens||[];$("#tokenList").innerHTML=all.length?all.map((t,i)=>`<div class="token-item"><span><b>${esc(t.name)}</b> <span class="muted">· ${esc(state.players.find(p=>p.id===t.playerId)?.name||"Joueur supprimé")}</span></span><button data-token="${i}">Retirer</button></div>`).join(""):'<p class="muted">Aucun jeton ajouté.</p>';
 document.querySelectorAll("[data-token]").forEach(b=>b.onclick=()=>{state.tokens.splice(+b.dataset.token,1);save();renderTokens()});
}
function showModal(id){$(id).classList.remove("hidden")}
function hideModals(){document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"))}
function openPlayerForm(id=null){
 const p=state.players.find(x=>x.id===id);$("#editId").value=id||"";$("#playerName").value=p?.name||"";$("#playerRole").value=p?.role||"";
 $("#modalTitle").textContent=p?"Modifier le joueur":"Ajouter un joueur";$("#modalEyebrow").textContent=p?"MODIFIER LA FICHE":"NOUVEAU JOUEUR";showModal("#modal");$("#playerName").focus();
}
function openDetail(id){
 selectedId=id;const p=state.players.find(x=>x.id===id);if(!p)return;
 $("#detailName").textContent=p.name;const info=roleInfo(p.role);$("#detailRole").textContent=`${info[1]} · ${p.role||"Rôle non attribué"}`;
 $("#toggleDead").textContent=p.dead?"Rendre vivant":"Marquer mort";$("#toggleVote").textContent=p.voted?"Annuler le vote utilisé":"Vote utilisé";$("#togglePoison").textContent=p.poisoned?"☠ Retirer l’empoisonnement":"☠ Empoisonné";$("#togglePoison").classList.toggle("active",!!p.poisoned);
 $("#detailTokens").innerHTML=(p.tokens||[]).map(t=>`<span>${esc(t)}</span>`).join("")||'<small class="muted">Aucun rappel</small>';showModal("#detailModal");
}
function bind(){
 document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.tab-panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#tab-"+b.dataset.tab).classList.add("active")});
 $("#addPlayer").onclick=$("#addPlayerTop").onclick=()=>openPlayerForm();
 $("#playerForm").onsubmit=e=>{e.preventDefault();const id=$("#editId").value,name=$("#playerName").value.trim(),role=$("#playerRole").value;if(!name)return;
 if(id){Object.assign(state.players.find(p=>p.id===id),{name,role})}else state.players.push({id:uid(),name,role,dead:false,voted:false,tokens:[]});
 save();hideModals();render();};
 document.querySelectorAll("[data-close]").forEach(x=>x.onclick=hideModals);document.querySelectorAll(".close").forEach(x=>x.onclick=hideModals);
 $("#toggleDead").onclick=()=>{const p=state.players.find(p=>p.id===selectedId);p.dead=!p.dead;save();render();openDetail(selectedId)};
 $("#toggleVote").onclick=()=>{const p=state.players.find(p=>p.id===selectedId);p.voted=!p.voted;save();render();openDetail(selectedId)};
 $("#togglePoison").onclick=()=>{const p=state.players.find(p=>p.id===selectedId);p.poisoned=!p.poisoned;save();render();openDetail(selectedId)};
 $("#editPlayer").onclick=()=>{hideModals();openPlayerForm(selectedId)};
 $("#deletePlayer").onclick=()=>{if(confirm("Supprimer ce joueur ?")){state.players=state.players.filter(p=>p.id!==selectedId);state.tokens=state.tokens.filter(t=>t.playerId!==selectedId);save();hideModals();render()}};
 $("#detailToken").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();const v=e.target.value.trim();if(v){state.players.find(p=>p.id===selectedId).tokens.push(v);e.target.value="";save();render();openDetail(selectedId)}}};
 function changePhase(next){
   if(state.phase===next)return;
   // Les effets « cette nuit et demain » expirent au début de la nuit suivante.
   if(state.phase==="Jour" && next==="Nuit") state.players.forEach(p=>{p.poisoned=false});
   state.phase=next;
   if(next==="Nuit")state.day++;
   save();render();
 }
 $("#phaseBtn").onclick=()=>changePhase(state.phase==="Nuit"?"Jour":"Nuit");
 $("#nextDay").onclick=()=>changePhase("Jour");$("#nextNight").onclick=()=>changePhase("Nuit");
 $("#resetVotes").onclick=()=>{state.players.forEach(p=>p.voted=false);save();render()};
 $("#playerSearch").oninput=renderPlayers;$("#filterTeam").onchange=renderPlayers;
 $("#addToken").onclick=()=>{const playerId=$("#tokenPlayer").value,name=$("#tokenName").value.trim();if(!playerId||!name)return alert("Choisis un joueur et indique un jeton.");state.tokens.push({playerId,name});$("#tokenName").value="";save();renderTokens()};
 $("#gameNotes").oninput=e=>{state.notes=e.target.value;save()};
 $("#exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="clocktower-partie.json";a.click();URL.revokeObjectURL(a.href)};
 $("#importBtn").onclick=()=>$("#importFile").click();$("#importFile").onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.players))throw Error();state={...state,...data};save();render();alert("Partie importée avec succès.")}catch(err){alert("Fichier de partie invalide.")}e.target.value=""};
}
init();
