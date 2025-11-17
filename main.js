// ======= CONFIGURACIÓN - editar =======
function updateOutputsFromState(s) {
document.getElementById('currentMode').textContent = s.modo || '--';
document.getElementById('ledOut1').style.background = s.salida1 ? 'green' : 'transparent';
document.getElementById('ledOut2').style.background = s.salida2 ? 'green' : 'transparent';
}


function sendOutputCmd(out, cmd) {
const t = `riego/salida/${DEVICE_ID}/${out}/cmd`;
publish(t, cmd);
}


function setMode(m) {
const t = `riego/modo/${DEVICE_ID}`;
publish(t, m);
}


// Bind UI
window.addEventListener('load', () => {
// botones salidas
document.getElementById('out1On').addEventListener('click', () => sendOutputCmd(1, 'ON'));
document.getElementById('out1Off').addEventListener('click', () => sendOutputCmd(1, 'OFF'));
document.getElementById('out2On').addEventListener('click', () => sendOutputCmd(2, 'ON'));
document.getElementById('out2Off').addEventListener('click', () => sendOutputCmd(2, 'OFF'));


// modos
document.getElementById('btnAuto').addEventListener('click', () => setMode('AUTO'));
document.getElementById('btnManual').addEventListener('click', () => setMode('MANUAL'));
document.getElementById('btnMant').addEventListener('click', () => setMode('MANTENIMIENTO'));


// iniciar conexión MQTT
connectMQTT();


// Register service worker for PWA
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('/sw.js').then(() => console.log('SW registrado'));
}
});


// Simple chart (sin librerías)
function drawTempChart() {
const c = document.getElementById('tempChart');
if (!c) return; const ctx = c.getContext('2d');
ctx.clearRect(0,0,c.width,c.height);
if (tempHistory.length < 2) return;
const w = c.width; const h = c.height;
const max = Math.max(...tempHistory); const min = Math.min(...tempHistory);
const range = Math.max(1, max-min);
ctx.beginPath();
tempHistory.forEach((v,i) => {
const x = (i/(tempHistory.length-1))*(w-10)+5;
const y = h - ((v-min)/range)*(h-10)-5;
if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
});
ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 2; ctx.stroke();
}


// También permitimos control HTTP directo (cuando la web se sirve desde el ESP)
function httpControl(url) {
fetch(url).then(r => r.text()).then(t => console.log('HTTP',t)).catch(e => console.warn(e));
}


// Permitir fallback: si MQTT no se conecta, intentar control HTTP directo al ESP (misma IP)
setInterval(()=>{
if (!client || !client.connected) {
document.getElementById('mqttState').textContent = 'Desconectado - usando HTTP (fallback)';
// NOTA: para usar HTTP fallback necesitas que la página se sirva desde el ESP
}
}, 5000);