import {
  inject
} from '@loopback/core';
import {
  get,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {
  UserProfile,
  securityId
} from '@loopback/security'; // Import UserProfile
import {
  User
} from '../models';
import {
  UserRepository
} from '../repositories';
import {
  JwtService
} from '../services/jwt.service';
import {
  PasswordHasherService
} from '../services/password-hasher.service';
import {
  WinstonService
} from '../services/winston.service';
import {
  ExpectedError
} from '../utils/error-handler';

// Define custom error codes for the authentication module
const AuthErrors = {
  USER_NOT_FOUND: 'User not found.',
  INVALID_CREDENTIALS: 'Invalid username or password.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INACTIVE_ACCOUNT: 'User account is inactive.',
};

/**
 * Controller for User authentication and management APIs.
 */
export class UserController {
  constructor(
    @inject('services.Logger') private logger: WinstonService,
    @inject('repositories.UserRepository') private userRepository: UserRepository,
    @inject('services.PasswordHasher') private passwordHasher: PasswordHasherService,
    @inject('services.JwtService') private jwtService: JwtService,
  ) { }

  /**
   * Helper function to check for required roles.
   * AD roleId = 1, Manager roleId = 2
   */
  private async hasRequiredRole(token: string, requiredRoleIds: number[]): Promise<boolean> {
    try {
      const userProfile = await this.jwtService.verifyToken(token);
      // Ensure roleId exists on the userProfile before checking
      if (userProfile.roleId === undefined) {
        this.logger.warn(`User profile from token missing roleId for authorization check.`);
        return false;
      }
      return requiredRoleIds.includes(userProfile.roleId);
    } catch (e) {
      this.logger.error(`Role check failed: ${e.message}`);
      return false;
    }
  }

  /**
   * POST /users/register
   * Registers a new user (with password hashing).
   */
  /*@post('/users/register')
  async registerUser(@requestBody() newUser: Omit < User, 'userId' | 'passwordHash' | 'salt' | 'isActive' | 'lastLogin' > ): Promise < User > {
    try {
      // Hash the password and get the salt
      const {
        passwordHash,
        salt
      } = await this.passwordHasher.hashPassword(newUser.password);

      // Create a new user object with hashed password and salt
      const createdUser = await this.userRepository.create({
        ...newUser,
        passwordHash,
        salt,
        isActive: true,
        lastLogin: new Date(),
      });

      this.logger.info(`User registered successfully: ${createdUser.username}`);
      return createdUser;
    } catch (error) {
      this.logger.error(`User registration failed: ${error.message}`);
      throw new ExpectedError(400, `Registration failed: ${error.message}`);
    }
  }*/


  /**
   * POST /users/login
   * Authenticate user, return JWT.
   */
  @post('/users/login')
  async login(@requestBody() credentials: {
    username: string,
    password: string
  }): Promise<any> {
    try {
      console.log("credentials: ", credentials)
      const user = await this.userRepository.findByUsername(credentials.username);
      if (!user) {
        this.logger.warn(`Login attempt for non-existent user: ${credentials.username}`);
        throw new ExpectedError(401, AuthErrors.INVALID_CREDENTIALS);
      }
      console.log("user: ", user)
      const passwordMatches = await this.passwordHasher.comparePassword(credentials.password, user.passwordHash, user.salt);
      if (!passwordMatches) {
        this.logger.warn(`Login attempt with incorrect password for user: ${credentials.username}`);
        throw new ExpectedError(401, AuthErrors.INVALID_CREDENTIALS);
      }

      if (!user.isActive) {
        this.logger.warn(`Login attempt for inactive user: ${credentials.username}`);
        throw new ExpectedError(403, AuthErrors.INACTIVE_ACCOUNT);
      }

      // Update last login timestamp
      user.lastLogin = new Date();
      await this.userRepository.updateById(user.userId!, user);

      // Create a UserProfile object from the User model for token generation
      const userProfile: UserProfile = {
        [securityId]: user.userId!.toString(),
        userId: user.userId!,
        username: user.username,
        roleId: user.roleId,
      };

      const token = await this.jwtService.generateToken(userProfile); // Pass UserProfile here
      this.logger.info(`User logged in successfully: ${user.username}`);
      return {
        token,
        user: user
      };
    } catch (error) {
      this.logger.error(`Login failed for user ${credentials.username}: ${error.message}`);
      throw error; // Re-throw the handled error
    }
  }

  /**
   * GET /users
   * Get all users (manager/AD only).
   */
  @get('/users')
  async getAllUsers(@param.header.string('Authorization') authHeader: string): Promise<User[]> {
    try {
      const token = authHeader.replace('Bearer ', '');
      const isAuthorized = await this.hasRequiredRole(token, [1, 2]); // AD and Manager roles
      if (!isAuthorized) {
        throw new ExpectedError(403, AuthErrors.UNAUTHORIZED);
      }

      const users = await this.userRepository.find();
      this.logger.info('Fetched all users.');
      return users;
    } catch (error) {
      this.logger.error(`Failed to get all users: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /users/{id}
   * Get user by ID.
   */
  @get('/users/{id}')
  async getUserById(
    @param.path.number('id') id: number,
  ): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      this.logger.info(`Fetched user with ID: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to get user with ID ${id}: ${error.message}`);
      throw new ExpectedError(404, AuthErrors.USER_NOT_FOUND);
    }
  }

  /**
   * PATCH /users/{id}
   * Update user profile (self/manager).
   */
  @patch('/users/{id}')
  async updateUserProfile(
    @param.path.number('id') id: number,
    @requestBody() updates: Partial<User>,
    @param.header.string('Authorization') authHeader: string,
  ): Promise<any> {
    try {
      const token = authHeader.replace('Bearer ', '');
      const userProfile = await this.jwtService.verifyToken(token);
      // Ensure userId exists on the userProfile before checking
      if (userProfile.userId === undefined) {
        this.logger.warn(`User profile from token missing userId for authorization check.`);
        throw new ExpectedError(403, AuthErrors.UNAUTHORIZED);
      }
      const isAuthorized = (userProfile.userId === id) || await this.hasRequiredRole(token, [1, 2]);

      if (!isAuthorized) {
        throw new ExpectedError(403, AuthErrors.UNAUTHORIZED);
      }

      await this.userRepository.updateById(id, updates);
      this.logger.info(`User profile updated for ID: ${id}`);
      return {
        message: 'User profile updated successfully.'
      };
    } catch (error) {
      this.logger.error(`Failed to update user profile for ID ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * PATCH /users/{id}/deactivate
   * Deactivate user (manager/AD).
   */
  @patch('/users/{id}/deactivate')
  async deactivateUser(
    @param.path.number('id') id: number,
    @param.header.string('Authorization') authHeader: string,
  ): Promise<any> {
    try {
      const token = authHeader.replace('Bearer ', '');
      const isAuthorized = await this.hasRequiredRole(token, [1, 2]);

      if (!isAuthorized) {
        throw new ExpectedError(403, AuthErrors.UNAUTHORIZED);
      }

      await this.userRepository.updateById(id, {
        isActive: false
      });
      this.logger.info(`User ID ${id} deactivated.`);
      return {
        message: 'User deactivated successfully.'
      };
    } catch (error) {
      this.logger.error(`Failed to deactivate user ID ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * PATCH /users/{id}/activate
   * Activate user (manager/AD).
   */
  @patch('/users/{id}/activate')
  async activateUser(
    @param.path.number('id') id: number,
    @param.header.string('Authorization') authHeader: string,
  ): Promise<any> {
    try {
      const token = authHeader.replace('Bearer ', '');
      const isAuthorized = await this.hasRequiredRole(token, [1, 2]);

      if (!isAuthorized) {
        throw new ExpectedError(403, AuthErrors.UNAUTHORIZED);
      }

      await this.userRepository.updateById(id, {
        isActive: true
      });
      this.logger.info(`User ID ${id} activated.`);
      return {
        message: 'User activated successfully.'
      };
    } catch (error) {
      this.logger.error(`Failed to activate user ID ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * PATCH /users/{id}/role
   * Update user role (AD only).
   */
  @patch('/users/{id}/role')
  async updateUserRole(
    @param.path.number('id') id: number,
    @requestBody() roleUpdate: {
      roleId: number
    },
    @param.header.string('Authorization') authHeader: string,
  ): Promise<any> {
    try {
      const token = authHeader.replace('Bearer ', '');
      const isAuthorized = await this.hasRequiredRole(token, [1]); // AD only
      if (!isAuthorized) {
        throw new ExpectedError(403, AuthErrors.UNAUTHORIZED);
      }

      await this.userRepository.updateById(id, roleUpdate);
      this.logger.info(`User ID ${id} role updated to role ID ${roleUpdate.roleId}.`);
      return {
        message: 'User role updated successfully.'
      };
    } catch (error) {
      this.logger.error(`Failed to update role for user ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
