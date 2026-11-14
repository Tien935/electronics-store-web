package com.jvnc.catalog.model;

public class Category {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String status;

    public Category() {
    }

    public Category(
            Long id,
            String name,
            String slug,
            String description,
            String status
    ) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}