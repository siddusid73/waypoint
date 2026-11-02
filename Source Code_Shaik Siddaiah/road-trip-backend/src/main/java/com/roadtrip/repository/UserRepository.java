package com.roadtrip.repository;

import com.roadtrip.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * JpaRepository already gives us save(), findById(), findAll(), deleteById()
 * for free. We only need to declare the EXTRA lookups that are specific to
 * User - Spring Data JPA reads the method name and writes the SQL for us.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
