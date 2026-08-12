<?php

require_once __DIR__ . '/../../config/Database.php';

class BaseModel {
    protected $pdo;
    protected $table;

    public function __construct() {
        $database = new Database();
        $this->pdo = $database->connect();
    }

    public function getAll($limit = null, $offset = 0) {
        $sql = "SELECT * FROM {$this->table}";
        
        if ($limit) {
            $sql .= " LIMIT $limit OFFSET $offset";
        }
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function insert($data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";
        $stmt = $this->pdo->prepare($sql);
        
        return $stmt->execute(array_values($data));
    }

    public function update($id, $data) {
        $set = implode(', ', array_map(fn($key) => "$key = ?", array_keys($data)));
        
        $sql = "UPDATE {$this->table} SET {$set} WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        
        $values = array_values($data);
        $values[] = $id;
        
        return $stmt->execute($values);
    }

    public function delete($id) {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$id]);
    }

    public function countAll() {
        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['total'] ?? 0;
    }

    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }
}
