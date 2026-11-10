USE biblioteca;
SELECT b.Title,b.Isbn13,c.Name AS Category,GROUP_CONCAT(a.Name ORDER BY a.Name SEPARATOR ', ') AS Authors FROM Books b JOIN Categories c ON c.CategoryId=b.CategoryId JOIN BookAuthors ba ON ba.BookId=b.BookId JOIN Authors a ON a.AuthorId=ba.AuthorId GROUP BY b.BookId,b.Title,b.Isbn13,c.Name ORDER BY b.Title;
SELECT cp.InventoryCode,b.Title,cp.Status FROM Copies cp JOIN Books b ON b.BookId=cp.BookId ORDER BY b.Title;
SELECT r.RegistrationNumber,r.FullName,COUNT(l.LoanId) AS ActiveLoans FROM Readers r LEFT JOIN Loans l ON l.ReaderId=r.ReaderId AND l.ReturnedAt IS NULL GROUP BY r.ReaderId,r.RegistrationNumber,r.FullName;
SELECT l.LoanId,r.FullName,cp.InventoryCode,l.DueAt,CASE WHEN l.ReturnedAt IS NULL AND l.DueAt<CURRENT_TIMESTAMP THEN 'OVERDUE' ELSE 'CURRENT' END AS LoanState FROM Loans l JOIN Readers r ON r.ReaderId=l.ReaderId JOIN Copies cp ON cp.CopyId=l.CopyId WHERE l.ReturnedAt IS NULL;
