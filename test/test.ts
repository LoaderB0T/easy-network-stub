import { EasyNetworkStub } from '../src/easy-network-stub';
const blogStub = new EasyNetworkStub('/MyServer/api/Blog');

blogStub.stub('DELETE', 'posts/{id:number}/{id2}/{id3:number}?{yee}&{bla:number}', ({ body, params }) => {});
