<?php

require_once __DIR__ . '/BaseModel.php';

class JadwalPelajaran extends BaseModel {
    protected $table = 'jadwal_pelajaran';

    public function getJadwalDetail() {
        $sql = "SELECT j.*, g.id as guru_id, u.nama_lengkap as nama_guru, 
                k.nama_kelas, m.nama_mapel,
                TIMESTAMPDIFF(MINUTE, j.jam_mulai, j.jam_selesai) as durasi_menit
                FROM {$this->table} j
                INNER JOIN guru g ON j.guru_id = g.id
                INNER JOIN users u ON g.user_id = u.id
                INNER JOIN kelas k ON j.kelas_id = k.id
                INNER JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                WHERE j.status = 'aktif'
                ORDER BY j.hari ASC, j.jam_mulai ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getJadwalByGuru($guruId) {
        $sql = "SELECT j.*, k.nama_kelas, m.nama_mapel, k.qr_code_content
                FROM {$this->table} j
                INNER JOIN kelas k ON j.kelas_id = k.id
                INNER JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                WHERE j.guru_id = ? AND j.status = 'aktif'
                ORDER BY j.hari ASC, j.jam_mulai ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$guruId]);
        return $stmt->fetchAll();
    }

    public function getJadwalByHari($hari) {
        $sql = "SELECT j.*, g.id as guru_id, u.nama_lengkap, k.nama_kelas, m.nama_mapel
                FROM {$this->table} j
                INNER JOIN guru g ON j.guru_id = g.id
                INNER JOIN users u ON g.user_id = u.id
                INNER JOIN kelas k ON j.kelas_id = k.id
                INNER JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                WHERE j.hari = ? AND j.status = 'aktif'
                ORDER BY j.jam_mulai ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$hari]);
        return $stmt->fetchAll();
    }

    public function getJadwalAktifSekarang($guruId) {
        $waktusSekarang = date('H:i:s');
        $hari = ['Minggu' => 0, 'Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 'Kamis' => 4, 'Jumat' => 5, 'Sabtu' => 6];
        $hariIni = array_search(date('w'), $hari);

        $sql = "SELECT j.*, k.nama_kelas, k.qr_code_content, m.nama_mapel
                FROM {$this->table} j
                INNER JOIN kelas k ON j.kelas_id = k.id
                INNER JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                WHERE j.guru_id = ? AND j.hari = ? AND j.jam_mulai <= ? AND j.jam_selesai > ? AND j.status = 'aktif'
                LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$guruId, $hariIni, $waktusSekarang, $waktusSekarang]);
        return $stmt->fetch();
    }
}
