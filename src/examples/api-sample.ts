/**
 * 
 * class Message {
 * 
 *    @edge(() => Keychain)
 *    chain?: null
 *  
 *    @link(() => Keychain)
 *    keychain?: null
 * }
 * 
 * 
 * 
 * const message = Message.create(userNode);
 * const keychain = await message.keychain.fetch();
 * 
 * await message.connect('keychain', keychain.link());
 * await message.keychain.fetch();
 */