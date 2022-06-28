/**
 * 
 * 
 * profile -> post(set) -> likes(set) -> profile
 * 
 * !SAVING update gun store
 * 
 * const profile = Profile.create(gunInstance);
 * profile.firstName = 'John';
 * profile.lastName = 'Doe';
 * profile.save();
 * 
 * const post = Post.create(profile);
 * post.content = 'test';
 * post.title = 'title';
 * post.save();
 * 
 * const like = Like.create(post); // post should be saved first
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
 * 
 * 
 * 
 * // NOTE: ENCRYPTION
 * @keychhain
 * @node
 * class Profile {

 *     @encryptedField
 *     address: string;
 * 
 *      @encrypted
 *      email: string;
 * 
 *
 * }
 * 
 * 
 * const profile = Profile.create()
 * profile.owner = SEA.pair();
 * profile.address = '123 Main St';
 * profile.trust('address', user.pub);
 * profile.revoke('address', user.pub);
 * profile.trustAll(user.pub);
 * profile.revokeAll(user.pub);
 * profile.save();
 * 
 * profile
 *  -address
 *  -email
 *  -keychain
 *   pub: string,
 *   epub: string,
 *   keys:  {
 *      address: {
 *         key: string,
 *         generatedAt?: string
 *      }
 *   }
 *   read: 
 *          pubId1: {
    *           pub: string,
    *           epub: string,
        *       properties: {
        *         address: {
        *             key: 'asdasqwrsdaseaseqwe',
        *             grantedAt: '123456789'
        *         }
        *       }
 *          }
 *     
 *   }
 * }
 * 
 *   upon save check if keychain exists
 *   check if owner exists;
 *   if not require pair on save if not provided throw an error
 *   if owner exists check if key exists if not generate keys
 * 
 * 
 * // MAP
 * const profile = Profile.create(org, 'id'); // inject id here
 * 
 * profile.firstName = 'John';
 * profile.lasName = 'Doe';
 * profile.save();
 * 
 * org.profiles.fetchById(id)
 * org.profiles.fetchAll()
 * 
 * 
 * 
 * 
 * Profile.create(org)
 * 
 * Profile.createEncrypted(org, pair);
 * 
 * profile.keychain({
 *  
 * })
 * 
 * profile.save({
 * });
 * 
 * 
 * If no keychain node has no owner
 * If has keychain node already has an owner
 * 
 * 
*/



