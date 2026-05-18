const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const db = require('../config/db');
const { logger } = require('../utils/logger');

class AuthController {
  async login(req, res) {
    const { username, password } = req.body;

    try {
      const result = await db.query('SELECT * FROM specialists WHERE username = $1', [username]);
      const user = result.rows[0];

      if (!user) {
        logger.warn('Login failed: user not found', { username });
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.warn('Login failed: incorrect password', { username });
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        }, 
        config.jwtSecret, 
        { expiresIn: '24h' }
      );

      logger.info('User login successful', { username });
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          companyName: user.company_name
        }
      });
    } catch (err) {
      logger.error('Login error', { error: err.message });
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  }

  async signup(req, res) {
    const { username, password, companyName, email } = req.body;
    
    try {
      // Check if user exists
      const existing = await db.query('SELECT * FROM specialists WHERE username = $1', [username]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await db.query(
        'INSERT INTO specialists (username, password, company_name, email) VALUES ($1, $2, $3, $4) RETURNING id, username',
        [username, hashedPassword, companyName, email]
      );

      logger.info('New specialist registered', { username, companyName });
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: result.rows[0]
      });
    } catch (err) {
      logger.error('Signup error', { error: err.message });
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();
