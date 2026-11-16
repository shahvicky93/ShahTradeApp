package com.app.book_keeping.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Forwards non-API and non-static requests to index.html for React SPA routing.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/",
            "/{path:^(?!api$)[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
