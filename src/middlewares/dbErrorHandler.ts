"use strict";

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

/**
 * Get unique error field name
 */
const uniqueMessage = (error: MongoError): string => {
  let output: string;
  try {
    const fieldName = error.message.substring(
        error.message.lastIndexOf(".$") + 2,
        error.message.lastIndexOf("_1")
    );
    output =
        fieldName.charAt(0).toUpperCase() +
        fieldName.slice(1) +
        " already exists";
  } catch (ex) {
    output = "Unique field already exists";
  }

  return output;
};

/**
 * Get the error message from error object
 */
export const errorHandler = (error: MongoError): string => {
  let message = "";

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = "Something went wrong";
    }
  } else if (error.errors) {
    for (const errorName in error.errors) {
      if (error.errors[errorName].message) {
        message = error.errors[errorName].message;
      }
    }
  }

  return message;
};