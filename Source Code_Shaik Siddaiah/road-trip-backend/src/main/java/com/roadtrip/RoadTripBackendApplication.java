package com.roadtrip;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the whole backend.
 * Running this file's main() method starts an embedded web server (Tomcat)
 * on port 8080 and wires together every @Component / @Service / @Repository
 * / @RestController in the com.roadtrip package (this is called "component scanning").
 */
@SpringBootApplication
public class RoadTripBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoadTripBackendApplication.class, args);
    }
}
