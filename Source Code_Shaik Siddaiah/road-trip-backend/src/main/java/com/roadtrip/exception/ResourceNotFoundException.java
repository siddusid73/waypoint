package com.roadtrip.exception;

/** Thrown when a trip/stop/user/etc. with the given id doesn't exist. Mapped to HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
