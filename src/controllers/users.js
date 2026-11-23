import { createUser, findUserByEmail, verifyPassword } from '../models/users.js';
import { userDashboardUrl } from '../middleware/auth.js';

const passwordMeetsRequirements = (password) => (
    typeof password === 'string'
    && password.length >= 8
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
);

const renderRegisterPage = (req, res) => {
    if (req.user) {
        return res.redirect(userDashboardUrl(req.user));
    }
    return res.render('register', {
        title: 'Register to create an account!',
        error: null,
        formData: { name: '', email: '' }
    });
};

const renderLoginPage = (req, res) => {
    if (req.user) {
        return res.redirect(userDashboardUrl(req.user));
    }
    return res.render('login', {
        title: 'Login to account',
        message: req.query.message,
        error: null
    });
};

const register = async (req, res) => {
    const body = req.body || {};
    const formData = {
        name: typeof body.name === 'string' ? body.name.trim() : '',
        email: typeof body.email === 'string' ? body.email.trim() : ''
    };
    const password = typeof body.password === 'string' ? body.password : '';

    if (!formData.name || !formData.email || !password) {
        return res.status(400).render('register', {
            title: 'Register to create an account!',
            error: 'Name, email, and password are required.',
            formData
        });
    }

    if (!passwordMeetsRequirements(password)) {
        return res.status(400).render('register', {
            title: 'Register to create an account!',
            error: 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.',
            formData
        });
    }

    try {
        await createUser(formData.name, formData.email, password);
        return res.redirect('/login?message=Account%20created%20successfully.%20Please%20sign%20in.');
    } catch (error) {
        console.error('There was an error registering a user:', error);
        return res.status(400).render('register', {
            title: 'Register to create an account!',
            error: error.code === 11000
                ? 'An account with that email already exists.'
                : 'Unable to create your account. Please check your details and try again.',
            formData
        });
    }
};

const login = async (req, res, next) => {
    const body = req.body || {};
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
        return res.status(400).render('login', {
            title: 'Login to account',
            message: null,
            error: 'Email and password are required.'
        });
    }

    try {
        const user = await findUserByEmail(email);
        const passwordMatches = user
            ? await verifyPassword(password, user.passwordHash)
            : false;

        if (!passwordMatches) {
            return res.status(401).render('login', {
                title: 'Login to account',
                message: null,
                error: 'Invalid email or password.'
            });
        }

        return req.session.regenerate((error) => {
            if (error) {
                return next(error);
            }
            req.session.user = { id: user._id.toString() };
            return req.session.save((saveError) => {
                if (saveError) {
                    return next(saveError);
                }
                return res.redirect(userDashboardUrl({ role: user.role.name }));
            });
        });
    } catch (error) {
        return next(error);
    }
};

const logout = (req, res, next) => {
    if (!req.session) {
        return res.redirect('/login');
    }
    return req.session.destroy((error) => {
        if (error) {
            return next(error);
        }
        res.clearCookie('connect.sid');
        return res.redirect('/login');
    });
};

const renderAdminDashboard = (req, res) => {
    return res.render('admin-dashboard', { title: 'Welcome to the Admin Dashboard!' });
};

const userDashboardPage = (req, res) => {
    if (req.user.role === 'admin') {
        return res.redirect('/admin-dashboard');
    }
    return res.render('dashboard', {
        title: 'Dashboard',
        displayName: req.user.displayName?.trim() || req.user.email
    });
};

const usersAdminPage = (req, res) => res.render('users-admin', { title: 'User Admin' });

export {
    renderRegisterPage,
    renderLoginPage,
    renderAdminDashboard,
    userDashboardPage,
    usersAdminPage,
    register,
    login,
    logout
};
