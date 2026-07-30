<input id="in" type="text" oninput="update()">
<pre id="out">...</pre>
<button onclick="save()">save</button>
<pre id="saved">saved</pre>
<script>
    const input = document.getElementById('in');
    const output = document.getElementById('out');
    const saved = document.getElementById('saved');
    let res = '...';
    let savedArr = [];
    function update() {
        res = 'syntax-error'
        try {
            output.innerHTML = eval(input.value);
        } catch (err) {
            //     
        };
    }
    function save() {
        savedArr.push(res);
        saved
    }
</script>
