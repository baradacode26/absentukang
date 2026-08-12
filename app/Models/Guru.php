<?php

require_once __DIR__ . '/BaseModel.php';

class Guru extends BaseModel {
    protected $table = 'guru';

    public function getByUserId($userId) {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }

    public function getGuruWithUser() {
        $sql = "SELECT g.*, u.username, u.email, u.nama_lengkap, u.role, u.status 
                FROM {$this->table} g 
                INNER JOIN users u ON g.user_id = u.id 
                WHERE u.role = 'guru' AND u.status = 'aktif'
                ORDER BY u.nama_lengkap ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getGuruDetail($id) {
        $sql = "SELECT g.*, u.username, u.email, u.nama_lengkap 
                FROM {$this->table} g 
                INNER JOIN users u ON g.user_id = u.id 
                WHERE g.id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
}
