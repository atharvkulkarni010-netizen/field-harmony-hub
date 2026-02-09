import pool from '../config/database.js';

export const addTokenToBlacklist = async (token, user_id, expires_at) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'INSERT INTO token_blacklist (token, user_id, expires_at) VALUES (?, ?, ?)',
      [token, user_id, expires_at]
    );
    return true;
  } catch (error) {
    console.error('Error adding token to blacklist:', error);
    return false;
  } finally {
    connection.release();
  }
};

export const isTokenBlacklisted = async (token) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT id FROM token_blacklist WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false;
  } finally {
    connection.release();
  }
};

export const cleanupExpiredTokens = async () => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM token_blacklist WHERE expires_at <= NOW()'
    );
    console.log(`Cleaned up ${result.affectedRows} expired tokens from blacklist`);
    return result.affectedRows;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  } finally {
    connection.release();
  }
};
