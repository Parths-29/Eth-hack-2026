import {createServer} from 'vite';
// Test-only process. Missing deployment config exercises honest fallback without external RPC traffic.
process.env.VITE_USE_MOCK_DATA='false';
process.env.VITE_ARKIV_PUBLISHER='';
const server=await createServer({server:{host:'127.0.0.1',port:5174,strictPort:true}});
await server.listen();
