package com.jvnc.catalog.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public class ApiErrorResponse {

    private int status;
    private String message;
    private String path;
    private Map<String, String> fieldErrors;
    private LocalDateTime timestamp;

    public ApiErrorResponse() {
    }

    public ApiErrorResponse(
            int status,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {
        this.status = status;
        this.message = message;
        this.path = path;
        this.fieldErrors = fieldErrors;
        this.timestamp = LocalDateTime.now();
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(
            Map<String, String> fieldErrors
    ) {
        this.fieldErrors = fieldErrors;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}