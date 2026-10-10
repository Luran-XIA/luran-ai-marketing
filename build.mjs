import {build} from 'vite';
import {readFile,writeFile} from 'node:fs/promises';
await build();
let html=await readFile('.build/source.html','utf8');
for(const match of [...html.matchAll(/<script[^>]*src="([^" ]+)"[^>]*><\/script>/g)]) {
  const code=await readFile('.build/'+match[1].replace(/^\.\//,''),'utf8');
  html=html.replace(match[0],()=>'<script type="module">'+code.replace(/<\/script/gi,'<\\/script')+'</script>');
}
for(const match of [...html.matchAll(/<link[^>]*href="([^" ]+\.css)"[^>]*>/g)]) {
  const css=await readFile('.build/'+match[1].replace(/^\.\//,''),'utf8');
  html=html.replace(match[0],()=>'<style>'+css+'</style>');
}
await writeFile('index.html',html);
console.log('GitHub Pages index.html ready');
