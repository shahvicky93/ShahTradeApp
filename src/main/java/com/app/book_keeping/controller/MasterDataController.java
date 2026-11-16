package com.app.book_keeping.controller;

import com.app.book_keeping.entity.AppUser;
import com.app.book_keeping.entity.Item;
import com.app.book_keeping.exception.ResourceNotFoundException;
import com.app.book_keeping.repository.ItemRepository;
import com.app.book_keeping.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing master data: Users and Items.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MasterDataController {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final PasswordEncoder passwordEncoder;

    // ========================
    // Users
    // ========================

    @GetMapping("/users")
    public ResponseEntity<List<AppUser>> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AppUser> getUser(@PathVariable Long id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users")
    public ResponseEntity<AppUser> createUser(@RequestBody AppUser user) {
        String rawPassword = (user.getPassword() != null && !user.getPassword().isBlank())
                ? user.getPassword()
                : "user123";
        user.setPassword(passwordEncoder.encode(rawPassword));
        return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(user));
    }

    // ========================
    // Items
    // ========================

    @GetMapping("/items")
    public ResponseEntity<List<Item>> listItems() {
        return ResponseEntity.ok(itemRepository.findAll());
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<Item> getItem(@PathVariable Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", id));
        return ResponseEntity.ok(item);
    }

    @PostMapping("/items")
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemRepository.save(item));
    }
}
