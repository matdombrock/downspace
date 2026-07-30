<textarea id="in" oninput="update()" placeholder="2 + 2&#10"></textarea>
<pre id="out">...</pre>

<div id="keypad">
  <button onclick="append('7')">7</button>
  <button onclick="append('8')">8</button>
  <button onclick="append('9')">9</button>
  <button onclick="append('/')">÷</button>
  <button onclick="clearInput()">C</button>
  <button onclick="append('4')">4</button>
  <button onclick="append('5')">5</button>
  <button onclick="append('6')">6</button>
  <button onclick="append('*')">×</button>
  <button onclick="backspace()">⌫</button>
  <button onclick="append('1')">1</button>
  <button onclick="append('2')">2</button>
  <button onclick="append('3')">3</button>
  <button onclick="append('-')">−</button>
  <button onclick="update()">=</button>
  <button onclick="append('0')">0</button>
  <button onclick="append('.')">.</button>
  <button onclick="append('%')">%</button>
  <button onclick="append('+')">+</button>
  <button onclick="append('(')">(</button>
  <button onclick="append(')')">)</button>
  <button onclick="append('**')">xʸ</button>
  <button onclick="append('Math.')">Math</button>
  <button onclick="append('Math.PI')">π</button>
  <button onclick="append('Math.E')">e</button>
</div>

<div id="toolbar">
  <button onclick="saveResult()">Save Result</button>
  <button onclick="clearHistory()">Clear History</button>
</div>

<h3>History</h3>
<div id="history"><em>No saved results</em></div>

<script>
{
    const input = document.getElementById('in');
    const output = document.getElementById('out');
    const historyDiv = document.getElementById('history');
    let history = [];

    function update() {
        try {
            const result = eval(input.value);
            output.textContent = result === undefined ? 'undefined' : String(result);
        } catch (err) {
            output.textContent = 'error';
        }
    }

    function append(val) {
        input.value += val;
        update();
        input.focus();
    }

    function clearInput() {
        input.value = '';
        update();
        input.focus();
    }

    function backspace() {
        input.value = input.value.slice(0, -1);
        update();
        input.focus();
    }

    function saveResult() {
        const val = output.textContent;
        if (val !== 'error' && val !== '...') {
            history.push(val);
            renderHistory();
        }
    }

    function clearHistory() {
        history = [];
        renderHistory();
    }

    function renderHistory() {
        historyDiv.innerHTML = '';
        if (history.length === 0) {
            historyDiv.innerHTML = '<em>No saved results</em>';
            return;
        }
        history.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'history-item';

            const span = document.createElement('span');
            span.className = 'history-value';
            span.textContent = item;

            const loadBtn = document.createElement('button');
            loadBtn.textContent = 'Load';
            loadBtn.addEventListener('click', () => {
                input.value += item;
                update();
                input.focus();
            });

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Del';
            delBtn.addEventListener('click', () => {
                history.splice(i, 1);
                renderHistory();
            });

            div.appendChild(span);
            div.appendChild(loadBtn);
            div.appendChild(delBtn);
            historyDiv.appendChild(div);
        });
    }
}
</script>

<style>
#in {
    width: 100%;
    height: 8rem;
    font-family: monospace;
    font-size: 1.1rem;
    padding: 6px;
    box-sizing: border-box;
    resize: vertical;
}
#out {
    background: #eee;
    color: #000;
    padding: 8px 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 1.2rem;
    margin: 8px 0;
    min-height: 1.6em;
    border: 1px solid #ddd;
}
#keypad {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    margin: 8px 0;
}
#keypad button {
    padding: 10px 4px;
    font-size: 1rem;
    cursor: pointer;
    border: 1px solid #ccc;
    background: #fafafa;
    color: #000;
    border-radius: 4px;
    font-family: inherit;
}
#keypad button:hover {
    background: #e8e8e8;
}
#keypad button:active {
    background: #d0d0d0;
}
#toolbar {
    display: flex;
    gap: 8px;
    margin: 8px 0;
}
#toolbar button {
    flex: 1;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #000;
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 4px;
}
#toolbar button:hover {
    background: #e0e0e0;
}
#history {
    margin-top: 8px;
}
.history-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px solid #eee;
}
.history-item .history-value {
    flex: 1;
    font-family: monospace;
    font-size: 0.95rem;
    color: inherit;
}
.history-item button {
    font-size: 0.8rem;
    padding: 2px 8px;
    cursor: pointer;
    color: #000;
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 3px;
}
.history-item button:hover {
    background: #e0e0e0;
}
@media (prefers-color-scheme: dark) {
    #in {
        background: #1e1e1e;
        color: #e0e0e0;
        border-color: #555;
    }
    #out {
        background: #2a2a2a;
        color: #e0e0e0;
        border-color: #555;
    }
    #keypad button {
        background: #333;
        color: #e0e0e0;
        border-color: #555;
    }
    #keypad button:hover {
        background: #444;
    }
    #keypad button:active {
        background: #555;
    }
    #toolbar button {
        background: #333;
        color: #e0e0e0;
        border-color: #555;
    }
    #toolbar button:hover {
        background: #444;
    }
    .history-item {
        border-bottom-color: #444;
    }
    .history-item button {
        background: #333;
        color: #e0e0e0;
        border-color: #555;
    }
    .history-item button:hover {
        background: #444;
    }
}
</style>
