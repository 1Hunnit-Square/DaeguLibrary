package com.dglib.repository.wishBook;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.wishBook.WishBook;

public interface WishBookRepository	extends JpaRepository<WishBook, Long> {

}
