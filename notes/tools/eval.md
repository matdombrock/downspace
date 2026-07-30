<textarea id="in" type="text" oninput="update()"></textarea>
<pre id="out">...</pre>
<script>
{
    const input = document.getElementById('in');
    input.placeholder = `
const a = 32;
a + 2`.trim();
    const output = document.getElementById('out');
    let res = '...';
    function update() {
        res = 'syntax-error'
        try {
            output.innerHTML = eval(input.value);
        } catch (err) {
            //     
        };
    }
}
</script>

<style>
#in {
    width: 100%;
    height: 10rem;
}
</style>
