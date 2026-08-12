<?php

require_once __DIR__ . '/BaseModel.php';

class Absensi extends BaseModel {
    protected $table = 'absensi';

    public function getAbsensiByJadwal($jadwalId, $tanggal) {
        $sql = "SELECT * FROM {$this->table} WHERE jadwal_pelajaran_id = ? AND tanggal = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$jadwalId, $tanggal]);
        return $stmt->fetch();
    }

    public function getAbsensiByGuru($guruId, $bulan, $tahun) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE guru_id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?
                ORDER BY tanggal DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$guruId, $bulan, $tahun]);
        return $stmt->fetchAll();
    }

    public function getAbsensiDetail($guruId, $jadwalId, $tanggal) {
        $sql = "SELECT a.*, k.nama_kelas, m.nama_mapel, j.jam_mulai, j.jam_selesai
                FROM {$this->table} a
                INNER JOIN kelas k ON a.kelas_id = k.id
                INNER JOIN jadwal_pelajaran j ON a.jadwal_pelajaran_id = j.id
                INNER JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                WHERE a.guru_id = ? AND a.jadwal_pelajaran_id = ? AND a.tanggal = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$guruId, $jadwalId, $tanggal]);
        return $stmt->fetch();
    }

    public function countAbsensiByStatus($guruId, $status, $bulan, $tahun) {
        $sql = "SELECT COUNT(*) as total FROM {$this->table} 
                WHERE guru_id = ? AND status = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$guruId, $status, $bulan, $tahun]);
        $result = $stmt->fetch();
        return $result['total'] ?? 0;
    }
}
