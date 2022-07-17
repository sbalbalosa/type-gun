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
 * 
 * 
 * 
 * import Node from 'lib/node';
 * 
 * const node = Node.create('address');
 * Keychain.addNode(node);
 * 
 * 
 * @list
 * class Key {
 *    key: string;
 * }
 * 
 * const keychain = Keychain.create(userNode);
 * 
 * 
 * const key = Key.create(keychain);
 * 
 * 
 * {
 *    pub
 *    epub
 *    properties: {
 *      'address': {
 *          name: 'address',
 *          keys: {
 *             lastIndex: 0,
 *             '0': { key: 'asdasdwdasdasd' }
 *          }
 *       },
 *       'email: {
 *       }
 *    },
 *    read: {
 *         'pubId: {
 *              pub
 *              epub
 *              properties: {
 *                 'address': {
 *                     name: 'address',
 *                     keys: {
 *                        lastIndex: 0,
 *                        '0': {
 *                          key: '324sdad234asdasd',
 *                          master: '342341234234'  // link to master key
 *                        }
 *                     } 
 *                  }
 *              }
 *         }
 *    }
 * }
 */