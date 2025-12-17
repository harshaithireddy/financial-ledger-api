USE ledger_db;

CREATE TABLE IF NOT EXISTS accounts (
  id CHAR(36) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status ENUM('active','frozen') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS transactions (
  id CHAR(36) PRIMARY KEY,
  type ENUM('transfer','deposit','withdrawal') NOT NULL,
  status ENUM('pending','completed','failed') NOT NULL,
  source_account_id CHAR(36),
  destination_account_id CHAR(36),
  amount DECIMAL(18,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS ledger_entries (
  id CHAR(36) PRIMARY KEY,
  account_id CHAR(36),
  transaction_id CHAR(36),
  entry_type ENUM('debit','credit') NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
) ENGINE=InnoDB;
