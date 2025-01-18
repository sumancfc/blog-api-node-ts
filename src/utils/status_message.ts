export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
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
  USER_NOT_EXIST: "User with that email does not exist.",
  INCORRECT_CREDENTIALS: "Email and Password do not match.",
  SIGNIN_SUCCESS: "User signin successful!!!",
  SIGNOUT_SUCCESS: "User signout Successful!!!",
  UNAUTHORIZED: "Unauthorized. No user ID found in the request.",
  USER_NOT_FOUND: "User not found",
  ADMIN_ONLY: "Access denied. Admin resource only.",
};
