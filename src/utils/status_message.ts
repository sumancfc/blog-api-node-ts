export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};

export const CATEGORY_MESSAGES = {
    CATEGORY_EXISTS: "Category already exists.",
    CATEGORY_CREATE_FAILED: "Failed to create category!",
    CATEGORY_NOT_FOUND: "Category not found or already has been deleted!",
    CATEGORY_DELETED: "Category deleted successfully",
};

export const TAG_MESSAGES = {
    TAG_EXISTS: "Tag already exists.",
    TAG_CREATE_FAILED: "Failed to create tag!",
    TAG_NOT_FOUND: "Tag not found or already has been deleted!",
    TAG_DELETED: "Tag deleted successfully",
};

export const USER_MESSAGES = {
    USER_EXISTS: "User already present",
    SIGNUP_SUCCESS: "User signup successful!!!",
    INVALID_USER: "Invalid User",
    INVALID_LINK: "Invalid Link",
    INVALID_EMAIL: "Invalid Email",
    EMAIL_VERIFIED: "Email Verified",
    EMAIL_SEND: "Email has been sent",
    EMAIL_VERIFY: "An email has been sent to your account. Please Verify",
    PASSWORD_RESET_EMAIL_SENT: "Password Reset Email Sent",
    PASSWORD_RESET_FAILED: "Password Reset Failed",
    USER_UPDATE_FAIL: "User update failed",
    INVALID_RESET_CODE_OR_EXPIRED: "Invalid Reset Code Or Expired",
    ALREADY_VERIFIED: "User Already Verified",
    USER_NOT_EXIST: "User with that email does not exist.",
    INCORRECT_CREDENTIALS: "Email and Password do not match.",
    SIGNIN_SUCCESS: "User signin successful!!!",
    SIGNOUT_SUCCESS: "User signout Successful!!!",
    UNAUTHORIZED: "Unauthorized. No user ID found in the request.",
    USER_NOT_FOUND: "User not found",
    ADMIN_ONLY: "Access denied. Admin resource only.",
    USER_CREATED: "New User Created"
};
