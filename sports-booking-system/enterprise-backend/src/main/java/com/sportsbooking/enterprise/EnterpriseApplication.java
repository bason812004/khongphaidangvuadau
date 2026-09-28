package com.sportsbooking.enterprise;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableCaching
@EnableKafka
@MapperScan("com.sportsbooking.enterprise.mapper")
public class EnterpriseApplication {

    public static void main(String[] args) {
        SpringApplication.run(EnterpriseApplication.class, args);
        System.out.println("===============================================================");
        System.out.println("Enterprise Sports Booking Backend Service successfully started!");
        System.out.println("Port: 8088 | Context Path: /api");
        System.out.println("Camunda Cockpit & Tasklist: http://localhost:8088/camunda");
        System.out.println("Keycloak / JWT Auth: Active");
        System.out.println("MyBatis + JPA/Hibernate Dual ORM: Active");
        System.out.println("JasperReports Engine: Active");
        System.out.println("Kafka & Redis Cache: Active");
        System.out.println("===============================================================");
    }
}
