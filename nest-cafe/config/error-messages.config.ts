import { registerAs } from '@nestjs/config';

export default registerAs('errorMessages', () => ({
  DOCUMENT_NOT_FOUND: 'Document not found',
  UNAUTHORIZED_ACCESS: 'You are not logged in! Please log in to get access.',
  ACCESS_FORBIDDEN: 'You do not have permission to perform this action',
  BAD_REQUEST: 'Bad request',
  PASSWORD_UPDATE_FORBIDDEN:
    'Password cannot be changed here. User /me/updatePassword instead.',
  INCORRECT_CURRENT_PASSWORD: 'Given current password is incorrect',
  EMAIL_SENDING_ERROR: 'There was an error sending the email. Try again later!',
  EMAIL_TRANSPORTER_ERROR: 'Transporter not initialized',
  UNKNOWN_USER: 'No user with that email exists',
  INVALID_TOKEN: 'Token is invalid or has expired',
  INVALID_CREDENTIALS: 'Incorrect email or password',
  ERROR_CREATING_TOKEN: 'Error creating token',
}));
