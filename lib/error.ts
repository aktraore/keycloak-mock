export class DuplicateUserError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, DuplicateUserError.prototype);

        this.name = 'DuplicateUserError';
    }
}

export class UserNotFoundError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, UserNotFoundError.prototype);

        this.name = 'UserNotFoundError';
    }
}
