import {
  TokenService
} from '@loopback/authentication';
import {
  BindingScope,
  bind,
  inject
} from '@loopback/core';
import {
  UserProfile,
  securityId
} from '@loopback/security';
import * as jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: number;
  username: string;
  roleId: number;
}

// Secret key for signing JWTs (store securely in a config file)
const JWT_SECRET = 'your-secret-key-that-is-very-long-and-secure';
const JWT_EXPIRES_IN = '1h'; // Token expiration time

// Bind this service as a singleton for efficiency
@bind({
  scope: BindingScope.SINGLETON
})
export class JwtService implements TokenService {
  @inject('services.Logger') private logger: any;

  /**
   * Generates a JWT token for a given user profile.
   * The TokenService interface expects UserProfile as an argument.
   * We assume UserProfile will contain 'userId', 'username', and 'roleId'.
   */
  async generateToken(userProfile: UserProfile): Promise<string> {
    // Ensure the userProfile contains the necessary data
    if (!userProfile.userId || !userProfile.username || !userProfile.roleId) {
      this.logger.error('UserProfile missing required properties for token generation.');
      throw new Error('Invalid user profile for token generation.');
    }

    const payload: TokenPayload = {
      userId: userProfile.userId,
      username: userProfile.username,
      roleId: userProfile.roleId,
    };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    this.logger.info(`JWT token generated for user: ${userProfile.username}`);
    return token;
  }

  /**
   * Verifies the JWT token and returns the user profile.
   * Ensures the returned UserProfile includes userId and roleId for authorization.
   */
  async verifyToken(token: string): Promise<UserProfile> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      const userProfile: UserProfile = {
        [securityId]: decoded.userId.toString(), // Standard LoopBack securityId
        userId: decoded.userId, // Custom property for ease of access
        username: decoded.username, // Custom property for ease of access
        roleId: decoded.roleId, // Custom property for authorization checks
      };

      this.logger.debug(`JWT token verified for user ID: ${decoded.userId}`);
      return userProfile;
    } catch (error) {
      this.logger.error(`JWT token verification failed: ${error.message}`);
      throw new Error('Invalid or expired token.');
    }
  }
}
