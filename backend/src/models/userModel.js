const db = require('../config/db');

const createUser = async (name, email, password, role) => {
  const result = await db.query(
    'INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, password, role]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await db.query(
    'SELECT id, name, email, password, role FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await db.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await db.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY id'
  );
  return result.rows;
};

module.exports = { createUser, getUserByEmail, getUserById, getAllUsers };