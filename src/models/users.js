import { User } from "./schemas/users.js";
import { Role } from "./schemas/roles.js";
import bcrypt from "bcrypt";

const createUser = async (name, email, password) => {
    const customer = await Role.findOne({ name: 'customer' });
    if (!customer) {
        throw new Error('Default role not found!');
    }
    // console.log(password);
    const saltRounds = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: customer._id
    });

    return user;
}

const findUserByEmail = async (email) => {
    const user = User.findOne({ email: email.trim().toLowerCase() }).populate('role');
    return user;
}

const findUserById = async (id) => User.findById(id).populate('role');

const verifyPassword = async (password, passwordHash) => {
    const passwordMatched = bcrypt.compare(password, passwordHash);
    return passwordMatched;
}

export { createUser, findUserByEmail, findUserById, verifyPassword };