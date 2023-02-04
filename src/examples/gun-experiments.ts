import Gun from 'gun';
import { getGun } from "../helpers";

// ? Question: could we set an anonymous gun node directly to set? Answer: No


// const node = Gun.node.ify({
//     test: 'test'
// });

// getGun().put(node);

// getGun().get("root").get('testset').set(node);


// getGun().get("root").get('testset').get(node['_']['#']).once((data) => {
//     console.log(data);
// });

// const metadata = await getGun().get('root').get('profile').get('posts').then();
// getGun().get('root').get('profile').get('posts').once().map().once((data, key) => {
// });