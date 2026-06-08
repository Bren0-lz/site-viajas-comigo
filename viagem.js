/* ===== CONFIGURAÇÃO ===== */
const WHATSAPP = "5599999999999"; // mesmo número do index.html
/* Cole aqui a chave do Google (Street View Static API). Vazio = mostra só as fotos. */
const GOOGLE_MAPS_KEY = "";
/* ========================= */

function slug(s){
  return (s||"").toString().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
function waLink(extra){
  return "https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(extra||"Olá! Vim pelo site da Viajas Comigo.");
}
function carregar(){
  try{const s=JSON.parse(localStorage.getItem("viajascomigo_destinos")); if(Array.isArray(s)&&s.length) return s;}catch(e){}
  return window.SEED_DESTINOS||[];
}
function streetViewURL(local,w,h){
  if(!GOOGLE_MAPS_KEY || !local) return null;
  return "https://maps.googleapis.com/maps/api/streetview?size="+w+"x"+h+"&fov=85&location="+encodeURIComponent(local)+"&key="+GOOGLE_MAPS_KEY;
}

var params = new URLSearchParams(location.search);
var alvo = params.get("v");
var lista = carregar();
var d = lista.find(function(x){return slug(x.titulo) === alvo;}) || lista[parseInt(params.get("i"))];
var cont = document.getElementById("conteudo");
var LBIMG = [], lbi = 0;

if(!d){
  cont.innerHTML = '<div class="wrap nf"><h1>Viagem não encontrada</h1><p>Talvez ela já tenha saído do ar ou o link esteja incompleto.</p><a href="index.html#viagens" class="btn btn-solid">Ver todas as viagens</a></div>';
  document.getElementById("wa-float").href = waLink();
} else {
  document.title = d.titulo + " · Viajas Comigo";
  var msg = "Olá! Tenho interesse na viagem para "+d.titulo+" ("+d.data+"). Pode me passar mais detalhes?";
  document.getElementById("wa-float").href = waLink(msg);

  LBIMG = [d.imagem].concat((d.galeria&&d.galeria.length)?d.galeria:[]).filter(Boolean);

  var badge = d.esgotado
    ? '<span class="badge esgotado">Esgotado</span>'
    : '<span class="badge">Vagas abertas</span>';

  var detalhes = d.detalhes
    ? '<p class="lead">'+d.detalhes+'</p>'
    : (d.descricao ? '<p class="lead">'+d.descricao+'</p>' : "");

  var inclusos = (d.inclusos&&d.inclusos.length)
    ? '<div class="block"><h2><span class="dot"></span>O que está incluso</h2><ul class="inclusos">'+
      d.inclusos.map(function(i){return '<li><span class="ck">✓</span><span>'+i+'</span></li>';}).join("")+'</ul></div>'
    : "";

  var roteiro = (d.roteiro&&d.roteiro.length)
    ? '<div class="block"><h2><span class="dot"></span>Roteiro dia a dia</h2><ul class="roteiro">'+
      d.roteiro.map(function(r){ var p=r.split("—");
        return p.length>1 ? '<li><b>'+p[0].trim()+'</b> <span>— '+p.slice(1).join("—").trim()+'</span></li>' : '<li><span>'+r+'</span></li>';
      }).join("")+'</ul></div>'
    : "";

  var galeria = "";
  if(d.galeria && d.galeria.length){
    var items = d.galeria.map(function(gimg,idx){
      var cls = idx===0 ? "g-item feat" : "g-item";
      var lbIndex = LBIMG.indexOf(gimg);
      return '<div class="'+cls+'" onclick="abrirLB('+lbIndex+')"><img src="'+gimg+'" alt="'+d.titulo+'" loading="lazy"></div>';
    }).join("");
    galeria = '<div class="block"><h2><span class="dot"></span>Fotos da viagem</h2><div class="galeria">'+items+'</div></div>';
  }

  var mapa = d.local
    ? '<div class="block mapa"><h2><span class="dot"></span>Onde fica</h2><p class="loc">📍 '+d.local+'</p>'+
      '<iframe loading="lazy" src="https://www.google.com/maps?q='+encodeURIComponent(d.local)+'&output=embed"></iframe></div>'
    : "";

  var sv = streetViewURL(d.local, 640, 360);
  var svMaps = "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(d.local||"");
  var streetview = sv
    ? '<div class="block"><h2><span class="dot"></span>A vista de quem chega</h2>'+
      '<a class="sv-wrap" href="'+svMaps+'" target="_blank" rel="noopener" id="sv-block">'+
      '<img id="sv-img" src="'+sv+'" alt="Street View de '+d.local+'" onerror="document.getElementById(\'sv-block\').style.display=\'none\'">'+
      '<span class="sv-cta">Explorar no Google Maps ↗</span></a>'+
      '<p class="sv-note">Imagem de rua do Google · clique para explorar o entorno.</p></div>'
    : "";

  var btnReserva = d.esgotado
    ? '<span class="btn btn-ghost" style="width:100%;justify-content:center;opacity:.6;cursor:default">Esgotado</span>'
    : '<a class="btn wa" target="_blank" rel="noopener" href="'+waLink(msg)+'">Tenho interesse (WhatsApp)</a>';

  cont.innerHTML =
    '<section class="hero" style="background-image:url(\''+d.imagem+'\')" onclick="abrirLB(0)">'+
      '<div class="wrap hero-content">'+badge+'<h1>'+d.titulo+'</h1>'+
      '<div class="meta">'+(d.data||"")+(d.local?" · "+d.local:"")+'</div></div>'+
      (LBIMG.length>1?'<span class="count">📷 '+LBIMG.length+' fotos · toque para ampliar</span>':"")+
    '</section>'+
    '<div class="wrap layout"><div class="main">'+
      detalhes+galeria+inclusos+roteiro+streetview+mapa+
    '</div>'+
    '<aside class="side"><div class="card-price">'+
      '<small>A partir de</small><div class="val">R$ '+(d.preco||"—")+'</div><div class="per">por pessoa</div>'+
      '<ul class="facts">'+
        '<li><span>Datas</span><b>'+(d.data||"A definir")+'</b></li>'+
        '<li><span>Vagas</span><b>'+(d.vagas||"Consultar")+'</b></li>'+
        (d.local?'<li><span>Destino</span><b>'+d.local+'</b></li>':"")+
      '</ul>'+btnReserva+
      '<a class="btn btn-ghost" target="_blank" rel="noopener" href="https://instagram.com/viajascomigo" style="width:100%;justify-content:center;margin-top:10px">Ver no Instagram</a>'+
      '<p class="reassure">Sem compromisso — tire suas dúvidas direto com a gente.</p>'+
    '</div></aside></div>';
}

/* ===== LIGHTBOX ===== */
var lb=document.getElementById("lb"), lbImg=document.getElementById("lb-img"), lbCap=document.getElementById("lb-cap");
function abrirLB(i){ if(!LBIMG.length) return; lbi=(i+LBIMG.length)%LBIMG.length; lbImg.src=LBIMG[lbi]; lbCap.textContent=(lbi+1)+" / "+LBIMG.length; lb.classList.add("open"); }
function fecharLB(){ lb.classList.remove("open"); }
function navLB(n){ abrirLB(lbi+n); }
document.getElementById("lb-x").onclick=fecharLB;
document.getElementById("lb-prev").onclick=function(e){e.stopPropagation();navLB(-1);};
document.getElementById("lb-next").onclick=function(e){e.stopPropagation();navLB(1);};
lb.addEventListener("click",function(e){ if(e.target===lb) fecharLB(); });
document.addEventListener("keydown",function(e){
  if(!lb.classList.contains("open")) return;
  if(e.key==="Escape") fecharLB();
  if(e.key==="ArrowLeft") navLB(-1);
  if(e.key==="ArrowRight") navLB(1);
});
var hdr=document.getElementById("hdr");
addEventListener("scroll",function(){hdr.classList.toggle("scrolled",scrollY>30);});
