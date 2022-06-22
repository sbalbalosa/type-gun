/**
 * 
 * 
 * profile -> post(set) -> likes(set) -> profile
 * 
 * !SAVING update gun store
 * 
 * const profile = new Profile(gunInstance);
 * profile.firstName = 'John';
 * profile.lastName = 'Doe';
 * profile.save();
 * 
 * const post = new Post(profile);
 * post.content = 'test';
 * post.title = 'title';
 * post.save();
 * 
 * const like = new Like(post);
 * like.count = 5;
 * like.save();
 * 
 * !FETCHING get a connected instance
 * 
 * const profile = new Profile(gunInstance);
 * const post = await profile.posts.fetchById('1');
 * const posts = await profile.posts.fetchAll();
 * post.save(); // NOTE: connected already
 *
 * 
 * const like = await post.likes.fetchById('1');
 * await like.save();
 * const profile = await like.profile.fetch();
 * 
 * !SYNCING get the latest data from gun store
 * 
 * const profile = new Profile(gunInstance);
 * await profile.sync();
 * console.log(profile.firstName);
 * 
 * !SUBSCRIBING two way data binding for gun store
 * 
 * const profile = new Profile(gunInstance);
 * profile.subscribe((updated) => console.log(updated));
 * profile.firstName = 'test'; // triggers a save
 * 
 * !ENCRYPTION and DECRYPTION
 * 
 * const profile = new Profile(gunInstance);
 * 
 * 
 * ? field decorators
 * 
 * @encrypted
 * @field
 * @edge
 * 
 * ? class decorators
 * 
 * @user
 * @node
 * @set
 * 
 * ? instance methods
 * 
 * ? getPath
 * ? getParent
 * ? getId
 * ? save
*/



