USE biblioteca;
INSERT INTO Categories (Name) VALUES ('Tecnologia'), ('Literatura') ON DUPLICATE KEY UPDATE Name=VALUES(Name);
INSERT INTO Authors (Name) VALUES ('Robert C. Martin'), ('Machado de Assis') ON DUPLICATE KEY UPDATE Name=VALUES(Name);
INSERT INTO Books (Title, Isbn13, CategoryId) SELECT 'Clean Code','9780132350884',CategoryId FROM Categories WHERE Name='Tecnologia' AND NOT EXISTS (SELECT 1 FROM Books WHERE Isbn13='9780132350884');
INSERT INTO Books (Title, Isbn13, CategoryId) SELECT 'Dom Casmurro','9788535910663',CategoryId FROM Categories WHERE Name='Literatura' AND NOT EXISTS (SELECT 1 FROM Books WHERE Isbn13='9788535910663');
INSERT IGNORE INTO BookAuthors SELECT b.BookId,a.AuthorId FROM Books b JOIN Authors a ON (b.Title='Clean Code' AND a.Name='Robert C. Martin') OR (b.Title='Dom Casmurro' AND a.Name='Machado de Assis');
INSERT IGNORE INTO Copies (BookId,InventoryCode) SELECT BookId,'EX-CLEAN-001' FROM Books WHERE Isbn13='9780132350884';
INSERT IGNORE INTO Copies (BookId,InventoryCode) SELECT BookId,'EX-DOM-001' FROM Books WHERE Isbn13='9788535910663';
INSERT INTO Readers (FullName,RegistrationNumber) VALUES ('Leitor Demonstração','MAT-0001') ON DUPLICATE KEY UPDATE RegistrationNumber=VALUES(RegistrationNumber);
