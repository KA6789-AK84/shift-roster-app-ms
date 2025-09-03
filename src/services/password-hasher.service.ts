import {
  bind,
  BindingScope,
  injectable
} from '@loopback/core';
import * as bcrypt from 'bcryptjs';

// Bind this service as a singleton for efficiency
@bind({
  scope: BindingScope.SINGLETON
})
@injectable({
  tags: {
    key: 'services.PasswordHasher'
  }
})
export class PasswordHasherService {
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<{
    passwordHash: string;
    salt: string
  }> {
    // Generate a new salt for each user
    const salt = await bcrypt.genSalt(this.saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    return {
      passwordHash,
      salt
    };
  }

  async comparePassword(password: string, hash: string, salt: string): Promise<boolean> {
    //const salt1 = await bcrypt.genSalt(this.saltRounds);
    //console.log("Salt new", salt1)
    const passwordHash = await bcrypt.hash(password, salt);
    console.log("bcrypt.compare(password+salt, hash)", passwordHash)
    console.log("bcrypt.compare(password+salt, hash)", hash)
    return bcrypt.compare(password, hash);
  }
}
