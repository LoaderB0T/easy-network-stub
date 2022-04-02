import { EasyNetworkStub } from '../src/easy-network-stub';

export class Test extends EasyNetworkStub {
  init() {
    const posts = [0, 1, 2, 3, 4, 5].map(x => ({ postId: x, text: `test${x}` }));

    const blogStub = new EasyNetworkStub('/MyServer/api/Blog');

    blogStub.stub('GET', 'posts', () => {
      return posts;
    });

    blogStub.stub('GET', 'posts/{id:number}', ({ params }) => {
      return posts.find(x => x.postId === params.id);
    });

    blogStub.stub('POST', 'posts', ({ body }) => {
      posts.push({ postId: body.postId, text: body.text });
    });

    blogStub.stub('DELETE', 'posts/{id:number}/{id2}/{id3:number}', ({ params }) => {
      const idx = posts.findIndex(x => x.postId === params.id);
      posts.splice(idx, 1);
    });
    blogStub.stub('DELETE', 'posts/{id:number}?{id2}&{id3:number}', ({ params }) => {
      const idx = posts.findIndex(x => x.postId === params.id);
      posts.splice(idx, 1);
    });

    blogStub.stub('GET', 'test/{id:number}/{test}?{bla:number}', ({ params }) => {
      console.log(params);
    });
  }
}
