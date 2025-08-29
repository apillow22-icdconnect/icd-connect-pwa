CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Add some sample sales data for testing
INSERT INTO sales (userId, amount, description, date) VALUES
(2, 1500.00, 'Product A sale to ABC Company', '2024-01-15'),
(2, 2200.00, 'Product B sale to XYZ Corp', '2024-01-20'),
(3, 1800.00, 'Product C sale to DEF Inc', '2024-01-18'),
(3, 950.00, 'Product A sale to GHI Ltd', '2024-01-22'),
(4, 3200.00, 'Product D sale to JKL Enterprises', '2024-01-16'),
(4, 1100.00, 'Product B sale to MNO Group', '2024-01-25'),
(5, 750.00, 'Product A sale to PQR Solutions', '2024-01-19'),
(5, 1600.00, 'Product C sale to STU Partners', '2024-01-23');
