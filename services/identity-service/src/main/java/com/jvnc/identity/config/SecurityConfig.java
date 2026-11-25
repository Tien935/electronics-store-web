package com.jvnc.identity.config;

import com.jvnc.identity.dao.RoleDao;
import com.jvnc.identity.dao.UserDao;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            UserDao userDao,
            RoleDao roleDao
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/actuator/health"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(
                                jwtAuthenticationConverter(userDao, roleDao)
                        ))
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter(
            UserDao userDao,
            RoleDao roleDao
    ) {
        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            long userId;

            try {
                userId = Long.parseLong(jwt.getSubject());
            } catch (NumberFormatException exception) {
                return List.<GrantedAuthority>of();
            }

            boolean isActive = userDao.findById(userId)
                    .map(user -> "ACTIVE".equals(user.getStatus()))
                    .orElse(false);

            if (!isActive) {
                return List.<GrantedAuthority>of();
            }

            return roleDao.findByUserId(userId).stream()
                    .map(role -> (GrantedAuthority)
                            new SimpleGrantedAuthority(
                                    "ROLE_" + role.getCode()
                            ))
                    .toList();
        });

        return converter;
    }
}