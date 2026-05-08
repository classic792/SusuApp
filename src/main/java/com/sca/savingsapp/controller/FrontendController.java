package com.sca.savingsapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    @RequestMapping(value = {
            "/",
            "/login",
            "/dashboard",
            "/admin",
            "/agent"
    })
    public String redirect() {
        return "forward:/index.html";
    }
}