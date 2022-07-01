import { keychain, field, encrypted, root } from '../decorators';

@root
@keychain
export default class Secret {

    @encrypted
    @field
    message?: string;
    
    @encrypted
    @field
    who?: string;
}