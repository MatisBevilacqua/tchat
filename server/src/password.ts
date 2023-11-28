import bcrypt from "bcrypt"

export function hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(12)

    return [salt, bcrypt.hashSync(password, salt)]
}

export function verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword)
}
