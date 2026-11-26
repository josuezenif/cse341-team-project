import mongoose from 'mongoose';
import { findUserById } from '../models/users.js';

export const loadSessionUser = async (req, res, next) => {
    try {
        const sessionUser = req.session?.user;
        const userId = sessionUser?.id;
        const databaseUser = userId && mongoose.isValidObjectId(userId)
            ? await findUserById(userId)
            : null;

        if (!databaseUser?.role) {
            if (sessionUser) {
                delete req.session.user;
            }
            req.user = null;
        } else {
            req.user = {
                id: databaseUser._id.toString(),
                email: databaseUser.email,
                displayName: databaseUser.name,
                role: databaseUser.role.name
            };
        }
        return next();
    } catch (error) {
        return next(error);
    }
};

export const setUserLocals = (req, res, next) => {
    res.locals.user = req.user
        ? {
            id: req.user.id,
            displayName: req.user.displayName,
            role: req.user.role
        }
        : null;
    res.locals.dashboardUrl = req.user?.role === 'admin'
        ? '/admin-dashboard'
        : '/dashboard';
    return next();
};

export const noStore = (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    return next();
};

const isLoggedIn = (req) => Boolean(req.user);
const hasRole = (req, role) => req.user.role === role;

const unauthenticatedError = {
    error: {
        code: 'UNAUTHENTICATED',
        message: 'You must be signed in to access this resource.'
    }
};
const forbiddenError = {
    error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this page.'
    }
};

export const requireApiLogin = (req, res, next) => {
    if (!isLoggedIn(req)) {
        return res.status(401).json(unauthenticatedError);
    }
    return next();
};

export const requirePageLogin = (req, res, next) => {
    if (!isLoggedIn(req)) {
        return res.redirect('/login?message=Please%20sign%20in%20to%20continue.');
    }
    return next();
};

export const requireApiRole = (role) => (req, res, next) => {
    if (!isLoggedIn(req)) {
        return res.status(401).json(unauthenticatedError);
    }
    if (!hasRole(req, role)) {
        return res.status(403).json(forbiddenError);
    }
    return next();
};

export const requirePageRole = (role) => (req, res, next) => {
    if (!isLoggedIn(req)) {
        return res.redirect('/login?message=Please%20sign%20in%20to%20continue.');
    }
    // console.log('User', req.user); To view the user signed in

    if (!hasRole(req, role)) {
        return res.status(403).render('errors/forbidden', {
            message: forbiddenError.error.message,
            title: '403 Forbidden'
        });
    }
    return next();
};

export const userDashboardUrl = (user) => user?.role === 'admin'
    ? '/admin-dashboard'
    : '/dashboard';
