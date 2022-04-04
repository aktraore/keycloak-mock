import { v4 as uuidv4 } from 'uuid';

import { PostViewFn } from '../types';
import { MockUser, MockUserCredentialType } from '../database';

const validateToken: PostViewFn = (instance, request, body) => {
    const { user: requestUser } = request;
    if (!requestUser) {
        return [403, 'Access denied'];
    }

    return [
        200,
        {
            active: true,
        },
    ];
};

export default validateToken;
