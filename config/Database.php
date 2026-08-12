<?php

class Database {
    private $host = 'localhost';
    private $db_name = 'sistem_absensi_honor';
    private $username = 'root';
    private $password = '';
    private $pdo;

    public function connect() {
        $this->pdo = null;

        try {
            $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->db_name;
            $this->pdo = new PDO($dsn, $this->username, $this->password);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            die('Connection Error: ' . $e->getMessage());
        }

        return $this->pdo;
    }
}
