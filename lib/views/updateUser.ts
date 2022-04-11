import { v4 as uuidv4 } from 'uuid';

import { PutViewFn } from '../types';
import createBearerToken from '../createBearerToken';
import { MockUser, MockUserCredentialType } from '../database';
import { DuplicateUserError, UserNotFoundError } from '../error';

const updateUser: PutViewFn = (instance, request, body) => {
    const { user } = request;
    if (!user) {
        return [403, 'Access denied'];
    }

    const { id } = body;
    if (!id) {
        return [400, 'Bad request'];
    }

    let updatedUser: MockUser | null = null;
    try {
        updatedUser = instance.database.updateUser({
            id: body.id,
            ...body,
        });
    } catch (error) {
        if (error instanceof UserNotFoundError) {
            return [404, { errorMessage: error.message }];
        }
    }

    const resourcePath = `/admin/realms/${instance.params.realm}/users/${updatedUser?.profile.id}`;
    const resourceURL = instance.createURL(resourcePath);

    return [
        200,
        { id: updatedUser?.profile.id },
        {
            location: resourceURL,
        },
    ];
};

export default updateUser;
