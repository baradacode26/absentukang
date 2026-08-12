<?php

require_once __DIR__ . '/BaseModel.php';

class MataPelajaran extends BaseModel {
    protected $table = 'mata_pelajaran';

    public function getAktif() {
        $sql = "SELECT * FROM {$this->table} WHERE status = 'aktif' ORDER BY nama_mapel ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getByKodeMapel($kode) {
        $sql = "SELECT * FROM {$this->table} WHERE kode_mapel = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$kode]);
        return $stmt->fetch();
    }
}
