package com.roadtrip.exception;

/** Thrown when a logged-in user tries to edit/delete something they do not own. Mapped to HTTP 403. */
public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }
}
