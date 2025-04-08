-- SQL Server setup script for Library Management System

-- Create database
IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = 'LibraryManagement')
BEGIN
    CREATE DATABASE LibraryManagement;
END
GO

USE LibraryManagement;
GO

-- Create LibraryUsers table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LibraryUsers')
BEGIN
    CREATE TABLE LibraryUsers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        firstName NVARCHAR(100) NOT NULL,
        lastName NVARCHAR(100) NOT NULL,
        facultyID NVARCHAR(50) NOT NULL UNIQUE,
        libraryAdminID NVARCHAR(50) NOT NULL UNIQUE,
        email NVARCHAR(255) NOT NULL UNIQUE,
        contactNumber NVARCHAR(50) NOT NULL,
        sex NVARCHAR(20) NOT NULL,
        passwordHash NVARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- Create Books table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Books')
BEGIN
    CREATE TABLE Books (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        author NVARCHAR(255) NOT NULL,
        isbn NVARCHAR(50) NOT NULL UNIQUE,
        publishYear INT,
        category NVARCHAR(100),
        totalCopies INT NOT NULL DEFAULT 1,
        availableCopies INT NOT NULL DEFAULT 1,
        addedBy INT FOREIGN KEY REFERENCES LibraryUsers(id),
        addedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- Create Borrowings table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Borrowings')
BEGIN
    CREATE TABLE Borrowings (
        id INT IDENTITY(1,1) PRIMARY KEY,
        bookId INT NOT NULL FOREIGN KEY REFERENCES Books(id),
        borrowerName NVARCHAR(255) NOT NULL,
        borrowerType NVARCHAR(50) NOT NULL, -- Student, Faculty, etc.
        borrowerID NVARCHAR(50) NOT NULL,
        borrowDate DATETIME NOT NULL DEFAULT GETDATE(),
        dueDate DATETIME NOT NULL,
        returnDate DATETIME NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'Borrowed', -- Borrowed, Returned, Overdue
        processedBy INT FOREIGN KEY REFERENCES LibraryUsers(id)
    );
END
GO

-- Example stored procedure for checking out a book
CREATE OR ALTER PROCEDURE sp_CheckoutBook
    @BookId INT,
    @BorrowerName NVARCHAR(255),
    @BorrowerType NVARCHAR(50),
    @BorrowerID NVARCHAR(50),
    @DueDays INT,
    @ProcessedBy INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if book is available
    DECLARE @AvailableCopies INT;
    SELECT @AvailableCopies = availableCopies FROM Books WHERE id = @BookId;
    
    IF @AvailableCopies <= 0
    BEGIN
        RAISERROR('Book is not available for checkout', 16, 1);
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    -- Update available copies
    UPDATE Books 
    SET availableCopies = availableCopies - 1
    WHERE id = @BookId;
    
    -- Create borrowing record
    INSERT INTO Borrowings (
        bookId, 
        borrowerName, 
        borrowerType, 
        borrowerID, 
        borrowDate, 
        dueDate,
        status, 
        processedBy
    )
    VALUES (
        @BookId,
        @BorrowerName,
        @BorrowerType,
        @BorrowerID,
        GETDATE(),
        DATEADD(DAY, @DueDays, GETDATE()),
        'Borrowed',
        @ProcessedBy
    );
    
    COMMIT TRANSACTION;
END
GO

-- Example stored procedure for returning a book
CREATE OR ALTER PROCEDURE sp_ReturnBook
    @BorrowingId INT,
    @ProcessedBy INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if borrowing record exists and is not already returned
    DECLARE @BookId INT;
    DECLARE @Status NVARCHAR(20);
    
    SELECT 
        @BookId = bookId,
        @Status = status
    FROM Borrowings
    WHERE id = @BorrowingId;
    
    IF @BookId IS NULL
    BEGIN
        RAISERROR('Borrowing record not found', 16, 1);
        RETURN;
    END
    
    IF @Status = 'Returned'
    BEGIN
        RAISERROR('Book already returned', 16, 1);
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    -- Update borrowing record
    UPDATE Borrowings
    SET 
        returnDate = GETDATE(),
        status = 'Returned',
        processedBy = @ProcessedBy
    WHERE id = @BorrowingId;
    
    -- Update available copies
    UPDATE Books
    SET availableCopies = availableCopies + 1
    WHERE id = @BookId;
    
    COMMIT TRANSACTION;
END
GO

-- Example index for improving search performance
CREATE INDEX IX_Books_Title ON Books(title);
CREATE INDEX IX_Books_Author ON Books(author);
CREATE INDEX IX_Books_ISBN ON Books(isbn);
CREATE INDEX IX_Borrowings_Status ON Borrowings(status);
GO

PRINT 'Database setup completed successfully';
GO