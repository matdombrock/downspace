<div id="cmd-list"></div>

<button id="load-btn" onclick="load()">load</button>

<div id="status"></div>
<pre id="out">...</pre>

<script>
{
document.getElementById('load-btn').style.display = 'none';

const cmdl = [
  'ls ..',
  'tailscale status',
  'podman ps',
  'tree ~/Documents/notes',
  'rclone ls do:',
  'rclone ls do:replicat',
  'cp -r ~/Documents/notes ~/Documents/notes.`date +%s`.bak',
  '/usr/bin/tim get matdombrock.com',
  '/usr/bin/tim get https://en.wikipedia.org/wiki/Markdown'
];

const cmdList = document.getElementById('cmd-list');
//const cmdListOut = '';
//for (let cmd of cmdl){
//  alert(cmd);
//  cmdListOut += `<button onclick='x("${cmd}")'>${cmd}</button>`;
//}
//cmdsList.innerHTML = cmdListOut;

for (let cmd of cmdl) {
  const btn = document.createElement('button');
  btn.textContent = cmd;
  btn.addEventListener('click', () => x(cmd));
  btn.style.padding = '0.5rem';
  btn.style.margin = '0.5rem';
  cmdList.appendChild(btn);
}
  
async function x(cmd) {
  const response = await fetch('/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: cmd }),
  });
  const data = await response.json();
  document.getElementById('out').innerHTML = data.stdout;

  const exitCodeStr = (data.exitCode ? "err: " : "ok: ") + data.exitCode;
    document.getElementById('status').innerHTML = exitCodeStr;

  alert(JSON.stringify(data, null, 2));
}
}
</script>
