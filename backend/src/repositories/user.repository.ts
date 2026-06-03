import { Pool } from 'pg';
import { User } from '../models';
import { getDatabase } from '../config/database';
import { logger } from '../utils/logger';

export class UserRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabase();
  }

  async create(username: string, email: string, passwordHash: string): Promise<User> {
    const query = `
      INSERT INTO users (id, username, email, password_hash, is_active)
      VALUES (gen_random_uuid(), $1, $2, $3, true)
      RETURNING id, username, email, is_active, created_at, updated_at
    `;

    try {
      const result = await this.pool.query(query, [username, email, passwordHash]);
      const user = result.rows[0];
      logger.info(`User created: ${user.id}`);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: '', // Don't return hash
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, password_hash, is_active, created_at, updated_at
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
    `;

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.password_hash,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, password_hash, is_active, created_at, updated_at
      FROM users
      WHERE email = $1 AND deleted_at IS NULL
    `;

    try {
      const result = await this.pool.query(query, [email]);
      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.password_hash,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, password_hash, is_active, created_at, updated_at
      FROM users
      WHERE username = $1 AND deleted_at IS NULL
    `;

    try {
      const result = await this.pool.query(query, [username]);
      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.password_hash,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error finding user by username:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (updates.username) {
      fields.push(`username = $${paramCount}`);
      values.push(updates.username);
      paramCount++;
    }

    if (updates.email) {
      fields.push(`email = $${paramCount}`);
      values.push(updates.email);
      paramCount++;
    }

    if (updates.passwordHash) {
      fields.push(`password_hash = $${paramCount}`);
      values.push(updates.passwordHash);
      paramCount++;
    }

    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount}`);
      values.push(updates.isActive);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING id, username, email, is_active, created_at, updated_at
    `;

    try {
      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      logger.info(`User updated: ${id}`);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: '',
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE users
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;

    try {
      const result = await this.pool.query(query, [id]);
      logger.info(`User soft-deleted: ${id}`);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserCount(): Promise<number> {
    const query = `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`;

    try {
      const result = await this.pool.query(query);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('Error getting user count:', error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
