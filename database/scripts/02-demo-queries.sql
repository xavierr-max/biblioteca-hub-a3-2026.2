USE biblioteca;
SELECT b.Title,b.Isbn13,c.Name AS Category,GROUP_CONCAT(a.Name ORDER BY a.Name SEPARATOR ', ') AS Authors FROM Books b JOIN Categories c ON c.CategoryId=b.CategoryId JOIN BookAuthors ba ON ba.BookId=b.BookId JOIN Authors a ON a.AuthorId=ba.AuthorId GROUP BY b.BookId,b.Title,b.Isbn13,c.Name ORDER BY b.Title;
SELECT cp.InventoryCode,b.Title,cp.Status FROM Copies cp JOIN Books b ON b.BookId=cp.BookId ORDER BY b.Title;
SELECT r.RegistrationNumber,r.FullName,COUNT(l.LoanId) AS ActiveLoans FROM Readers r LEFT JOIN Loans l ON l.ReaderId=r.ReaderId AND l.ReturnedAt IS NULL GROUP BY r.ReaderId,r.RegistrationNumber,r.FullName;
SELECT l.LoanId,r.FullName,cp.InventoryCode,l.DueAt,CASE WHEN l.ReturnedAt IS NULL AND l.DueAt<CURRENT_TIMESTAMP THEN 'OVERDUE' ELSE 'CURRENT' END AS LoanState FROM Loans l JOIN Readers r ON r.ReaderId=l.ReaderId JOIN Copies cp ON cp.CopyId=l.CopyId WHERE l.ReturnedAt IS NULL;

-- Consulta 1: acervo com categoria, editora, autores e generos.
SELECT b.Title, c.Name AS Category, p.Name AS Publisher,
       GROUP_CONCAT(DISTINCT a.Name ORDER BY a.Name SEPARATOR ', ') AS Authors,
       GROUP_CONCAT(DISTINCT g.Name ORDER BY g.Name SEPARATOR ', ') AS Genres
FROM Books b
JOIN Categories c ON c.CategoryId = b.CategoryId
JOIN Publishers p ON p.PublisherId = b.PublisherId
LEFT JOIN BookAuthors ba ON ba.BookId = b.BookId
LEFT JOIN Authors a ON a.AuthorId = ba.AuthorId
LEFT JOIN BookGenres bg ON bg.BookId = b.BookId
LEFT JOIN Genres g ON g.GenreId = bg.GenreId
WHERE b.IsArchived = FALSE
GROUP BY b.BookId, b.Title, c.Name, p.Name
ORDER BY b.Title;

-- Consulta 2: leitores com quantidade de emprestimos ativos, incluindo quem nao possui emprestimos.
SELECT r.RegistrationNumber, r.FullName,
       COUNT(l.LoanId) AS ActiveLoans,
       CASE WHEN r.IsSuspended THEN 'SUSPENDED' ELSE 'ACTIVE' END AS ReaderStatus
FROM Readers r
LEFT JOIN Loans l ON l.ReaderId = r.ReaderId AND l.ReturnedAt IS NULL
GROUP BY r.ReaderId, r.RegistrationNumber, r.FullName, r.IsSuspended
HAVING ActiveLoans >= 0
ORDER BY ActiveLoans DESC, r.FullName;

-- Consulta 3: multas em aberto por leitor e situacao do emprestimo.
SELECT r.FullName, b.Title, f.Amount, f.Reason, l.DueAt,
       CASE WHEN f.PaidAt IS NULL THEN 'OPEN' ELSE 'PAID' END AS FineStatus
FROM Fines f
JOIN Loans l ON l.LoanId = f.LoanId
JOIN Readers r ON r.ReaderId = l.ReaderId
JOIN Copies cp ON cp.CopyId = l.CopyId
JOIN Books b ON b.BookId = cp.BookId
WHERE f.PaidAt IS NULL
ORDER BY f.Amount DESC, l.DueAt;
