package com.attendance.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:${DATABASE_URL:}}")
    private String rawUrl;

    @Value("${spring.datasource.username:${DATABASE_USERNAME:root}}")
    private String defaultUsername;

    @Value("${spring.datasource.password:${DATABASE_PASSWORD:}}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();

        if (rawUrl != null && rawUrl.startsWith("mysql://")) {
            try {
                URI uri = new URI(rawUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 3306 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery() != null ? "?" + uri.getQuery() : "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

                String jdbcUrl = "jdbc:mysql://" + host + ":" + port + path + query;
                ds.setJdbcUrl(jdbcUrl);

                if (uri.getUserInfo() != null) {
                    String[] parts = uri.getUserInfo().split(":", 2);
                    ds.setUsername(parts[0]);
                    if (parts.length > 1) {
                        ds.setPassword(parts[1]);
                    }
                } else {
                    ds.setUsername(defaultUsername);
                    ds.setPassword(defaultPassword);
                }
            } catch (Exception e) {
                ds.setJdbcUrl(rawUrl);
                ds.setUsername(defaultUsername);
                ds.setPassword(defaultPassword);
            }
        } else {
            ds.setJdbcUrl(rawUrl);
            ds.setUsername(defaultUsername);
            ds.setPassword(defaultPassword);
        }

        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        return ds;
    }
}
