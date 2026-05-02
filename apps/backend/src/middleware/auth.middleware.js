const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Auth Middleware
 * Validates JWT tokens for protected routes
 */

exports.protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized - No token provided' 
        });
    }

    try {
        // Verify token using the secret from config
        const decoded = jwt.verify(token, config.jwtSecret);
        
        // Add user information to request object
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized - Invalid or expired token' 
        });
    }
};
/**
 * Role Restriction Middleware
 * Restricts access to specific roles
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};
