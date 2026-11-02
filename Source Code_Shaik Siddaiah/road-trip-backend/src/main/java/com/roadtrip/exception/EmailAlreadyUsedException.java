package com.roadtrip.exception;

/** Thrown at registration when the email is already taken. Mapped to HTTP 409 (Conflict). */
public class EmailAlreadyUsedException extends RuntimeException {
    public EmailAlreadyUsedException(String message) {
        super(message);
    }
}
