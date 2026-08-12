<?php

require_once __DIR__ . '/BaseModel.php';

class Kelas extends BaseModel {
    protected $table = 'kelas';

    public function getKelasWithInfo() {
        $sql = "SELECT k.*, COUNT(DISTINCT j.id) as total_jadwal 
                FROM {$this->table} k 
                LEFT JOIN jadwal_pelajaran j ON k.id = j.kelas_id AND j.status = 'aktif'
                WHERE k.status = 'aktif'
                GROUP BY k.id
                ORDER BY k.tingkat ASC, k.nama_kelas ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getByKodeKelas($kode) {
        $sql = "SELECT * FROM {$this->table} WHERE kode_kelas = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$kode]);
        return $stmt->fetch();
    }
}
