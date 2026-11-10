# Modelo lógico

`Categories(CategoryId PK, Name UQ, IsActive, CreatedAt)`  
`Books(BookId PK, Title, Isbn13 UQ, CategoryId FK, IsArchived, CreatedAt, UpdatedAt)`  
`Authors(AuthorId PK, Name UQ, CreatedAt)`  
`BookAuthors(BookId PK/FK, AuthorId PK/FK)`  
`Copies(CopyId PK, BookId FK, InventoryCode UQ, Status, CreatedAt)`  
`Readers(ReaderId PK, FullName, RegistrationNumber UQ, IsSuspended, CreatedAt)`  
`Loans(LoanId PK, CopyId FK, ReaderId FK, LoanedAt, DueAt, ReturnedAt)`

O modelo atende à 3FN: atributos atômicos, dependência da chave inteira e ausência de dependências transitivas. Contagens e transações serão garantidas no serviço do backend.
