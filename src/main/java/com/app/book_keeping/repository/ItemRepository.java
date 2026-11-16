package com.app.book_keeping.repository;

import com.app.book_keeping.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
