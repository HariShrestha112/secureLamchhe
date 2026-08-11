package com.example.backend;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SpaRedirectFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();
        boolean isApi = requestPath.startsWith("/api") || requestPath.startsWith("/actuator");
        boolean isAsset = requestPath.contains(".") || requestPath.startsWith("/static/") || requestPath.startsWith("/favicon") || requestPath.startsWith("/assets/");

        if (!isApi && !isAsset && !requestPath.equals("/")) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
