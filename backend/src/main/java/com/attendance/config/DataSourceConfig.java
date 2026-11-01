package com.attendance.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;

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
        String jdbcUrl = rawUrl;
        String user = defaultUsername;
        String pass = defaultPassword;

        if (rawUrl != null && rawUrl.startsWith("mysql://")) {
            try {
                URI uri = new URI(rawUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 3306 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery() != null ? "?" + uri.getQuery() : "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
                jdbcUrl = "jdbc:mysql://" + host + ":" + port + path + query;
                if (uri.getUserInfo() != null) {
                    String[] parts = uri.getUserInfo().split(":", 2);
                    user = parts[0];
                    if (parts.length > 1) {
                        pass = parts[1];
                    }
                }
            } catch (Exception ignored) {}
        }

        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(user);
        ds.setPassword(pass);
        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        ds.setConnectionTimeout(3000);

        try (Connection conn = ds.getConnection()) {
            System.out.println("===> Successfully connected to MySQL database: " + jdbcUrl);
            return ds;
        } catch (Exception e) {
            System.err.println("===> MySQL connection failed (" + e.getMessage() + "). Falling back to embedded H2 database (data will be saved locally in ./data/smart_attendance_db).");
            try {
                ds.close();
            } catch (Exception ignored) {}

            HikariDataSource h2Ds = new HikariDataSource();
            h2Ds.setJdbcUrl("jdbc:h2:file:./data/smart_attendance_db;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE");
            h2Ds.setDriverClassName("org.h2.Driver");
            h2Ds.setUsername("sa");
            h2Ds.setPassword("");
            return h2Ds;
        }
    }
}
