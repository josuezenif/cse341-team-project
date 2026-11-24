import { createUser, findUserByEmail, verifyPassword } from "../models/users.js";

async function renderRegisterPage(req, res) {
    const title = 'Register to create an account!';
    res.render('register', {
        title
    });
}

async function renderLoginPage(req, res) {
    const title = 'Login to account';
    res.render('login', {
        title
    });
}

const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await createUser(name, email, password);

        if (user) {
            res.redirect('/');
        }
    }

    catch (error) {
        console.error('There was an error:', error)
        res.redirect('/register');
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        const verifiedPassord = await verifyPassword(password, user.passwordHash);

        // console.log('User found:', user); To view user and its details

        if (verifiedPassord === true) {
            req.session.user = {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role.name
            };

            res.redirect('/');
        }

        else {
            res.redirect('/login');
        }
    }

    catch (error) {
        console.error('An error has ocurred:', error);
        res.redirect('/login');
    }
}

const logout = async (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }

    res.redirect('/login');
}

const renderAdminDashboard = async (req, res) => {
    const title = "Welcome to the Admin Dashboard!";

    res.render('admin-dashboard', {
        title
    });
}

export { renderRegisterPage, renderLoginPage, renderAdminDashboard, register, login, logout };